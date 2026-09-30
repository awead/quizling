import pytest
import tempfile


from pathlib import Path
from quizling.base.file_reader import (
    DOCXFileReader,
    FileReaderFactory,
    PDFFileReader,
    TextFileReader,
)


class TestTextFileReader:
    def test_read_text_file(self) -> None:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("Test content")
            temp_path = Path(f.name)

        try:
            reader = TextFileReader()
            content = reader.read(temp_path)
            assert content == "Test content"
        finally:
            temp_path.unlink()

    def test_read_utf8_file(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", suffix=".txt", delete=False
        ) as f:
            f.write("Test with unicode: \u00e9\u00e8\u00e0")
            temp_path = Path(f.name)

        try:
            reader = TextFileReader()
            content = reader.read(temp_path)
            assert "unicode" in content
        finally:
            temp_path.unlink()

    def test_file_not_found(self) -> None:
        reader = TextFileReader()
        with pytest.raises(FileNotFoundError):
            reader.read(Path("/nonexistent/file.txt"))


class TestFileReaderFactory:
    def test_get_text_reader(self) -> None:
        reader = FileReaderFactory.get_reader(Path("file.txt"))
        assert isinstance(reader, TextFileReader)

    def test_get_markdown_reader(self) -> None:
        reader = FileReaderFactory.get_reader(Path("file.md"))
        assert isinstance(reader, TextFileReader)

    def test_get_pdf_reader(self) -> None:
        reader = FileReaderFactory.get_reader(Path("file.pdf"))
        assert isinstance(reader, PDFFileReader)

    def test_get_docx_reader(self) -> None:
        reader = FileReaderFactory.get_reader(Path("file.docx"))
        assert isinstance(reader, DOCXFileReader)

    def test_unsupported_format(self) -> None:
        with pytest.raises(ValueError, match="Unsupported file type"):
            FileReaderFactory.get_reader(Path("file.xyz"))

    def test_case_insensitive_extension(self) -> None:
        reader = FileReaderFactory.get_reader(Path("file.TXT"))
        assert isinstance(reader, TextFileReader)

    def test_read_file_integration(self) -> None:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("Integration test content")
            temp_path = Path(f.name)

        try:
            content = FileReaderFactory.read_file(temp_path)
            assert content == "Integration test content"
        finally:
            temp_path.unlink()

    def test_read_file_not_found(self) -> None:
        with pytest.raises(FileNotFoundError):
            FileReaderFactory.read_file("/nonexistent/file.txt")

    def test_read_file_is_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            with pytest.raises(ValueError, match="not a file"):
                FileReaderFactory.read_file(temp_dir)
