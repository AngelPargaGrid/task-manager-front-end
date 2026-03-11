# Flask REST API

REST API built with Flask, SQLAlchemy, Marshmallow, JWT authentication, and Swagger UI.

## Stack

- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Marshmallow** - Serialization & validation
- **Flask-JWT-Extended** - JWT authentication
- **Flask-RESTX** - REST API + Swagger UI

## Project Structure

```
api/                    # (or task-management-api/)
├── app/
│   ├── __init__.py     # App factory, extensions
│   ├── models/         # Database models
│   │   └── user.py
│   ├── routes/         # API endpoints
│   │   ├── __init__.py # Namespace registration
│   │   ├── auth.py     # /auth/register, /auth/login, etc.
│   │   └── users.py    # /users/
│   ├── schemas/        # Marshmallow schemas
│   │   └── user.py
│   └── utils/          # Helper functions
├── config.py
├── instance/           # SQLite DB (created at runtime)
├── requirements.txt
├── run.py
└── .env.example
```

## Setup

```bash
cd api
python -m venv venv
source venv/bin/activate   # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create `.env` from `.env.example` and set `SECRET_KEY`, `JWT_SECRET_KEY`.

## Run

```bash
python run.py
```

- API base: `http://localhost:5001/api/v1`
- Swagger UI: `http://localhost:5001/swagger`

(Use `PORT=5000` if port 5001 is in use.)

## Migrations

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT |
| POST | `/api/v1/auth/refresh` | Refresh | Refresh access token |
| GET | `/api/v1/auth/me` | Yes | Current user |
| GET | `/api/v1/users/` | Yes | List users |
| GET | `/api/v1/users/<id>` | Yes | Get user by ID |

Use `Authorization: Bearer <access_token>` for protected routes.

### Mock JWT (solo para pruebas)

En desarrollo, con `MOCK_JWT=true` (por defecto), puedes usar el header `X-Mock-User-Id: 1` en lugar del Bearer token para simular un usuario autenticado:

```bash
curl -H "X-Mock-User-Id: 1" http://localhost:5001/api/v1/users/
```

Desactiva con `MOCK_JWT=false` en `.env` para probar con tokens reales.
