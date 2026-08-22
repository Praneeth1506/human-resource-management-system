import backend.models as models
import backend.services.auth_service as auth
from backend.database import SessionLocal

ADMIN_LOGIN_ID = "DF-TEST-2026-0001"
ADMIN_EMAIL = "admin@dayflow.test"
ADMIN_PASSWORD = "AdminPass123"


def _make_admin(login_id=ADMIN_LOGIN_ID, email=ADMIN_EMAIL, password=ADMIN_PASSWORD):
    db = SessionLocal()
    try:
        admin = models.User(
            login_id=login_id,
            password_hash=auth.hash_password(password),
            role="admin",
            first_login=False,
        )
        db.add(admin)
        db.flush()
        db.add(
            models.Employee(
                user_id=admin.id,
                employee_code=login_id,
                first_name="Admin",
                last_name="User",
                email=email,
            )
        )
        db.commit()
    finally:
        db.close()


def _admin_token(client):
    _make_admin()
    resp = client.post("/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def _create_employee(client, admin_token, email, first_name="Jane", last_name="Doe"):
    resp = client.post(
        "/admin/employees",
        json={
            "first_name": first_name,
            "last_name": last_name,
            "joining_date": "2026-01-15",
            "email": email,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    return resp.json()


def _employee_full_token(client, email, temp_password):
    login_resp = client.post("/login", json={"email": email, "password": temp_password})
    temp_token = login_resp.json()["access_token"]
    reset_resp = client.post(
        "/first-login/reset-password",
        json={"old_password": temp_password, "new_password": "NewPass456"},
        headers={"Authorization": f"Bearer {temp_token}"},
    )
    assert reset_resp.status_code == 200
    relogin = client.post("/login", json={"email": email, "password": "NewPass456"})
    assert relogin.status_code == 200
    return relogin.json()["access_token"]


def _new_employee_token(client, admin_token, email):
    created = _create_employee(client, admin_token, email)
    return _employee_full_token(client, email, created["temp_password"]), created


def test_check_in_creates_record(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "checkin@dayflow.test")

    resp = client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "present"
    assert body["check_in"] is not None
    assert body["check_out"] is None


def test_duplicate_check_in_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "dupcheckin@dayflow.test")

    first = client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    assert first.status_code == 201

    second = client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    assert second.status_code == 409


def test_check_out_without_checkin_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "nocheckin@dayflow.test")

    resp = client.post("/attendance/check-out", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 400


def test_check_out_after_check_in(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "fullday@dayflow.test")

    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    resp = client.post("/attendance/check-out", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["check_out"] is not None


def test_duplicate_check_out_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "dupcheckout@dayflow.test")

    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    first = client.post("/attendance/check-out", headers={"Authorization": f"Bearer {token}"})
    assert first.status_code == 200

    second = client.post("/attendance/check-out", headers={"Authorization": f"Bearer {token}"})
    assert second.status_code == 409


def test_get_my_attendance(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "meattendance@dayflow.test")
    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})

    resp = client.get("/attendance/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) == 1
    assert records[0]["status"] == "present"


def test_employee_cannot_see_others_attendance_via_me(client):
    admin_token = _admin_token(client)
    victim_token, victim = _new_employee_token(client, admin_token, "victim@dayflow.test")
    attacker_token, _ = _new_employee_token(client, admin_token, "attacker@dayflow.test")

    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {victim_token}"})

    # /attendance/me has no employee_id parameter at all - a manipulated
    # query param is simply ignored, records are always derived from the
    # caller's own token, never from client-supplied input.
    resp = client.get(
        f"/attendance/me?employee_id={victim['employee_id']}",
        headers={"Authorization": f"Bearer {attacker_token}"},
    )
    assert resp.status_code == 200
    assert resp.json() == []  # attacker never checked in - sees none of victim's records


def test_employee_cannot_view_all_attendance(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "blockedall@dayflow.test")

    resp = client.get("/attendance", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_employee_cannot_view_all_attendance_with_employee_id_filter(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "blockedfilter@dayflow.test")

    resp = client.get(
        "/attendance?employee_id=1", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403


def test_admin_can_view_all_attendance_filtered_by_employee(client):
    admin_token = _admin_token(client)
    token_a, created_a = _new_employee_token(client, admin_token, "filtera@dayflow.test")
    token_b, created_b = _new_employee_token(client, admin_token, "filterb@dayflow.test")

    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token_a}"})
    client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token_b}"})

    resp = client.get(
        f"/attendance?employee_id={created_a['employee_id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) == 1
    assert records[0]["employee_id"] == created_a["employee_id"]


def test_admin_can_set_attendance_status_for_new_record(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "statusnew@dayflow.test")

    resp = client.put(
        f"/attendance/{created['employee_id']}/status",
        json={"date": "2026-01-20", "status": "absent"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["employee_id"] == created["employee_id"]
    assert body["date"] == "2026-01-20"
    assert body["status"] == "absent"
    assert body["check_in"] is None
    assert body["check_out"] is None


def test_admin_can_override_existing_status_without_duplicating(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "statusoverride@dayflow.test")

    checkin_resp = client.post("/attendance/check-in", headers={"Authorization": f"Bearer {token}"})
    assert checkin_resp.status_code == 201
    assert checkin_resp.json()["status"] == "present"
    today = checkin_resp.json()["date"]

    resp = client.put(
        f"/attendance/{created['employee_id']}/status",
        json={"date": today, "status": "half_day"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200  # updated, not created
    assert resp.json()["status"] == "half_day"

    # confirm the check-in row was updated in place, not duplicated
    me_resp = client.get("/attendance/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    records = me_resp.json()
    assert len(records) == 1
    assert records[0]["status"] == "half_day"
    assert records[0]["check_in"] is not None  # original check-in time preserved
