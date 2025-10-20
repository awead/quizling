# TODO

## Refactoring

Generated with Claude [Python refactoring agent](https://github.com/awead/claude/blob/main/agents/python/refactoring.md)

### Base Application Module

#### HIGH PRIORITY (4 issues):

✅ Code duplication - Validation labels {"A", "B", "C", "D"} appear twice in models.py
✅ Code duplication - Content length validation duplicated in generator.py
✅ Missing type hint - _write_question parameter in quiz_writer.py lacks type annotation
❌ ~Unsafe environment variable access - QuizConfig fields use os.getenv() which can return None~
    - used os.environ instead which will raise KeyError on load

#### MEDIUM PRIORITY (6 issues):

  5. Generic exception wrapping loses error context
  6. Magic number 100 for minimum content length
  7. Inconsistent prompt building patterns
  8. Redundant None check in QuizWriter
  9. Import organization not following PEP 8
  10. Overly broad exception handling

#### LOW PRIORITY (5 issues):

  11. Inconsistent docstring coverage
  12. Repeated Literal["A", "B", "C", "D"] type
  13. Missing dictionary documentation
  14. Variable name reuse (file_path)
  15. Output directory path validation

#### ARCHITECTURAL RECOMMENDATIONS (2 items):

  16. Extract prompt building to separate class
  17. Use dependency injection for agent creation

### API

1. Service Layer Pattern (High Priority)

✅ Extract business logic from routes into a dedicated QuestionService class
✅ Introduce value objects like QuestionQueryParams and PaginationResult
✅ Benefits: Better separation of concerns, easier testing, reusable logic

2. Custom Exception Handling (High Priority)

- Create domain-specific exceptions (DatabaseError, ResourceNotFoundError, etc.)
- Add global error handlers for consistent error responses
- Benefits: Better error messages, improved debugging, cleaner code

3. Protocol-Based Dependency Injection (High Priority)

- Define QuestionRepository protocol to decouple from MongoDB
- Use proper DI patterns with get_repository() dependency
- Benefits: Easier testing with mocks, swappable implementations

4. Performance Optimizations (High Priority)

- Combine search + difficulty filtering at database level instead of in Python
- Add connection pooling configuration for MongoDB
- Benefits: Significant performance improvement for filtered queries

5. Code Quality Improvements (Medium Priority)

- Eliminate duplicate document-to-model conversion code
- Add proper type hints and validation
- Add request logging and CORS support
- Benefits: Better maintainability, production-readiness

6. Testing Enhancements (Medium Priority)

- Move fixtures to conftest.py for reusability
- Add integration tests with real database
- Benefits: Better test organization, more comprehensive coverage

