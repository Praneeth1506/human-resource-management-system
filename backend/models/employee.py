from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from backend.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_code = Column(String(30), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    department = Column(String(100))
    designation = Column(String(100))
    joining_date = Column(Date)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))

    __table_args__ = (UniqueConstraint("email", name="uq_employees_email"),)

    user = relationship("User", back_populates="employee")
