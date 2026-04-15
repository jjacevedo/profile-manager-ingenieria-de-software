import re

from app.services.matching import extract_skills_from_text

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d{1,3}\s*)?(?:\d[\s-]?){7,15}")
YEARS_RE = re.compile(r"(\d{1,2})\s*(?:\+?\s*)?(?:años|anos)")

EDUCATION_HINTS = [
    "doctorado",
    "maestria",
    "especializacion",
    "posgrado",
    "pregrado",
    "profesional",
    "tecnico",
    "tecnologo",
    "bachiller",
]

PERSONAL_LABELS = ["nombre", "ciudad", "correo", "email", "telefono"]


def _normalize_text(text: str) -> str:
    cleaned = re.sub(r"[ \t]+", " ", text)
    cleaned = re.sub(r"\n{2,}", "\n", cleaned)
    return cleaned.strip()


def _extract_name(text: str) -> str:
    for line in text.splitlines():
        lower = line.lower().strip()
        if lower.startswith("nombre:"):
            return line.split(":", 1)[1].strip()
    return ""


def _extract_city(text: str) -> str:
    for line in text.splitlines():
        lower = line.lower().strip()
        if lower.startswith("ciudad:"):
            return line.split(":", 1)[1].strip()
    return ""


def _extract_education(text: str) -> str:
    lower = text.lower()
    for hint in EDUCATION_HINTS:
        if hint in lower:
            return hint.capitalize()
    return "No especificado"


def _extract_years_experience(text: str) -> int:
    values = [int(match.group(1)) for match in YEARS_RE.finditer(text.lower())]
    if not values:
        return 1
    return min(max(values), 50)


def _extract_personal_summary(text: str) -> str:
    name = _extract_name(text)
    city = _extract_city(text)
    email_match = EMAIL_RE.search(text)
    phone_match = PHONE_RE.search(text)
    parts = []
    if name:
        parts.append(f"Nombre: {name}")
    if city:
        parts.append(f"Ciudad: {city}")
    if email_match:
        parts.append(f"Correo: {email_match.group(0)}")
    if phone_match:
        parts.append(f"Teléfono: {phone_match.group(0)}")
    return " | ".join(parts)


def _extract_profile_description(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    profile_lines = []
    capture = False
    for line in lines:
        low = line.lower()
        if "perfil profesional" in low:
            capture = True
            continue
        if capture and any(label in low for label in PERSONAL_LABELS):
            continue
        if capture and len(profile_lines) < 4:
            profile_lines.append(line)
        if len(profile_lines) >= 4:
            break
    if profile_lines:
        return " ".join(profile_lines)
    return " ".join(lines[:4])


def parse_cv_text(text: str) -> dict:
    normalized = _normalize_text(text)
    personal = _extract_personal_summary(normalized)
    profile_desc = _extract_profile_description(normalized)
    summary_parts = [part for part in [personal, profile_desc] if part]
    summary = " | ".join(summary_parts)
    summary = summary[:1200] if summary else normalized[:1200]

    skills = extract_skills_from_text(normalized)
    years = _extract_years_experience(normalized)
    education = _extract_education(normalized)

    return {
        "summary": summary,
        "skills": skills,
        "experience_years": years,
        "education": education,
    }
