from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
)

from backend.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    check_in = Column(Time)
    check_out = Column(Time)
    status = Column(String(20))

    __table_args__ = (
        CheckConstraint(
            "status IN ('present', 'absent', 'half_day', 'leave', 'late')",
            name="ck_attendance_status",
        ),
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
    )
