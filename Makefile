SHELL := /bin/bash

up:
\tdocker compose up -d --build

down:
\tdocker compose down

logs:
\tdocker compose logs -f --tail=100

migrate:
\tdocker compose exec laravel.test php artisan migrate

seed:
\tdocker compose exec laravel.test php artisan db:seed

tinker:
\tdocker compose exec laravel.test php artisan tinker

swagger:
\tdocker compose exec laravel.test php artisan l5-swagger:generate
