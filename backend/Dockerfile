FROM python:3.12-slim AS builder

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Create virtual environment
RUN uv venv /app/.venv
ENV VIRTUAL_ENV=/app/.venv PATH="/app/.venv/bin:$PATH"
RUN uv pip install --no-cache-dir .

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv
ENV VIRTUAL_ENV=/app/.venv PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY backend/app ./app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
