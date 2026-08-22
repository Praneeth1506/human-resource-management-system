from datetime import date, time
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: Optional[str] = None


class AttendanceStatusUpdate(BaseModel):
    date: date
    status: Literal["present", "absent", "half_day", "leave", "late"]
