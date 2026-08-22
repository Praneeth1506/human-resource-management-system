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


def _payroll_payload(employee_id, month=8, year=2026, **overrides):
    payload = dict(
        employee_id=employee_id,
        month=month,
        year=year,
        basic=30000.00,
        hra=10000.00,
        pf=1800.00,
        professional_tax=200.00,
        working_days=26,
    )
    payload.update(overrides)
    return payload


def test_admin_can_create_payroll(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "createpayroll@dayflow.test")

    resp = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["employee_id"] == created["employee_id"]
    assert body["month"] == 8
    assert body["year"] == 2026
    # no attendance/leave rows exist yet, so payable_days == working_days
    # and gross/net_pay reflect the live-recomputed formula with 0 deductions
    # beyond pf/professional_tax.
    assert body["payable_days"] == 26
    assert float(body["gross"]) == 40000.00
    assert float(body["net_pay"]) == 38000.00


def test_duplicate_period_rejected(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "duppayroll@dayflow.test")

    first = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert first.status_code == 201

    second = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert second.status_code == 409


def test_employee_forbidden_on_create(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "noc@dayflow.test")

    resp = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_employee_forbidden_on_update(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "nou@dayflow.test")

    create_resp = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    payroll_id = create_resp.json()["id"]

    resp = client.put(
        f"/admin/payroll/{payroll_id}",
        json={"basic": 35000.00},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


def test_employee_forbidden_on_list(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "nol@dayflow.test")

    resp = client.get("/payroll", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_can_list_and_filter_payroll(client):
    admin_token = _admin_token(client)
    _, created_a = _new_employee_token(client, admin_token, "filtera@dayflow.test")
    _, created_b = _new_employee_token(client, admin_token, "filterb@dayflow.test")

    client.post(
        "/admin/payroll",
        json=_payroll_payload(created_a["employee_id"], month=7, year=2026),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    client.post(
        "/admin/payroll",
        json=_payroll_payload(created_a["employee_id"], month=8, year=2026),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    client.post(
        "/admin/payroll",
        json=_payroll_payload(created_b["employee_id"], month=8, year=2026),
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    all_resp = client.get("/payroll", headers={"Authorization": f"Bearer {admin_token}"})
    assert all_resp.status_code == 200
    assert len(all_resp.json()) == 3

    by_employee = client.get(
        f"/payroll?employee_id={created_a['employee_id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert by_employee.status_code == 200
    assert len(by_employee.json()) == 2
    assert all(r["employee_id"] == created_a["employee_id"] for r in by_employee.json())

    by_period = client.get(
        "/payroll?month=8&year=2026", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert by_period.status_code == 200
    assert len(by_period.json()) == 2
    assert all(r["month"] == 8 and r["year"] == 2026 for r in by_period.json())


def test_put_updates_only_sent_fields(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "partialupdate@dayflow.test")

    create_resp = client.post(
        "/admin/payroll",
        json=_payroll_payload(created["employee_id"]),
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    payroll_id = create_resp.json()["id"]

    resp = client.put(
        f"/admin/payroll/{payroll_id}",
        json={"basic": 35000.00},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert float(body["basic"]) == 35000.00
    # everything else untouched from the original create payload
    assert float(body["hra"]) == 10000.00
    assert float(body["pf"]) == 1800.00
    assert float(body["professional_tax"]) == 200.00
    assert body["working_days"] == 26
    # live-recomputed response, matching the new basic
    assert float(body["gross"]) == 45000.00
