from sqlalchemy import Column, ForeignKey, Integer, Numeric, UniqueConstraint

from backend.database import Base


class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(Integer)
    year = Column(Integer)
    basic = Column(Numeric(10, 2))
    hra = Column(Numeric(10, 2))
    pf = Column(Numeric(10, 2))
    professional_tax = Column(Numeric(10, 2))
    working_days = Column(Integer)
    payable_days = Column(Integer)
    gross = Column(Numeric(10, 2))
    deductions = Column(Numeric(10, 2))
    net_pay = Column(Numeric(10, 2))

    __table_args__ = (
        UniqueConstraint(
            "employee_id", "month", "year", name="uq_payroll_employee_month_year"
        ),
    )
