# Encrypted Password Manager — Flask REST API

A refactored, production-oriented version of the original CLI password manager.
All core cryptographic logic is preserved; the interface has been replaced with a
stateless REST API built on Flask.

---

## What changed from the base project

| Aspect | Original | This version |
|---|---|---|
| Interface | Interactive terminal (input/print/menus) | REST API (JSON in, JSON out) |
| Execution model | Blocking procedural script | Persistent Flask server |
| State | Global variables | Stateless — credentials per request |
| SQL injection protection | String-formatted queries | Parameterised queries (`%s`) |
| Error handling | `exit(1)` / bare `except` | Typed exceptions + HTTP status codes |
| Architecture | Single-file monolith | Layered: routes → services → models → utils |
| Testability | Not testable without a terminal | Unit + integration tests with mocks |
| Configuration | Hard-coded values | `.env` / environment variables |

The encryption algorithm (**PBKDF2-HMAC-SHA256 + Fernet/AES**), salt generation,
database naming scheme (`db_password_<user>` / `tb_<user>`), and overall data model
are **preserved unchanged**.

---

## Architecture

```
password-manager/
├── run.py                        # Dev server entry point
├── requirements.txt
├── .env.example                  # Copy to .env and fill in
│
├── config/
│   └── settings.py               # Centralised config (reads .env)
│
└── app/
    ├── __init__.py               # create_app() factory
    │
    ├── routes/                   # Controllers — HTTP in/out only
    │   ├── auth.py               # Blueprint: /api/auth
    │   └── passwords.py          # Blueprint: /api/passwords
    │
    ├── services/                 # Business logic — no Flask objects
    │   ├── auth_service.py
    │   └── password_service.py
    │
    ├── models/
    │   └── database.py           # Data-access layer (raw MySQL)
    │
    └── utils/
        ├── crypto.py             # KDF + Fernet helpers (pure functions)
        └── responses.py          # Uniform JSON response helpers
```

Each layer has a single responsibility and strict downward dependency:

```
routes → services → models
              ↘ utils/crypto
```

---

## Prerequisites

- Python 3.11+
- MySQL / MariaDB (XAMPP works fine for local dev)
- `pip`

---

## Setup

```bash
# 1. Clone / copy this folder
cd password-manager

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — set MYSQL_HOST, SECRET_KEY, etc.

# 5. Start the server
python run.py
# Server runs at http://localhost:5000
```

---

## API Reference

All request and response bodies are **JSON**.  
Every response follows the envelope:
```json
{ "success": true|false, "message": "...", "data": { ... } }
```

### Authentication

#### `POST /api/auth/connect`
Verify MySQL credentials and bootstrap the per-user schema.  
Must be called at least once before using the password routes.

**Request**
```json
{
  "mysql_user":      "root",
  "mysql_password":  "yourpassword",
  "master_password": "my-secret-master-phrase"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Connected successfully.",
  "data": { "mysql_user": "root" }
}
```

**Error codes:** `400` missing fields · `503` DB unreachable

---

### Passwords

Every password route requires `mysql_user`, `mysql_password`, and
`master_password` in the request body. This keeps the API stateless.

#### `GET /api/passwords/`
List all entries (id, name, tag). Passwords are **never** returned here.

**Request body** — credentials only (see above).

**Response `200`**
```json
{
  "success": true,
  "message": "3 entry/entries found.",
  "data": [
    { "id": 1, "name": "GitHub", "tag": "dev" },
    { "id": 2, "name": "AWS",    "tag": "cloud" }
  ]
}
```

---

#### `GET /api/passwords/<id>`
Decrypt and return a single password.

**Request body** — credentials only.

**Response `200`**
```json
{
  "success": true,
  "message": "OK",
  "data": { "id": 1, "name": "GitHub", "tag": "dev", "password": "hunter2" }
}
```

**Error codes:** `401` wrong master password · `404` id not found

---

#### `POST /api/passwords/`
Create a new encrypted entry.

**Request**
```json
{
  "mysql_user":      "root",
  "mysql_password":  "yourpassword",
  "master_password": "my-secret-master-phrase",
  "name":            "GitHub",
  "tag":             "dev",
  "password":        "hunter2"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Password saved.",
  "data": { "id": 3, "name": "GitHub", "tag": "dev" }
}
```

**Error codes:** `400` blank name or password

---

#### `DELETE /api/passwords/<id>`
Delete an entry by id.

**Request body** — credentials only.

**Response `200`**
```json
{
  "success": true,
  "message": "Entry 3 deleted.",
  "data": { "deleted_id": 3 }
}
```

**Error codes:** `404` id not found

---

## Running tests

```bash
pip install pytest
pytest tests/ -v
```

Tests are split into:
- `tests/test_crypto.py` — pure unit tests, no network/DB required
- `tests/test_routes.py` — Flask integration tests with mocked DB/services

---

## Production deployment

Use a WSGI server instead of Flask's built-in dev server:

```bash
gunicorn "run:app" --workers 4 --bind 0.0.0.0:5000
```

Set `FLASK_DEBUG=false` and a strong `SECRET_KEY` in `.env`.

---

## Security notes

- The `master_password` is **never stored** anywhere — it is used on-the-fly
  to derive a per-entry Fernet key and then discarded.
- Each password entry has its own **random 16-byte salt**, preventing
  rainbow-table and batch-cracking attacks.
- SQL queries use **parameterised placeholders** (`%s`) throughout, eliminating
  SQL injection.
- The API is stateless by design — no server-side session stores credentials.
