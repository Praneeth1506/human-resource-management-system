"""
One-off DESTRUCTIVE reset script: drops every table known to backend/models/
and recreates them fresh from the current model definitions.

Per CLAUDE.md, this project doesn't use migrations - schema changes are
drop/recreate, not Alembic. This script is that drop/recreate step, for
when a table's structure in the live database (e.g. Neon) has drifted from
models.py, such as a NOT NULL/UNIQUE constraint that was added to a model
after the table already existed - Base.metadata.create_all() alone never
alters existing tables, so drift like that silently sits there until this
runs.

THIS PERMANENTLY DELETES ALL DATA IN THOSE TABLES. It targets whatever
DATABASE_URL points to (see backend/.env) - if that's the shared Neon
instance, this destroys everyone's data in it. Confirm with the team before
running. Requires typing "reset" at a prompt to proceed; anything else
aborts with no changes made.

Run from the repo root (needs `backend` importable as a package):
    python backend/reset_db.py
"""

import os
import sys
from urllib.parse import urlsplit, urlunsplit

from sqlalchemy import inspect

import backend.models  # noqa: F401 - registers all model classes on Base.metadata
from backend.database import Base, engine


def _redact(url: str) -> str:
    """Host/db name only - never print credentials from DATABASE_URL."""
    parts = urlsplit(url)
    netloc = parts.hostname or ""
    if parts.port:
        netloc += f":{parts.port}"
    return urlunsplit((parts.scheme, netloc, parts.path, "", ""))


def main():
    target = _redact(os.environ.get("DATABASE_URL", ""))
    print(f"Target database: {target}\n")

    inspector = inspect(engine)
    existing_tables = sorted(inspector.get_table_names())
    model_tables = sorted(Base.metadata.tables.keys())

    print(f"Tables currently in the database ({len(existing_tables)}):")
    for name in existing_tables:
        print(f"  - {name}")

    orphaned = [t for t in existing_tables if t not in model_tables]
    if orphaned:
        print(
            f"\nNOTE: these existing tables aren't in the current models and "
            f"will be left untouched (drop_all only drops tables it knows about): {orphaned}"
        )

    print(f"\nTables that will be dropped and recreated ({len(model_tables)}):")
    for name in model_tables:
        print(f"  - {name}")

    print("\nThis PERMANENTLY DESTROYS all data in the tables listed above.")
    confirm = input("Type 'reset' to proceed, anything else aborts: ").strip()
    if confirm != "reset":
        print("Aborted - no changes made.")
        sys.exit(1)

    print("\nDropping tables...")
    Base.metadata.drop_all(bind=engine)
    dropped = [t for t in model_tables if t in existing_tables]
    print(f"Dropped: {dropped if dropped else '(none existed yet)'}")

    print("\nRecreating tables...")
    Base.metadata.create_all(bind=engine)
    print(f"Recreated: {model_tables}")

    print("\nDone. Live schema now matches backend/models/ exactly.")


if __name__ == "__main__":
    main()
