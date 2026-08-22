"""
Standalone demo-data seeding script - creates realistic employees,
attendance history, leave requests, and payroll records against a LIVE
running app, entirely through the real API (never direct DB writes), so
login_id generation, password hashing, and every validation rule behave
exactly as they would for a real admin doing this by hand.

Separate from smoke_test.py (verification) and reset_db.py (destructive
reset) - this script only ever creates rows through the API, it never
drops or deletes anything.

Meant to run ONCE against a freshly-reset database. It uses fixed,
realistic employee emails (not unique-per-run ones like smoke_test.py),
deliberately - names/emails need to stay stable and readable on camera
for a demo recording, not change every run. Re-running this against a
database that already has these employees will fail with 409 on
employee creation; if you need fresh data, reset first (reset_db.py -
not run by this script).

Prerequisites: same as smoke_test.py - app already running
(uvicorn backend.main:app) with DATABASE_URL pointed at Neon,
backend/.env has matching ADMIN_BOOTSTRAP_* values and the same
JWT_SECRET/JWT_ALGORITHM the running app is actually signing with.

Run:
    python backend/seed_demo_data.py
"""

import sys
from datetime import date, timedelta
from pathlib import Path

import httpx

ENV_PATH = Path(__file__).resolve().parent / ".env"
DEFAULT_BASE_URL = "http://localhost:8000"

# Shared, memorable password for every seeded demo employee - a live demo
# needs the presenter to be able to actually type a password on camera,
# not look up a random per-employee one.
DEMO_PASSWORD = "DemoPass123"

EMPLOYEE_SPECS = [
    dict(tag="priya", first_name="Priya", last_name="Sharma", department="Engineering",
         designation="Software Engineer", months_ago=10, email="priya.sharma@dayflow.demo"),
    dict(tag="rohan", first_name="Rohan", last_name="Mehta", department="Engineering",
         designation="Senior Software Engineer", months_ago=7, email="rohan.mehta@dayflow.demo"),
    dict(tag="ananya", first_name="Ananya", last_name="Iyer", department="Sales",
         designation="Sales Executive", months_ago=5, email="ananya.iyer@dayflow.demo"),
    dict(tag="karan", first_name="Karan", last_name="Malhotra", department="Sales",
         designation="Sales Manager", months_ago=11, email="karan.malhotra@dayflow.demo"),
    dict(tag="divya", first_name="Divya", last_name="Nair", department="Marketing",
         designation="Marketing Specialist", months_ago=9, email="divya.nair@dayflow.demo"),
    dict(tag="arjun", first_name="Arjun", last_name="Verma", department="Marketing",
         designation="Marketing Associate", months_ago=1, email="arjun.verma@dayflow.demo"),
]


def _recent_days_this_month(today: date, n: int) -> list[date]:
    """Up to n most recent calendar days ending today, clipped to the
    current month so it never crosses into the previous one - keeps this
    robust regardless of what day of the month the script runs on. Does
    not skip weekends; not needed for demo purposes.
    """
    days_elapsed = (today - today.replace(day=1)).days + 1
    n = min(n, days_elapsed)
    return [today - timedelta(days=i) for i in range(n - 1, -1, -1)]


def _login_bootstrap_admin(client: httpx.Client, admin_email: str, admin_password: str, rotated_password: str):
    resp = client.post("/login", json={"email": admin_email, "password": admin_password})
    used_rotated = False
    if resp.status_code != 200:
        retry = client.post("/login", json={"email": admin_email, "password": rotated_password})
        if retry.status_code != 200:
            print(f"Could not log in as bootstrap admin: {resp.status_code} {resp.text}")
            sys.exit(1)
        resp = retry
        used_rotated = True
        print("Recovered using rotated password from a previous incomplete run.")

    login_body = resp.json()
    admin_token = login_body["access_token"]

    if login_body["must_reset_password"]:
        old_password = rotated_password if used_rotated else admin_password
        reset_resp = client.post(
            "/first-login/reset-password",
            json={"old_password": old_password, "new_password": rotated_password},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        if reset_resp.status_code != 200:
            print(f"Admin password reset failed: {reset_resp.status_code} {reset_resp.text}")
            sys.exit(1)
        relogin = client.post("/login", json={"email": admin_email, "password": rotated_password})
        admin_token = relogin.json()["access_token"]
        used_rotated = True
        print("Bootstrap admin was on first login - reset done.")
    else:
        print("Bootstrap admin already past first login.")

    return admin_token, used_rotated


def _restore_admin_password(client, admin_token, used_rotated, admin_password, rotated_password):
    if not (used_rotated and admin_token):
        return
    resp = client.post(
        "/first-login/reset-password",
        json={"old_password": rotated_password, "new_password": admin_password},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    if resp.status_code == 200:
        print("\nBootstrap admin password restored to ADMIN_BOOTSTRAP_PASSWORD.")
    else:
        print(f"\nWARNING: could not restore bootstrap admin password: {resp.status_code} {resp.text}")


def _create_employees(client: httpx.Client, admin_headers: dict, today: date) -> dict:
    employees = {}
    print("\nCreating employees...")
    for spec in EMPLOYEE_SPECS:
        joining_date = today - timedelta(days=spec["months_ago"] * 30)
        create_resp = client.post(
            "/admin/employees",
            json={
                "first_name": spec["first_name"],
                "last_name": spec["last_name"],
                "department": spec["department"],
                "designation": spec["designation"],
                "joining_date": joining_date.isoformat(),
                "email": spec["email"],
            },
            headers=admin_headers,
        )
        if create_resp.status_code != 201:
            print(f"  FAILED to create {spec['email']}: {create_resp.status_code} {create_resp.text}")
            continue
        created = create_resp.json()
        temp_password = created["temp_password"]

        login_resp = client.post("/login", json={"email": spec["email"], "password": temp_password})
        if login_resp.status_code != 200:
            print(f"  FAILED to log in as new employee {spec['email']}: {login_resp.status_code}")
            continue
        temp_token = login_resp.json()["access_token"]

        reset_resp = client.post(
            "/first-login/reset-password",
            json={"old_password": temp_password, "new_password": DEMO_PASSWORD},
            headers={"Authorization": f"Bearer {temp_token}"},
        )
        if reset_resp.status_code != 200:
            print(f"  FAILED to reset password for {spec['email']}: {reset_resp.status_code} {reset_resp.text}")
            continue
        relogin = client.post("/login", json={"email": spec["email"], "password": DEMO_PASSWORD})
        token = relogin.json()["access_token"]

        employees[spec["tag"]] = {
            **spec,
            "employee_id": created["employee_id"],
            "login_id": created["login_id"],
            "token": token,
        }
        print(
            f"  {spec['first_name']} {spec['last_name']} <{spec['email']}> "
            f"- id={created['employee_id']}, login_id={created['login_id']}"
        )

    if len(employees) < len(EMPLOYEE_SPECS):
        print(f"\nWARNING: only {len(employees)}/{len(EMPLOYEE_SPECS)} employees created - continuing with what exists.")
    return employees


def _set_status(client, admin_headers, employee_id, for_date, status_value):
    resp = client.put(
        f"/attendance/{employee_id}/status",
        json={"date": for_date.isoformat(), "status": status_value},
        headers=admin_headers,
    )
    if resp.status_code not in (200, 201):
        print(f"    status set failed for employee {employee_id} on {for_date}: {resp.status_code} {resp.text}")


def _seed_attendance(client, admin_headers, employees, today):
    print("\nSeeding attendance...")

    # Mostly present, 1 late day. Real check-in/check-out for today,
    # admin override backfills the rest of the window.
    for tag in ("priya", "rohan"):
        emp = employees.get(tag)
        if emp is None:
            continue
        client.post("/attendance/check-in", headers={"Authorization": f"Bearer {emp['token']}"})
        client.post("/attendance/check-out", headers={"Authorization": f"Bearer {emp['token']}"})
        days = _recent_days_this_month(today, 8)
        backfill_days = [d for d in days if d != today]
        late_day = backfill_days[0] if backfill_days else None
        for d in backfill_days:
            _set_status(client, admin_headers, emp["employee_id"], d, "late" if d == late_day else "present")
        print(f"  {emp['first_name']}: {len(days)} days this month, mostly present + 1 late day")

    # A few absences, 1-2 half days.
    for tag, half_day_count in (("ananya", 2), ("karan", 1)):
        emp = employees.get(tag)
        if emp is None:
            continue
        days = _recent_days_this_month(today, 7)
        for i, d in enumerate(days):
            if i < 2:
                _set_status(client, admin_headers, emp["employee_id"], d, "absent")
            elif i < 2 + half_day_count:
                _set_status(client, admin_headers, emp["employee_id"], d, "half_day")
            else:
                _set_status(client, admin_headers, emp["employee_id"], d, "present")
        print(f"  {emp['first_name']}: {len(days)} days this month, 2 absences + {half_day_count} half day(s)")

    # HIGH risk: 4 absent (x2) + 1 late (x1) = risk_score 9, > 6 -> HIGH.
    divya = employees.get("divya")
    if divya is not None:
        days = _recent_days_this_month(today, 5)
        for i, d in enumerate(days):
            _set_status(client, admin_headers, divya["employee_id"], d, "absent" if i < 4 else "late")
        print(f"  {divya['first_name']}: {len(days)} days this month, 4 absences + 1 late -> risk_score=9 (HIGH)")

    # Insufficient data: deliberately zero attendance rows this month -
    # this is the actual condition the risk endpoint's "insufficient
    # data" path checks for, not just "sparse" data.
    arjun = employees.get("arjun")
    if arjun is not None:
        print(f"  {arjun['first_name']}: no attendance rows created (tests the insufficient-data path)")


def _apply_leave(client, token, leave_type, start, end, remarks=None):
    resp = client.post(
        "/leave",
        json={
            "leave_type": leave_type,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "remarks": remarks,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.status_code != 201:
        print(f"    leave apply failed: {resp.status_code} {resp.text}")
        return None
    return resp.json()["id"]


def _seed_leave(client, admin_headers, employees, today) -> dict:
    print("\nSeeding leave requests...")
    leave_info = {}

    rohan = employees.get("rohan")
    if rohan is not None:
        start, end = today + timedelta(days=3), today + timedelta(days=5)
        leave_id = _apply_leave(client, rohan["token"], "paid", start, end, "Family trip")
        if leave_id:
            leave_info["pending"] = {"employee": rohan, "leave_id": leave_id, "start": start, "end": end}
            print(f"  {rohan['first_name']}: pending leave (id={leave_id}, {start} to {end}) - approve live in the demo")

    ananya = employees.get("ananya")
    if ananya is not None:
        start, end = today - timedelta(days=20), today - timedelta(days=19)
        leave_id = _apply_leave(client, ananya["token"], "sick", start, end, "Fever")
        if leave_id:
            approve_resp = client.put(
                f"/leave/{leave_id}/approve",
                json={"comment": "Get well soon"},
                headers=admin_headers,
            )
            if approve_resp.status_code == 200:
                leave_info["approved"] = {"employee": ananya, "leave_id": leave_id, "start": start, "end": end}
                print(f"  {ananya['first_name']}: leave approved (id={leave_id}) - attendance shows status=leave for those dates")
            else:
                print(f"    approve failed: {approve_resp.status_code} {approve_resp.text}")

    karan = employees.get("karan")
    if karan is not None:
        start, end = today - timedelta(days=15), today - timedelta(days=14)
        leave_id = _apply_leave(client, karan["token"], "unpaid", start, end, "Personal")
        if leave_id:
            reject_resp = client.put(
                f"/leave/{leave_id}/reject",
                json={"comment": "Insufficient notice"},
                headers=admin_headers,
            )
            if reject_resp.status_code == 200:
                leave_info["rejected"] = {"employee": karan, "leave_id": leave_id}
                print(f"  {karan['first_name']}: leave rejected (id={leave_id})")
            else:
                print(f"    reject failed: {reject_resp.status_code} {reject_resp.text}")

    return leave_info


def _seed_payroll(client, admin_headers, employees, today):
    print("\nSeeding payroll...")
    payroll_specs = [
        ("priya", 50000.00, 20000.00, 3000.00, 200.00),
        ("ananya", 42000.00, 16800.00, 2520.00, 200.00),
        ("divya", 48000.00, 19200.00, 2880.00, 200.00),
    ]
    for tag, basic, hra, pf, ptax in payroll_specs:
        emp = employees.get(tag)
        if emp is None:
            continue
        resp = client.post(
            "/admin/payroll",
            json={
                "employee_id": emp["employee_id"],
                "month": today.month,
                "year": today.year,
                "basic": basic,
                "hra": hra,
                "pf": pf,
                "professional_tax": ptax,
                "working_days": 22,
            },
            headers=admin_headers,
        )
        if resp.status_code == 201:
            print(f"  {emp['first_name']}: payroll created for {today.month}/{today.year} (net_pay={resp.json()['net_pay']})")
        else:
            print(f"    payroll create failed for {emp['first_name']}: {resp.status_code} {resp.text}")


def _print_summary(employees, leave_info, today):
    print("\n" + "=" * 70)
    print("DEMO DATA SUMMARY")
    print("=" * 70)
    print(f"\nShared login password for every seeded employee: {DEMO_PASSWORD}\n")
    for spec in EMPLOYEE_SPECS:
        emp = employees.get(spec["tag"])
        if emp is None:
            print(f"- {spec['first_name']} {spec['last_name']} <{spec['email']}> - NOT CREATED (see errors above)")
            continue
        print(
            f"- {emp['first_name']} {emp['last_name']} <{emp['email']}> "
            f"(id={emp['employee_id']}, login_id={emp['login_id']}, {emp['department']})"
        )

    print("\nSuggested demo moments:")
    divya = employees.get("divya")
    if divya is not None:
        print(
            f"  - Risk endpoint (HIGH): GET /attendance/{divya['employee_id']}/risk"
            f"?month={today.month}&year={today.year} on {divya['first_name']} -> HIGH (4 absences + 1 late)"
        )
    arjun = employees.get("arjun")
    if arjun is not None:
        print(
            f"  - Risk endpoint ('insufficient data'): GET /attendance/{arjun['employee_id']}/risk"
            f"?month={today.month}&year={today.year} on {arjun['first_name']} -> no attendance rows yet"
        )
    if "pending" in leave_info:
        p = leave_info["pending"]
        print(
            f"  - Live approve moment: PUT /leave/{p['leave_id']}/approve for "
            f"{p['employee']['first_name']}'s pending request ({p['start']} to {p['end']})"
        )
    if "approved" in leave_info:
        a = leave_info["approved"]
        print(
            f"  - Approved leave reflected in attendance: GET /attendance?employee_id={a['employee']['employee_id']}"
            f" on {a['employee']['first_name']} -> status=leave for {a['start']} to {a['end']}"
        )
    if "rejected" in leave_info:
        r = leave_info["rejected"]
        print(f"  - Rejected leave, attendance untouched: {r['employee']['first_name']}'s request (id={r['leave_id']})")
    payroll_names = [employees[t]["first_name"] for t in ("priya", "ananya", "divya") if t in employees]
    if payroll_names:
        print(
            f"  - Payroll: GET /payroll?month={today.month}&year={today.year} shows records for "
            f"{', '.join(payroll_names)}"
        )
    print(f"  - Any seeded employee can log in live with '{DEMO_PASSWORD}' for the self-service side "
          f"(check-in, /employees/me, /leave/me, /payroll/me)")


def main():
    import os

    from dotenv import load_dotenv

    load_dotenv(ENV_PATH)

    base_url = os.environ.get("SEED_BASE_URL", DEFAULT_BASE_URL)
    admin_email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
    admin_password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")

    if not admin_email or not admin_password:
        print("Missing ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD in backend/.env - aborting.")
        sys.exit(1)

    print(f"Target app: {base_url}")

    rotated_password = admin_password + "_reset"
    client = httpx.Client(base_url=base_url, timeout=15.0)
    today = date.today()

    employees = {}
    leave_info = {}
    admin_token = None
    used_rotated = False

    try:
        admin_token, used_rotated = _login_bootstrap_admin(client, admin_email, admin_password, rotated_password)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        employees = _create_employees(client, admin_headers, today)
        _seed_attendance(client, admin_headers, employees, today)
        leave_info = _seed_leave(client, admin_headers, employees, today)
        _seed_payroll(client, admin_headers, employees, today)
    except httpx.ConnectError as exc:
        print(f"\nCould not reach {base_url}: {exc}")
    except Exception as exc:  # noqa: BLE001 - demo-prep script: report and still show partial summary
        print(f"\nSeeding stopped early due to an unexpected error: {exc}")
    finally:
        _restore_admin_password(client, admin_token, used_rotated, admin_password, rotated_password)
        _print_summary(employees, leave_info, today)


if __name__ == "__main__":
    main()
