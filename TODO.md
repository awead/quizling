# TODO

## Refactoring

### HIGH PRIORITY (4 issues):

✅ Code duplication - Validation labels {"A", "B", "C", "D"} appear twice in models.py
✅ Code duplication - Content length validation duplicated in generator.py
✅ Missing type hint - _write_question parameter in quiz_writer.py lacks type annotation
❌ ~Unsafe environment variable access - QuizConfig fields use os.getenv() which can return None~
    - used os.environ instead which will raise KeyError on load

### MEDIUM PRIORITY (6 issues):

  5. Generic exception wrapping loses error context
  6. Magic number 100 for minimum content length
  7. Inconsistent prompt building patterns
  8. Redundant None check in QuizWriter
  9. Import organization not following PEP 8
  10. Overly broad exception handling

### LOW PRIORITY (5 issues):

  11. Inconsistent docstring coverage
  12. Repeated Literal["A", "B", "C", "D"] type
  13. Missing dictionary documentation
  14. Variable name reuse (file_path)
  15. Output directory path validation

### ARCHITECTURAL RECOMMENDATIONS (2 items):

  16. Extract prompt building to separate class
  17. Use dependency injection for agent creation
