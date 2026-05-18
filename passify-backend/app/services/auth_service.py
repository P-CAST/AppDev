"""
services/auth_service.py
------------------------
Handles MySQL connection verification and schema bootstrap.

The service validates credentials by actually opening a connection.
No passwords are stored server-side beyond the lifetime of a request.
"""

from __future__ import annotations

import logging

from app.models.database import get_connection, ensure_schema

logger = logging.getLogger(__name__)


def verify_and_bootstrap(
    mysql_user: str,
    mysql_password: str,
    master_password: str,
) -> dict:
    mysql_user = (mysql_user or "").strip()
    mysql_password = mysql_password or ""
    master_password = (master_password or "").strip()

    if not mysql_user:
        raise ValueError("'mysql_user' is required.")
    if not master_password:
        raise ValueError("'master_password' is required.")

    # Opens connection (raises ConnectionError on failure)
    conn = get_connection(mysql_user, mysql_password)
    try:
        ensure_schema(conn, mysql_user)
    finally:
        conn.close()

    logger.info("Auth+bootstrap succeeded for mysql_user='%s'", mysql_user)
    return {"mysql_user": mysql_user}
