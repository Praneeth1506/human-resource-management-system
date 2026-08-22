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


def test_employee_applies_for_leave_successfully(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "apply@dayflow.test")

    resp = client.post(
        "/leave",
        json={
            "leave_type": "paid",
            "start_date": "2026-02-10",
            "end_date": "2026-02-12",
            "remarks": "trip",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "pending"
    assert body["leave_type"] == "paid"
    assert body["remarks"] == "trip"


def test_end_date_before_start_date_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "baddates@dayflow.test")

    resp = client.post(
        "/leave",
        json={"leave_type": "sick", "start_date": "2026-02-12", "end_date": "2026-02-10"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_overlapping_leave_request_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "overlap@dayflow.test")

    first = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-03-01", "end_date": "2026-03-05"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first.status_code == 201

    second = client.post(
        "/leave",
        json={"leave_type": "sick", "start_date": "2026-03-04", "end_date": "2026-03-06"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second.status_code == 409


def test_overlap_boundary_shared_single_day_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "boundary@dayflow.test")

    first = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-09-10", "end_date": "2026-09-15"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first.status_code == 201

    # Shares exactly one day (2026-09-10) with the existing request.
    second = client.post(
        "/leave",
        json={"leave_type": "sick", "start_date": "2026-09-05", "end_date": "2026-09-10"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second.status_code == 409


def test_reapplying_after_rejection_is_allowed(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "reapply@dayflow.test")

    first = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-08-01", "end_date": "2026-08-05"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first.status_code == 201
    leave_id = first.json()["id"]

    reject_resp = client.put(
        f"/leave/{leave_id}/reject", json={}, headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "rejected"

    # Same (in fact identical) dates as the now-rejected request - should
    # succeed since rejected requests don't count toward the overlap check.
    second = client.post(
        "/leave",
        json={"leave_type": "sick", "start_date": "2026-08-01", "end_date": "2026-08-05"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second.status_code == 201


def test_employee_cannot_see_others_leave_via_me(client):
    admin_token = _admin_token(client)
    victim_token, _ = _new_employee_token(client, admin_token, "leavevictim@dayflow.test")
    attacker_token, _ = _new_employee_token(client, admin_token, "leaveattacker@dayflow.test")

    client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-04-01", "end_date": "2026-04-02"},
        headers={"Authorization": f"Bearer {victim_token}"},
    )

    resp = client.get("/leave/me", headers={"Authorization": f"Bearer {attacker_token}"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_admin_approves_leave_and_sets_attendance_to_leave(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "approve@dayflow.test")

    apply_resp = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-05-01", "end_date": "2026-05-03"},
        headers={"Authorization": f"Bearer {token}"},
    )
    leave_id = apply_resp.json()["id"]

    approve_resp = client.put(
        f"/leave/{leave_id}/approve",
        json={"comment": "approved, enjoy"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "approved"
    assert approve_resp.json()["review_comment"] == "approved, enjoy"

    attendance_resp = client.get(
        f"/attendance?employee_id={created['employee_id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert attendance_resp.status_code == 200
    records = {r["date"]: r["status"] for r in attendance_resp.json()}
    assert records == {
        "2026-05-01": "leave",
        "2026-05-02": "leave",
        "2026-05-03": "leave",
    }


def test_admin_cannot_approve_already_approved_request(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "doubleapprove@dayflow.test")

    apply_resp = client.post(
        "/leave",
        json={"leave_type": "unpaid", "start_date": "2026-06-01", "end_date": "2026-06-01"},
        headers={"Authorization": f"Bearer {token}"},
    )
    leave_id = apply_resp.json()["id"]

    first_approve = client.put(
        f"/leave/{leave_id}/approve", json={}, headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert first_approve.status_code == 200

    second_approve = client.put(
        f"/leave/{leave_id}/approve", json={}, headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert second_approve.status_code == 409


def test_admin_can_list_and_filter_all_leave_requests(client):
    admin_token = _admin_token(client)
    token_a, created_a = _new_employee_token(client, admin_token, "listleavea@dayflow.test")
    token_b, created_b = _new_employee_token(client, admin_token, "listleaveb@dayflow.test")

    resp_a = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-10-01", "end_date": "2026-10-02"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    resp_b = client.post(
        "/leave",
        json={"leave_type": "sick", "start_date": "2026-10-05", "end_date": "2026-10-05"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    leave_id_a = resp_a.json()["id"]

    client.put(
        f"/leave/{leave_id_a}/approve", json={}, headers={"Authorization": f"Bearer {admin_token}"}
    )

    all_resp = client.get("/leave", headers={"Authorization": f"Bearer {admin_token}"})
    assert all_resp.status_code == 200
    assert len(all_resp.json()) == 2

    status_resp = client.get(
        "/leave?status=pending", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert status_resp.status_code == 200
    statuses = status_resp.json()
    assert len(statuses) == 1
    assert statuses[0]["employee_id"] == created_b["employee_id"]
    assert statuses[0]["status"] == "pending"

    employee_resp = client.get(
        f"/leave?employee_id={created_a['employee_id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert employee_resp.status_code == 200
    employees = employee_resp.json()
    assert len(employees) == 1
    assert employees[0]["employee_id"] == created_a["employee_id"]
    assert employees[0]["status"] == "approved"


def test_employee_cannot_approve_or_reject_leave(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "noapprove@dayflow.test")

    apply_resp = client.post(
        "/leave",
        json={"leave_type": "paid", "start_date": "2026-07-01", "end_date": "2026-07-01"},
        headers={"Authorization": f"Bearer {token}"},
    )
    leave_id = apply_resp.json()["id"]

    approve_resp = client.put(
        f"/leave/{leave_id}/approve", json={}, headers={"Authorization": f"Bearer {token}"}
    )
    assert approve_resp.status_code == 403

    reject_resp = client.put(
        f"/leave/{leave_id}/reject", json={}, headers={"Authorization": f"Bearer {token}"}
    )
    assert reject_resp.status_code == 403
