
from __future__ import annotations

import logging

import pymysql

from flask import Blueprint, request, Flask, jsonify

from app.services.auth_service import verify_and_bootstrap
from app.utils.responses import error, success

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/connect", methods=["POST"])
def connect():

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


# VJ Added 
@auth_bp.route("/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    mysql_user = body.get("mysql_user")
    mysql_password = body.get("mysql_password")
    master_password = body.get("master_password")
    
    if not mysql_user or not master_password:
        return error("Missing required registration fields.", status=400)

    try:
        admin_conn = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # default XAMPP root password is empty
            autocommit=True
        )
        admin_cursor = admin_conn.cursor()

        admin_cursor.execute(f"CREATE USER IF NOT EXISTS '{mysql_user}'@'localhost' IDENTIFIED BY '{mysql_password}';")
        admin_cursor.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{mysql_user}'@'localhost' WITH GRANT OPTION;")
        admin_cursor.execute("FLUSH PRIVILEGES;")
        admin_conn.close()

        user_conn = pymysql.connect(
            host='localhost',
            user=mysql_user,
            password=mysql_password,
            autocommit=True
        )
        user_cursor = user_conn.cursor()

        user_cursor.execute("CREATE DATABASE IF NOT EXISTS passify_vault;")
        user_conn.select_db("passify_vault")

        table_name = f"db_password_{mysql_user.lower()}"
        user_cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                tag VARCHAR(255),
                password TEXT NOT NULL
            );
        """)
        user_conn.close()

        return jsonify({'message': f'Vault environment provisioned for {mysql_user}!'}), 201

    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500