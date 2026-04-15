from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import Application, AutomationConfig, Job, User
from app.routes.jobs import get_recommendations_for_user
from app.schemas import (
    ApplicationRead,
    ApplicationStatusUpdate,
    ApplyRequest,
    AssistedApplyRequest,
    AutomationConfigRead,
    AutomationConfigUpdate,
)
from app.security import sanitize_text
from app.services.automation import run_automatic_postulations

router = APIRouter(prefix="/api/applications", tags=["applications"])


def to_config_read(config: AutomationConfig) -> AutomationConfigRead:
    return AutomationConfigRead(
        user_id=config.user_id,
        enabled=config.enabled,
        min_postulations=config.min_postulations,
        max_postulations=config.max_postulations,
        frequency=config.frequency,
        keyword=config.keyword,
        location_filter=config.location_filter,
        updated_at=config.updated_at,
    )


@router.post("/manual", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_manual_application(payload: ApplyRequest, session: Session = Depends(get_session)) -> Application:
    user = session.get(User, payload.user_id)
    job = session.get(Job, payload.job_id)
    if not user or not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario o vacante no encontrado.")

    exists = session.exec(
        select(Application).where(Application.user_id == payload.user_id, Application.job_id == payload.job_id)
    ).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe una postulación para esta vacante.")

    application = Application(
        user_id=payload.user_id,
        job_id=payload.job_id,
        source="manual",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


@router.post("/assisted", response_model=list[ApplicationRead])
def create_assisted_applications(payload: AssistedApplyRequest, session: Session = Depends(get_session)) -> list[Application]:
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    recommendations = get_recommendations_for_user(session, payload.user_id, limit=payload.limit * 3)
    created: list[Application] = []
    for item in recommendations:
        job: Job = item["job"]
        exists = session.exec(
            select(Application).where(Application.user_id == payload.user_id, Application.job_id == job.id)
        ).first()
        if exists:
            continue
        application = Application(
            user_id=payload.user_id,
            job_id=job.id,
            source="asistida",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(application)
        created.append(application)
        if len(created) >= payload.limit:
            break

    session.commit()
    for application in created:
        session.refresh(application)
    return created


@router.get("/{user_id}", response_model=list[ApplicationRead])
def list_applications(user_id: int, session: Session = Depends(get_session)) -> list[Application]:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return session.exec(select(Application).where(Application.user_id == user_id)).all()


@router.patch("/{application_id}/status", response_model=ApplicationRead)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    session: Session = Depends(get_session),
) -> Application:
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")
    application.status = payload.status
    application.updated_at = datetime.utcnow()
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


@router.get("/automation/{user_id}", response_model=AutomationConfigRead)
def get_automation_config(user_id: int, session: Session = Depends(get_session)) -> AutomationConfigRead:
    config = session.get(AutomationConfig, user_id)
    if config is None:
        config = AutomationConfig(user_id=user_id)
        session.add(config)
        session.commit()
        session.refresh(config)
    return to_config_read(config)


@router.put("/automation/{user_id}", response_model=AutomationConfigRead)
def update_automation_config(
    user_id: int,
    payload: AutomationConfigUpdate,
    session: Session = Depends(get_session),
) -> AutomationConfigRead:
    if payload.min_postulations > payload.max_postulations:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="min_postulations no puede ser mayor que max_postulations.",
        )

    config = session.get(AutomationConfig, user_id)
    if config is None:
        config = AutomationConfig(user_id=user_id)
    config.enabled = payload.enabled
    config.min_postulations = payload.min_postulations
    config.max_postulations = payload.max_postulations
    config.frequency = sanitize_text(payload.frequency, max_length=30).lower()
    config.keyword = sanitize_text(payload.keyword, max_length=100).lower()
    config.location_filter = sanitize_text(payload.location_filter, max_length=100).lower()
    config.updated_at = datetime.utcnow()
    session.add(config)
    session.commit()
    session.refresh(config)
    return to_config_read(config)


@router.post("/automation/{user_id}/run", response_model=list[ApplicationRead])
def run_automation(user_id: int, session: Session = Depends(get_session)) -> list[Application]:
    config = session.get(AutomationConfig, user_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Configura la automatización primero.")
    return run_automatic_postulations(session, user_id, config)
