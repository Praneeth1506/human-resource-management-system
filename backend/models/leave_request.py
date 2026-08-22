from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
)

from backend.database import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String(30))
    start_date = Column(Date)
    end_date = Column(Date)
    remarks = Column(Text)
    attachment_url = Column(String(255))
    status = Column(String(20), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_leave_status",
        ),
    )
