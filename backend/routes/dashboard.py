from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
import backend.services.payroll_service as payroll_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/employee/{employee_id}")
def get_employee_dashboard(employee_id: int, db: Session = Depends(get_db)):
    emp = db.execute(
        text("SELECT * FROM employees WHERE id = :id"),
        {"id": employee_id}
    ).mappings().first()

    attendance = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE status = 'present') AS present,
            COUNT(*) AS total
        FROM attendance
        WHERE employee_id = :id
        AND date >= date_trunc('month', CURRENT_DATE)
    """), {"id": employee_id}).mappings().first()

    attendance_pct = round((attendance["present"] / attendance["total"]) * 100, 1) if attendance["total"] else 0

    leave_balance = db.execute(text("""
        SELECT COUNT(*) AS used
        FROM leave_requests
        WHERE employee_id = :id AND status = 'approved'
        AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    """), {"id": employee_id}).mappings().first()

    # Use the shared live-recompute path (same one every other payroll-reading
    # endpoint uses) instead of reading the raw net_pay column - that column
    # is intentionally never populated on write, only computed on read, so
    # reading it directly here always returned NULL and crashed on float(None).
    payroll_history = payroll_service.get_payroll_history(db, employee_id)
    latest_payroll = payroll_history[0] if payroll_history else None

    return {
        "employee": dict(emp) if emp else None,
        "attendance_percent": attendance_pct,
        "leave_balance": 18 - (leave_balance["used"] or 0),
        "latest_net_pay": (
            float(latest_payroll["net_pay"])
            if latest_payroll and latest_payroll["net_pay"] is not None
            else None
        ),
    }


@router.get("/admin")
def get_admin_dashboard(db: Session = Depends(get_db)):
    total_employees = db.execute(text("SELECT COUNT(*) AS c FROM employees")).mappings().first()["c"]

    today_stats = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE status = 'present') AS present,
            COUNT(*) FILTER (WHERE status = 'absent') AS absent
        FROM attendance WHERE date = CURRENT_DATE
    """)).mappings().first()

    pending_leaves = db.execute(text("""
        SELECT COUNT(*) AS c FROM leave_requests WHERE status = 'pending'
    """)).mappings().first()["c"]

    attendance_rate = round((today_stats["present"] / total_employees) * 100, 1) if total_employees else 0

    low_attendance = db.execute(text("""
        SELECT e.id, e.first_name, e.last_name,
            ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'present') / NULLIF(COUNT(*), 0), 1) AS pct
        FROM employees e
        JOIN attendance a ON a.employee_id = e.id
        WHERE a.date >= date_trunc('month', CURRENT_DATE)
        GROUP BY e.id
        HAVING ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'present') / NULLIF(COUNT(*), 0), 1) < 75
    """)).mappings().all()

    return {
        "total_employees": total_employees,
        "present_today": today_stats["present"] or 0,
        "absent_today": today_stats["absent"] or 0,
        "pending_leaves": pending_leaves,
        "attendance_rate": attendance_rate,
        "needs_attention": {
            "low_attendance_employees": [dict(r) for r in low_attendance],
            "pending_leave_count": pending_leaves,
        }
    }