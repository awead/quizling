from pathlib import Path
from typing import ClassVar, Protocol

from docx import Document
from pypdf import PdfReader


class FileReader(Protocol):
    """Protocol for file readers."""

    def read(self, file_path: Path) -> str:
        """Read content from a file."""
        ...


class TextFileReader:
    def read(self, file_path: Path) -> str:
        """Read content from a text file.

        Args:
            file_path: Path to the text file

        Returns:
            The file content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            IOError: If there is an error reading the file

        """
        try:
            return file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return file_path.read_text(encoding="latin-1")


class PDFFileReader:
    def read(self, file_path: Path) -> str:
        """Read content from a PDF file.

        Args:
            file_path: Path to the PDF file

        Returns:
            The extracted text content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            IOError: If there is an error reading the file

        """
        reader = PdfReader(file_path)
        page_texts = (page.extract_text() for page in reader.pages)
        return "\n\n".join(text for text in page_texts if text)


class DOCXFileReader:
    def read(self, file_path: Path) -> str:
        """Read content from a DOCX file.

        Args:
            file_path: Path to the DOCX file

        Returns:
            The extracted text content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            IOError: If there is an error reading the file

        """
        doc = Document(file_path)
        return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


class FileReaderFactory:
    """Factory for creating appropriate file readers based on file extension."""

    READERS: ClassVar[dict[str, type[FileReader]]] = {
        ".txt": TextFileReader,
        ".md": TextFileReader,
        ".pdf": PDFFileReader,
        ".docx": DOCXFileReader,
    }

    @classmethod
    def get_reader(cls, file_path: Path) -> FileReader:
        """Get the appropriate file reader for the given file.

        Args:
            file_path: Path to the file

        Returns:
            An instance of the appropriate FileReader

        Raises:
            ValueError: If the file extension is not supported

        """
        extension = file_path.suffix.lower()

        reader_class = cls.READERS.get(extension)
        if reader_class is None:
            supported = ", ".join(cls.READERS.keys())
            msg = f"Unsupported file type: {extension}. Supported types: {supported}"
            raise ValueError(msg)

        return reader_class()

    @classmethod
    def read_file(cls, file_path: str | Path) -> str:
        """Read content from a file, automatically detecting the file type.

        Args:
            file_path: Path to the file (string or Path object)

        Returns:
            The file content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            ValueError: If the file type is not supported
            IOError: If there is an error reading the file

        """
        path = Path(file_path)

        if not path.exists():
            msg = f"File not found: {path}"
            raise FileNotFoundError(msg)

        if not path.is_file():
            msg = f"Path is not a file: {path}"
            raise ValueError(msg)

        reader = cls.get_reader(path)
        return reader.read(path)
