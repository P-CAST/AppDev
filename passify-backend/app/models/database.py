from __future__ import annotations

import logging
from typing import List, Optional, Tuple

import mysql.connector
from mysql.connector import Error as MySQLError
from flask import current_app

logger = logging.getLogger(__name__)



def get_connection(mysql_user: str, mysql_password: str) -> mysql.connector.MySQLConnection:
    
    # open and return a MySQL connection for the given credentials.
    try:
        conn = mysql.connector.connect(
            host=current_app.config["MYSQL_HOST"],
            port=current_app.config["MYSQL_PORT"],
            user=mysql_user,
            password=mysql_password,
        )
        logger.info("MySQL connection established for user '%s'", mysql_user)
        return conn
    except MySQLError as exc:
        logger.error("MySQL connection failed: %s", exc)
        raise ConnectionError(f"Cannot connect to database: {exc}") from exc




def ensure_schema(conn: mysql.connector.MySQLConnection, login_user: str) -> None:
    db_name = _db_name(login_user)
    table_name = _table_name(login_user)

    with conn.cursor() as cur:
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS `{db_name}`.`{table_name}` (
                id       INT          NOT NULL AUTO_INCREMENT,
                name     VARCHAR(255) NOT NULL,
                tag      VARCHAR(255),
                password BLOB         NOT NULL,
                salt     BLOB         NOT NULL,
                PRIMARY KEY (id)
            )
            """
        )
    conn.commit()
    logger.info("Schema ensured for user '%s'", login_user)




def list_entries(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
) -> List[dict]:
    sql = f"SELECT id, name, tag FROM `{_db_name(login_user)}`.`{_table_name(login_user)}`"
    with conn.cursor(dictionary=True) as cur:
        cur.execute(sql)
        return cur.fetchall()


def fetch_entry_raw(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    entry_id: int,
) -> Optional[dict]:
    sql = (
        f"SELECT id, name, tag, password, salt "
        f"FROM `{_db_name(login_user)}`.`{_table_name(login_user)}` "
        f"WHERE id = %s"
    )
    with conn.cursor(dictionary=True) as cur:
        cur.execute(sql, (entry_id,))
        return cur.fetchone()


def insert_entry(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    name: str,
    tag: str,
    encrypted_password: bytes,
    salt: bytes,
) -> int:

    # Insert a new password entry and return the newly created row id.
    sql = (
        f"INSERT INTO `{_db_name(login_user)}`.`{_table_name(login_user)}` "
        f"(name, tag, password, salt) VALUES (%s, %s, %s, %s)"
    )
    with conn.cursor() as cur:
        cur.execute(sql, (name, tag, encrypted_password, salt))
        conn.commit()
        new_id = cur.lastrowid
    logger.info("Inserted entry id=%s for user '%s'", new_id, login_user)
    return new_id


def delete_entry(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    entry_id: int,
) -> int:

    # Delete the row with the given id.

    sql = (
        f"DELETE FROM `{_db_name(login_user)}`.`{_table_name(login_user)}` "
        f"WHERE id = %s"
    )
    with conn.cursor() as cur:
        cur.execute(sql, (entry_id,))
        conn.commit()
        affected = cur.rowcount
    logger.info(
        "Deleted %d row(s) with id=%s for user '%s'", affected, entry_id, login_user
    )
    return affected



def _db_name(login_user: str) -> str:
    return f"db_password_{login_user}"


def _table_name(login_user: str) -> str:
    return f"tb_{login_user}"
