import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import backend.models as models
import backend.services.auth_service as auth
from backend.database import Base, engine, get_db
from backend.routes import api_router


def _seed_bootstrap_admin(db: Session) -> None:
    login_id = os.environ.get("ADMIN_BOOTSTRAP_LOGIN_ID")
    password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")
    email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
    if not login_id or not password or not email:
        return
    email = email.strip().lower()

    existing_admin = db.query(models.User).filter(models.User.role == "admin").first()
    if existing_admin:
        return

    admin = models.User(
        login_id=login_id,
        password_hash=auth.hash_password(password),
        role="admin",
        first_login=True,
    )
    db.add(admin)
    db.flush()

    # Login is by email, and email only lives on `employees` - every user
    # that can log in (admin or not) needs a matching Employee row.
    db.add(
        models.Employee(
            user_id=admin.id,
            employee_code=login_id,
            first_name="Admin",
            last_name="User",
            email=email,
        )
    )
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        _seed_bootstrap_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Dayflow HRMS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
