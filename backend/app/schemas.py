from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import ApplicationStatus


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=120)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    created_at: datetime


class CVExtractionRequest(BaseModel):
    user_id: int
    texto_cv: str = Field(min_length=10, max_length=5000)


class ProfileUpdate(BaseModel):
    summary: str = Field(default="", max_length=1200)
    skills: list[str] = Field(default_factory=list)
    experience_years: int = Field(default=0, ge=0, le=50)
    education: str = Field(default="", max_length=250)


class ProfileRead(BaseModel):
    user_id: int
    summary: str
    skills: list[str]
    experience_years: int
    education: str
    updated_at: datetime


class JobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company: str
    description: str
    location: str
    required_skills_csv: str


class RecommendationRead(BaseModel):
    job: JobRead
    score: int
    reason: str


class ApplyRequest(BaseModel):
    user_id: int
    job_id: int


class AssistedApplyRequest(BaseModel):
    user_id: int
    limit: int = Field(default=3, ge=1, le=10)


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    job_id: int
    status: ApplicationStatus
    source: str
    created_at: datetime
    updated_at: datetime


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class AutomationConfigUpdate(BaseModel):
    enabled: bool = False
    min_postulations: int = Field(default=1, ge=1, le=20)
    max_postulations: int = Field(default=3, ge=1, le=20)
    frequency: str = Field(default="daily", max_length=30)
    keyword: str = Field(default="", max_length=100)
    location_filter: str = Field(default="", max_length=100)


class AutomationConfigRead(BaseModel):
    user_id: int
    enabled: bool
    min_postulations: int
    max_postulations: int
    frequency: str
    keyword: str
    location_filter: str
    updated_at: datetime


class HomeSummaryRead(BaseModel):
    total_postulaciones: int
    progreso_porcentaje: int
    por_estado: dict[str, int]
    recomendaciones_destacadas: list[RecommendationRead]
