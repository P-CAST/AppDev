"""
utils/crypto.py
---------------
Cryptographic helpers.

Preserves the original PBKDF2-HMAC-SHA256 + Fernet (AES-128-CBC) approach
from the base project. All functions are pure (no globals, no side-effects).
"""

from __future__ import annotations

import base64
import os

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


# ---------------------------------------------------------------------------
# Salt generation
# ---------------------------------------------------------------------------

def generate_salt(length: int = 16) -> bytes:
    """Return *length* cryptographically random bytes for use as a KDF salt."""
    return os.urandom(length)


# ---------------------------------------------------------------------------
# Key derivation
# ---------------------------------------------------------------------------

def derive_key(master_password: str, salt: bytes, iterations: int = 100_000) -> bytes:
    """
    Derive a 32-byte Fernet-compatible key from *master_password* and *salt*
    using PBKDF2-HMAC-SHA256.

    Args:
        master_password: The user-supplied master passphrase (plain text).
        salt:            Per-entry random salt (bytes).
        iterations:      PBKDF2 iteration count (default 100 000, configurable).

    Returns:
        URL-safe base64-encoded 32-byte key, ready for ``Fernet(key)``.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=iterations,
        backend=default_backend(),
    )
    return base64.urlsafe_b64encode(kdf.derive(master_password.encode()))


# ---------------------------------------------------------------------------
# Encrypt / Decrypt
# ---------------------------------------------------------------------------

def encrypt_password(plain_password: str, master_password: str, iterations: int = 100_000) -> tuple[bytes, bytes]:
    """
    Encrypt *plain_password* with a freshly generated salt.

    Returns:
        (ciphertext_bytes, salt_bytes)
    """
    salt = generate_salt()
    key = derive_key(master_password, salt, iterations)
    crypter = Fernet(key)
    ciphertext = crypter.encrypt(plain_password.encode())
    return ciphertext, salt


def decrypt_password(ciphertext: bytes, salt: bytes, master_password: str, iterations: int = 100_000) -> str:
    """
    Decrypt *ciphertext* using *salt* and *master_password*.

    Returns:
        Decrypted plain-text password string.

    Raises:
        ValueError: if the master password is wrong (InvalidToken).
    """
    key = derive_key(master_password, salt, iterations)
    crypter = Fernet(key)
    try:
        return crypter.decrypt(ciphertext).decode()
    except InvalidToken as exc:
        raise ValueError("Decryption failed: invalid master password or corrupted data.") from exc
