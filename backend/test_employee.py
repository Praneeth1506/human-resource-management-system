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
    """Logs an employee through the first-login reset dance, returns a
    non-must-reset token."""
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


def test_admin_can_list_employees(client):
    admin_token = _admin_token(client)
    _create_employee(client, admin_token, "list1@dayflow.test")
    _create_employee(client, admin_token, "list2@dayflow.test")

    resp = client.get("/employees", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    emails = {e["email"] for e in resp.json()}
    assert {"list1@dayflow.test", "list2@dayflow.test"}.issubset(emails)


def test_employee_cannot_list_employees(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "noaccess@dayflow.test")
    employee_token = _employee_full_token(client, "noaccess@dayflow.test", created["temp_password"])

    resp = client.get("/employees", headers={"Authorization": f"Bearer {employee_token}"})
    assert resp.status_code == 403


def test_employee_can_view_own_profile(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "own@dayflow.test")
    employee_token = _employee_full_token(client, "own@dayflow.test", created["temp_password"])

    resp = client.get(
        f"/employees/{created['employee_id']}", headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "own@dayflow.test"


def test_employee_cannot_view_others_profile(client):
    admin_token = _admin_token(client)
    victim = _create_employee(client, admin_token, "victim@dayflow.test")
    attacker = _create_employee(client, admin_token, "attacker@dayflow.test")
    attacker_token = _employee_full_token(client, "attacker@dayflow.test", attacker["temp_password"])

    resp = client.get(
        f"/employees/{victim['employee_id']}", headers={"Authorization": f"Bearer {attacker_token}"}
    )
    assert resp.status_code == 403


def test_admin_can_view_any_profile(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "viewable@dayflow.test")

    resp = client.get(
        f"/employees/{created['employee_id']}", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "viewable@dayflow.test"


def test_get_employees_me(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "me@dayflow.test")
    employee_token = _employee_full_token(client, "me@dayflow.test", created["temp_password"])

    resp = client.get("/employees/me", headers={"Authorization": f"Bearer {employee_token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@dayflow.test"
    assert resp.json()["id"] == created["employee_id"]


def test_employee_can_edit_own_allowed_fields(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "editself@dayflow.test")
    employee_token = _employee_full_token(client, "editself@dayflow.test", created["temp_password"])

    resp = client.put(
        f"/employees/{created['employee_id']}",
        json={"phone": "555-1234", "address": "1 Main St", "profile_picture": "https://x.test/p.png"},
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["phone"] == "555-1234"
    assert body["address"] == "1 Main St"
    assert body["profile_picture"] == "https://x.test/p.png"


def test_employee_cannot_edit_disallowed_fields(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "editblocked@dayflow.test")
    employee_token = _employee_full_token(client, "editblocked@dayflow.test", created["temp_password"])

    resp = client.put(
        f"/employees/{created['employee_id']}",
        json={"department": "Engineering"},
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert resp.status_code == 403


def test_employee_cannot_edit_others_profile(client):
    admin_token = _admin_token(client)
    victim = _create_employee(client, admin_token, "victim2@dayflow.test")
    attacker = _create_employee(client, admin_token, "attacker2@dayflow.test")
    attacker_token = _employee_full_token(client, "attacker2@dayflow.test", attacker["temp_password"])

    resp = client.put(
        f"/employees/{victim['employee_id']}",
        json={"phone": "555-9999"},
        headers={"Authorization": f"Bearer {attacker_token}"},
    )
    assert resp.status_code == 403


def test_admin_can_edit_all_fields(client):
    admin_token = _admin_token(client)
    created = _create_employee(client, admin_token, "editbyadmin@dayflow.test")

    resp = client.put(
        f"/employees/{created['employee_id']}",
        json={"department": "Engineering", "designation": "SWE II", "phone": "555-0000"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["department"] == "Engineering"
    assert body["designation"] == "SWE II"
    assert body["phone"] == "555-0000"
