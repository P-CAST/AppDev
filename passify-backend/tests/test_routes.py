"""
tests/test_routes.py
--------------------
Integration tests for Flask routes.

Database and crypto calls are mocked so no real MySQL instance is needed.
"""

import pytest
from unittest.mock import MagicMock, patch
from app import create_app
from config.settings import Config


class TestConfig(Config):
    TESTING = True
    DEBUG = False
    KDF_ITERATIONS = 1  # Fast for tests


@pytest.fixture()
def app():
    application = create_app(TestConfig)
    yield application


@pytest.fixture()
def client(app):
    return app.test_client()


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

class TestAuthConnect:
    def test_missing_fields_returns_400(self, client):
        resp = client.post("/api/auth/connect", json={})
        assert resp.status_code == 400
        assert resp.get_json()["success"] is False

    def test_missing_master_password_returns_400(self, client):
        resp = client.post("/api/auth/connect", json={"mysql_user": "u", "mysql_password": "p"})
        assert resp.status_code == 400

    @patch("app.routes.auth.verify_and_bootstrap")
    def test_success_returns_200(self, mock_vab, client):
        mock_vab.return_value = {"mysql_user": "testuser"}
        resp = client.post(
            "/api/auth/connect",
            json={"mysql_user": "testuser", "mysql_password": "pass", "master_password": "master"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["mysql_user"] == "testuser"

    @patch("app.routes.auth.verify_and_bootstrap", side_effect=ConnectionError("DB down"))
    def test_connection_error_returns_503(self, _mock, client):
        resp = client.post(
            "/api/auth/connect",
            json={"mysql_user": "u", "mysql_password": "p", "master_password": "m"},
        )
        assert resp.status_code == 503


# ---------------------------------------------------------------------------
# Password routes
# ---------------------------------------------------------------------------

CREDS = {"mysql_user": "u", "mysql_password": "p", "master_password": "m"}


class TestListPasswords:
    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.list_passwords", return_value=[{"id": 1, "name": "GitHub", "tag": "dev"}])
    def test_returns_entries(self, _mock_list, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.get("/api/passwords/", json=CREDS)
        assert resp.status_code == 200
        assert len(resp.get_json()["data"]) == 1

    def test_missing_creds_returns_400(self, client):
        resp = client.get("/api/passwords/", json={})
        assert resp.status_code == 400


class TestGetPassword:
    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.view_password", return_value={"id": 1, "name": "GH", "tag": "", "password": "s3cr3t"})
    def test_returns_decrypted_entry(self, _mock_view, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.get("/api/passwords/1", json=CREDS)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["password"] == "s3cr3t"

    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.view_password", side_effect=KeyError("No entry with id=99."))
    def test_not_found_returns_404(self, _mock, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.get("/api/passwords/99", json=CREDS)
        assert resp.status_code == 404

    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.view_password", side_effect=ValueError("Decryption failed"))
    def test_wrong_master_returns_401(self, _mock, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.get("/api/passwords/1", json=CREDS)
        assert resp.status_code == 401


class TestCreatePassword:
    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.create_password", return_value={"id": 5, "name": "AWS", "tag": "cloud"})
    def test_creates_and_returns_201(self, _mock_create, mock_conn, client):
        mock_conn.return_value = MagicMock()
        payload = {**CREDS, "name": "AWS", "tag": "cloud", "password": "hunter2"}
        resp = client.post("/api/passwords/", json=payload)
        assert resp.status_code == 201
        assert resp.get_json()["data"]["name"] == "AWS"

    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.create_password", side_effect=ValueError("'name' must not be empty."))
    def test_empty_name_returns_400(self, _mock, mock_conn, client):
        mock_conn.return_value = MagicMock()
        payload = {**CREDS, "name": "", "password": "pw"}
        resp = client.post("/api/passwords/", json=payload)
        assert resp.status_code == 400


class TestDeletePassword:
    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.remove_password", return_value=1)
    def test_deletes_and_returns_200(self, _mock_del, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.delete("/api/passwords/1", json=CREDS)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["deleted_id"] == 1

    @patch("app.routes.passwords._open_conn")
    @patch("app.routes.passwords.remove_password", return_value=0)
    def test_not_found_returns_404(self, _mock_del, mock_conn, client):
        mock_conn.return_value = MagicMock()
        resp = client.delete("/api/passwords/999", json=CREDS)
        assert resp.status_code == 404
