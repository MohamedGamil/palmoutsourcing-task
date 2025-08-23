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

* CI/CD pipelines implementation
* Implementing authentication endpoints
* Further applying SOLID principles and refactoring project structure into database centric clean architecture for future proofing project's implementation
* Refactoring tasks CRUD operations to be handled within the application layer, implemented by controllers in the infrastructure layer, both layers depending on a domain layer for abstract definitions of business logic
* Utilizing tRPC through a proxy app that calls laravel RESTful API returning data to the front-end as a client in order to validate schema changes
* Refactoring front-end code into more organized types and interfaces to isolate business logic
* Refactoring front-end code using hooks and a better state management implementation to handle singular and bulk changes to tasks without blocking users from making asynchronous changes to multiple tasks, allowing for better user experience.
* Implementing a better user interface -similar to Google's Keep- in order to allow for better tasks management in real-time and enabling re-order of tasks.
* Enabling secure private or public sharing of tasks with friends or anonymous users.

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
