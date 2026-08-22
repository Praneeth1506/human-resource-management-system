from datetime import date as date_type
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import backend.models as models
import backend.schemas as schemas
import backend.services.attendance_service as attendance_service
import backend.services.auth_service as auth
from backend.database import get_db

router = APIRouter()


def _employee_for(current_user: models.User) -> models.Employee:
    if current_user.employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employee record for this account"
        )
    return current_user.employee


@router.post(
    "/attendance/check-in",
    response_model=schemas.AttendanceOut,
    status_code=status.HTTP_201_CREATED,
)
def check_in(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _employee_for(current_user)
    today = datetime.now().date()

    existing = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee.id, models.Attendance.date == today)
        .first()
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already checked in today")

    # Only "present" is ever set automatically, on check-in. "absent" is never
    # auto-derived anywhere in this app - there's no scheduled job to mark
    # employees who never checked in, and no admin endpoint yet to set it
    # manually either. "half_day" and "leave" are likewise never auto-set;
    # wiring attendance.status to leave_requests approval isn't implemented.
    record = models.Attendance(
        employee_id=employee.id,
        date=today,
        check_in=datetime.now().time(),
        status="present",
    )
    db.add(record)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already checked in today")
    db.refresh(record)
    return record


@router.post("/attendance/check-out", response_model=schemas.AttendanceOut)
def check_out(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _employee_for(current_user)
    today = datetime.now().date()

    record = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee.id, models.Attendance.date == today)
        .first()
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No check-in found for today"
        )
    if record.check_out is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already checked out today")

    record.check_out = datetime.now().time()
    db.commit()
    db.refresh(record)
    return record


@router.get("/attendance/me", response_model=list[schemas.AttendanceOut])
def my_attendance(
    view: str = Query("weekly", pattern="^(daily|weekly)$"),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        pattern="^(present|absent|half_day|leave|late)$",
    ),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _employee_for(current_user)
    today = datetime.now().date()

    query = db.query(models.Attendance).filter(models.Attendance.employee_id == employee.id)

    # `month` opts into a calendar-month window instead of the `view`-based
    # rolling window below; `year` only matters alongside `month` and
    # defaults to the current year when omitted.
    if month is not None:
        filter_year = year if year is not None else today.year
        query = query.filter(
            extract("year", models.Attendance.date) == filter_year,
            extract("month", models.Attendance.date) == month,
        )
    else:
        start_date = today if view == "daily" else today - timedelta(days=6)
        query = query.filter(
            models.Attendance.date >= start_date,
            models.Attendance.date <= today,
        )

    if status_filter is not None:
        query = query.filter(models.Attendance.status == status_filter)

    return query.order_by(models.Attendance.date).all()


@router.get("/attendance", response_model=list[schemas.AttendanceOut])
def all_attendance(
    employee_id: Optional[int] = None,
    date: Optional[date_type] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    query = db.query(models.Attendance)
    if employee_id is not None:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date is not None:
        query = query.filter(models.Attendance.date == date)
    return query.order_by(models.Attendance.date.desc()).all()


@router.put("/attendance/{employee_id}/status", response_model=schemas.AttendanceOut)
def set_attendance_status(
    employee_id: int,
    payload: schemas.AttendanceStatusUpdate,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    """Admin manual override/upsert - additive to, not a replacement for, the
    auto-"present"-on-check-in path above. Creates the record if none exists
    for employee_id+date, otherwise updates the existing one's status.
    """
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    record, created = attendance_service.upsert_attendance_status(
        db, employee_id, payload.date, payload.status
    )
    if created:
        response.status_code = status.HTTP_201_CREATED

    db.commit()
    db.refresh(record)
    return record
