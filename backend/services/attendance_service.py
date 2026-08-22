from datetime import date as date_type

from sqlalchemy.orm import Session

import backend.models as models


def upsert_attendance_status(
    db: Session, employee_id: int, for_date: date_type, status_value: str
) -> tuple[models.Attendance, bool]:
    """Create-or-update the attendance row for employee_id+for_date with
    status_value. Does NOT commit - the caller controls the transaction
    boundary, since callers (the admin override route, leave-approval
    setting "leave" across a date range) may need to batch several of
    these plus another update into one atomic commit. Returns (record, created).
    """
    record = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee_id, models.Attendance.date == for_date)
        .first()
    )
    if record is None:
        record = models.Attendance(employee_id=employee_id, date=for_date, status=status_value)
        db.add(record)
        return record, True

    record.status = status_value
    return record, False
