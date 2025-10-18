from pathlib import Path
from typing import Protocol


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
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                return f.read()


class PDFFileReader:

    def read(self, file_path: Path) -> str:
        """Read content from a PDF file.

        Args:
            file_path: Path to the PDF file

        Returns:
            The extracted text content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            ImportError: If pypdf is not installed
            IOError: If there is an error reading the file
        """
        try:
            from pypdf import PdfReader
        except ImportError as e:
            raise ImportError(
                "pypdf is required to read PDF files. Install it with: pip install pypdf"
            ) from e

        reader = PdfReader(file_path)
        text_parts = []

        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)

        return "\n\n".join(text_parts)


class DOCXFileReader:

    def read(self, file_path: Path) -> str:
        """Read content from a DOCX file.

        Args:
            file_path: Path to the DOCX file

        Returns:
            The extracted text content as a string

        Raises:
            FileNotFoundError: If the file does not exist
            ImportError: If python-docx is not installed
            IOError: If there is an error reading the file
        """
        try:
            from docx import Document
        except ImportError as e:
            raise ImportError(
                "python-docx is required to read DOCX files. "
                "Install it with: pip install python-docx"
            ) from e

        doc = Document(file_path)
        text_parts = []

        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)

        return "\n\n".join(text_parts)


class FileReaderFactory:
    """Factory for creating appropriate file readers based on file extension."""

    READERS: dict[str, type[FileReader]] = {
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
            raise ValueError(
                f"Unsupported file type: {extension}. Supported types: {supported}"
            )

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
            raise FileNotFoundError(f"File not found: {path}")

        if not path.is_file():
            raise ValueError(f"Path is not a file: {path}")

        reader = cls.get_reader(path)
        return reader.read(path)
