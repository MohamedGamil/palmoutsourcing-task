# Database Choice Rationale

This document compares **PostgreSQL, MySQL, SQLite, MongoDB, and RethinkDB** for implementing a simple Laravel-based API:

* `GET /tasks` → returns an array of tasks (id, title, description, status) seeded with 6–8 records
* `POST /tasks` → adds a task (no auth)
* Status values: **Pending, In Progress, Done**
* Database requirement: RethinkDB *if possible*, otherwise SQLite/MySQL (quick), or PostgreSQL for future-proofing

---

# TL;DR

✅ **PostgreSQL.**, is the safest choice.

It balances **strict schema enforcement** (status integrity), **first-class Laravel support**, **growth-ready features** (full-text search, JSONB, indexing), and **future-proof scalability**.

* **SQLite** is great for demos/tests.
* **MySQL** works but lags in constraints/search vs Postgres.
* **MongoDB** adds schema-less complexity without benefit for simple relational tasks.
* **RethinkDB** offers real-time change feeds, but its **ecosystem is smaller**, Laravel support is limited, and it introduces operational overhead for a basic CRUD API.

---

# High-Level Comparison

| Criterion              | PostgreSQL                                  | MySQL                      | SQLite           | MongoDB                         | RethinkDB                            |
| ---------------------- | ------------------------------------------- | -------------------------- | ---------------- | ------------------------------- | ------------------------------------ |
| Spin-up speed          | ✅ Easy (Sail/Docker)                        | ✅ Easy                     | ✅ Easiest        | ⚠️ Driver setup                 | ⚠️ Needs custom driver/package       |
| Laravel support        | ✅ Native                                    | ✅ Native                   | ✅ Native         | ⚠️ Community (e.g., jenssegers) | ⚠️ Community drivers (not core)      |
| Enforce `status` options | ✅ `ENUM`/`CHECK`                            | ✅ `ENUM`/`CHECK` (8.0+)    | ✅ `CHECK`        | ⚠️ App-level or schema rules    | ⚠️ App-level or secondary validation |
| Concurrency            | ✅ Strong                                    | ✅ Strong                   | ⚠️ Single writer | ✅ Good                          | ✅ Good (horizontal scaling)          |
| JSON support           | ✅ JSONB w/ indexes                          | ✅ JSON (fewer ops)         | ⚠️ Limited       | ✅ Native                        | ✅ Native document model              |
| Realtime change feeds  | ⚠️ Needs triggers/NOTIFY                    | ⚠️ Needs triggers/binlog   | ❌                | ✅ Change streams                | ✅ Native changefeeds                 |
| Future scaling         | ✅ Rich (replicas, partitioning, extensions) | ✅ Good (replicas/sharding) | ❌                | ✅ Sharding & replicas           | ⚠️ Horizontal, but smaller ecosystem |

---

# Trade-offs, Pros & Cons

## PostgreSQL

* **Pros**:

  * Strong schema validation (`ENUM`, `CHECK`).
  * JSONB + full-text search.
  * Mature Laravel support.
  * Scales from local dev to managed prod.

* **Cons**:
  * Slightly more setup overhead than SQLite.

## MySQL

* **Pros**:

  * Stable, mature, widely available.
  * Solid Laravel support.

* **Cons**:
  * Historically weaker `CHECK` support.
  * Full-text search weaker than Postgres.
  * JSON ops limited.

## SQLite

* **Pros**:

  * Fastest zero-config setup.
  * Excellent for CI/testing.

* **Cons**:
  * Single-writer bottleneck.
  * Not suitable for staging/prod.

## MongoDB

* **Pros**:

  * Flexible schema.
  * Native JSON/document storage.
  * Strong text search, change streams.

* **Cons**:
  * Overkill for relational tasks.
  * Laravel integration requires 3rd-party packages.
  * Data integrity must be enforced at app-level.

## RethinkDB

* **Pros**:

  * Built-in real-time changefeeds (push updates).
  * JSON-first design.
  * Horizontally scalable cluster.

* **Cons**:
  * Laravel support limited (no first-class driver, relies on community).
  * Smaller ecosystem & less maintained than Postgres/MySQL.
  * Adds operational overhead for a CRUD API that doesn’t need live feeds.

---

# Decision Matrix (Weighted)

|             Criterion | Weight | PostgreSQL | MySQL | SQLite | MongoDB | RethinkDB |
| --------------------: | -----: | ---------: | ----: | -----: | ------: | --------: |
|        Data integrity |    25% |      **5** |     4 |      3 |       2 |         2 |
|            Laravel DX |    20% |      **5** |     5 |      4 |       3 |         2 |
| Local→Prod continuity |    15% |      **5** |     5 |      3 |       3 |         2 |
|   Features for growth |    25% |      **5** |     4 |      2 |       3 |         3 |
|   Setup speed |    15% |          4 |     4 |  **5** |       3 |         2 |
|    **Weighted score** |   100% |    **4.8** |   4.3 |    3.2 |     2.8 |       2.4 |

---

# Why PostgreSQL Wins

1. **Strong Data Integrity** → enforce valid statuses at DB-level with `ENUM`/`CHECK`.
2. **Laravel Native Support** → no extra drivers or packages required.
3. **Balanced Flexibility** → structured schema + JSONB for future task metadata.
4. **Future-Proofing** → robust search, indexing, constraints, extensions, and cloud scaling.
5. **Avoids Overhead** → unlike RethinkDB/Mongo, we don’t need schema-less or real-time feeds for a simple tasks API.

---

# When the Others Make Sense

* **SQLite**: if this is strictly a local demo, with no concurrent writes, and “fastest setup” trumps all else.
* **MySQL**: if your company standardizes on MySQL infra.
* **MongoDB**: if tasks are just a slice of a much larger, document-heavy app.
* **RethinkDB**: if real-time streaming of tasks (`GET /tasks` auto-updates without polling) is a **core requirement**. Otherwise, its overhead isn’t justified.

---

# Verdict

For a **tiny Laravel CRUD API** and a **solid foundation for tomorrow**, **PostgreSQL** is the best choice. It offers strict schema guarantees, effortless Laravel integration, and advanced features you’ll actually need if this prototype grows.

SQLite, MySQL, MongoDB, and RethinkDB all have valid niches — but Postgres is the most balanced, future-ready solution.
