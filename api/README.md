# Customer Support Ticket API

REST API for a customer support ticket management system with JWT authentication, ticket CRUD, assignment, status tracking, priority management, comments, and admin dashboard. Built from PRD_Customer_Support_System.txt.

## Stack

- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Marshmallow** - Serialization & validation
- **Flask-JWT-Extended** - JWT authentication
- **Flask-RESTX** - REST API + Swagger UI
- **Flask-Limiter** - Rate limiting
- **bcrypt** - Password hashing (cost factor 12)

## Project Structure

```
api/
├── app/
│   ├── __init__.py       # App factory, error handlers, extensions
│   ├── exceptions.py     # Custom API exceptions
│   ├── models/
│   │   ├── user.py       # User (customer, agent, admin)
│   │   ├── ticket.py     # Support ticket
│   │   ├── comment.py    # Ticket comments
│   │   ├── assignment.py # Assignment history
│   │   └── attachment.py # File attachments
│   ├── routes/
│   │   ├── auth.py       # Register, login, logout, me
│   │   ├── tickets.py    # Tickets + comments
│   │   ├── users.py      # User management (admin)
│   │   ├── agents.py     # Agent list, tickets, availability
│   │   └── admin.py      # Dashboard, reports
│   ├── schemas/         # Marshmallow validation
│   └── utils/
│       ├── security.py   # sanitize_input, role_required
│       └── ticket_utils.py
├── tests/
│   └── test_validation.py
├── config.py
├── run.py
└── requirements.txt
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

- **API base:** `http://localhost:5001/api/v1`
- **Swagger UI:** `http://localhost:5001/swagger`

## Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register (name, email, password, role) |
| POST | `/auth/login` | No | Login, returns JWT |
| POST | `/auth/logout` | Yes | Logout |
| POST | `/auth/refresh` | Refresh | Refresh access token |
| GET | `/auth/me` | Yes | Current user |

### Tickets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tickets/` | Yes | List tickets (filters: status, priority, category, search) |
| POST | `/tickets/` | Yes | Create ticket (rate limited 10/min) |
| GET | `/tickets/<id>` | Yes | Get ticket |
| PUT | `/tickets/<id>` | Yes | Update ticket |
| DELETE | `/tickets/<id>` | Admin | Delete ticket |
| PUT | `/tickets/<id>/status` | Yes | Update status (validated transitions) |
| PUT | `/tickets/<id>/priority` | Agent/Admin | Update priority |
| POST | `/tickets/<id>/assign` | Admin | Assign to agent |
| GET | `/tickets/<id>/history` | Yes | Assignment history |
| GET | `/tickets/<id>/comments` | Yes | List comments |
| POST | `/tickets/<id>/comments` | Yes | Add comment |

### Users & Agents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/` | Admin | List users |
| GET | `/users/<id>` | Admin/Self | Get user |
| PUT | `/users/<id>` | Admin | Update user |
| GET | `/agents/` | Yes | List agents |
| GET | `/agents/<id>/tickets` | Yes | Agent's tickets |
| PUT | `/agents/<id>/availability` | Yes | Update availability |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard metrics |
| GET | `/admin/reports/tickets` | Admin | Ticket volume report |
| GET | `/admin/reports/agents` | Admin | Agent performance |
| GET | `/admin/reports/sla` | Admin | SLA compliance |

## Validation & Security

- **Ticket creation:** subject 5–200 chars, description min 20 chars, valid priority/category, valid email
- **Status transitions:** open→assigned|closed, assigned→in_progress|closed, in_progress→waiting|resolved|closed, etc.
- **Error responses:** `{ "status": "error", "message": "...", "code": "ERROR_CODE", "errors": {...} }`
- **RBAC:** Customer (own tickets), Agent (assigned + queue), Admin (all)

## Test Workflow

1. **Register:** `POST /api/v1/auth/register`  
   `{"name": "User", "email": "user@example.com", "password": "password123", "role": "customer"}`

2. **Login:** `POST /api/v1/auth/login`  
   `{"email": "user@example.com", "password": "password123"}`  
   Copy `access_token`.

3. **Create ticket:** `POST /api/v1/tickets`  
   Headers: `Authorization: Bearer <access_token>`  
   `{"subject": "Cannot login", "description": "Description with at least 20 characters", "category": "technical", "customer_email": "user@example.com"}`

## Run Tests

```bash
pytest tests/ -v
```

Tests cover: invalid email (400), invalid priority (400), unauthorized (403), valid request (201), status transition validation.
