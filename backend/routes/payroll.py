from fastapi import APIRouter, Depends, HTTPException, Query, status
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
