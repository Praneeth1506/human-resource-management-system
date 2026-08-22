from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PayrollOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    month: int
    year: int
    basic: Optional[Decimal] = None
    hra: Optional[Decimal] = None
    pf: Optional[Decimal] = None
    professional_tax: Optional[Decimal] = None
    working_days: Optional[int] = None
    payable_days: Optional[int] = None
    gross: Optional[Decimal] = None
    deductions: Optional[Decimal] = None
    net_pay: Optional[Decimal] = None
