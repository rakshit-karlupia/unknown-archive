from __future__ import annotations

import os
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

try:
    from geoalchemy2 import Geography
except ImportError:  # pragma: no cover
    Geography = None


class Base(DeclarativeBase):
    pass


class CategoryORM(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(140), nullable=False)
    description = Column(Text, nullable=False)
    disciplines = Column(ARRAY(Text), nullable=False, default=list)
    accent_color = Column(String(16), nullable=False, default="#6C9EFF")
    sort_order = Column(Integer, nullable=False, default=0)


class MysteryORM(Base):
    __tablename__ = "mysteries"

    id = Column(Integer, primary_key=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(280), nullable=False)
    summary = Column(Text, nullable=False)
    category_slug = Column(String(80), ForeignKey("categories.slug"), nullable=False)
    secondary_categories = Column(ARRAY(Text), nullable=False, default=list)
    evidence_status = Column(String(32), nullable=False)
    evidence_rationale = Column(Text, nullable=False)
    region = Column(String(100), nullable=False)
    location_name = Column(String(180), nullable=False)
    latitude = Column(Integer, nullable=False)
    longitude = Column(Integer, nullable=False)
    if Geography is not None:
        geom = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    coordinate_precision = Column(String(120), nullable=False)
    reading_time_minutes = Column(Integer, nullable=False, default=8)
    popularity_score = Column(Integer, nullable=False, default=80)
    updated_at = Column(Date, nullable=False)
    featured = Column(Boolean, nullable=False, default=False)
    hero_image = Column(String(255), nullable=False)
    image_alt = Column(Text, nullable=False)
    overview_what = Column(Text, nullable=False)
    overview_where = Column(Text, nullable=False)
    overview_when = Column(Text, nullable=False)
    overview_narrative = Column(Text, nullable=False)
    why_mysterious = Column(ARRAY(Text), nullable=False, default=list)
    what_we_know = Column(ARRAY(Text), nullable=False, default=list)
    scientific_investigation = Column(Text, nullable=False)
    what_remains_unknown = Column(ARRAY(Text), nullable=False, default=list)
    final_assessment = Column(Text, nullable=False)
    visualization_config = Column(JSONB, nullable=False, default=dict)

    timeline_events = relationship(
        "TimelineEventORM", back_populates="mystery", cascade="all, delete-orphan"
    )
    theories = relationship(
        "CompetingTheoryORM", back_populates="mystery", cascade="all, delete-orphan"
    )


class TimelineEventORM(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True)
    mystery_id = Column(Integer, ForeignKey("mysteries.id", ondelete="CASCADE"), nullable=False)
    year_label = Column(String(40), nullable=False)
    sort_year = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    significance = Column(String(160), nullable=False)
    associated_record = Column(Text, nullable=True)

    mystery = relationship("MysteryORM", back_populates="timeline_events")


class CompetingTheoryORM(Base):
    __tablename__ = "competing_theories"

    id = Column(Integer, primary_key=True)
    mystery_id = Column(Integer, ForeignKey("mysteries.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(180), nullable=False)
    claim = Column(Text, nullable=False)
    supporting_evidence = Column(ARRAY(Text), nullable=False, default=list)
    contradicting_evidence = Column(ARRAY(Text), nullable=False, default=list)
    scientific_limitations = Column(Text, nullable=False)
    scientific_acceptance = Column(String(120), nullable=False)
    source_reference_ids = Column(ARRAY(String(80)), nullable=False, default=list)

    mystery = relationship("MysteryORM", back_populates="theories")


class ResearchSourceORM(Base):
    __tablename__ = "research_sources"

    id = Column(String(80), primary_key=True)
    title = Column(String(320), nullable=False)
    author_or_org = Column(String(220), nullable=False)
    publication_date = Column(String(40), nullable=False)
    source_type = Column(String(80), nullable=False)
    record_tier = Column(String(80), nullable=False)
    url = Column(Text, nullable=False)
    access_info = Column(String(160), nullable=False)
    summary = Column(Text, nullable=False)
    institution_tag = Column(String(80), nullable=False)


def get_database_url() -> Optional[str]:
    """Return configured PostgreSQL/PostGIS URL if provided."""
    return os.getenv("DATABASE_URL")


def create_session_factory():
    """Create a SQLAlchemy sessionmaker when DATABASE_URL is configured."""
    db_url = get_database_url()
    if not db_url:
        return None
    engine = create_engine(db_url, pool_pre_ping=True)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)
