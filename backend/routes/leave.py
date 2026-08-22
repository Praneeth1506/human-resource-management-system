from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import backend.models as models
import backend.schemas as schemas
import backend.services.attendance_service as attendance_service
import backend.services.auth_service as auth
from backend.database import get_db

router = APIRouter()


def _get_leave_or_404(db: Session, leave_id: int) -> models.LeaveRequest:
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if leave is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    return leave


def _require_pending(leave: models.LeaveRequest, action: str) -> None:
    if leave.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Leave request is already {leave.status}, only pending requests can be {action}",
        )


@router.post("/leave", response_model=schemas.LeaveOut, status_code=status.HTTP_201_CREATED)
def apply_leave(
    payload: schemas.LeaveCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    if current_user.employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employee record for this account"
        )
    employee = current_user.employee

    overlap = (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.employee_id == employee.id,
            models.LeaveRequest.status.in_(["pending", "approved"]),
            models.LeaveRequest.start_date <= payload.end_date,
            models.LeaveRequest.end_date >= payload.start_date,
        )
        .first()
    )
    if overlap is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Overlaps an existing pending or approved leave request",
        )

    leave = models.LeaveRequest(
        employee_id=employee.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/leave/me", response_model=list[schemas.LeaveOut])
def my_leave_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_active_user),
):
    if current_user.employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employee record for this account"
        )
    return (
        db.query(models.LeaveRequest)
        .filter(models.LeaveRequest.employee_id == current_user.employee.id)
        .order_by(models.LeaveRequest.created_at.desc())
        .all()
    )


@router.get("/leave", response_model=list[schemas.LeaveOut])
def all_leave_requests(
    status_param: Optional[str] = Query(None, alias="status"),
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    query = db.query(models.LeaveRequest)
    if status_param is not None:
        query = query.filter(models.LeaveRequest.status == status_param)
    if employee_id is not None:
        query = query.filter(models.LeaveRequest.employee_id == employee_id)
    return query.order_by(models.LeaveRequest.created_at.desc()).all()


@router.put("/leave/{leave_id}/approve", response_model=schemas.LeaveOut)
def approve_leave(
    leave_id: int,
    payload: schemas.LeaveReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    leave = _get_leave_or_404(db, leave_id)
    _require_pending(leave, "approved")

    leave.status = "approved"
    if payload.comment is not None:
        leave.review_comment = payload.comment

    current_date = leave.start_date
    while current_date <= leave.end_date:
        attendance_service.upsert_attendance_status(db, leave.employee_id, current_date, "leave")
        current_date += timedelta(days=1)

    db.commit()
    db.refresh(leave)
    return leave


@router.put("/leave/{leave_id}/reject", response_model=schemas.LeaveOut)
def reject_leave(
    leave_id: int,
    payload: schemas.LeaveReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin")),
):
    leave = _get_leave_or_404(db, leave_id)
    _require_pending(leave, "rejected")

    leave.status = "rejected"
    if payload.comment is not None:
        leave.review_comment = payload.comment

    db.commit()
    db.refresh(leave)
    return leave
