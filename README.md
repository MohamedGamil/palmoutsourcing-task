# Palm Outsourcing - Senior Full-Stack Assessment Task

This project is a **monorepo** containing:

* **Laravel (latest)** API (via **Sail**) with:
  * Authentication (Laravel Breeze API + Sanctum tokens)
  * Example RESTful endpoints
  * Swagger/OpenAPI documentation
  * Postgres database + initial migrations

* **Next.js (latest)** frontend app
* **Docker Compose** orchestration for local development

---

## 🗂 Project Structure

```
palmoutsourcing-task/
├─ apps/
│  ├─ api/          # Laravel (backend API)
│  └─ web/          # Next.js (frontend)
├─ data/
│  └─ sail-pgsql/   # Local Postgres persisted data
├─ scripts/         # Utilities & helpers bash scripts
├─ docker-compose.yml
├─ Makefile
├─ .env
└─ README.md
```

---

## ⚡ Prerequisites

* [Docker](https://docs.docker.com/get-docker/) (20.10+ recommended)
* [Docker Compose](https://docs.docker.com/compose/) v2+
* GNU `make` (optional, for shorthand commands)

---

## 🔧 Setup & Installation

1. **Clone this repository**

   ```bash
   git clone git@github.com:MohamedGamil/palmoutsourcing-task.git
   cd palmoutsourcing-task
   ```

2. **Prepare environment files (Optional)**

   * Root directory: copy `.env.example` → `.env` inside `./`
   * Laravel API: copy `.env.example` → `.env` inside `apps/api`
   * Next.js: create `apps/web/.env.local`

   Example values:

   **`apps/api/.env`** (important lines)

   ```dotenv
   DB_CONNECTION=pgsql
   DB_HOST=pgsql
   DB_PORT=5435
   DB_DATABASE=app
   DB_USERNAME=sail
   DB_PASSWORD=password
   ```

   **`apps/web/.env.local`**

   ```dotenv
   NEXT_PUBLIC_API_URL=http://localhost:8081
   ```

3. **Start containers**
   
   First time application services setup
   ```bash
   make install
   ```
   
   Running the application services
   ```bash
   make up
   ```

   This will build and run Laravel API, Next.js frontend, and Postgres.

4. **Run migrations + seed database**

   ```bash
   make migrate
   make seed
   ```

   The database is stored locally in `./data/sail-pgsql/` and will persist between runs.

---

## ▶️ Running the App

* **Backend API (Laravel)** → [http://localhost:8081](http://localhost:8081)
* **Swagger Docs** → [http://localhost:8081/api/docs](http://localhost:8081/api/docs)
* **Frontend (Next.js)** → [http://localhost:3001](http://localhost:3001)

---

## 🛠 Makefile Shortcuts

To simplify commands, use the included `Makefile`:

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `make up`      | Build & start all containers         |
| `make down`    | Stop & remove containers             |
| `make logs`    | Tail logs of all services            |
| `make migrate` | Run database migrations              |
| `make seed`    | Seed the database with demo data     |
| `make tinker`  | Open Laravel Tinker inside container |
| `make swagger` | Regenerate Swagger docs              |
| `make clean`   | Clean up the app to initial state    |
| `make install` | Installs the application             |

Example:

```bash
make up        # start services
make migrate   # run migrations
make swagger   # rebuild docs
```

---

## 🔑 Authentication Flow

* `POST /register` → create a new user

* `POST /login` → get API token (`plainTextToken`)

* Pass token as header:

  ```
  Authorization: Bearer <your_token_here>
  ```

* Example protected route:

  * `GET /api/profile` → returns authenticated user

---

## 🐞 Known Bugs & Issues

* During initial project setup by running `make install` command, the web container may need a teardown then running it back to ensure it's working as expected by running: `make down && make up` commands.
* Since CI/CD was out of scope, additional project scripts or command may need implementation to handle building backend image, and front-end image as well.
* Front-end pagination may lag sometimes in updating the number of pages available for navigation after changing the amount of tasks displayed per page.
* RESTful API endpoints should've been prefixed by `v1` URL segment to follow best practices.
* CSRF handling may require additional tweaks and testing to ensure it's working as expected.
* Backend task listing endpoint may need further refactoring to standardize the response format.
* If web container fails to run at all, you may need to run it using local node as follows:
  ```bash
  cd apps/web
  rm -rf node_modules
  npm ci
  npm run dev
  ```
  The application would be available via: [http://localhost:3000](http://localhost:3000), however should still run without any problems.

---

## 🔨 Trade-offs & Potential Improvements

1. **CI/CD**

   * Currently manual; introducing pipelines for build, test, and deploy would improve reliability and automation.

2. **Authentication**

   * Basic scaffolding exists, but implementing robust authentication endpoints and flows (login, register, token refresh, role-based access) is still needed.

3. **Architecture & Code Quality**

   * Project could benefit from deeper application of **SOLID principles**.
   * Refactor into a **clean architecture**:

     * **Domain layer** → abstract business logic.
     * **Application layer** → handle use cases (e.g., tasks CRUD).
     * **Infrastructure layer** → controllers, persistence, frameworks.

4. **API & Schema Evolution & Frontend DevEx**

   * API client codegen from OpenAPI, React Query/TanStack with Zod validation, MSW for offline mocks, Storybook, Vercel for preview deploys, Bundle analysis, i18n, accessibility linting.

5. **Frontend Improvements**

   * Refactor into **well-typed interfaces and types** to isolate business logic.
   * Use **React Query + custom hooks** for data fetching and cache management.
   * Improve **state management** to support concurrent updates (bulk edits, async changes) without blocking the user.

6. **User Experience**

   * Upgrade UI to a **Google Keep–like interface** for real-time task management, drag-and-drop reordering, and smoother workflows.
   * Add **secure sharing options**: public/anonymous or private task sharing with fine-grained permissions.

7. **Sail vs Prod Images**

   * Create slim prod Dockerfiles (multi‑stage, opcache preloading, no dev tools), run behind nginx/Traefik/Caddy with HTTP/2 + TLS; add healthchecks and non‑root users.

8. **Database & Data Layer**

   * Add connection pooling (PgBouncer), read replicas, schema validation (pgTAP), seed strategies per env, migrate on startup with gating/lock, temporal tables or auditing, logical backups + PITR; integrate Prisma (for web) or OpenAPI clients to avoid drift.

9. **Observability**

   * Add structured logging (Monolog JSON) to stdout, request IDs, Sentry/Bugsnag; metrics (Prometheus + Grafana), OpenTelemetry traces (HTTP + DB + queue), health endpoints & readiness checks.

10. **Caching & Performance**

   * Add Redis for cache/queues/rate‑limits, response caching (ETag, 304), HTTP caching for Next static routes, Octane (RoadRunner/Swoole) for API throughput, tuned OPcache & preloading, DB indexes review.

11. **Testing Strategy**

   * Pest/PHPUnit with feature tests + API contract tests; Playwright for web E2E; smoke tests CI step post‑deploy; test containers for PG/Redis; fixture factories and snapshot tests for OpenAPI docs.

12. **API Gateway**

   * Introduce reverse proxy (Traefik/Caddy) with Let’s Encrypt, rate‑limit, WAF rules, unified access logs.

---

## 💡 Additional Documentations & Notes

* **SRS**: Detailed in the following document: [`docs/srs.md`](https://github.com/MohamedGamil/palmoutsourcing-task/blob/main/docs/srs.md).
* **Database Choice**: Detailed in the following document: [`docs/db-choice.md`](https://github.com/MohamedGamil/palmoutsourcing-task/blob/main/docs/db-choice.md).
* **API Error Handling**: Detailed in the following document: [`docs/api-error-handling.md`](https://github.com/MohamedGamil/palmoutsourcing-task/blob/main/docs/api-error-handling.md).
* **Notes**:
    - **Persistence**: Postgres data is stored under `./data/sail-pgsql/` (ignored by git, except for `.gitkeep`).
    - **CORS**: Configured in Laravel to allow `http://localhost:3001` (Next.js).
    - **Swagger Docs**: Generated via [`darkaonline/l5-swagger`](https://github.com/DarkaOnLine/L5-Swagger).

---

## 🚀 Next Steps

* Extend `apps/api/routes/api.php` with your own endpoints.
* Add Next.js pages/components to consume the API.
* Switch to managed Postgres & production Docker builds for deployment.
