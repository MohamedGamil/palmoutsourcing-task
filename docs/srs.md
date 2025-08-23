# Software Requirements Specification (SRS)

**Project:** Tiny Tasks (Laravel API + Next.js UI)
**Version:** 1.0
**Date:** 2025-08-23
**Owner:** Mohamed Gamil

---

## 1. Purpose & Scope

Build a minimal tasks service with:

* **Backend:** Laravel API exposing `GET /tasks` and `POST /tasks`, backed by a database.
* **Frontend:** Next.js app fetching and rendering tasks responsively.
* **Docs:** Short README with run and DB setup steps; clean, tidy repo.

Primary database target: **PostgreSQL** (future-proof, strong integrity).
Acceptable alternatives (if time-constrained or to meet the “RethinkDB if you can” note): **RethinkDB**, **MySQL**, **SQLite**.

---

## 2. Definitions & References

* **Task:** `{ id, title, description, status }`
* **Status enum:** `Pending | In Progress | Done`
* **Seed data:** 6–8 tasks inserted at migration/seed time.

---

## 3. Stakeholders

* **Developer/Tech Lead:** builds, maintains, extends.
* **Reviewer/Interviewer:** evaluates code quality, clarity, correctness.
* **User (demo):** views and adds tasks via UI.

---

## 4. Assumptions & Constraints

* No authentication is required.
* Public POST is acceptable for the demo (rate limiting optional).
* Single service pair (API + UI) deployed locally via Docker or bare Node/PHP.
* Internet is not required at runtime (except for dependency install).
* **Timebox-friendly:** can fall back to SQLite if needed; still keep schema constraints in app/DB.

---

## 5. System Context

* Next.js frontend (browser) → fetches from Laravel API (`/api/*` or separate origin with CORS).
* Laravel API ↔ database (PostgreSQL preferred; alternatives supported).

---

## 6. Functional Requirements

### 6.1 Backend (Laravel API)

#### 6.1.1 Endpoints

| Endpoint | Method | Description                                                  | Request Body                      | Success (200/201)                        | Errors                               |
| -------- | ------ | ------------------------------------------------------------ | --------------------------------- | ---------------------------------------- | ------------------------------------ |
| `/tasks` | GET    | Return all tasks (seed + newly created). Sorted by `id` ASC. | —                                 | `[{ id, title, description, status }]`   | 500 on server error                  |
| `/tasks` | POST   | Create a new task. No auth.                                  | `{ title, description?, status }` | `201 { id, title, description, status }` | `422` validation; `500` server error |

#### 6.1.2 Request/Response Models

* **Task (response):**

  ```json
  {
    "id": 1,
    "title": "Setup Sail",
    "description": "Bootstrap containers",
    "status": "Pending"
  }
  ```
* **POST /tasks (request):**

  ```json
  {
    "title": "Write tests",
    "description": "Cover controller",
    "status": "Pending"
  }
  ```

#### 6.1.3 Validation Rules (server-side)

* `title`: required, string, max 120 chars
* `description`: optional, string or null
* `status`: required, one of `Pending`, `In Progress`, `Done`

#### 6.1.4 Data Model (DB)

* **tasks**

  * `id` (PK, auto)
  * `title` (varchar 120, not null)
  * `description` (text, nullable)
  * `status` (enum/check constrained)
  * `created_at`, `updated_at`

**Integrity**

* PostgreSQL/MySQL: `ENUM` or `CHECK` constraint on `status`.
* SQLite: `CHECK` constraint or triggers.
* RethinkDB: enforce in app layer; optional validator wrapper.

#### 6.1.5 Seed Data

Insert **6–8 tasks** during seeding. Coverage: all three statuses represented.

#### 6.1.6 CORS

If frontend and backend run on different origins, enable CORS for `GET` and `POST` from the Next.js origin.

#### 6.1.7 Errors

* **422**: validation error returns field-specific messages.
* **500**: generic JSON `{ "message": "Internal server error" }`.

---

### 6.2 Frontend (Next.js)

#### 6.2.1 Pages/Views

* **Tasks List Page**
  * Fetches `GET /tasks`.
  * Displays **responsive** list/grid.
  * Each card shows: **title, description, status**.
  * Visual badge/color for status.

* **Create Task Form**
  * Fields: `title` (required), `description` (optional), `status` (select).
  * Submits to `POST /tasks`.
  * On success: optimistic add or refetch list.


#### 6.2.2 Behavior

* Loading and error states for both fetch and submit.
* Client-side validation mirroring backend rules.
* Mobile-first, responsive layout (cards stack on small screens, grid ≥ md).

---

### 6.3 Documentation (README)

* Prereqs (Docker, PHP, Node, Composer).
* Setup steps: install dependencies, environment variables.
* DB setup instructions (primary Postgres + alternatives):
  * Migrate & seed commands.
  * Connection strings per DB.

* Run commands for API and UI.
* Notes on CORS and environment variables.

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance

* `GET /tasks` (≤ 100 rows) median response ≤ **150 ms** on local dev.
* `POST /tasks` median response ≤ **200 ms** on local dev.

### 7.2 Reliability & Integrity

* DB-level constraints (where available) ensure status validity.
* Transactions wrap task inserts.

### 7.3 Security (minimal for demo)

* No auth by design.
* Sanitize inputs; use Laravel validation.
* CORS restricted to Next.js origin in `.env` example.

### 7.4 Maintainability & Code Quality

* Clean folder structure; PSR-12/Lint.
* Small, focused controllers/components.
* Config via `.env` only; no secrets in code.
* Clear commit messages.
* Optional: basic feature tests for endpoints.

### 7.5 Usability & Accessibility

* Keyboard accessible form.
* Color contrast for status badges meets WCAG AA.
* ARIA labels for form controls.

### 7.6 Portability

* Docker compose for API and DB.
* Next.js runs via `npm run dev` or in Docker.

### 7.7 Observability

* Structured error logs (Laravel default).
* Console messages on the client for fetch errors (non-blocking).

---

## 8. Database Options & Minimum Acceptance

**Primary (recommended): PostgreSQL**

* Enforce `ENUM/CHECK` for `status`.
* Seeder creates 6–8 tasks.

**Alternatives (acceptable to satisfy brief):**

* **RethinkDB:** use app-level enum validation; demonstrate changefeeds only if time permits (not required).
* **MySQL:** `ENUM` or `CHECK` (8.0+).
* **SQLite:** `CHECK` constraint or pre-insert triggers; good for quickest demo.

**Acceptance for DB hookup (any option):**

* `GET /tasks` returns seeded + newly created tasks.
* `POST /tasks` persists and returns created task.
* README documents how to configure and run with the chosen DB.

---

## 9. API Contracts (OpenAPI-lite)

```yaml
openapi: 3.0.0
info: { title: Tiny Tasks API, version: 1.0.0 }
paths:
  /tasks:
    get:
      summary: List tasks
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    post:
      summary: Create task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewTask'
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/Task' }}}}
        '422': { description: Validation error }
components:
  schemas:
    Task:
      type: object
      required: [id, title, status]
      properties:
        id: { type: integer, example: 1 }
        title: { type: string, maxLength: 120 }
        description: { type: string, nullable: true }
        status: { type: string, enum: [Pending, In Progress, Done] }
    NewTask:
      type: object
      required: [title, status]
      properties:
        title: { type: string, maxLength: 120 }
        description: { type: string, nullable: true }
        status: { type: string, enum: [Pending, In Progress, Done] }
```

---

## 10. UI Requirements (Next.js)

### 10.1 Layout & Components

* **TaskCard**: shows title, description (truncate to \~3 lines), status badge.
* **TaskForm**: controlled inputs, status select with three options.
* **TaskGrid**: responsive CSS grid (1 col on xs, 2 on sm, 3+ on md+).

### 10.2 Styling

* Any utility CSS (Tailwind recommended) or minimal CSS modules.
* Status badge palette:

  * Pending: neutral
  * In Progress: info/blue
  * Done: success/green

---

## 11. Dev Environment & Config

### 11.1 Backend

* PHP 8.2+, Composer
* Laravel 11+
* `.env` with DB connection (examples for Postgres, MySQL, SQLite, RethinkDB notes)
* Commands:

  * `php artisan migrate --seed`
  * `php artisan serve` or Sail: `./vendor/bin/sail up -d`

### 11.2 Frontend

* Node 20+
* `npm i && npm run dev`
* `NEXT_PUBLIC_API_BASE_URL` env to point to Laravel API.

### 11.3 Docker (optional but recommended)

* `docker-compose.yml` including:
  * `app` (Laravel + PHP-FPM)
  * `pgsql` (or `mysql`/`rethinkdb`)
  * `next` (Next.js dev server)

* README contains `docker compose up` instructions.

---

## 12. Test Cases (Acceptance)

### 12.1 API

* **GET returns seed:** After `migrate --seed`, `GET /tasks` returns ≥ 6 items.
* **POST valid:** POST with `{title:"X", status:"Pending"}` returns 201 and echoes the task; subsequent GET includes it.
* **POST invalid status:** returns 422 with validation error.
* **Ordering:** `GET /tasks` ordered ascending by `id`.

### 12.2 UI

* **Responsive cards:** At 320px width, cards stack; ≥768px shows grid with ≥2 columns.
* **Create flow:** Fill form → POST → list updates.
* **Validation UX:** Missing title or invalid status shows error.

---

## 13. Risks & Mitigations

* **Open POST endpoint abuse:** add note in README; optionally enable simple rate limit middleware.
* **DB drift across options:** keep shared validation in app; document DB-specific constraints in README.
* **CORS issues:** document correct origin; provide `.env` examples.

---

## 14. Deliverables

* **Laravel app** (src + migrations + seeder + minimal tests).
* **Next.js app** (pages/components).
* **README.md** with:

  * Setup (API + UI)
  * DB configuration (Postgres primary; alternatives)
  * Run commands and URLs

---

## 15. Out of Scope

* Authentication/authorization.
* Pagination, sorting, filtering beyond simple list.
* Multi-user features, assignments, due dates.
* CI/CD pipelines (can be added later).

---

### Appendix A — Minimal Status Palette (suggested)

* Pending: `#9CA3AF` (gray)
* In Progress: `#2563EB` (blue)
* Done: `#10B981` (green)
