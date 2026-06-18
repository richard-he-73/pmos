FROM python:3.12-slim

WORKDIR /app

# 系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 依赖
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# 项目代码
COPY . .

# 收集静态文件
RUN uv run python manage.py collectstatic --noinput --settings=pmos.settings.prod || true

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "pmos.wsgi:application", "-b", ":8000", "-w", "4"]
