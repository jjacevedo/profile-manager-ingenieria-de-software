from typing import Optional, Tuple

from app.models import Job, Profile


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
    "cocina",
    "gastronomia",
    "chef",
    "arquitectura",
    "autocad",
    "revit",
    "obra",
    "ventas",
    "atencion al cliente",
    "excel",
    "contabilidad",
]

PROFILE_TAG_KEYWORDS = {
    "chef": ["chef", "cocina", "gastronomia", "restaurante", "cocinero"],
    "arquitecto": [
        "arquitecto",
        "arquitectura",
        "autocad",
        "revit",
        "obra",
        "planos",
    ],
    "ventas": ["ventas", "comercial", "retail", "atencion al cliente"],
    "administrativo": [
        "administrativo",
        "excel",
        "contabilidad",
        "inventario",
        "facturacion",
    ],
    "tecnologia": [
        "python",
        "react",
        "javascript",
        "sql",
        "backend",
        "frontend",
        "desarrollador",
    ],
}


def parse_skills_csv(skills_csv: str) -> list[str]:
    return [
        skill.strip().lower()
        for skill in skills_csv.split(",")
        if skill.strip()
    ]


def extract_skills_from_text(text: str) -> list[str]:
    lower_text = text.lower()
    detected = [skill for skill in KNOWN_SKILLS if skill in lower_text]
    return sorted(set(detected))


def build_match_reason(overlap: list[str], missing: list[str]) -> str:
    if overlap and missing:
        return (
            f"Coincide en {', '.join(overlap[:3])}. "
            f"Puedes reforzar: {', '.join(missing[:2])}."
        )
    if overlap:
        return f"Buena alineación en habilidades: {', '.join(overlap[:3])}."
    return "No hay coincidencias directas de habilidades; revisar manualmente."


def infer_profile_tags(profile: Optional[Profile]) -> list[str]:
    if not profile:
        return []
    text = f"{profile.summary} {profile.skills_csv} {profile.education}".lower()
    tags = []
    for tag, keywords in PROFILE_TAG_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            tags.append(tag)
    return tags


def compute_match(profile: Optional[Profile], job: Job) -> Tuple[int, str]:
    job_skills = parse_skills_csv(job.required_skills_csv)
    if not profile:
        return (
            10,
            "Perfil aún incompleto; completa información para mejorar "
            "recomendaciones.",
        )

    job_text = f"{job.title} {job.description} {job.required_skills_csv}".lower()
    profile_skills = parse_skills_csv(profile.skills_csv)
    profile_tags = infer_profile_tags(profile)
    overlap = [skill for skill in job_skills if skill in profile_skills]
    missing = [skill for skill in job_skills if skill not in profile_skills]
    score = min(100, int((len(overlap) / max(1, len(job_skills))) * 100))

    # Si hay coincidencia de perfil (chef, arquitecto, etc.), aumenta
    # el score para reflejar afinidad real.
    tag_hits = []
    for tag in profile_tags:
        if any(keyword in job_text for keyword in PROFILE_TAG_KEYWORDS[tag]):
            tag_hits.append(tag)
    if tag_hits:
        score = min(100, score + 30)

    reason = build_match_reason(overlap, missing)
    if tag_hits:
        reason = (
            f"Afinidad de perfil detectada ({', '.join(tag_hits)}). "
            f"{reason}"
        )
    return score, reason
