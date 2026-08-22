from datetime import date

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


def _seed_attendance(client, admin_token, employee_id, for_date, status_value):
    resp = client.put(
        f"/attendance/{employee_id}/status",
        json={"date": for_date, "status": status_value},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)


def _insert_unpaid_leave(employee_id, start_date, end_date, leave_status="approved"):
    db = SessionLocal()
    try:
        db.add(
            models.LeaveRequest(
                employee_id=employee_id,
                leave_type="unpaid",
                start_date=date.fromisoformat(start_date),
                end_date=date.fromisoformat(end_date),
                status=leave_status,
            )
        )
        db.commit()
    finally:
        db.close()


def test_admin_gets_medium_risk_for_known_inputs(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "riskmedium@dayflow.test")
    employee_id = created["employee_id"]

    # 1 absent (2) + 2 unpaid leave days (2) + 1 late (1) = risk_score 5 -> MEDIUM (3-6)
    _seed_attendance(client, admin_token, employee_id, "2026-08-01", "absent")
    _seed_attendance(client, admin_token, employee_id, "2026-08-02", "late")
    _insert_unpaid_leave(employee_id, "2026-08-10", "2026-08-11")

    resp = client.get(
        f"/attendance/{employee_id}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["employee_id"] == employee_id
    assert body["month"] == 8
    assert body["year"] == 2026
    assert body["absent_days"] == 1
    assert body["late_days"] == 1
    assert body["unpaid_leave_days"] == 2
    assert body["risk_score"] == 5
    assert body["risk_level"] == "MEDIUM"
    assert body["note"] is None


def test_admin_gets_high_risk_for_known_inputs(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "riskhigh@dayflow.test")
    employee_id = created["employee_id"]

    # 3 absent days (6) + 1 unpaid leave day (1) = risk_score 7 -> HIGH (>6)
    _seed_attendance(client, admin_token, employee_id, "2026-08-01", "absent")
    _seed_attendance(client, admin_token, employee_id, "2026-08-02", "absent")
    _seed_attendance(client, admin_token, employee_id, "2026-08-03", "absent")
    _insert_unpaid_leave(employee_id, "2026-08-15", "2026-08-15")

    resp = client.get(
        f"/attendance/{employee_id}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["absent_days"] == 3
    assert body["unpaid_leave_days"] == 1
    assert body["late_days"] == 0
    assert body["risk_score"] == 7
    assert body["risk_level"] == "HIGH"


def test_admin_gets_low_risk_for_clean_attendance(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "risklow@dayflow.test")
    employee_id = created["employee_id"]

    # 1 present day, nothing else -> risk_score 0 -> LOW
    _seed_attendance(client, admin_token, employee_id, "2026-08-01", "present")

    resp = client.get(
        f"/attendance/{employee_id}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["risk_score"] == 0
    assert body["risk_level"] == "LOW"
    assert body["note"] is None  # real (if clean) data, not the insufficient-data case


def test_employee_with_no_attendance_data_returns_low_with_note(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "risknodata@dayflow.test")
    employee_id = created["employee_id"]

    resp = client.get(
        f"/attendance/{employee_id}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["risk_level"] == "LOW"
    assert body["risk_score"] == 0
    assert body["absent_days"] == 0
    assert body["unpaid_leave_days"] == 0
    assert body["late_days"] == 0
    assert body["note"] == "insufficient data"


def test_employee_cannot_check_own_risk_score(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "riskself@dayflow.test")

    resp = client.get(
        f"/attendance/{created['employee_id']}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_employee_cannot_check_another_employees_risk_score(client):
    admin_token = _admin_token(client)
    _, victim = _new_employee_token(client, admin_token, "riskvictim@dayflow.test")
    attacker_token, _ = _new_employee_token(client, admin_token, "riskattacker@dayflow.test")

    resp = client.get(
        f"/attendance/{victim['employee_id']}/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {attacker_token}"},
    )
    assert resp.status_code == 403


def test_invalid_month_rejected(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "riskbadmonth@dayflow.test")

    resp = client.get(
        f"/attendance/{created['employee_id']}/risk?month=13&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_invalid_year_rejected(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "riskbadyear@dayflow.test")

    resp = client.get(
        f"/attendance/{created['employee_id']}/risk?month=8&year=99",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_risk_for_nonexistent_employee_returns_404(client):
    admin_token = _admin_token(client)

    resp = client.get(
        "/attendance/999999/risk?month=8&year=2026",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404
