from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, model_validator


class LeaveCreate(BaseModel):
    leave_type: Literal["paid", "sick", "unpaid"]
    start_date: date
    end_date: date
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def _check_date_range(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class LeaveOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    attachment_url: Optional[str] = None
    status: str
    review_comment: Optional[str] = None
    created_at: Optional[datetime] = None


class LeaveReview(BaseModel):
    comment: Optional[str] = None
