# Backend

Runs the API and generates questions from text-based content.

## Installation

This project uses `uv` for package management. First, install dependencies:

```bash
uv sync
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Azure OpenAI credentials:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

## Usage

### Command Line Interface

```bash
# Generate 5 medium difficulty questions
uv run python -m quizling document.pdf

# Generate 10 easy questions
uv run python -m quizling document.txt -n 10 -d easy

# Focus on a specific topic
uv run python -m quizling document.pdf -n 5 -t "machine learning" -d hard

# Output only JSON format
uv run python -m quizling document.txt --format json -o my_quiz

# Get help
uv run python -m quizling --help
```

#### CLI Options

- `-n, --num-questions`: Number of questions (default: 5)
- `-d, --difficulty`: Difficulty level: easy, medium, hard (default: medium)
- `-t, --topic`: Specific topic to focus on
- `--no-explanations`: Exclude explanations for answers
- `-o, --output`: Output file path (default: quiz_output)
- `--format`: Output format: json, text, both (default: both)

### Supported File Formats

- **Text files**: `.txt`, `.md`
- **PDF files**: `.pdf` (requires `pypdf`)
- **Word documents**: `.docx` (requires `python-docx`)

### Examples

See the `examples/` directory for more usage examples:

- `examples/basic_usage.py` - Simple quiz generation
- `examples/advanced_usage.py` - Advanced features and batch processing

Run examples:

```bash
uv run python examples/basic_usage.py
```

## Running the API

You can run the API server using uvicorn:

```bash
uvicorn quizling.api.app:app --reload
```

The API will be available at `http://localhost:8000`

### Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Health Check

- **GET /** - Root endpoint, returns health status
- **GET /health** - Health check endpoint

### Questions

#### Get All Questions (with pagination)

```
GET /questions?limit=20&cursor=0
```

**Query Parameters:**
- `limit` (optional): Number of results per page (1-100, default: 20)
- `cursor` (optional): Pagination cursor (skip offset, default: 0)

**Response:**
```json
{
  "data": [
    {
      "question": "What is 2+2?",
      "options": [
        {"label": "A", "text": "3"},
        {"label": "B", "text": "4"},
        {"label": "C", "text": "5"},
        {"label": "D", "text": "6"}
      ],
      "correct_answer": "B",
      "explanation": "2+2=4",
      "difficulty": "easy"
    }
  ],
  "next_cursor": "20",
  "has_more": true,
  "total": 100
}
```

#### Filter by Difficulty

```
GET /questions?difficulty=easy
```

**Query Parameters:**
- `difficulty`: Filter by difficulty level (easy, medium, hard)

#### Search Questions

```
GET /questions?search=python
```

**Query Parameters:**
- `search`: Search text to find in questions

#### Combined Filters

You can combine difficulty and search filters:

```
GET /questions?difficulty=medium&search=python&limit=10
```

#### Get Question by ID

```
GET /questions/{question_id}
```

**Path Parameters:**
- `question_id`: MongoDB ObjectId of the question

**Response:**
```json
{
  "data": {
    "question": "What is 2+2?",
    "options": [
      {"label": "A", "text": "3"},
      {"label": "B", "text": "4"},
      {"label": "C", "text": "5"},
      {"label": "D", "text": "6"}
    ],
    "correct_answer": "B",
    "explanation": "2+2=4",
    "difficulty": "easy"
  }
}
```

### Error Responses

All endpoints may return error responses:

**404 Not Found:**
```json
{
  "detail": "Question not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Database error: connection failed"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "ensure this value is less than or equal to 100",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### Cursor-Based Pagination

The API uses cursor-based pagination for efficient data retrieval:

1. First request: `GET /questions?limit=20`
2. Response includes `next_cursor` if more results exist
3. Next request: `GET /questions?limit=20&cursor=20`
4. Continue until `has_more` is false

### Examples

#### cURL

```bash
# Get all questions
curl http://localhost:8000/questions

# Get questions by difficulty
curl http://localhost:8000/questions?difficulty=hard

# Search questions
curl "http://localhost:8000/questions?search=python"

# Get specific question
curl http://localhost:8000/questions/507f1f77bcf86cd799439011
```

## Development

### Running Tests

Run tests with verbose output:

```bash
make test
# or
uv run pytest tests/ -v
```

Run tests with coverage reporting:

```bash
make test-cov
# or
uv run pytest tests/ --cov=quizling --cov-report=term --cov-report=html
```

Coverage reports are generated in:
- Terminal output (summary)
- `htmlcov/` directory (detailed HTML report - open `htmlcov/index.html` in your browser)
- `coverage.xml` (for CI/CD)

### Code Formatting

```bash
uv run ruff check .
uv run ruff format .
```

## License

MIT License

