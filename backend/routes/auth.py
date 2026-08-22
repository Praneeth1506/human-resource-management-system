from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import backend.models as models
import backend.schemas as schemas
import backend.services.auth_service as auth
from backend.database import get_db

router = APIRouter()


@router.post(
    "/admin/employees",
    response_model=schemas.EmployeeCreated,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    payload: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    joining_year = payload.joining_date.year
    login_id = auth.generate_login_id(db, payload.first_name, payload.last_name, joining_year)
    temp_password = auth.generate_temp_password()
    email = payload.email.strip().lower()

    user = models.User(
        login_id=login_id,
        password_hash=auth.hash_password(temp_password),
        role="employee",
        first_login=True,
    )
    db.add(user)
    db.flush()

    employee = models.Employee(
        user_id=user.id,
        employee_code=login_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        department=payload.department,
        designation=payload.designation,
        joining_date=payload.joining_date,
        email=email,
        phone=payload.phone,
        address=payload.address,
        profile_picture=payload.profile_picture,
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this email already exists",
        )
    db.refresh(employee)

    return schemas.EmployeeCreated(
        employee_id=employee.id,
        login_id=login_id,
        temp_password=temp_password,
        role=user.role,
    )


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    employee = db.query(models.Employee).filter(models.Employee.email == email).first()
    user = employee.user if employee else None
    if user is None or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = auth.create_access_token(user, must_reset=user.first_login)
    return schemas.LoginResponse(access_token=token, must_reset_password=user.first_login)


@router.post("/first-login/reset-password")
def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not auth.verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect",
        )

    current_user.password_hash = auth.hash_password(payload.new_password)
    current_user.first_login = False
    db.commit()
    return {"detail": "Password updated successfully"}
