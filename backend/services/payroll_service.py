import calendar
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

from sqlalchemy.orm import Session

import backend.models as models


def _month_bounds(month: int, year: int) -> tuple[date, date]:
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def count_unpaid_leave_days(db: Session, employee_id: int, month: int, year: int) -> int:
    """Days of *approved, unpaid* leave that fall inside month/year, clipped to
    the month at each end for a request that spans a month boundary.
    """
    month_start, month_end = _month_bounds(month, year)
    requests = (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.employee_id == employee_id,
            models.LeaveRequest.status == "approved",
            models.LeaveRequest.leave_type == "unpaid",
            models.LeaveRequest.start_date <= month_end,
            models.LeaveRequest.end_date >= month_start,
        )
        .all()
    )
    total = 0
    for req in requests:
        overlap_start = max(req.start_date, month_start)
        overlap_end = min(req.end_date, month_end)
        total += (overlap_end - overlap_start).days + 1
    return total


def count_unexcused_absence_days(db: Session, employee_id: int, month: int, year: int) -> int:
    month_start, month_end = _month_bounds(month, year)
    return (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date >= month_start,
            models.Attendance.date <= month_end,
            models.Attendance.status == "absent",
        )
        .count()
    )


def calculate_payable_days(
    working_days: int, unpaid_leave_days: int, unexcused_absence_days: int
) -> int:
    """Pure, DB-free core of the payroll<->attendance link: Working Days -
    Unpaid Leave - Unexcused Absence, floored at 0.
    """
    return max(0, working_days - unpaid_leave_days - unexcused_absence_days)


def compute_payable_days(db: Session, employee_id: int, month: int, year: int, working_days: int) -> int:
    unpaid_leave_days = count_unpaid_leave_days(db, employee_id, month, year)
    unexcused_absence_days = count_unexcused_absence_days(db, employee_id, month, year)
    return calculate_payable_days(working_days, unpaid_leave_days, unexcused_absence_days)


def compute_gross(basic: Decimal, hra: Decimal) -> Decimal:
    return basic + hra


def compute_attendance_deduction(gross: Decimal, working_days: int, payable_days: int) -> Decimal:
    if working_days <= 0:
        return Decimal("0.00")
    per_day_rate = gross / working_days
    unpaid_days = max(0, working_days - payable_days)
    return (per_day_rate * unpaid_days).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_deductions(pf: Decimal, professional_tax: Decimal, attendance_deduction: Decimal) -> Decimal:
    return pf + professional_tax + attendance_deduction


def compute_net_pay(gross: Decimal, deductions: Decimal) -> Decimal:
    return gross - deductions


def build_payroll_response(db: Session, payroll: models.Payroll) -> dict:
    """Row + live recompute of payable_days/gross/deductions/net_pay so the
    numbers always reflect current attendance/leave data, not whatever was
    last stored. Falls back to the row's stored values as-is if any base
    salary input is missing (can't compute from an incomplete record).
    """
    base_fields = (payroll.basic, payroll.hra, payroll.pf, payroll.professional_tax, payroll.working_days)
    if any(field is None for field in base_fields):
        return {
            "id": payroll.id,
            "employee_id": payroll.employee_id,
            "month": payroll.month,
            "year": payroll.year,
            "basic": payroll.basic,
            "hra": payroll.hra,
            "pf": payroll.pf,
            "professional_tax": payroll.professional_tax,
            "working_days": payroll.working_days,
            "payable_days": payroll.payable_days,
            "gross": payroll.gross,
            "deductions": payroll.deductions,
            "net_pay": payroll.net_pay,
        }

    payable_days = compute_payable_days(
        db, payroll.employee_id, payroll.month, payroll.year, payroll.working_days
    )
    gross = compute_gross(payroll.basic, payroll.hra)
    attendance_deduction = compute_attendance_deduction(gross, payroll.working_days, payable_days)
    deductions = compute_deductions(payroll.pf, payroll.professional_tax, attendance_deduction)
    net_pay = compute_net_pay(gross, deductions)

    return {
        "id": payroll.id,
        "employee_id": payroll.employee_id,
        "month": payroll.month,
        "year": payroll.year,
        "basic": payroll.basic,
        "hra": payroll.hra,
        "pf": payroll.pf,
        "professional_tax": payroll.professional_tax,
        "working_days": payroll.working_days,
        "payable_days": payable_days,
        "gross": gross,
        "deductions": deductions,
        "net_pay": net_pay,
    }


def get_payroll_record(db: Session, employee_id: int, month: int, year: int) -> Optional[models.Payroll]:
    return (
        db.query(models.Payroll)
        .filter(
            models.Payroll.employee_id == employee_id,
            models.Payroll.month == month,
            models.Payroll.year == year,
        )
        .first()
    )


def get_payroll_for_period(db: Session, employee_id: int, month: int, year: int) -> Optional[dict]:
    record = get_payroll_record(db, employee_id, month, year)
    if record is None:
        return None
    return build_payroll_response(db, record)


def get_payroll_history(db: Session, employee_id: int) -> list[dict]:
    records = (
        db.query(models.Payroll)
        .filter(models.Payroll.employee_id == employee_id)
        .order_by(models.Payroll.year.desc(), models.Payroll.month.desc())
        .all()
    )
    return [build_payroll_response(db, record) for record in records]
