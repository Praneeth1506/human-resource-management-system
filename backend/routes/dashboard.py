from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db

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

    payroll = db.execute(text("""
        SELECT net_pay FROM payroll
        WHERE employee_id = :id
        ORDER BY year DESC, month DESC LIMIT 1
    """), {"id": employee_id}).mappings().first()

    return {
        "employee": dict(emp) if emp else None,
        "attendance_percent": attendance_pct,
        "leave_balance": 18 - (leave_balance["used"] or 0),
        "latest_net_pay": float(payroll["net_pay"]) if payroll else None,
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