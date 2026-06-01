.PHONY: build up down logs shell db makemigrations migrate \
        createsuperuser test lint format clean

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down $(if $(V),--volumes,)

logs:
	docker compose logs -f backend

db:
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB

shell:
	docker compose exec backend python manage.py shell

makemigrations:
	docker compose exec backend python manage.py makemigrations

migrate:
	docker compose exec backend python manage.py migrate

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

test:
	docker compose exec backend python manage.py test

lint:
	docker compose exec backend flake8 .

format:
	docker compose exec backend black .

clean:
	docker compose exec backend find . -type d -name __pycache__ -exec rm -rf {} +
	docker compose exec backend find . -name "*.pyc" -delete