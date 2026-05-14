# HabitHero — Telegram бот для отслеживания привычек

## Что нужно для запуска

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) — менеджер пакетов
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — для локальной PostgreSQL
- Telegram-бот (токен от @BotFather)

---

## Быстрый старт

### 1. Настрой переменные окружения

```bash
cd habit-bot
cp .env.example .env
```

Открой `.env` и заполни:
- `BOT_TOKEN` — токен от @BotFather
- Остальное можно оставить как есть для локалки

### 2. Запусти PostgreSQL через Docker

```bash
docker-compose up -d
```

Проверить что работает:
```bash
docker-compose ps
```

Должно показать `healthy` у postgres.

### 3. Установи зависимости Python

```bash
cd backend
uv sync
```

uv автоматически создаст виртуальное окружение и установит все пакеты.

### 4. Применить миграции (создать таблицы в БД)

```bash
cd backend
uv run alembic upgrade head
```

### 5. Запусти бота

Открой **первый** терминал в `backend/`:
```bash
uv run python src/bot_main.py
```

Бот запустится и будет слушать сообщения.

### 6. Запусти API (для Mini App)

Открой **второй** терминал в `backend/`:
```bash
uv run python src/api_main.py
```

API запустится на `http://localhost:8000`.

Открой в браузере [http://localhost:8000/docs](http://localhost:8000/docs) — Swagger UI с описанием всех эндпоинтов.

> **Важно:** все эндпоинты `/api/*` требуют заголовок `X-Telegram-Init-Data` с подписанным initData от Telegram WebApp. Из Swagger UI напрямую вызвать их не получится (нужны реальные данные из Telegram). Это нормально — Mini App будет отправлять их сам.

---

## Команды бота

| Команда | Что делает |
|---|---|
| `/start` | Приветствие и выбор таймзоны |
| `/new` | Создать новую привычку |
| `/today` | Привычки на сегодня + отметка выполнения |

---

## Структура проекта

```
habit-bot/
├── backend/
│   ├── alembic/          ← миграции БД
│   ├── src/
│   │   ├── bot/          ← хэндлеры, клавиатуры, состояния
│   │   ├── core/         ← конфиг, логгер
│   │   ├── db/           ← модели, репозитории, сессия
│   │   ├── services/     ← бизнес-логика
│   │   └── bot_main.py   ← точка входа
│   └── pyproject.toml    ← зависимости
├── docker-compose.yml    ← локальная PostgreSQL
├── .env.example          ← шаблон переменных
└── README.md
```

---

## Частые ошибки

**"Cannot connect to database"** — убедись что Docker запущен и контейнер работает:
```bash
docker-compose up -d
docker-compose ps
```

**"BOT_TOKEN not found"** — убедись что создал файл `.env` (не `.env.example`) и заполнил токен.

**"uv: command not found"** — перезапусти терминал после установки uv.
