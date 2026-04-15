from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class ApplicationStatus(str, Enum):
    POSTULADO = "Postulado"
    EN_REVISION = "En revisión"
    ENTREVISTA = "Entrevista"
    RECHAZADO = "Rechazado"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True, max_length=120)
    email: str = Field(index=True, unique=True, max_length=120)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Profile(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    summary: str = Field(default="", max_length=1200)
    skills_csv: str = Field(default="", max_length=700)
    experience_years: int = Field(default=0, ge=0, le=50)
    education: str = Field(default="", max_length=250)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=120)
    company: str = Field(max_length=120)
    description: str = Field(max_length=1400)
    location: str = Field(max_length=120)
    required_skills_csv: str = Field(max_length=400)


class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    job_id: int = Field(index=True, foreign_key="job.id")
    status: ApplicationStatus = Field(default=ApplicationStatus.POSTULADO)
    source: str = Field(default="manual", max_length=40)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AutomationConfig(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    enabled: bool = Field(default=False)
    min_postulations: int = Field(default=1, ge=1, le=20)
    max_postulations: int = Field(default=3, ge=1, le=20)
    frequency: str = Field(default="daily", max_length=30)
    keyword: str = Field(default="", max_length=100)
    location_filter: str = Field(default="", max_length=100)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
