# Task Management API

Comprehensive REST API for a task management system with JWT authentication, task CRUD, project management, team collaboration, and real-time notifications.

## Stack

- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Marshmallow** - Serialization & validation
- **Flask-JWT-Extended** - JWT authentication
- **Flask-RESTX** - REST API + Swagger UI
- **Flask-SocketIO** - Real-time WebSocket notifications

## Project Structure

```
api/
├── app/
│   ├── __init__.py       # App factory, extensions
│   ├── models/
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── project.py
│   │   └── notification.py
│   ├── routes/
│   │   ├── auth.py       # Register, login, refresh, me
│   │   ├── users.py
│   │   ├── tasks.py      # Task CRUD
│   │   ├── projects.py   # Projects + team members
│   │   └── notifications.py
│   ├── schemas/          # Marshmallow validation
│   ├── socketio_events.py # WebSocket handlers
│   └── utils/
├── config.py
├── instance/              # SQLite DB
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

Or use a different port if 5001 is in use:

```bash
PORT=5000 python run.py
```

- **API base:** `http://localhost:5001/api/v1` (or the port you specify)
- **Swagger UI:** `http://localhost:5001/swagger`
- **WebSocket:** `ws://localhost:5001/socket.io` (connect with `?token=<jwt>`)

Use `PORT=5000` if 5001 is in use.

## Migrations

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT |
| POST | `/api/v1/auth/refresh` | Refresh | Refresh access token |
| GET | `/api/v1/auth/me` | Yes | Current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/` | Yes | List users |
| GET | `/api/v1/users/<id>` | Yes | Get user by ID |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tasks/` | Yes | List tasks (filter: status, project_id, priority) |
| POST | `/api/v1/tasks/` | Yes | Create task |
| GET | `/api/v1/tasks/<id>` | Yes | Get task |
| PUT | `/api/v1/tasks/<id>` | Yes | Update task |
| DELETE | `/api/v1/tasks/<id>` | Yes | Delete task |

**Task fields:** `title`, `description`, `status` (pending|in_progress|completed), `priority` (low|medium|high|urgent), `project_id`, `assignee_id`, `due_date`

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/projects/` | Yes | List projects |
| POST | `/api/v1/projects/` | Yes | Create project |
| GET | `/api/v1/projects/<id>` | Yes | Get project |
| PUT | `/api/v1/projects/<id>` | Yes | Update project |
| DELETE | `/api/v1/projects/<id>` | Yes | Delete project |
| GET | `/api/v1/projects/<id>/tasks` | Yes | List project tasks |
| GET | `/api/v1/projects/<id>/members` | Yes | List project members |
| POST | `/api/v1/projects/<id>/members` | Yes | Add member |
| PUT | `/api/v1/projects/<id>/members/<user_id>` | Yes | Update member role |
| DELETE | `/api/v1/projects/<id>/members/<user_id>` | Yes | Remove member |

**Member roles:** `owner`, `member`, `viewer`

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications/` | Yes | List notifications (?unread=true) |
| GET | `/api/v1/notifications/<id>` | Yes | Get notification |
| PATCH | `/api/v1/notifications/<id>` | Yes | Mark as read |
| POST | `/api/v1/notifications/read-all` | Yes | Mark all as read |

### Real-time Notifications (WebSocket)

Connect via Socket.IO with JWT:

```javascript
const socket = io('http://localhost:5001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
  // or query: { token: 'YOUR_JWT_TOKEN' }
});
socket.on('notification', (data) => console.log('New notification:', data));
socket.on('connected', (data) => console.log('Connected as user:', data.user_id));
```

## Test Workflow

1. **Register:** `POST /api/v1/auth/register`  
   Body: `{"email": "user@example.com", "username": "user1", "password": "password123"}`

2. **Login:** `POST /api/v1/auth/login`  
   Body: `{"email": "user@example.com", "password": "password123"}`  
   Copy `access_token` from response.

3. **Create task:** `POST /api/v1/tasks`  
   Headers: `Authorization: Bearer <access_token>`  
   Body: `{"title": "My first task", "description": "Task details", "status": "pending", "priority": "medium"}`

4. **Get tasks:** `GET /api/v1/tasks`  
   Headers: `Authorization: Bearer <access_token>`

5. **Create project:** `POST /api/v1/projects`  
   Body: `{"name": "My Project", "description": "Project description"}`

6. **Add member:** `POST /api/v1/projects/1/members`  
   Body: `{"user_id": 2, "role": "member"}`

### Mock JWT (development)

With `MOCK_JWT=true`, use header `X-Mock-User-Id: 1` instead of Bearer token:

```bash
curl -H "X-Mock-User-Id: 1" http://localhost:5001/api/v1/tasks/
```

Disable with `MOCK_JWT=false` in `.env` for real token testing.
