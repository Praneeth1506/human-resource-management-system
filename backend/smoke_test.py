"""
Standalone manual smoke test against a LIVE running app + real Neon Postgres.

NOT part of the pytest suite - deliberately not collected as tests (no
test_* functions, everything gated behind __main__, config loaded lazily
inside main() so nothing runs or touches the environment on import).

Prerequisites:
  - The app is already running (e.g. `uvicorn backend.main:app`) with
    DATABASE_URL pointed at Neon.
  - backend/.env has ADMIN_BOOTSTRAP_EMAIL/PASSWORD matching what that
    running app was seeded with, and the same JWT_SECRET/JWT_ALGORITHM
    it's actually signing tokens with.

The bootstrap admin is seeded with first_login=True like any other account,
so on a fresh database it needs to go through /first-login/reset-password
before it can call any role-gated route - this script does that rotation
itself (step 1) and rotates the password back to ADMIN_BOOTSTRAP_PASSWORD
at the end, so re-running this script (or logging in manually) keeps
working against the value that's actually in .env.

Run:
    python backend/smoke_test.py
"""

__test__ = False  # belt-and-suspenders: tells pytest not to collect this file

import re
import sys
import time
from pathlib import Path

import httpx
from jose import jwt as jose_jwt

ENV_PATH = Path(__file__).resolve().parent / ".env"
DEFAULT_BASE_URL = "http://localhost:8000"

LEAK_MARKERS = (
    "Traceback",
    "psycopg2",
    "sqlalchemy",
    "IntegrityError",
    'File "',
    "duplicate key value",
    "<!DOCTYPE",  # an HTML error page instead of our JSON error body
)

results = []


def record(step, ok, detail=""):
    # `detail` is shown only on failure - it often carries the raw response
    # body, which can contain secrets (temp_password, access_token). Use
    # note() instead for short, non-sensitive context that should always show.
    results.append((step, ok))
    status = "PASS" if ok else "FAIL"
    line = f"[{status}] {step}"
    if detail and not ok:
        line += f" - {detail}"
    print(line)


def note(text):
    print(f"      note: {text}")


def check_no_leak(step_label, response):
    hit = next((m for m in LEAK_MARKERS if m in response.text), None)
    record(f"{step_label}: no internal error leakage", hit is None, f"found {hit!r} in response body")


def main():
    import os

    from dotenv import load_dotenv

    load_dotenv(ENV_PATH)

    base_url = os.environ.get("SMOKE_TEST_BASE_URL", DEFAULT_BASE_URL)
    jwt_secret = os.environ.get("JWT_SECRET")
    jwt_algorithm = os.environ.get("JWT_ALGORITHM", "HS256")
    admin_email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
    admin_password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")

    if not jwt_secret or not admin_email or not admin_password:
        print("Missing JWT_SECRET / ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD in backend/.env - aborting.")
        sys.exit(1)

    # Deterministic (not random) so a crashed prior run can be recovered from
    # in step 0 below - a random rotated password would be unrecoverable.
    rotated_password = admin_password + "_reset"

    run_id = int(time.time())
    employee_email = f"smoketest.{run_id}@x.com"
    duplicate_email_variant = f"SMOKETEST.{run_id}@X.COM"  # same address, different case

    admin_token = None
    used_rotated_password = False  # tracks whether we need to restore at the end

    try:
        client = httpx.Client(base_url=base_url, timeout=10.0)

        # --- Step 0: log in as bootstrap admin (with crash-recovery fallback) ---
        resp = client.post("/login", json={"email": admin_email, "password": admin_password})
        if resp.status_code == 200:
            record("0. Bootstrap admin login", True)
        else:
            # A previous run may have rotated the password and crashed before
            # restoring it. Try the rotated value before giving up.
            retry = client.post("/login", json={"email": admin_email, "password": rotated_password})
            if retry.status_code == 200:
                resp = retry
                used_rotated_password = True
                record("0. Bootstrap admin login", True)
                note("recovered using rotated password from a previous incomplete run")
            else:
                record("0. Bootstrap admin login", False, f"status={resp.status_code} body={resp.text}")
                finish(client, admin_token, admin_email, admin_password, used_rotated_password)

        login_body = resp.json()
        admin_token = login_body["access_token"]
        must_reset = login_body["must_reset_password"]

        # --- Step 1: reset bootstrap admin's password if this is a fresh seed ---
        if must_reset:
            old_password = admin_password if not used_rotated_password else rotated_password
            reset_resp = client.post(
                "/first-login/reset-password",
                json={"old_password": old_password, "new_password": rotated_password},
                headers={"Authorization": f"Bearer {admin_token}"},
            )
            ok = reset_resp.status_code == 200
            record(
                "1. Reset bootstrap admin password (fresh-seed first-login requirement)",
                ok,
                f"status={reset_resp.status_code} body={reset_resp.text}",
            )
            if not ok:
                finish(client, admin_token, admin_email, admin_password, used_rotated_password)

            relogin_resp = client.post("/login", json={"email": admin_email, "password": rotated_password})
            ok = relogin_resp.status_code == 200
            record("1b. Re-login with rotated password returns a working token", ok)
            if not ok:
                finish(client, admin_token, admin_email, admin_password, used_rotated_password)
            admin_token = relogin_resp.json()["access_token"]
            used_rotated_password = True
        else:
            record("1. Reset bootstrap admin password", True)
            note("not needed - already past first login")

        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # --- Step 2: create employee ---
        create_resp = client.post(
            "/admin/employees",
            json={
                "first_name": "Smoke",
                "last_name": "Test",
                "joining_date": "2026-01-15",
                "email": employee_email,
            },
            headers=admin_headers,
        )
        ok = create_resp.status_code == 201
        record(
            "2. Create employee via POST /admin/employees",
            ok,
            f"status={create_resp.status_code} body={create_resp.text}",
        )
        if not ok:
            finish(client, admin_token, admin_email, admin_password, used_rotated_password)
        created = create_resp.json()
        login_id = created["login_id"]
        temp_password = created["temp_password"]

        # --- Step 3: validate login_id format (DF-<2+2 initials>-<join year>-<4 digit serial>) ---
        expected_pattern = r"^DF-SMTE-2026-\d{4}$"
        ok = bool(re.match(expected_pattern, login_id))
        record("3. login_id matches expected format", ok, f"got {login_id!r}")

        # --- Step 4: duplicate email, different case -> expect 409, not 201/500 ---
        dup_resp = client.post(
            "/admin/employees",
            json={
                "first_name": "Smoke",
                "last_name": "Duplicate",
                "joining_date": "2026-01-15",
                "email": duplicate_email_variant,
            },
            headers=admin_headers,
        )
        ok = dup_resp.status_code == 409
        record(
            "4. Duplicate email (different case) rejected with 409",
            ok,
            f"status={dup_resp.status_code} body={dup_resp.text}",
        )
        check_no_leak("4. Duplicate email rejection", dup_resp)

        # --- Step 5: log in as the new employee with lowercase email ---
        login_resp = client.post("/login", json={"email": employee_email.lower(), "password": temp_password})
        ok = login_resp.status_code == 200
        record(
            "5. Employee login with lowercase email returns 200",
            ok,
            f"status={login_resp.status_code} body={login_resp.text}",
        )
        if ok:
            token = login_resp.json().get("access_token", "")
            try:
                payload = jose_jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
                valid = "sub" in payload and "exp" in payload
                detail = "" if valid else f"decoded but missing claims: {payload}"
            except Exception as exc:
                valid = False
                detail = f"token failed to decode/verify: {exc}"
            record("5b. Returned access_token is a valid, decodable JWT", valid, detail)

        # --- Step 6: wrong password -> generic 401, nothing leaked ---
        wrong_resp = client.post(
            "/login", json={"email": employee_email.lower(), "password": "definitely-wrong-password"}
        )
        ok = wrong_resp.status_code == 401
        record("6. Wrong password rejected with 401", ok, f"status={wrong_resp.status_code} body={wrong_resp.text}")
        try:
            wrong_detail = wrong_resp.json().get("detail")
        except ValueError:
            wrong_detail = None
        ok = wrong_detail == "Invalid email or password"
        record("6b. Error message is the generic invalid-credentials message", ok, f"got detail={wrong_detail!r}")
        check_no_leak("6. Wrong password response", wrong_resp)

    except httpx.ConnectError as exc:
        record("connection to running app", False, f"could not reach {base_url}: {exc}")

    finish(client, admin_token, admin_email, admin_password, used_rotated_password)


def finish(client, admin_token, admin_email, admin_password, used_rotated_password):
    if used_rotated_password and admin_token:
        rotated_password = admin_password + "_reset"
        restore_resp = client.post(
            "/first-login/reset-password",
            json={"old_password": rotated_password, "new_password": admin_password},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        record(
            "7. Restore bootstrap admin password to ADMIN_BOOTSTRAP_PASSWORD",
            restore_resp.status_code == 200,
            f"status={restore_resp.status_code} body={restore_resp.text}",
        )

    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    print(f"\n=== {passed}/{total} checks passed ===")
    if passed < total:
        print("Failed:")
        for step, ok in results:
            if not ok:
                print(f"  - {step}")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
