from app.models import Job, Profile
from typing import Optional, Tuple


KNOWN_SKILLS = [
    "python",
    "react",
    "javascript",
    "typescript",
    "sql",
    "fastapi",
    "docker",
    "git",
    "java",
    "node",
]


def parse_skills_csv(skills_csv: str) -> list[str]:
    return [skill.strip().lower() for skill in skills_csv.split(",") if skill.strip()]


def extract_skills_from_text(text: str) -> list[str]:
    lower_text = text.lower()
    detected = [skill for skill in KNOWN_SKILLS if skill in lower_text]
    return sorted(set(detected))


def build_match_reason(overlap: list[str], missing: list[str]) -> str:
    if overlap and missing:
        return f"Coincide en {', '.join(overlap[:3])}. Puedes reforzar: {', '.join(missing[:2])}."
    if overlap:
        return f"Buena alineación en habilidades: {', '.join(overlap[:3])}."
    return "No hay coincidencias directas de habilidades; revisar manualmente."


def compute_match(profile: Optional[Profile], job: Job) -> Tuple[int, str]:
    job_skills = parse_skills_csv(job.required_skills_csv)
    if not profile:
        return 10, "Perfil aún incompleto; completa información para mejorar recomendaciones."

    profile_skills = parse_skills_csv(profile.skills_csv)
    overlap = [skill for skill in job_skills if skill in profile_skills]
    missing = [skill for skill in job_skills if skill not in profile_skills]
    score = min(100, int((len(overlap) / max(1, len(job_skills))) * 100))
    return score, build_match_reason(overlap, missing)
