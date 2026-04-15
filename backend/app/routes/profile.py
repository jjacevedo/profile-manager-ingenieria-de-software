from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db import get_session
from app.models import Profile, User
from app.schemas import CVExtractionRequest, ProfileRead, ProfileUpdate
from app.security import sanitize_text
from app.services.matching import extract_skills_from_text

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


@router.post("/extract", response_model=ProfileRead)
def extract_profile(payload: CVExtractionRequest, session: Session = Depends(get_session)) -> ProfileRead:
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    sanitized_cv = sanitize_text(payload.texto_cv, max_length=5000)
    detected_skills = extract_skills_from_text(sanitized_cv)
    profile = session.get(Profile, payload.user_id)
    summary = sanitized_cv[:400]
    if profile is None:
        profile = Profile(
            user_id=payload.user_id,
            summary=summary,
            skills_csv=",".join(detected_skills),
            experience_years=1,
            education="No especificado",
            updated_at=datetime.utcnow(),
        )
        session.add(profile)
    else:
        profile.summary = summary
        profile.skills_csv = ",".join(detected_skills)
        profile.updated_at = datetime.utcnow()

    session.commit()
    session.refresh(profile)
    return to_profile_read(profile)


@router.get("/{user_id}", response_model=ProfileRead)
def get_profile(user_id: int, session: Session = Depends(get_session)) -> ProfileRead:
    profile = session.get(Profile, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado.")
    return to_profile_read(profile)


@router.put("/{user_id}", response_model=ProfileRead)
def update_profile(user_id: int, payload: ProfileUpdate, session: Session = Depends(get_session)) -> ProfileRead:
    profile = session.get(Profile, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado.")

    skills = [sanitize_text(skill, max_length=30).lower() for skill in payload.skills if skill.strip()]
    profile.summary = sanitize_text(payload.summary, max_length=1200)
    profile.skills_csv = ",".join(sorted(set(skills)))
    profile.experience_years = payload.experience_years
    profile.education = sanitize_text(payload.education, max_length=250)
    profile.updated_at = datetime.utcnow()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return to_profile_read(profile)
