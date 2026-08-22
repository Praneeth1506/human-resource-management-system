from sqlalchemy import Boolean, CheckConstraint, Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    login_id = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    first_login = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'employee')", name="ck_users_role"),
    )

    employee = relationship("Employee", back_populates="user", uselist=False)
