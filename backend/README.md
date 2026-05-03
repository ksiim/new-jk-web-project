## Backend Runbook

### 1. Требования
- Python `3.12.x`
- `uv` (рекомендуется) или уже созданный `backend/.venv`
- PostgreSQL (локально или через `docker-compose`)

### 2. Подготовка окружения
Команды выполняются из корня репозитория.

```bash
cd backend
uv sync
```

Если используете локальный `.venv`:

```bash
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
pip install -e .
```

### 3. Переменные окружения
Файл `.env` в корне проекта уже содержит нужные переменные для локального запуска.

Ключевые переменные:
- `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`
- `PROJECT_API_V1_STR` (обычно `/api/v1`)
- `PROJECT_SECRET_KEY`
- `PROJECT_ACCESS_TOKEN_EXPIRE_MINUTES`

### 4. Запуск backend
Из корня проекта:

```bash
make dev-run
```

Или напрямую:

```bash
cd backend
uv run uvicorn src.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Проверка health:

```bash
curl -sS http://127.0.0.1:8000/api/v1/health
```

### 5. Миграции
Применение миграций:

```bash
cd backend
uv run alembic upgrade head
```

### 6. Единый seed тестовых данных
Seed заполняет:
- тестовые аккаунты (`admin`, `guide`, `tourist`)
- профиль гида
- POE
- туры и слоты
- бронирования и отзывы

```bash
cd backend
uv run python -m src.app.scripts.seed_demo_data
```

Тестовые аккаунты после seed:
- `admin@example.com / Admin123!`
- `guide@example.com / Guide123!`
- `tourist@example.com / Tourist123!`

Скрипт идемпотентный: при повторном запуске не дублирует записи с теми же ID/email.

### 7. Роли и основные endpoint-ы
- Турист: `/users/*`, `/tours/*`, `/bookings/*`, `/favorites/*`, `/reviews/*`
- Гид: `/guides/me`, `/guides/me/bookings`, `/guides/me/stats`, `/guides/me/reviews`
- Админ: `/admin/users`, `/admin/guides`, `/admin/tours`, `/admin/poes`, `/admin/reviews`, `/admin/bookings`

### 8. Smoke-приемка (backend)
Быстрый smoke через pytest:

```bash
cd backend
.venv/bin/python -m pytest -q tests/test_api_new_endpoints_smoke.py
```

Более широкий прогон:

```bash
make smoke-e2e
```

### 9. Полезные проверки
Линтер:

```bash
make lint
```

Таргетные тесты по изменениям:

```bash
cd backend
.venv/bin/python -m pytest -q tests/test_review_service.py tests/test_api_new_endpoints_smoke.py
```
