from datetime import date
from typing import Optional

from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: date
    email: str
    phone: Optional[str] = None


class EmployeeCreated(BaseModel):
    employee_id: int
    login_id: str
    temp_password: str
    role: str
