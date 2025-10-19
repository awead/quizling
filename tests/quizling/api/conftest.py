"""Pytest configuration for API tests."""

import os

import pytest


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up environment variables for tests."""
    os.environ.setdefault("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com")
    os.environ.setdefault("AZURE_OPENAI_KEY", "test-key")
    os.environ.setdefault("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")
    os.environ.setdefault("AZURE_OPENAI_VERSION", "2024-12-01-preview")
    os.environ.setdefault(
        "MONGODB_URI",
        "mongodb://admin:password@localhost:27017/quizling?authSource=admin",
    )
    os.environ.setdefault("MONGO_DATABASE", "quizling")
