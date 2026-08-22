from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import backend.models as models
import backend.schemas as schemas
import backend.services.auth_service as auth
import backend.services.payroll_service as payroll_service
from backend.database import get_db

router = APIRouter()


def _employee_for(current_user: models.User) -> models.Employee:
    if current_user.employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employee record for this account"
        )
    return current_user.employee


@router.get("/payroll/me", response_model=schemas.PayrollOut)
def my_payroll(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _employee_for(current_user)
    record = payroll_service.get_payroll_for_period(db, employee.id, month, year)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payroll record found for this period",
        )
    return record


@router.get("/payroll/me/history", response_model=list[schemas.PayrollOut])
def my_payroll_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _employee_for(current_user)
    return payroll_service.get_payroll_history(db, employee.id)


@router.get("/payroll", response_model=list[schemas.PayrollOut])
def all_payroll(
    employee_id: Optional[int] = None,
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    query = db.query(models.Payroll)
    if employee_id is not None:
        query = query.filter(models.Payroll.employee_id == employee_id)
    if month is not None:
        query = query.filter(models.Payroll.month == month)
    if year is not None:
        query = query.filter(models.Payroll.year == year)
    records = query.order_by(models.Payroll.year.desc(), models.Payroll.month.desc()).all()
    return [payroll_service.build_payroll_response(db, record) for record in records]


@router.post("/admin/payroll", response_model=schemas.PayrollOut, status_code=status.HTTP_201_CREATED)
def create_payroll(
    payload: schemas.PayrollCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    employee = db.query(models.Employee).filter(models.Employee.id == payload.employee_id).first()
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    existing = payroll_service.get_payroll_record(db, payload.employee_id, payload.month, payload.year)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payroll record already exists for this employee and period",
        )

    record = models.Payroll(
        employee_id=payload.employee_id,
        month=payload.month,
        year=payload.year,
        basic=payload.basic,
        hra=payload.hra,
        pf=payload.pf,
        professional_tax=payload.professional_tax,
        working_days=payload.working_days,
    )
    db.add(record)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payroll record already exists for this employee and period",
        )
    db.refresh(record)
    return payroll_service.build_payroll_response(db, record)


@router.put("/admin/payroll/{payroll_id}", response_model=schemas.PayrollOut)
def update_payroll(
    payroll_id: int,
    payload: schemas.PayrollUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    record = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return payroll_service.build_payroll_response(db, record)
