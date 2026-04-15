from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db import get_session
from app.models import Application, ApplicationStatus
from app.routes.jobs import get_recommendations_for_user
from app.schemas import HomeSummaryRead, JobRead, RecommendationRead

router = APIRouter(prefix="/api/home", tags=["home"])


@router.get("/{user_id}", response_model=HomeSummaryRead)
def get_home_summary(user_id: int, session: Session = Depends(get_session)) -> HomeSummaryRead:
    applications = session.exec(select(Application).where(Application.user_id == user_id)).all()
    total = len(applications)
    done_statuses = {ApplicationStatus.EN_REVISION, ApplicationStatus.ENTREVISTA}
    progress = 0
    if total > 0:
        progress = int((sum(1 for app in applications if app.status in done_statuses) / total) * 100)

    by_status = {
        ApplicationStatus.POSTULADO.value: 0,
        ApplicationStatus.EN_REVISION.value: 0,
        ApplicationStatus.ENTREVISTA.value: 0,
        ApplicationStatus.RECHAZADO.value: 0,
    }
    for app in applications:
        by_status[app.status.value] += 1

    recommendations = get_recommendations_for_user(session, user_id, limit=3)
    rec_output = [
        RecommendationRead(
            job=JobRead.model_validate(item["job"]),
            score=item["score"],
            reason=item["reason"],
        )
        for item in recommendations
    ]
    return HomeSummaryRead(
        total_postulaciones=total,
        progreso_porcentaje=progress,
        por_estado=by_status,
        recomendaciones_destacadas=rec_output,
    )
