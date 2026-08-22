# human-resource-management-system

Run tests with `python -m pytest backend/` from the repo root, not plain `pytest` — the backend uses package-qualified imports (`backend.xxx`), and `python -m` puts the repo root on `sys.path` so `backend` resolves as a package.

On a freshly seeded database, the bootstrap admin account also has `must_reset_password: true` — log in as it once and complete `POST /first-login/reset-password` before it can call any admin-only route (`backend/smoke_test.py` does this automatically).
