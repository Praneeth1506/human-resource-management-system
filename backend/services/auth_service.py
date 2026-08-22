import os
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import backend.models as models
from backend.database import get_db

load_dotenv()

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
FIRST_LOGIN_TOKEN_EXPIRE_MINUTES = int(
    os.environ.get("FIRST_LOGIN_TOKEN_EXPIRE_MINUTES", 15)
)

COMPANY_CODE = "DF"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTPBearer (not OAuth2PasswordBearer) because our /login takes a JSON
# body, not an OAuth2 form - OAuth2PasswordBearer makes Swagger's Authorize
# dialog render a username/password/client_id form (for a form-encoded
# token endpoint we don't have), with no way to paste a raw token. HTTPBearer
# just describes "send Authorization: Bearer <token>", so Swagger renders a
# single paste-your-token field instead - purely an OpenAPI/docs difference,
# doesn't change how tokens are read or validated below.
bearer_scheme = HTTPBearer(auto_error=False)

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def generate_temp_password(length: int = 10) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_login_id(db: Session, first_name: str, last_name: str, joining_year: int) -> str:
    """Format: DF-<2 letters first name><2 letters last name>-<join year>-<4 digit serial>.

    Serial is a simple count-based increment (hackathon scope, not a DB
    sequence) - fine for a live demo, would race under concurrent creates.
    """
    name_part = (first_name[:2] + last_name[:2]).upper()
    serial = db.query(models.User).count() + 1
    return f"{COMPANY_CODE}-{name_part}-{joining_year}-{serial:04d}"


def create_access_token(user: models.User, must_reset: bool) -> str:
    expire_minutes = (
        FIRST_LOGIN_TOKEN_EXPIRE_MINUTES if must_reset else ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "must_reset": must_reset,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise credentials_exception
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise credentials_exception
    if payload.get("sub") is None:
        raise credentials_exception
    return payload


def get_current_user(
    payload: dict = Depends(get_token_payload), db: Session = Depends(get_db)
) -> models.User:
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if user is None:
        raise credentials_exception
    return user


def get_active_user(
    current_user: models.User = Depends(get_current_user),
    payload: dict = Depends(get_token_payload),
) -> models.User:
    """Like get_current_user, but also rejects first-login (must_reset) tokens,
    so a not-yet-rotated system-generated password can only be used to call
    /first-login/reset-password, nothing else. Use this (not bare
    get_current_user) for any route that shouldn't be reachable before the
    temp password is rotated.
    """
    if payload.get("must_reset"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password reset required before accessing this resource",
        )
    return current_user


def require_role(*allowed_roles: str):
    """Protects a route by role. Composes on get_active_user, so it also
    rejects first-login (must_reset) tokens - same behavior as before this
    was split out, just shared with non-role-gated routes now too.
    """

    def dependency(current_user: models.User = Depends(get_active_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
