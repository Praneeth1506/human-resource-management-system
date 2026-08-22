from fastapi import APIRouter

from backend.routes.attendance import router as attendance_router
from backend.routes.auth import router as auth_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.employee import router as employee_router
from backend.routes.leave import router as leave_router
from backend.routes.payroll import router as payroll_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(employee_router)
api_router.include_router(attendance_router)
api_router.include_router(leave_router)
api_router.include_router(payroll_router)
api_router.include_router(dashboard_router)

__all__ = ["api_router"]