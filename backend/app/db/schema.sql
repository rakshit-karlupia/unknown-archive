-- THE UNKNOWN ARCHIVE
-- PostgreSQL + PostGIS Production Schema
-- Supports spatial mystery queries, chronological timelines, competing theories, and primary source indexing.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE evidence_status_enum AS ENUM (
    'VERIFIED',
    'UNRESOLVED',
    'DEBATED',
    'UNSUPPORTED'
);

CREATE TYPE source_type_enum AS ENUM (
    'Scientific Paper',
    'Government Report',
    'Historical Document',
    'Declassified Record',
    'Archaeological Publication',
    'Original Photograph',
    'Satellite Imagery',
    'Research Dataset'
);

CREATE TYPE record_tier_enum AS ENUM (
    'Primary Record',
    'Peer-Reviewed Study',
    'Institutional Report',
    'Secondary Commentary'
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(140) NOT NULL,
    description TEXT NOT NULL,
    disciplines TEXT[] NOT NULL DEFAULT '{}',
    accent_color VARCHAR(16) NOT NULL DEFAULT '#6C9EFF',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mysteries (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(280) NOT NULL,
    summary TEXT NOT NULL,
    category_slug VARCHAR(80) NOT NULL REFERENCES categories(slug) ON DELETE RESTRICT,
    secondary_categories TEXT[] NOT NULL DEFAULT '{}',
    evidence_status evidence_status_enum NOT NULL,
    evidence_rationale TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    location_name VARCHAR(180) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    coordinate_precision VARCHAR(120) NOT NULL,
    reading_time_minutes INT NOT NULL DEFAULT 8,
    popularity_score INT NOT NULL DEFAULT 80,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    hero_image VARCHAR(255) NOT NULL,
    image_alt TEXT NOT NULL,
    overview_what TEXT NOT NULL,
    overview_where TEXT NOT NULL,
    overview_when TEXT NOT NULL,
    overview_narrative TEXT NOT NULL,
    why_mysterious TEXT[] NOT NULL DEFAULT '{}',
    what_we_know TEXT[] NOT NULL DEFAULT '{}',
    scientific_investigation TEXT NOT NULL,
    what_remains_unknown TEXT[] NOT NULL DEFAULT '{}',
    final_assessment TEXT NOT NULL,
    visualization_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(location_name, ''))
    ) STORED
);

CREATE INDEX IF NOT EXISTS idx_mysteries_geom ON mysteries USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_mysteries_search ON mysteries USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_mysteries_category ON mysteries (category_slug);
CREATE INDEX IF NOT EXISTS idx_mysteries_status ON mysteries (evidence_status);

CREATE TABLE IF NOT EXISTS timeline_events (
    id SERIAL PRIMARY KEY,
    mystery_id INT NOT NULL REFERENCES mysteries(id) ON DELETE CASCADE,
    year_label VARCHAR(40) NOT NULL,
    sort_year INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    significance VARCHAR(160) NOT NULL,
    associated_record TEXT
);

CREATE INDEX IF NOT EXISTS idx_timeline_mystery ON timeline_events (mystery_id, sort_year);

CREATE TABLE IF NOT EXISTS competing_theories (
    id SERIAL PRIMARY KEY,
    mystery_id INT NOT NULL REFERENCES mysteries(id) ON DELETE CASCADE,
    name VARCHAR(180) NOT NULL,
    claim TEXT NOT NULL,
    supporting_evidence TEXT[] NOT NULL DEFAULT '{}',
    contradicting_evidence TEXT[] NOT NULL DEFAULT '{}',
    scientific_limitations TEXT NOT NULL,
    scientific_acceptance VARCHAR(120) NOT NULL,
    source_reference_ids VARCHAR(80)[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS research_sources (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(320) NOT NULL,
    author_or_org VARCHAR(220) NOT NULL,
    publication_date VARCHAR(40) NOT NULL,
    source_type source_type_enum NOT NULL,
    record_tier record_tier_enum NOT NULL,
    url TEXT NOT NULL,
    access_info VARCHAR(160) NOT NULL,
    summary TEXT NOT NULL,
    institution_tag VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS mystery_sources (
    mystery_id INT NOT NULL REFERENCES mysteries(id) ON DELETE CASCADE,
    source_id VARCHAR(80) NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
    is_original_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_note TEXT,
    PRIMARY KEY (mystery_id, source_id)
);

CREATE TABLE IF NOT EXISTS recent_discoveries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(240) NOT NULL,
    publication_date VARCHAR(40) NOT NULL,
    institution VARCHAR(160) NOT NULL,
    summary TEXT NOT NULL,
    related_mystery_slug VARCHAR(120) REFERENCES mysteries(slug) ON DELETE SET NULL,
    source_url TEXT NOT NULL
);
