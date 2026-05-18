
from __future__ import annotations

import logging

from flask import Blueprint, current_app, request

from app.models.database import get_connection, ensure_schema
from app.services.password_service import (
    create_password,
    list_passwords,
    remove_password,
    view_password,
)
from app.utils.responses import error, success

passwords_bp = Blueprint("passwords", __name__)
logger = logging.getLogger(__name__)



def _extract_credentials(body: dict) -> tuple[str, str, str]:
    """
    Pull mysql_user, mysql_password, master_password from a request body.
    Falls back to HTTP headers if not found in the body (for GET requests).
    """
    mysql_user = body.get("mysql_user")
    mysql_password = body.get("mysql_password")
    master_password = body.get("master_password")

    if not mysql_user:
        mysql_user = request.headers.get("mysql-user")
        mysql_password = request.headers.get("mysql-password")
        master_password = request.headers.get("master-password")

    mysql_user = (mysql_user or "").strip()
    mysql_password = mysql_password or ""
    master_password = (master_password or "").strip()

    missing = [f for f, v in [
        ("mysql_user", mysql_user),
        ("master_password", master_password),
    ] if not v]

    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}.")

    return mysql_user, mysql_password, master_password


def _open_conn(mysql_user: str, mysql_password: str):
    """Open a connection and ensure schema; caller must close it."""
    conn = get_connection(mysql_user, mysql_password)
    ensure_schema(conn, mysql_user)
    return conn


# GET /api/passwords/
@passwords_bp.route("/", methods=["GET"])
def list_entries():
    """
    List all password entries (no decryption performed).

    Request JSON:
        { "mysql_user": "...", "mysql_password": "...", "master_password": "..." }

    Response 200:
        { "success": true, "data": [ { "id": 1, "name": "...", "tag": "..." }, ... ] }
    """
    body = request.get_json(silent=True) or {}
    try:
        mysql_user, mysql_password, master_password = _extract_credentials(body)
    except ValueError as exc:
        return error(str(exc), status=400)

    conn = None
    try:
        conn = _open_conn(mysql_user, mysql_password)
        entries = list_passwords(conn, mysql_user)
        return success(data=entries, message=f"{len(entries)} entry/entries found.")
    except ValueError as exc:
        return error(str(exc), status=400)
    except ConnectionError as exc:
        return error(str(exc), status=503)
    except Exception:
        logger.exception("Error listing entries for user='%s'", body.get("mysql_user"))
        return error("An unexpected server error occurred.", status=500)
    finally:
        if conn:
            conn.close()


# GET /api/passwords/<int:entry_id>
@passwords_bp.route("/<int:entry_id>", methods=["GET"])
def get_entry(entry_id: int):
    """
    Decrypt and return a single password entry.

    Request JSON:
        { "mysql_user": "...", "mysql_password": "...", "master_password": "..." }

    Response 200:
        { "success": true, "data": { "id": 1, "name": "...", "tag": "...", "password": "..." } }

    Response 404:
        { "success": false, "message": "No entry with id=<n>." }

    Response 401:
        { "success": false, "message": "Decryption failed: ..." }
    """
    body = request.get_json(silent=True) or {}
    try:
        mysql_user, mysql_password, master_password = _extract_credentials(body)
    except ValueError as exc:
        return error(str(exc), status=400)

    iterations = current_app.config.get("KDF_ITERATIONS", 100_000)
    conn = None
    try:
        conn = _open_conn(mysql_user, mysql_password)
        entry = view_password(conn, mysql_user, entry_id, master_password, iterations)
        return success(data=entry)
    except KeyError as exc:
        return error(str(exc), status=404)
    except ValueError as exc:
        # Wrong master password
        return error(str(exc), status=401)
    except ConnectionError as exc:
        return error(str(exc), status=503)
    except Exception:
        logger.exception("Error viewing entry id=%s", entry_id)
        return error("An unexpected server error occurred.", status=500)
    finally:
        if conn:
            conn.close()


# POST /api/passwords/
@passwords_bp.route("/", methods=["POST"])
def create_entry():
    """
    Create a new encrypted password entry.

    Request JSON:
        {
            "mysql_user":      "...",
            "mysql_password":  "...",
            "master_password": "...",
            "name":            "<string, required>",
            "tag":             "<string, optional>",
            "password":        "<string, required>"
        }

    Response 201:
        { "success": true, "message": "Password saved.", "data": { "id": ..., "name": "...", "tag": "..." } }
    """
    body = request.get_json(silent=True) or {}
    try:
        mysql_user, mysql_password, master_password = _extract_credentials(body)
    except ValueError as exc:
        return error(str(exc), status=400)

    name = body.get("name", "")
    tag = body.get("tag", "")
    plain_password = body.get("password", "")
    iterations = current_app.config.get("KDF_ITERATIONS", 100_000)

    conn = None
    try:
        conn = _open_conn(mysql_user, mysql_password)
        entry = create_password(
            conn, mysql_user, name, tag, plain_password, master_password, iterations
        )
        return success(data=entry, message="Password saved.", status=201)
    except ValueError as exc:
        return error(str(exc), status=400)
    except ConnectionError as exc:
        return error(str(exc), status=503)
    except Exception:
        logger.exception("Error creating entry for user='%s'", mysql_user)
        return error("An unexpected server error occurred.", status=500)
    finally:
        if conn:
            conn.close()


# DELETE /api/passwords/<int:entry_id>
@passwords_bp.route("/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id: int):
    """
    Delete a password entry by id.

    Request JSON:
        { "mysql_user": "...", "mysql_password": "...", "master_password": "..." }

    Response 200:
        { "success": true, "message": "Entry deleted.", "data": { "deleted_id": <n> } }

    Response 404:
        { "success": false, "message": "Entry not found." }
    """
    body = request.get_json(silent=True) or {}
    try:
        mysql_user, mysql_password, master_password = _extract_credentials(body)
    except ValueError as exc:
        return error(str(exc), status=400)

    conn = None
    try:
        conn = _open_conn(mysql_user, mysql_password)
        deleted = remove_password(conn, mysql_user, entry_id)
        if deleted == 0:
            return error(f"No entry with id={entry_id}.", status=404)
        return success(
            data={"deleted_id": entry_id},
            message=f"Entry {entry_id} deleted.",
        )
    except ConnectionError as exc:
        return error(str(exc), status=503)
    except Exception:
        logger.exception("Error deleting entry id=%s", entry_id)
        return error("An unexpected server error occurred.", status=500)
    finally:
        if conn:
            conn.close()
