import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Resolve .env relative to this file, not the process's CWD - otherwise
# `load_dotenv()` silently finds nothing when the app is started from the
# repo root (e.g. `python -m uvicorn backend.main:app`), since backend/.env
# is a subdirectory of the repo root, not an ancestor of it.
load_dotenv(Path(__file__).resolve().parent / ".env")

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
