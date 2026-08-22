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


class EmployeeOut(BaseModel):
    id: int
    login_id: str
    role: str
    employee_code: str
    first_name: str
    last_name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
