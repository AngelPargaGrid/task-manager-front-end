# React + TypeScript + Vite

Aplicación frontend modular con autenticación, dashboard, Kanban board, feed social y soporte para dark mode.

## Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite 7** — Build tool
- **Tailwind CSS** — Estilos y dark mode
- **@dnd-kit** — Drag and drop (Kanban)
- **Recharts** — Gráficas
- **Playwright** — Tests E2E

---

## Arquitectura

### Estructura del Proyecto

```
src/
├── App.tsx                 # Punto de entrada principal, rutas y layout
├── main.tsx                # Renderizado raíz (StrictMode)
├── index.css               # Estilos globales + Tailwind
│
├── auth/                   # Autenticación
│   ├── AuthProvider.tsx    # Proveedor de contexto de auth
│   ├── AuthContext.tsx     # Contexto y estado de sesión
│   ├── useAuth.ts          # Hook para consumir auth
│   └── auth.types.ts       # Tipos de autenticación
│
├── components/
│   ├── auth/               # Login, registro multistep
│   ├── features/           # Pantallas/features principales
│   │   ├── DashboardDemo.tsx
│   │   ├── ProductCardDemo.tsx
│   │   ├── SettingsPanelDemo.tsx
│   │   └── ...
│   ├── KanbanBoard/        # Módulo Kanban completo
│   │   ├── KanbanBoard.tsx
│   │   ├── BoardColumn.tsx
│   │   ├── TaskCard.tsx
│   │   ├── AddTaskModal.tsx
│   │   ├── EditTaskModal.tsx
│   │   ├── types.ts
│   │   ├── initialTasks.ts
│   │   └── kanbanAssignees.ts
│   ├── layout/             # Layout, sidebar, profile
│   │   ├── AppLayout.tsx
│   │   ├── ProfilePage.tsx
│   │   └── ...
│   ├── shared/             # Componentes reutilizables
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   └── Card.tsx
│   ├── TeamDashboard/      # Dashboard de equipo
│   ├── SocialFeed/         # Feed, posts, comentarios
│   └── ui/                 # Componentes UI base
│       ├── Button.tsx
│       ├── FormInput.tsx
│       ├── ToggleSwitch.tsx
│       └── ...
│
├── contexts/
│   └── ThemeContext.tsx    # Tema light/dark
│
├── routes/
│   └── ProtectedRoute.tsx  # HOC para rutas protegidas
│
├── types/                  # Tipos globales
│   ├── dashboard.types.ts
│   ├── product.types.ts
│   ├── user.types.ts
│   └── ...
│
└── data/                   # Datos de ejemplo
    └── sampleUsers.ts
```

### Patrones de Diseño

| Área | Implementación |
|------|----------------|
| **State** | `useState` local + Context (Auth, Theme) |
| **Persistencia** | `localStorage` (tema, tareas Kanban, sesión simulada) |
| **Routing** | `pushState` / `popstate` (SPA sin React Router) |
| **Componentes** | Composición, props drilling donde aplica |

### Flujo de la Aplicación

```
main.tsx
  └── App
        └── ThemeProvider
              └── AuthProvider
                    └── AppContent
                          ├── [No autenticado] → Login / MultiStepRegister
                          └── [Autenticado]   → AppLayout (sidebar + contenido)
                                                ├── ProtectedRoute
                                                └── renderPage() por ruta:
                                                    /dashboard  → DashboardDemo
                                                    /tasks      → KanbanBoard
                                                    /projects   → ProductCardDemo
                                                    /team       → TeamDashboard
                                                    /feed       → Feed (SocialFeed)
                                                    /settings   → SettingsPanelDemo
                                                    /profile    → ProfilePage
```

### Módulo Kanban (Arquitectura)

- **KanbanBoard**: Contenedor principal, DndContext, filtros, búsqueda, modales
- **BoardColumn**: Columnas droppables (useDroppable) con SortableContext
- **TaskCard**: Tarjetas sortables (useSortable) con metadatos
- **AddTaskModal / EditTaskModal**: CRUD de tareas con asignación
- **Estado**: `useState` + `localStorage` para persistencia

### Tema (Dark Mode)

- `ThemeContext` sincroniza con `localStorage` y `prefers-color-scheme`
- Tailwind: clases `dark:` para estilos en modo oscuro
- `document.documentElement.classList` para `class="dark"` en HTML

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run test` | Tests Playwright |
| `npm run test:register` | Tests del formulario de registro |
| `npm run lint` | ESLint |

---

## Tests

Tests E2E con Playwright en `tests/` (ej. `register.spec.ts` para el formulario multistep).

---

## React Compiler

El React Compiler no está habilitado por defecto por impacto en rendimiento. Ver [documentación](https://react.dev/learn/react-compiler/installation).

---

## ESLint

Para reglas más estrictas (type-aware), ver la documentación en el archivo de configuración de ESLint.
