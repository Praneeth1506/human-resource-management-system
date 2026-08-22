from datetime import datetime, timedelta, timezone

from jose import jwt

import backend.models as models
import backend.services.auth_service as auth
from backend.database import SessionLocal

ADMIN_LOGIN_ID = "DF-TEST-2026-0001"
ADMIN_EMAIL = "admin@dayflow.test"
ADMIN_PASSWORD = "AdminPass123"


def _make_admin(
    login_id=ADMIN_LOGIN_ID,
    email=ADMIN_EMAIL,
    password=ADMIN_PASSWORD,
    first_login=False,
):
    db = SessionLocal()
    try:
        admin = models.User(
            login_id=login_id,
            password_hash=auth.hash_password(password),
            role="admin",
            first_login=first_login,
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
        db.refresh(admin)
        return admin
    finally:
        db.close()


def _admin_token(client, login_id=ADMIN_LOGIN_ID, email=ADMIN_EMAIL, password=ADMIN_PASSWORD):
    _make_admin(login_id, email, password)
    resp = client.post("/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_login_success(client):
    _make_admin()
    resp = client.post("/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"]
    assert body["must_reset_password"] is False


def test_login_wrong_password(client):
    _make_admin()
    resp = client.post("/login", json={"email": ADMIN_EMAIL, "password": "WrongPass"})
    assert resp.status_code == 401
    assert "Invalid" in resp.json()["detail"]


def test_wrong_role_hits_admin_route(client):
    token = _admin_token(client)

    create_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "joining_date": "2026-01-15",
            "email": "john.doe@dayflow.test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 201
    employee_temp_password = create_resp.json()["temp_password"]

    # Employee resets their password to get a full (non must-reset) token.
    login_resp = client.post(
        "/login",
        json={"email": "john.doe@dayflow.test", "password": employee_temp_password},
    )
    assert login_resp.json()["must_reset_password"] is True
    reset_resp = client.post(
        "/first-login/reset-password",
        json={"old_password": employee_temp_password, "new_password": "NewPass456"},
        headers={"Authorization": f"Bearer {login_resp.json()['access_token']}"},
    )
    assert reset_resp.status_code == 200

    relogin_resp = client.post(
        "/login", json={"email": "john.doe@dayflow.test", "password": "NewPass456"}
    )
    employee_token = relogin_resp.json()["access_token"]

    forbidden_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "Jane",
            "last_name": "Roe",
            "joining_date": "2026-01-15",
            "email": "jane.roe@dayflow.test",
        },
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert forbidden_resp.status_code == 403


def test_first_login_token_blocked_from_protected_routes(client):
    _make_admin(
        login_id="DF-NEWA-2026-0002",
        email="newadmin@dayflow.test",
        password="TempPass123",
        first_login=True,
    )

    login_resp = client.post(
        "/login", json={"email": "newadmin@dayflow.test", "password": "TempPass123"}
    )
    assert login_resp.json()["must_reset_password"] is True
    temp_token = login_resp.json()["access_token"]

    resp = client.post(
        "/admin/employees",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "joining_date": "2026-01-15",
            "email": "john.doe@dayflow.test",
        },
        headers={"Authorization": f"Bearer {temp_token}"},
    )
    assert resp.status_code == 403
    assert "reset" in resp.json()["detail"].lower()


def test_expired_token_rejected(client):
    admin = _make_admin()
    expired_payload = {
        "sub": str(admin.id),
        "role": admin.role,
        "must_reset": False,
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    expired_token = jwt.encode(
        expired_payload, auth.JWT_SECRET, algorithm=auth.JWT_ALGORITHM
    )

    resp = client.post(
        "/admin/employees",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "joining_date": "2026-01-15",
            "email": "john.doe@dayflow.test",
        },
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp.status_code == 401


def test_reusing_old_password_after_reset_fails(client):
    token = _admin_token(client)
    create_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "Amy",
            "last_name": "Lee",
            "joining_date": "2026-02-01",
            "email": "amy.lee@dayflow.test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    old_password = create_resp.json()["temp_password"]

    login_resp = client.post(
        "/login", json={"email": "amy.lee@dayflow.test", "password": old_password}
    )
    temp_token = login_resp.json()["access_token"]

    reset_resp = client.post(
        "/first-login/reset-password",
        json={"old_password": old_password, "new_password": "BrandNewPass789"},
        headers={"Authorization": f"Bearer {temp_token}"},
    )
    assert reset_resp.status_code == 200

    stale_login_resp = client.post(
        "/login", json={"email": "amy.lee@dayflow.test", "password": old_password}
    )
    assert stale_login_resp.status_code == 401


def test_duplicate_employee_email_rejected(client):
    token = _admin_token(client)

    first_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "Sam",
            "last_name": "Iyer",
            "joining_date": "2026-03-01",
            "email": "dup@dayflow.test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first_resp.status_code == 201

    second_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "Sara",
            "last_name": "Iyer",
            "joining_date": "2026-03-02",
            "email": "dup@dayflow.test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second_resp.status_code == 409
    assert "already exists" in second_resp.json()["detail"].lower()


def test_login_email_is_case_insensitive(client):
    token = _admin_token(client)

    create_resp = client.post(
        "/admin/employees",
        json={
            "first_name": "Casey",
            "last_name": "Nolan",
            "joining_date": "2026-03-10",
            "email": "Test@X.com",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 201
    temp_password = create_resp.json()["temp_password"]

    login_resp = client.post(
        "/login", json={"email": "test@x.com", "password": temp_password}
    )
    assert login_resp.status_code == 200
