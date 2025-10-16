# Quizling Implementation Overview

This document provides a comprehensive overview of the Quizling implementation.

## Architecture

Quizling is built with a clean, modular architecture following Python best practices:

### Core Components

1. **Models (`src/quizling/models.py`)**
   - Type-safe Pydantic models for all data structures
   - Built-in validation using Pydantic validators
   - Models: `AnswerOption`, `MultipleChoiceQuestion`, `QuizConfig`, `QuizResult`, `DifficultyLevel`

2. **File Reader (`src/quizling/file_reader.py`)**
   - Strategy pattern for different file types
   - Factory pattern for reader instantiation
   - Supports: TXT, MD, PDF, DOCX files
   - Extensible design for adding new file types

3. **Quiz Generator (`src/quizling/generator.py`)**
   - Main class integrating PydanticAI with Azure OpenAI
   - Configurable prompt engineering
   - Export capabilities (JSON, formatted text)
   - Async/await for efficient API calls

4. **CLI (`src/quizling/__main__.py`)**
   - Command-line interface using argparse
   - Environment variable integration
   - User-friendly error messages

## Design Patterns Used

### Strategy Pattern
The file reader uses the Strategy pattern to handle different file formats:

```python
class FileReader(Protocol):
    def read(self, file_path: Path) -> str: ...

class TextFileReader: ...
class PDFFileReader: ...
class DOCXFileReader: ...
```

### Factory Pattern
`FileReaderFactory` creates the appropriate reader based on file extension:

```python
reader = FileReaderFactory.get_reader(file_path)
content = reader.read(file_path)
```

### Dependency Injection
The `QuizGenerator` accepts configuration through dependency injection:

```python
config = QuizConfig(...)
generator = QuizGenerator(config)
```

## Key Features

### 1. Type Safety with Pydantic
All data structures use Pydantic models with:
- Field validation
- Type hints
- Automatic serialization/deserialization

### 2. PydanticAI Integration
- Uses PydanticAI's Agent for structured AI interactions
- Azure OpenAI configuration via OpenAIModel
- Type-safe result handling

### 3. Robust Error Handling
- Custom validators in Pydantic models
- Comprehensive error messages
- Proper exception propagation

### 4. Extensibility
Easy to extend:
- Add new file formats by implementing `FileReader` protocol
- Add new export formats by adding methods to `QuizGenerator`
- Customize prompts via `QuizConfig`

## Testing Strategy

### Test Structure
Tests mirror the source structure:
```
tests/
├── test_models.py        # Model validation tests
└── test_file_reader.py   # File reading tests
```

### Test Coverage
- **Model validation**: Tests for valid/invalid inputs
- **File reading**: Tests for different file formats and edge cases
- **Integration**: End-to-end file reading tests

### Running Tests
```bash
uv run pytest          # Run all tests
uv run pytest -v       # Verbose output
uv run pytest -k test_name  # Run specific test
```

## Configuration Management

### Environment Variables
Sensitive data is stored in environment variables:
```bash
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

### QuizConfig
All generation parameters are centralized:
- `num_questions`: 1-50
- `difficulty`: EASY, MEDIUM, HARD
- `include_explanations`: bool
- `topic_focus`: optional string
- Azure credentials and settings

## API Design

### Async/Await
All AI interactions use async/await for:
- Non-blocking I/O
- Efficient API calls
- Scalability

### Method Signatures
```python
async def generate_from_file(file_path: str | Path) -> QuizResult
async def generate_from_text(text: str) -> QuizResult
def export_to_json(result: QuizResult, output_path: str | Path) -> None
def format_quiz_text(result: QuizResult) -> str
```

## Prompt Engineering

The system prompt is dynamically built based on configuration:

```python
def _build_system_prompt(self) -> str:
    # Includes:
    # - Number of questions
    # - Difficulty level
    # - Explanation requirements
    # - Topic focus (if specified)
    # - Format requirements
```

This ensures consistent, high-quality question generation.

## Error Handling

### Input Validation
- File existence checks
- Content length validation (minimum 100 characters)
- File type validation
- Configuration parameter validation

### Azure OpenAI Errors
- Connection errors
- Authentication errors
- API rate limiting (handled by PydanticAI)

### User Feedback
Clear error messages guide users to solutions:
```
Error: File content is too short to generate questions.
Minimum 100 characters required, got 45
```

## Code Quality

### PEP 8 Compliance
- 88 character line length (Black style)
- Type hints throughout
- Docstrings for all public APIs

### Type Hints
```python
def generate_from_file(self, file_path: str | Path) -> QuizResult:
    """Generate questions from a file."""
```

### Documentation
- Module-level docstrings
- Class docstrings with usage examples
- Method docstrings with Args, Returns, Raises sections

## Dependencies

### Core Dependencies
- `pydantic-ai>=1.1.0`: AI agent framework
- `pydantic>=2.0.0`: Data validation
- `python-dotenv>=1.0.0`: Environment management
- `pypdf>=5.1.0`: PDF reading
- `python-docx>=1.1.0`: DOCX reading

### Dev Dependencies
- `pytest>=8.4.2`: Testing framework
- `ruff>=0.14.0`: Linting and formatting

## Usage Examples

### CLI Usage
```bash
uv run python -m quizling document.pdf -n 10 -d hard
```

### Python API
```python
config = QuizConfig(
    num_questions=5,
    difficulty=DifficultyLevel.MEDIUM,
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
)

generator = QuizGenerator(config)
result = await generator.generate_from_file("document.pdf")
```

### Batch Processing
```python
for file in files:
    result = await generator.generate_from_file(file)
    generator.export_to_json(result, f"{file.stem}_quiz.json")
```

## Future Enhancements

Potential areas for expansion:
1. Additional file formats (HTML, EPUB, etc.)
2. Question types (true/false, fill-in-blank, etc.)
3. Difficulty scoring algorithms
4. Question bank management
5. Web interface
6. Streaming responses for large documents
7. Caching for repeated content

## Performance Considerations

- **File Reading**: Efficient readers with minimal memory usage
- **API Calls**: Async operations prevent blocking
- **Validation**: Pydantic's Rust-based validation for speed
- **Caching**: PydanticAI handles response caching

## Security

- API keys stored in environment variables
- No credentials in code or version control
- Input sanitization via Pydantic validation
- File path validation to prevent directory traversal

## Maintainability

- Clean separation of concerns
- Comprehensive test coverage
- Clear documentation
- Type hints throughout
- Consistent code style (Ruff)
- Modular design for easy updates

## Conclusion

Quizling provides a robust, production-ready solution for generating multiple choice questions using Azure OpenAI. The implementation follows Python best practices, uses modern tooling (uv, Pydantic, PydanticAI), and provides both CLI and programmatic interfaces for maximum flexibility.
