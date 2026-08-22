from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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


class PayrollCreate(BaseModel):
    employee_id: int
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    basic: Decimal = Field(..., ge=0)
    hra: Decimal = Field(..., ge=0)
    pf: Decimal = Field(..., ge=0)
    professional_tax: Decimal = Field(..., ge=0)
    working_days: int = Field(..., ge=0)


class PayrollUpdate(BaseModel):
    basic: Optional[Decimal] = Field(None, ge=0)
    hra: Optional[Decimal] = Field(None, ge=0)
    pf: Optional[Decimal] = Field(None, ge=0)
    professional_tax: Optional[Decimal] = Field(None, ge=0)
    working_days: Optional[int] = Field(None, ge=0)
