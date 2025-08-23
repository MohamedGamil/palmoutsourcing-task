SHELL := /bin/bash
DC := docker compose

.PHONY: up down ps logs install migrate fresh seed tinker swagger api-composer api-artisan api-sh web-install web-sh reset-db clean prune


# --- Lifecycle ---------------------------------------------------------------

up:
	$(DC) up -d --build

down:
	$(DC) down

ps:
	$(DC) ps

logs:
	$(DC) logs -f --tail=100

prune:
	$(DC) down -v --remove-orphans

clean: down
	rm -rf ./data/sail-pgsql/* || true


# --- One-shot bootstrap ------------------------------------------------------

## One command to set up everything for local dev:
## - builds & starts containers
## - installs PHP deps (Laravel)
## - generates app key & storage link
## - runs migrations (+ optional seed)
## - generates Swagger docs
## - installs Node deps for Next.js
install: up
	# Ensure API dependencies are installed
	$(DC) exec laravel.test composer install --no-interaction --prefer-dist
	# App key + storage symlink
	$(DC) exec laravel.test php artisan key:generate --force
	$(DC) exec laravel.test php artisan storage:link || true
	# Database migrations (uncomment seed if needed)
	$(DC) exec laravel.test php artisan migrate --force
	# $(DC) exec laravel.test php artisan db:seed --force
	# Swagger docs
	$(DC) exec laravel.test php artisan l5-swagger:generate
	# Frontend dependencies
	$(DC) run --rm web sh -c "npm ci || npm install"


# --- DB helpers --------------------------------------------------------------

migrate:
	$(DC) exec laravel.test php artisan migrate --force

fresh:
	$(DC) exec laravel.test php artisan migrate:fresh --seed --force

seed:
	$(DC) exec laravel.test php artisan db:seed --force

reset-db: ## Danger: drop + recreate
	$(DC) exec laravel.test php artisan migrate:fresh --force


# --- API helpers -------------------------------------------------------------

swagger:
	$(DC) exec laravel.test php artisan l5-swagger:generate

tinker:
	$(DC) exec laravel.test php artisan tinker

api-composer:
	$(DC) exec laravel.test composer $(c)

api-artisan:
	$(DC) exec laravel.test php artisan $(t)

api-sh:
	$(DC) exec laravel.test bash


# --- Web helpers -------------------------------------------------------------

web-install:
	$(DC) run --rm web sh -c "npm ci || npm install"

web-sh:
	$(DC) exec web sh
