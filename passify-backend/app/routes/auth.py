"""
routes/auth.py
--------------
Blueprint: /api/auth

POST /api/auth/connect
    Verifies MySQL credentials and bootstraps the per-user schema.
    Returns a 200 on success; callers must supply credentials on every
    subsequent request (stateless design).
"""

from __future__ import annotations

import logging

from flask import Blueprint, request

from app.services.auth_service import verify_and_bootstrap
from app.utils.responses import error, success

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/connect", methods=["POST"])
def connect():
    """
    Verify database credentials and bootstrap user schema.

    Request JSON:
        {
            "mysql_user":      "<string, required>",
            "mysql_password":  "<string, required>",
            "master_password": "<string, required>"
        }

    Response 200:
        { "success": true, "message": "Connected successfully.", "data": { "mysql_user": "..." } }

    Response 400 / 500:
        { "success": false, "message": "<reason>" }
    """
    body = request.get_json(silent=True) or {}

    mysql_user = body.get("mysql_user", "")
    mysql_password = body.get("mysql_password", "")
    master_password = body.get("master_password", "")

    try:
        result = verify_and_bootstrap(mysql_user, mysql_password, master_password)
        return success(data=result, message="Connected successfully.")
    except ValueError as exc:
        return error(str(exc), status=400)
    except ConnectionError as exc:
        return error(str(exc), status=503)
    except Exception as exc:
        logger.exception("Unexpected error during /connect")
        return error("An unexpected server error occurred.", status=500)
