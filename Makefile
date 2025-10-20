.PHONY: test test-cov console

test:
	uv run pytest tests/ -v

test-cov:
	uv run pytest tests/ --cov=quizling --cov-report=term --cov-report=html

console:
	uv run ipython -i src/quizling/utils/console.py

api:
	uv run uvicorn quizling.api.app:app --reload

