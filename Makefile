.PHONY: test test-cov

test:
	uv run pytest tests/ -v

test-cov:
	uv run pytest tests/ --cov=quizling --cov-report=term --cov-report=html
