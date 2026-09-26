import os
import pytest


from pydantic import ValidationError
from quizling.base.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)


def _options(correct_index: int | None = 0, count: int = 4) -> list[AnswerOption]:
    return [
        AnswerOption(text=f"Option {i}", is_correct=i == correct_index)
        for i in range(count)
    ]


class TestAnswerOption:
    def test_valid_answer_option(self) -> None:
        option = AnswerOption(text="Answer text", is_correct=True)
        assert option.text == "Answer text"
        assert option.is_correct is True

    def test_option_has_only_text_and_is_correct(self) -> None:
        option = AnswerOption(text="Answer text", is_correct=False)
        assert option.model_dump() == {"text": "Answer text", "is_correct": False}

    def test_is_correct_is_required(self) -> None:
        with pytest.raises(ValidationError):
            AnswerOption.model_validate({"label": "A", "text": "Answer text"})

    def test_empty_text(self) -> None:
        with pytest.raises(ValidationError):
            AnswerOption(text="", is_correct=False)


class TestMultipleChoiceQuestion:
    def test_valid_question(self) -> None:
        question = MultipleChoiceQuestion(
            question="What is 2+2?",
            options=_options(correct_index=2),
            explanation="2+2 equals 4",
            difficulty=DifficultyLevel.EASY,
        )

        assert question.question == "What is 2+2?"
        assert len(question.options) == 4
        assert [opt.is_correct for opt in question.options] == [
            False,
            False,
            True,
            False,
        ]
        assert question.explanation == "2+2 equals 4"
        assert question.difficulty == DifficultyLevel.EASY

    def test_serialized_question_has_no_labels_or_correct_answer(self) -> None:
        question = MultipleChoiceQuestion(question="Test?", options=_options())
        data = question.model_dump()

        assert "correct_answer" not in data
        for option in data["options"]:
            assert set(option) == {"text", "is_correct"}

    def test_options_keep_given_order(self) -> None:
        options = [
            AnswerOption(text="Delta", is_correct=False),
            AnswerOption(text="Bravo", is_correct=True),
            AnswerOption(text="Alpha", is_correct=False),
            AnswerOption(text="Charlie", is_correct=False),
        ]

        question = MultipleChoiceQuestion(question="Test?", options=options)

        assert [opt.text for opt in question.options] == [
            "Delta",
            "Bravo",
            "Alpha",
            "Charlie",
        ]

    @pytest.mark.parametrize("count", [3, 5])
    def test_rejects_option_count_other_than_four(self, count: int) -> None:
        with pytest.raises(ValidationError):
            MultipleChoiceQuestion(question="Test?", options=_options(count=count))

    def test_rejects_no_correct_option(self) -> None:
        with pytest.raises(ValidationError, match="exactly one correct option"):
            MultipleChoiceQuestion(
                question="Test?", options=_options(correct_index=None)
            )

    def test_rejects_multiple_correct_options(self) -> None:
        options = _options()
        options[1] = AnswerOption(text="Also right", is_correct=True)

        with pytest.raises(ValidationError, match="exactly one correct option"):
            MultipleChoiceQuestion(question="Test?", options=options)

    def test_rejects_old_shape_document(self) -> None:
        with pytest.raises(ValidationError):
            MultipleChoiceQuestion.model_validate(
                {
                    "question": "Test?",
                    "options": [
                        {"label": label, "text": f"Option {label}"} for label in "ABCD"
                    ],
                    "correct_answer": "A",
                }
            )


class TestQuizConfig:
    def test_valid_config(self) -> None:
        config = QuizConfig(
            num_questions=5,
            difficulty=DifficultyLevel.MEDIUM,
            include_explanations=True,
            output_directory="custom_output",
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
            azure_deployment_name="gpt-4o-mini",
        )

        assert config.num_questions == 5
        assert config.difficulty == DifficultyLevel.MEDIUM
        assert config.include_explanations is True
        assert config.output_directory == "custom_output"
        assert config.azure_endpoint == "https://example.openai.azure.com"

    def test_default_values(self) -> None:
        config = QuizConfig(
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
        )

        assert config.num_questions == 5
        assert config.difficulty == DifficultyLevel.MEDIUM
        assert config.include_explanations is True
        assert config.azure_deployment_name == os.environ["AZURE_OPENAI_DEPLOYMENT"]
        assert config.output_directory == "out"

    def test_num_questions_validation(self) -> None:
        with pytest.raises(ValidationError):
            QuizConfig(
                num_questions=0,
                azure_endpoint="https://example.openai.azure.com",
                azure_api_key="test-key",
            )

        with pytest.raises(ValidationError):
            QuizConfig(
                num_questions=51,
                azure_endpoint="https://example.openai.azure.com",
                azure_api_key="test-key",
            )


class TestQuizResult:
    def test_valid_quiz_result(self) -> None:
        config = QuizConfig(
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
        )

        questions = [
            MultipleChoiceQuestion(
                question="Test?",
                options=_options(),
            )
        ]

        result = QuizResult(
            questions=questions,
            source_file="/path/to/file.txt",
            config=config,
        )

        assert result.num_questions == 1
        assert result.source_file == "/path/to/file.txt"
        assert result.config == config
