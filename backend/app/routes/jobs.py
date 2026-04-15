from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import Job, Profile, User
from app.schemas import JobRead, RecommendationRead
from app.services.matching import compute_match

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


SAMPLE_JOBS = [
    Job(
        title="Desarrollador Full Stack Junior",
        company="TechNova",
        description="Construcción de APIs en FastAPI y frontend en React.",
        location="Medellin",
        required_skills_csv="python,react,sql,git",
    ),
    Job(
        title="Frontend Developer React",
        company="PixelWare",
        description="Implementación de interfaces limpias y consumo de APIs.",
        location="Remoto",
        required_skills_csv="react,javascript,typescript,git",
    ),
    Job(
        title="Backend Developer Python",
        company="DataBridge",
        description="Diseño de servicios backend y modelado de datos.",
        location="Bogota",
        required_skills_csv="python,fastapi,sql,docker",
    ),
    Job(
        title="Analista de Datos Junior",
        company="InsightCo",
        description="Análisis de datasets y automatización de reportes.",
        location="Medellin",
        required_skills_csv="python,sql,git",
    ),
    Job(
        title="Chef de cocina",
        company="Sabores Urbanos",
        description=(
            "Planeación de menú, preparación de platos "
            "y control de cocina."
        ),
        location="Medellin",
        required_skills_csv="chef,cocina,gastronomia,inventario",
    ),
    Job(
        title="Auxiliar de cocina",
        company="Cocina Viva",
        description=(
            "Apoyo en mise en place, alistamiento "
            "y buenas prácticas de manipulación."
        ),
        location="Bogota",
        required_skills_csv="cocina,gastronomia,higiene,atencion al cliente",
    ),
    Job(
        title="Arquitecto de diseño",
        company="Espacio y Forma",
        description="Diseño arquitectónico, modelado y coordinación con obra.",
        location="Medellin",
        required_skills_csv="arquitectura,autocad,revit,obra,planos",
    ),
    Job(
        title="Asistente de obra",
        company="Constructora Horizonte",
        description=(
            "Seguimiento de obra, reportes diarios "
            "y apoyo a coordinación técnica."
        ),
        location="Cali",
        required_skills_csv="obra,planos,autocad,excel",
    ),
    Job(
        title="Asesor comercial",
        company="Ventas Plus",
        description=(
            "Atención al cliente y cierre de ventas "
            "en punto físico y digital."
        ),
        location="Remoto",
        required_skills_csv="ventas,atencion al cliente,excel,comunicacion",
    ),
    Job(
        title="Auxiliar administrativo",
        company="Gestión Central",
        description=(
            "Soporte administrativo, facturación, "
            "archivo y manejo de inventarios."
        ),
        location="Medellin",
        required_skills_csv="administrativo,excel,contabilidad,inventario",
    ),
]


def ensure_jobs_seeded(session: Session) -> None:
    existing = session.exec(select(Job)).all()
    existing_keys = {
        (job.title.strip().lower(), job.company.strip().lower())
        for job in existing
    }

    for job in SAMPLE_JOBS:
        key = (job.title.strip().lower(), job.company.strip().lower())
        if key not in existing_keys:
            session.add(job)
    session.commit()


def get_recommendations_for_user(
    session: Session, user_id: int, limit: int = 20
) -> list[dict]:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    profile = session.get(Profile, user_id)
    jobs = session.exec(select(Job)).all()
    ranked: list[dict] = []
    for job in jobs:
        score, reason = compute_match(profile, job)
        ranked.append({"job": job, "score": score, "reason": reason})
    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked[:limit]


@router.get("", response_model=list[JobRead])
def list_jobs(
    search: str = Query(default=""),
    location: str = Query(default=""),
    session: Session = Depends(get_session),
) -> list[Job]:
    ensure_jobs_seeded(session)
    query = select(Job)
    jobs = session.exec(query).all()
    search_lower = search.lower().strip()
    location_lower = location.lower().strip()
    filtered = []
    for job in jobs:
        if search_lower and search_lower not in (
            f"{job.title} {job.company} {job.description}"
        ).lower():
            continue
        if location_lower and location_lower not in job.location.lower():
            continue
        filtered.append(job)
    return filtered


@router.get(
    "/recommendations/{user_id}",
    response_model=list[RecommendationRead],
)
def get_recommendations(
    user_id: int, session: Session = Depends(get_session)
) -> list[RecommendationRead]:
    ensure_jobs_seeded(session)
    ranked = get_recommendations_for_user(session, user_id, limit=20)
    output: list[RecommendationRead] = []
    for item in ranked:
        output.append(
            RecommendationRead(
                job=JobRead.model_validate(item["job"]),
                score=item["score"],
                reason=item["reason"],
            )
        )
    return output


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, session: Session = Depends(get_session)) -> Job:
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacante no encontrada.",
        )
    return job
