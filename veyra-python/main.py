
import os
import tempfile
from pathlib import Path
from io import BytesIO

import pymupdf
import pytesseract
from PIL import Image
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel


# Update this if Tesseract is installed in a different location.
TESSERACT_PATH = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)
if Path(TESSERACT_PATH).exists():
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


app = FastAPI(title="Veyra Python Processing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only; restrict for production.
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
MAX_PDF_PAGES = 20
MAX_TEXT_LENGTH = 100_000

# Loaded once when the service starts.
# First startup downloads the model; CPU inference uses int8.
whisper_model = None


def get_whisper_model():
    global whisper_model

    if whisper_model is None:
        whisper_model = WhisperModel(
            "base",
            device="cpu",
            compute_type="int8",
        )

    return whisper_model


async def read_upload(file: UploadFile) -> bytes:
    data = await file.read(MAX_FILE_SIZE + 1)

    if not data:
        raise HTTPException(400, "The uploaded file is empty.")

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(413, "File must be 20 MB or smaller.")

    return data


def extract_image_text(data: bytes) -> str:
    try:
        with Image.open(BytesIO(data)) as image:
            image = image.convert("RGB")
            text = pytesseract.image_to_string(
                image,
                timeout=30,
            )
            return text.strip()
    except pytesseract.TesseractNotFoundError:
        raise HTTPException(
            503,
            "Tesseract OCR is not installed or its path is incorrect.",
        )
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(400, "Could not read this image.")


def extract_pdf_text(data: bytes) -> str:
    output = []

    try:
        with pymupdf.open(stream=data, filetype="pdf") as document:
            if document.page_count > MAX_PDF_PAGES:
                raise HTTPException(
                    413,
                    f"PDFs are limited to {MAX_PDF_PAGES} pages.",
                )

            if document.is_encrypted:
                raise HTTPException(
                    400,
                    "Password-protected PDFs are not supported.",
                )

            for page_number, page in enumerate(document):
                text = page.get_text().strip()

                # Scanned pages often contain no selectable text.
                if not text:
                    try:
                        pixmap = page.get_pixmap(
                            matrix=pymupdf.Matrix(1.5, 1.5),
                            alpha=False,
                        )
                        image = Image.open(
                            BytesIO(pixmap.tobytes("png"))
                        ).convert("RGB")

                        text = pytesseract.image_to_string(
                            image,
                            timeout=30,
                        ).strip()
                    except pytesseract.TesseractNotFoundError:
                        raise HTTPException(
                            503,
                            "Install Tesseract to read scanned PDFs.",
                        )

                if text:
                    output.append(
                        f"Page {page_number + 1}\n{text}"
                    )

                if sum(map(len, output)) > MAX_TEXT_LENGTH:
                    break

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            400,
            "Could not read this PDF. It may be damaged or unsupported.",
        )

    return "\n\n".join(output)[:MAX_TEXT_LENGTH]


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Veyra Python Processing API",
    }


@app.post("/api/extract")
async def extract_text(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    data = await read_upload(file)

    if filename.endswith(".pdf"):
        text = extract_pdf_text(data)
        kind = "pdf"

    elif filename.endswith(
        (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff")
    ):
        text = extract_image_text(data)
        kind = "image"

    else:
        raise HTTPException(
            415,
            "Upload a PDF or supported image file.",
        )

    if not text:
        return {
            "filename": file.filename,
            "kind": kind,
            "text": "",
            "message": (
                "No readable text was found. Try a clearer image "
                "or a PDF with better scan quality."
            ),
        }

    return {
        "filename": file.filename,
        "kind": kind,
        "text": text,
    }


@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    allowed_extensions = (
        ".wav", ".mp3", ".m4a", ".aac", ".ogg", ".webm", ".mp4", ".flac"
    )

    if not filename.endswith(allowed_extensions):
        raise HTTPException(
            415,
            "Upload WAV, MP3, M4A, AAC, OGG, WebM, MP4, or FLAC audio.",
        )

    data = await read_upload(file)
    suffix = Path(filename).suffix or ".audio"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_file.write(data)
            temp_path = temp_file.name

        model = get_whisper_model()
        segments, info = model.transcribe(
            temp_path,
            beam_size=3,
            vad_filter=True,
        )

        text = " ".join(
            segment.text.strip() for segment in segments
        ).strip()

        return {
            "text": text,
            "language": info.language,
            "language_probability": round(
                info.language_probability, 3
            ),
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            500,
            "Could not transcribe this recording. Try another audio file.",
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
