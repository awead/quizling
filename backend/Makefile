.PHONY: install test test-cov lint format console api

install:
	uv sync

test:
	uv run pytest tests/ -v

test-cov:
	uv run pytest tests/ --cov=quizling --cov-report=term --cov-report=html

lint:
	uv run ruff check .
	uv run ruff format --check .

format:
	uv run ruff format .

console:
	uv run ipython -i src/quizling/utils/console.py

api:
	uv run uvicorn quizling.api.app:app --reload
