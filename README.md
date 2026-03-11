# Customer Support Full-Stack Application

Full-stack application with React frontend and Flask backend: authentication, dashboard, Kanban board, social feed, and customer support features.

## Tech Stack

**Frontend**
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS** — Styling, dark mode
- **@dnd-kit** — Drag and drop (Kanban)
- **Recharts** — Charts
- **Playwright** — E2E tests
- **Vitest** — Unit tests

**Backend**
- **Flask** — REST API (see `api/` for details)
- **SQLAlchemy** — ORM
- **Flask-JWT-Extended** — Authentication

## Quick Start

```bash
npm install
npm run dev          # Frontend at http://localhost:5173
cd api && pip install -r requirements.txt && python run.py   # API at http://localhost:5001
```

---

## Architecture

### Project Structure

```
├── src/                    # Frontend (React)
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── AuthContext.tsx
│   │   ├── useAuth.ts
│   │   └── auth.types.ts
│   ├── components/
│   │   ├── auth/
│   │   ├── features/
│   │   ├── KanbanBoard/
│   │   ├── layout/
│   │   ├── shared/
│   │   ├── TeamDashboard/
│   │   ├── SocialFeed/
│   │   └── ui/
│   ├── contexts/
│   ├── routes/
│   ├── types/
│   └── data/
│
├── api/                    # Backend (Flask)
│   ├── app/                # Routes, models, schemas
│   ├── tests/
│   └── requirements.txt
│
├── qa-automation/          # QA framework
│   ├── tests/              # Unit, E2E pages (POM)
│   ├── quality/            # ESLint, Pylint, Sonar
│   ├── security/           # OWASP ZAP, Snyk
│   ├── performance/        # k6, Lighthouse
│   └── reports/            # Dashboard, report generation
│
└── tests/                  # Playwright E2E specs
```

### Design Patterns

| Area | Implementation |
|------|----------------|
| **State** | `useState` local + Context (Auth, Theme) |
| **Persistence** | `localStorage` (theme, Kanban tasks, session) |
| **Routing** | `pushState` / `popstate` (SPA) |
| **Components** | Composition, props where appropriate |

### Application Flow

```
main.tsx → App → ThemeProvider → AuthProvider → AppContent
  ├── [Unauthenticated] → Login / MultiStepRegister
  └── [Authenticated]   → AppLayout (sidebar + content)
       └── ProtectedRoute → renderPage(): /dashboard, /tasks, /projects, /team, /feed, /settings, /profile
```

### Kanban Module

- **KanbanBoard**: Main container, DndContext, filters, search, modals
- **BoardColumn**: Droppable columns (useDroppable) with SortableContext
- **TaskCard**: Sortable cards (useSortable)
- **AddTaskModal / EditTaskModal**: Task CRUD
- **State**: `useState` + `localStorage`

### Dark Mode

- `ThemeContext` syncs with `localStorage` and `prefers-color-scheme`
- Tailwind `dark:` classes

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Playwright E2E tests |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:register` | Registration form tests |
| `npm run lint` | ESLint |
| `npm run qa` | Full QA suite (lint, tests, security, report) |
| `npm run qa:report` | Generate QA report |
| `npm run qa:analyze` | AI improvement recommendations |

**Backend:** `cd api && python run.py` — API on `http://localhost:5001`

---

## Testing

| Type | Tool | Location |
|------|------|----------|
| E2E | Playwright | `tests/` |
| E2E (POM) | Playwright + Page Objects | `qa-automation/tests/e2e/pages/` |
| Frontend unit | Vitest | `qa-automation/tests/unit/frontend/` |
| Backend | pytest | `api/tests/` |

---

## QA Automation

Full QA suite with code quality, security scanning, performance tests, and dashboard:

```bash
npm run qa
open qa-automation/reports/dashboard.html
```

See [qa-automation/QA_SUITE_DOCUMENTATION.md](qa-automation/QA_SUITE_DOCUMENTATION.md) for details.

---

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml` — build, test, security scan, deploy.

See [.github/WORKFLOWS_GUIDE.md](.github/WORKFLOWS_GUIDE.md) for pipeline documentation.

---

## React Compiler

React Compiler is not enabled by default. See [documentation](https://react.dev/learn/react-compiler/installation).

## ESLint

For stricter (type-aware) rules, see the ESLint configuration file.
