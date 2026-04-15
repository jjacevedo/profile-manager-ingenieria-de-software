from datetime import datetime

from sqlmodel import Session, select

from app.models import Application, ApplicationStatus, AutomationConfig, Job
from app.routes.jobs import get_recommendations_for_user


def run_automatic_postulations(session: Session, user_id: int, config: AutomationConfig) -> list[Application]:
    if not config.enabled:
        return []

    if config.min_postulations > config.max_postulations:
        config.min_postulations = config.max_postulations

    recommendations = get_recommendations_for_user(session, user_id, limit=config.max_postulations * 2)
    selected = recommendations[: config.max_postulations]

    created: list[Application] = []
    for recommendation in selected:
        job: Job = recommendation["job"]
        exists = session.exec(
            select(Application).where(Application.user_id == user_id, Application.job_id == job.id)
        ).first()
        if exists:
            continue
        application = Application(
            user_id=user_id,
            job_id=job.id,
            status=ApplicationStatus.POSTULADO,
            source="automatico",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(application)
        created.append(application)
        if len(created) >= config.max_postulations:
            break

    session.commit()
    for app in created:
        session.refresh(app)
    return created
