"""Seed PostgreSQL + PostGIS database from backend/app/data/archive_seed.json.

Usage:
    set DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/unknown_archive
    python -m app.db.seed
"""
from __future__ import annotations

import os
from datetime import date

from sqlalchemy import text

from app.data_loader import load_archive_data
from app.db.models import (
    CategoryORM,
    CompetingTheoryORM,
    MysteryORM,
    ResearchSourceORM,
    TimelineEventORM,
    create_session_factory,
)


def seed_database() -> None:
    factory = create_session_factory()
    if factory is None:
        raise RuntimeError(
            "DATABASE_URL is not set. Example: postgresql+psycopg://postgres:postgres@localhost:5432/unknown_archive"
        )

    archive = load_archive_data()
    with factory() as session:
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        with open(schema_path, "r", encoding="utf-8") as f:
            session.execute(text(f.read()))

        for idx, cat in enumerate(archive["categories"]):
            existing = session.query(CategoryORM).filter_by(slug=cat["slug"]).first()
            if not existing:
                session.add(
                    CategoryORM(
                        slug=cat["slug"],
                        name=cat["name"],
                        description=cat["description"],
                        disciplines=cat["disciplines"],
                        accent_color=cat["accentColor"],
                        sort_order=idx,
                    )
                )

        for src in archive["sources"]:
            if not session.get(ResearchSourceORM, src["id"]):
                session.add(
                    ResearchSourceORM(
                        id=src["id"],
                        title=src["title"],
                        author_or_org=src["authorOrOrg"],
                        publication_date=src["publicationDate"],
                        source_type=src["sourceType"],
                        record_tier=src["recordTier"],
                        url=src["url"],
                        access_info=src["accessInfo"],
                        summary=src["summary"],
                        institution_tag=src["institutionTag"],
                    )
                )

        for m in archive["mysteries"]:
            if session.query(MysteryORM).filter_by(slug=m["slug"]).first():
                continue
            orm_m = MysteryORM(
                slug=m["slug"],
                title=m["title"],
                subtitle=m["subtitle"],
                summary=m["summary"],
                category_slug=m["category"],
                secondary_categories=m.get("secondaryCategories", []),
                evidence_status=m["evidenceStatus"],
                evidence_rationale=m["evidenceRationale"],
                region=m["region"],
                location_name=m["locationName"],
                latitude=m["coordinates"]["lat"],
                longitude=m["coordinates"]["lng"],
                coordinate_precision=m["coordinates"]["precisionLabel"],
                reading_time_minutes=m["readingTimeMinutes"],
                popularity_score=m["popularityScore"],
                updated_at=date.fromisoformat(m["updatedAt"]),
                featured=m["featured"],
                hero_image=m["heroImage"],
                image_alt=m["imageAlt"],
                overview_what=m["overview"]["what"],
                overview_where=m["overview"]["where"],
                overview_when=m["overview"]["when"],
                overview_narrative=m["overview"]["narrative"],
                why_mysterious=m["whyMysterious"],
                what_we_know=m["whatWeKnow"],
                scientific_investigation=m["scientificInvestigation"]["narrative"],
                what_remains_unknown=m["whatRemainsUnknown"],
                final_assessment=m["finalAssessment"],
                visualization_config=m["scientificInvestigation"],
            )
            session.add(orm_m)
            session.flush()

            for ev in m["timeline"]:
                session.add(
                    TimelineEventORM(
                        mystery_id=orm_m.id,
                        year_label=ev["yearLabel"],
                        sort_year=ev["sortYear"],
                        title=ev["title"],
                        description=ev["description"],
                        significance=ev["significance"],
                        associated_record=ev.get("associatedRecord"),
                    )
                )

            for th in m["competingTheories"]:
                session.add(
                    CompetingTheoryORM(
                        mystery_id=orm_m.id,
                        name=th["name"],
                        claim=th["claim"],
                        supporting_evidence=th["supportingEvidence"],
                        contradicting_evidence=th["contradictingEvidence"],
                        scientific_limitations=th["scientificLimitations"],
                        scientific_acceptance=th["scientificAcceptance"],
                        source_reference_ids=th["sourceIds"],
                    )
                )

        session.commit()
    print(f"Seeded {len(archive['mysteries'])} mysteries and {len(archive['sources'])} sources.")


if __name__ == "__main__":
    seed_database()
