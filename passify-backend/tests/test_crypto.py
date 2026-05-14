"""
tests/test_crypto.py
--------------------
Unit tests for app.utils.crypto.

These tests are pure Python — no Flask app context, no database required.
"""

import pytest
from app.utils.crypto import (
    decrypt_password,
    derive_key,
    encrypt_password,
    generate_salt,
)


class TestGenerateSalt:
    def test_returns_bytes(self):
        salt = generate_salt()
        assert isinstance(salt, bytes)

    def test_default_length(self):
        assert len(generate_salt()) == 16

    def test_custom_length(self):
        assert len(generate_salt(32)) == 32

    def test_uniqueness(self):
        assert generate_salt() != generate_salt()


class TestDeriveKey:
    def test_returns_bytes(self):
        key = derive_key("master", b"saltsalt12345678")
        assert isinstance(key, bytes)

    def test_deterministic(self):
        salt = b"saltsalt12345678"
        assert derive_key("master", salt) == derive_key("master", salt)

    def test_different_passwords_differ(self):
        salt = b"saltsalt12345678"
        assert derive_key("pass1", salt) != derive_key("pass2", salt)

    def test_different_salts_differ(self):
        assert derive_key("master", b"saltsalt12345678") != derive_key("master", b"87654321tlas tlas")


class TestEncryptDecrypt:
    def test_round_trip(self):
        ciphertext, salt = encrypt_password("s3cr3t!", "masterpass")
        plain = decrypt_password(ciphertext, salt, "masterpass")
        assert plain == "s3cr3t!"

    def test_wrong_master_raises(self):
        ciphertext, salt = encrypt_password("s3cr3t!", "correct")
        with pytest.raises(ValueError, match="Decryption failed"):
            decrypt_password(ciphertext, salt, "wrong")

    def test_ciphertext_is_bytes(self):
        ciphertext, _ = encrypt_password("hello", "master")
        assert isinstance(ciphertext, bytes)

    def test_salt_is_bytes(self):
        _, salt = encrypt_password("hello", "master")
        assert isinstance(salt, bytes)

    def test_unique_ciphertexts_for_same_input(self):
        """Each call uses a fresh salt, so ciphertexts should differ."""
        ct1, _ = encrypt_password("hello", "master")
        ct2, _ = encrypt_password("hello", "master")
        assert ct1 != ct2
