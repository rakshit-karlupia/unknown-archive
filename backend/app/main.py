from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.data_loader import load_archive_data
from app.services.assistant import answer_research_query
from app.services.integrations import get_institutional_integrations

app = FastAPI(
    title="THE UNKNOWN ARCHIVE API",
    description="REST API for world mysteries, primary research records, PostGIS spatial markers, and citation-grounded assistant queries.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AssistantQueryRequest(BaseModel):
    question: str
    mystery_slug: Optional[str] = None


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    archive = load_archive_data()
    db_url = os.getenv("DATABASE_URL")
    return {
        "backendOnline": True,
        "databaseMode": "PostgreSQL + PostGIS" if db_url else "JSON Archive Store (PostgreSQL/PostGIS Ready)",
        "indexedMysteries": len(archive["mysteries"]),
        "indexedSources": len(archive["sources"]),
    }


@app.get("/api/mysteries")
def list_mysteries(
    q: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    region: Optional[str] = Query(default=None),
    sort: str = Query(default="popular"),
    featured: Optional[bool] = Query(default=None),
) -> Dict[str, Any]:
    archive = load_archive_data()
    items: List[Dict[str, Any]] = list(archive["mysteries"])

    if q:
        ql = q.strip().lower()
        items = [
            m
            for m in items
            if ql in m["title"].lower()
            or ql in m["summary"].lower()
            or ql in m["locationName"].lower()
            or ql in m["region"].lower()
        ]

    if category:
        items = [
            m
            for m in items
            if m["category"] == category or category in (m.get("secondaryCategories") or [])
        ]

    if status:
        items = [m for m in items if m["evidenceStatus"] == status.upper()]

    if region:
        items = [m for m in items if m["region"].lower() == region.lower()]

    if featured is not None:
        items = [m for m in items if bool(m.get("featured")) == featured]

    if sort == "recent":
        items.sort(key=lambda x: x.get("updatedAt", ""), reverse=True)
    else:
        items.sort(key=lambda x: x.get("popularityScore", 0), reverse=True)

    return {"total": len(items), "items": items}


@app.get("/api/mysteries/{slug}")
def get_mystery(slug: str) -> Dict[str, Any]:
    archive = load_archive_data()
    for m in archive["mysteries"]:
        if m["slug"] == slug:
            return m
    raise HTTPException(status_code=404, detail=f"Mystery '{slug}' not found")


@app.get("/api/categories")
def list_categories() -> Dict[str, Any]:
    archive = load_archive_data()
    return {"total": len(archive["categories"]), "items": archive["categories"]}


@app.get("/api/discoveries")
def list_discoveries() -> Dict[str, Any]:
    archive = load_archive_data()
    return {"total": len(archive["discoveries"]), "items": archive["discoveries"]}


@app.get("/api/sources")
def list_sources(
    q: Optional[str] = Query(default=None),
    source_type: Optional[str] = Query(default=None),
    record_tier: Optional[str] = Query(default=None),
    mystery_slug: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    archive = load_archive_data()
    items = list(archive["sources"])

    if q:
        ql = q.strip().lower()
        items = [
            s
            for s in items
            if ql in s["title"].lower()
            or ql in s["authorOrOrg"].lower()
            or ql in s["summary"].lower()
            or ql in s["institutionTag"].lower()
        ]
    if source_type:
        items = [s for s in items if s["sourceType"] == source_type]
    if record_tier:
        items = [s for s in items if s["recordTier"] == record_tier]
    if mystery_slug:
        items = [s for s in items if mystery_slug in s.get("relatedMysterySlugs", [])]

    return {"total": len(items), "items": items}


@app.get("/api/map/markers")
def get_geojson_markers(
    category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    """Return RFC 7946 GeoJSON FeatureCollection matching PostGIS geography coordinates."""
    archive = load_archive_data()
    features = []
    for m in archive["mysteries"]:
        if category and m["category"] != category and category not in (m.get("secondaryCategories") or []):
            continue
        if status and m["evidenceStatus"] != status.upper():
            continue
        coords = m["coordinates"]
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [coords["lng"], coords["lat"]],
                },
                "properties": {
                    "slug": m["slug"],
                    "title": m["title"],
                    "summary": m["summary"],
                    "category": m["category"],
                    "evidenceStatus": m["evidenceStatus"],
                    "region": m["region"],
                    "locationName": m["locationName"],
                    "precisionLabel": coords["precisionLabel"],
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


@app.post("/api/assistant/query")
def assistant_query(payload: AssistantQueryRequest) -> Dict[str, Any]:
    archive = load_archive_data()
    return answer_research_query(
        question=payload.question,
        mystery_slug=payload.mystery_slug,
        mysteries=archive["mysteries"],
        sources=archive["sources"],
    )


@app.get("/api/integrations")
def list_integrations() -> Dict[str, Any]:
    return {"items": get_institutional_integrations()}
