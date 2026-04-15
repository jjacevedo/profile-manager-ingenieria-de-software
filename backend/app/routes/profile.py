import io
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlmodel import Session

from app.db import get_session
from app.models import Profile, User
from app.schemas import CVExtractionRequest, ProfileRead, ProfileUpdate
from app.security import sanitize_text
from app.services.cv_parser import parse_cv_text

router = APIRouter(prefix="/api/profile", tags=["profile"])


def to_profile_read(profile: Profile) -> ProfileRead:
    return ProfileRead(
        user_id=profile.user_id,
        summary=profile.summary,
        skills=[item for item in profile.skills_csv.split(",") if item],
        experience_years=profile.experience_years,
        education=profile.education,
        updated_at=profile.updated_at,
    )


def extract_text_from_upload(file: UploadFile, content: bytes) -> str:
    filename = (file.filename or "").lower()
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
        except ModuleNotFoundError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Falta dependencia para PDF: instala 'pypdf' en backend."
                ),
            ) from exc
        reader = PdfReader(io.BytesIO(content))
        return " ".join((page.extract_text() or "") for page in reader.pages)
    if filename.endswith(".docx"):
        try:
            from docx import Document
        except ModuleNotFoundError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Falta dependencia para DOCX: instala 'python-docx' "
                    "en backend."
                ),
            ) from exc
        doc = Document(io.BytesIO(content))
        return " ".join(paragraph.text for paragraph in doc.paragraphs)
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Formato no soportado. Usa PDF, DOCX o TXT.",
    )


@router.post("/extract", response_model=ProfileRead)
def extract_profile(
    payload: CVExtractionRequest,
    session: Session = Depends(get_session),
) -> ProfileRead:
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    sanitized_cv = sanitize_text(payload.texto_cv, max_length=5000)
    parsed = parse_cv_text(sanitized_cv)
    profile = session.get(Profile, payload.user_id)
    summary = sanitize_text(parsed["summary"], max_length=1200)
    if profile is None:
        profile = Profile(
            user_id=payload.user_id,
            summary=summary,
            skills_csv=",".join(parsed["skills"]),
            experience_years=parsed["experience_years"],
            education=sanitize_text(parsed["education"], max_length=250),
            updated_at=datetime.utcnow(),
        )
        session.add(profile)
    else:
        profile.summary = summary
        profile.skills_csv = ",".join(parsed["skills"])
        profile.experience_years = parsed["experience_years"]
        profile.education = sanitize_text(parsed["education"], max_length=250)
        profile.updated_at = datetime.utcnow()

    session.commit()
    session.refresh(profile)
    return to_profile_read(profile)


@router.post("/extract-file", response_model=ProfileRead)
async def extract_profile_file(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
) -> ProfileRead:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo está vacío.",
        )

    extracted_text = extract_text_from_upload(file, content)
    if len(extracted_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se encontró suficiente texto en el archivo.",
        )

    payload = CVExtractionRequest(user_id=user_id, texto_cv=extracted_text)
    return extract_profile(payload, session)


@router.get("/{user_id}", response_model=ProfileRead)
def get_profile(
    user_id: int,
    session: Session = Depends(get_session),
) -> ProfileRead:
    profile = session.get(Profile, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado.",
        )
    return to_profile_read(profile)


@router.put("/{user_id}", response_model=ProfileRead)
def update_profile(
    user_id: int,
    payload: ProfileUpdate,
    session: Session = Depends(get_session),
) -> ProfileRead:
    profile = session.get(Profile, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado.",
        )

    skills = [
        sanitize_text(skill, max_length=30).lower()
        for skill in payload.skills
        if skill.strip()
    ]
    profile.summary = sanitize_text(payload.summary, max_length=1200)
    profile.skills_csv = ",".join(sorted(set(skills)))
    profile.experience_years = payload.experience_years
    profile.education = sanitize_text(payload.education, max_length=250)
    profile.updated_at = datetime.utcnow()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return to_profile_read(profile)
