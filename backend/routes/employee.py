from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import backend.models as models
import backend.schemas as schemas
import backend.services.auth_service as auth
from backend.database import get_db

router = APIRouter()

# PUT /employees/{id}: the EmployeeUpdate schema's fields ARE the admin-editable
# set (first_name/last_name/department/designation/email/phone/address/
# profile_picture) - employee_code/user_id/id/joining_date are immutable via
# this endpoint even for admins, simply by not being schema fields at all.
# An employee editing their own record is further restricted to this subset.
SELF_EDITABLE_FIELDS = {"phone", "address", "profile_picture"}


def _to_employee_out(employee: models.Employee) -> schemas.EmployeeOut:
    return schemas.EmployeeOut(
        id=employee.id,
        login_id=employee.user.login_id,
        role=employee.user.role,
        employee_code=employee.employee_code,
        first_name=employee.first_name,
        last_name=employee.last_name,
        department=employee.department,
        designation=employee.designation,
        joining_date=employee.joining_date,
        email=employee.email,
        phone=employee.phone,
        address=employee.address,
        profile_picture=employee.profile_picture,
    )


def _get_employee_or_404(db: Session, employee_id: int) -> models.Employee:
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


def _require_self_or_admin(current_user: models.User, employee: models.Employee) -> None:
    if current_user.role == "admin":
        return
    if current_user.employee is None or current_user.employee.id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own employee record",
        )


@router.get("/employees", response_model=list[schemas.EmployeeOut])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    employees = (
        db.query(models.Employee)
        .order_by(models.Employee.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_to_employee_out(e) for e in employees]


@router.get("/employees/me", response_model=schemas.EmployeeOut)
def get_my_employee(
    current_user: models.User = Depends(auth.get_active_user),
):
    if current_user.employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employee record for this account"
        )
    return _to_employee_out(current_user.employee)


@router.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _get_employee_or_404(db, employee_id)
    _require_self_or_admin(current_user, employee)
    return _to_employee_out(employee)


@router.put("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(
    employee_id: int,
    payload: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    employee = _get_employee_or_404(db, employee_id)
    _require_self_or_admin(current_user, employee)

    updates = payload.model_dump(exclude_unset=True)

    if current_user.role != "admin":
        disallowed = set(updates.keys()) - SELF_EDITABLE_FIELDS
        if disallowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You are not allowed to edit: {', '.join(sorted(disallowed))}",
            )

    if "email" in updates and updates["email"] is not None:
        updates["email"] = updates["email"].strip().lower()

    for field, value in updates.items():
        setattr(employee, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        detail = (
            "An employee with this email already exists"
            if "email" in updates
            else "Update violates a database constraint"
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
    db.refresh(employee)
    return _to_employee_out(employee)
