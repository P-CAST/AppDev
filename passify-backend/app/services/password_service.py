
from __future__ import annotations

import logging
from typing import List

import mysql.connector

from app.models import database as db
from app.utils.crypto import encrypt_password, decrypt_password

logger = logging.getLogger(__name__)


class PasswordEntry:

    __slots__ = ("id", "name", "tag")

    def __init__(self, id: int, name: str, tag: str | None):
        self.id = id
        self.name = name
        self.tag = tag

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "tag": self.tag or ""}



def list_passwords(conn: mysql.connector.MySQLConnection, login_user: str) -> List[dict]:
    """
    Return all stored entries (id, name, tag) for *login_user*.
    Passwords are never included in the list view.
    """
    rows = db.list_entries(conn, login_user)
    return [PasswordEntry(r["id"], r["name"], r["tag"]).to_dict() for r in rows]


def view_password(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    entry_id: int,
    master_password: str,
    iterations: int,
) -> dict:
    row = db.fetch_entry_raw(conn, login_user, entry_id)
    if row is None:
        raise KeyError(f"No entry with id={entry_id}.")

    plain = decrypt_password(
        ciphertext=bytes(row["password"]),
        salt=bytes(row["salt"]),
        master_password=master_password,
        iterations=iterations,
    )
    return {
        "id": row["id"],
        "name": row["name"],
        "tag": row["tag"] or "",
        "password": plain,
    }


def create_password(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    name: str,
    tag: str,
    plain_password: str,
    master_password: str,
    iterations: int,
) -> dict:

    name = name.strip()
    plain_password = plain_password.strip()

    if not name:
        raise ValueError("'name' must not be empty.")
    if not plain_password:
        raise ValueError("'password' must not be empty.")

    ciphertext, salt = encrypt_password(plain_password, master_password, iterations)
    new_id = db.insert_entry(conn, login_user, name, tag or "", ciphertext, salt)

    return {"id": new_id, "name": name, "tag": tag or ""}


def remove_password(
    conn: mysql.connector.MySQLConnection,
    login_user: str,
    entry_id: int,
) -> int:

    return db.delete_entry(conn, login_user, entry_id)
