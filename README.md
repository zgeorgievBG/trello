# TaskBoard

A full-stack Kanban / task-board app (mini Jira / Trello) built as a portfolio project.

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query, dnd-kit |
| Backend  | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL 16 |
| Infra    | Docker, Docker Compose, nginx |

---

## Features

- Projects — create, rename, delete; auto-selects first project on load
- Tasks — create, edit, delete; status (`todo` / `in-progress` / `done`), priority, assignee
- Kanban board — three columns with per-column infinite scroll (loads more as you scroll)
- Drag & drop — move cards between columns by dragging
- Comments — add / delete comments on any task
- Search — debounced title search across all columns
- Optimistic updates — status and title changes reflect immediately in the UI

---

## Running with Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

| Service  | URL |
|----------|-----|
| App (UI) | http://localhost:8080 |
| API      | http://localhost:8080/tasks, http://localhost:8080/projects |
| Swagger  | http://localhost:8080/api-docs |

nginx proxies all API requests from the client container to the server container internally — only port 8080 is exposed to the host.

To seed demo data after the first start:

```bash
docker compose exec server node dist/config/seed.js
```

To stop and remove containers (data is preserved in the `pgdata` volume):

```bash
docker compose down
```

To also wipe the database volume:

```bash
docker compose down -v
```

---

## Running locally (development)

### Prerequisites

- Node.js 22+
- PostgreSQL running locally (or via Docker)

### 1 — Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2 — Start the server

```bash
cd server
npm install
npm run setup      # copies .env.example → .env, edit if your Postgres credentials differ
npm run dev        # ts-node with nodemon, port 3000
```

The server creates all tables on first start.

### 3 — Start the client

```bash
cd client
npm install
npm run dev        # Vite dev server, port 5173
```

### Environment variables

`server/.env.example` lists all required variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/trello
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/trello_test
PORT=3000
```

`npm run setup` copies this file to `.env` with the default values (matching the Docker Compose Postgres config). Edit it if your local Postgres uses different credentials.

`VITE_API_URL` in the client defaults to `http://localhost:3000` when not set.

---

## Project structure

```
trello/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios wrappers
│   │   ├── components/      # UI components
│   │   ├── hooks/           # TanStack Query hooks
│   │   └── types/           # Shared TypeScript types
│   ├── Dockerfile
│   └── nginx.conf           # Serves SPA + proxies API to server
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # DB connection, schema, seed
│   │   ├── middleware/       # Error handler, Zod validation
│   │   └── modules/
│   │       ├── tasks/
│   │       ├── projects/
│   │       └── comments/
│   └── Dockerfile
│
└── docker-compose.yml       # postgres + server + client
```

---

## API overview

All responses follow `{ data: T | null, error: string | null }`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a project |
| PATCH | `/projects/:id` | Update a project |
| DELETE | `/projects/:id` | Delete a project (cascades to tasks) |
| GET | `/tasks?projectId=&status=&search=&page=&limit=` | Paginated tasks |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/tasks/counts?projectId=` | Count per status |
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add a comment |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete a comment |

Interactive docs: `GET /api-docs`

---

## Running tests

Tests hit a real PostgreSQL database — start Postgres first.

```bash
cd server
npm test
```
