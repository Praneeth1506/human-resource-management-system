from datetime import date
from decimal import Decimal

import backend.models as models
import backend.services.auth_service as auth
import backend.services.payroll_service as payroll_service
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


def _insert_payroll(employee_id, month, year, **overrides):
    db = SessionLocal()
    try:
        fields = dict(
            employee_id=employee_id,
            month=month,
            year=year,
            basic=Decimal("30000.00"),
            hra=Decimal("10000.00"),
            pf=Decimal("1800.00"),
            professional_tax=Decimal("200.00"),
            working_days=26,
            payable_days=26,
            gross=Decimal("40000.00"),
            deductions=Decimal("2000.00"),
            net_pay=Decimal("38000.00"),
        )
        fields.update(overrides)
        row = models.Payroll(**fields)
        db.add(row)
        db.commit()
        db.refresh(row)
        return row.id
    finally:
        db.close()


def _set_attendance_status(employee_id, for_date, status_value):
    db = SessionLocal()
    try:
        db.add(
            models.Attendance(
                employee_id=employee_id,
                date=date.fromisoformat(for_date),
                status=status_value,
            )
        )
        db.commit()
    finally:
        db.close()


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


# ---------------------------------------------------------------------------
# calculate_payable_days: pure function, no DB needed
# ---------------------------------------------------------------------------


def test_calculate_payable_days_basic_example():
    # The example from the spec: 26 working days, 2 unpaid leave, 1 unexcused
    # absence -> 23 payable days.
    assert payroll_service.calculate_payable_days(26, 2, 1) == 23


def test_calculate_payable_days_never_negative():
    assert payroll_service.calculate_payable_days(10, 8, 8) == 0


def test_calculate_payable_days_no_deductions():
    assert payroll_service.calculate_payable_days(22, 0, 0) == 22


# ---------------------------------------------------------------------------
# Payroll calculation formula (gross / deductions / net pay)
# ---------------------------------------------------------------------------


def test_compute_gross_is_basic_plus_hra():
    assert payroll_service.compute_gross(Decimal("30000"), Decimal("10000")) == Decimal("40000")


def test_compute_attendance_deduction_zero_when_fully_payable():
    deduction = payroll_service.compute_attendance_deduction(Decimal("40000"), 26, 26)
    assert deduction == Decimal("0.00")


def test_compute_attendance_deduction_prorates_unpaid_days():
    # 40000 gross / 26 working days = 1538.4615... per day; 2 unpaid days.
    deduction = payroll_service.compute_attendance_deduction(Decimal("40000"), 26, 24)
    assert deduction == Decimal("3076.92")


def test_compute_net_pay_is_gross_minus_deductions():
    net_pay = payroll_service.compute_net_pay(Decimal("40000"), Decimal("2000"))
    assert net_pay == Decimal("38000")


# ---------------------------------------------------------------------------
# Attendance/leave -> payable days integration (real DB rows)
# ---------------------------------------------------------------------------


def test_compute_payable_days_counts_absence_and_unpaid_leave(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "payabledays@dayflow.test")
    employee_id = created["employee_id"]

    _set_attendance_status(employee_id, "2026-08-05", "absent")
    _insert_unpaid_leave(employee_id, "2026-08-10", "2026-08-11")  # 2 days

    db = SessionLocal()
    try:
        payable_days = payroll_service.compute_payable_days(db, employee_id, 8, 2026, 26)
    finally:
        db.close()

    assert payable_days == 23  # 26 - 2 unpaid leave - 1 unexcused absence


def test_compute_payable_days_ignores_pending_unpaid_leave(client):
    admin_token = _admin_token(client)
    _, created = _new_employee_token(client, admin_token, "pendingleave@dayflow.test")
    employee_id = created["employee_id"]

    _insert_unpaid_leave(employee_id, "2026-08-10", "2026-08-11", leave_status="pending")

    db = SessionLocal()
    try:
        payable_days = payroll_service.compute_payable_days(db, employee_id, 8, 2026, 26)
    finally:
        db.close()

    assert payable_days == 26  # only approved unpaid leave counts


# ---------------------------------------------------------------------------
# GET /payroll/me
# ---------------------------------------------------------------------------


def test_get_payroll_for_authenticated_employee(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "getpayroll@dayflow.test")
    _insert_payroll(created["employee_id"], 8, 2026)

    resp = client.get(
        "/payroll/me?month=8&year=2026", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["month"] == 8
    assert body["year"] == 2026
    assert body["basic"] == "30000.00" or float(body["basic"]) == 30000.0
    assert body["payable_days"] == 26
    assert body["net_pay"] is not None


def test_payroll_reflects_attendance_and_leave(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "linkedpayroll@dayflow.test")
    employee_id = created["employee_id"]
    # basic=30000, hra=10000, pf=1800, professional_tax=200, working_days=26
    # (see _insert_payroll defaults) - stored payable_days/gross/deductions/
    # net_pay below are deliberately stale, to prove the response reflects
    # the live recompute, not these stored values.
    _insert_payroll(
        employee_id,
        8,
        2026,
        payable_days=26,
        gross=Decimal("40000.00"),
        deductions=Decimal("2000.00"),
        net_pay=Decimal("38000.00"),
    )

    _set_attendance_status(employee_id, "2026-08-05", "absent")  # 1 unexcused absence
    _insert_unpaid_leave(employee_id, "2026-08-10", "2026-08-11")  # 2 unpaid leave days

    resp = client.get(
        "/payroll/me?month=8&year=2026", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    body = resp.json()

    # Hand-calculated expected values (independent of payroll_service's own
    # code, worked out by hand from the spec's formulas):
    #   payable_days = 26 working days - 2 unpaid leave - 1 unexcused absence = 23
    #   gross = basic(30000) + hra(10000) = 40000.00
    #   per_day_rate = 40000 / 26 = 1538.461538...
    #   unpaid_days = working_days(26) - payable_days(23) = 3
    #   attendance_deduction = 1538.461538... * 3 = 4615.384615... -> 4615.38 (2dp, half-up)
    #   deductions = pf(1800) + professional_tax(200) + attendance_deduction(4615.38) = 6615.38
    #   net_pay = gross(40000) - deductions(6615.38) = 33384.62
    assert body["payable_days"] == 23  # recomputed live, not the stale stored value of 26
    assert Decimal(str(body["gross"])) == Decimal("40000.00")
    assert Decimal(str(body["deductions"])) == Decimal("6615.38")
    assert Decimal(str(body["net_pay"])) == Decimal("33384.62")


def test_get_payroll_missing_record_returns_404(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "nopayroll@dayflow.test")

    resp = client.get(
        "/payroll/me?month=1&year=2026", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 404


def test_get_payroll_invalid_month_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "badmonth@dayflow.test")

    resp = client.get(
        "/payroll/me?month=13&year=2026", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


def test_get_payroll_invalid_year_rejected(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "badyear@dayflow.test")

    resp = client.get(
        "/payroll/me?month=8&year=99", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


def test_employee_cannot_access_another_employees_payroll(client):
    admin_token = _admin_token(client)
    _, victim = _new_employee_token(client, admin_token, "payrollvictim@dayflow.test")
    attacker_token, _ = _new_employee_token(client, admin_token, "payrollattacker@dayflow.test")
    _insert_payroll(victim["employee_id"], 8, 2026)

    # No employee_id param exists on this route at all - identity always
    # comes from the attacker's own token, so they simply see their own
    # (nonexistent) record, never the victim's.
    resp = client.get(
        "/payroll/me?month=8&year=2026", headers={"Authorization": f"Bearer {attacker_token}"}
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# GET /payroll/me/history
# ---------------------------------------------------------------------------


def test_payroll_history_sorted_newest_first(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "history@dayflow.test")
    employee_id = created["employee_id"]

    _insert_payroll(employee_id, 6, 2026)
    _insert_payroll(employee_id, 8, 2026)
    _insert_payroll(employee_id, 7, 2026)

    resp = client.get("/payroll/me/history", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    periods = [(r["year"], r["month"]) for r in resp.json()]
    assert periods == [(2026, 8), (2026, 7), (2026, 6)]


def test_payroll_history_only_own_records(client):
    admin_token = _admin_token(client)
    token, created = _new_employee_token(client, admin_token, "historymine@dayflow.test")
    _, other = _new_employee_token(client, admin_token, "historyother@dayflow.test")

    _insert_payroll(created["employee_id"], 8, 2026)
    _insert_payroll(other["employee_id"], 8, 2026)

    resp = client.get("/payroll/me/history", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) == 1
    assert records[0]["employee_id"] == created["employee_id"]


def test_payroll_history_empty_for_new_employee(client):
    admin_token = _admin_token(client)
    token, _ = _new_employee_token(client, admin_token, "nohistory@dayflow.test")

    resp = client.get("/payroll/me/history", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json() == []
