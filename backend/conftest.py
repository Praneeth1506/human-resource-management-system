import os
import tempfile

# Must be set before `database`/`main` are imported anywhere, so tests never
# touch the shared Neon instance - a local SQLite file stands in for it.
_tmp_dir = tempfile.mkdtemp(prefix="dayflow_test_")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_dir}/test.db"
os.environ["JWT_SECRET"] = "test-secret-do-not-use-in-prod"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
os.environ["FIRST_LOGIN_TOKEN_EXPIRE_MINUTES"] = "15"
os.environ.pop("ADMIN_BOOTSTRAP_LOGIN_ID", None)
os.environ.pop("ADMIN_BOOTSTRAP_EMAIL", None)
os.environ.pop("ADMIN_BOOTSTRAP_PASSWORD", None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import backend.main as main  # noqa: E402
from backend.database import Base, engine  # noqa: E402


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(main.app) as c:
        yield c
