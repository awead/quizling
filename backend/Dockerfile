FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src/ ./src/

RUN uv sync --frozen --no-dev

RUN useradd -m -u 1000 quizling && \
    chown -R quizling:quizling /app

USER quizling

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app/src

EXPOSE 8000

CMD ["uvicorn", "quizling.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
