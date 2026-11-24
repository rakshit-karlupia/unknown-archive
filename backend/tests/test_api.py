from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["backendOnline"] is True
    assert body["indexedMysteries"] >= 15
    assert body["indexedSources"] >= 25


def test_list_mysteries_and_filters():
    res = client.get("/api/mysteries")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 15

    featured = client.get("/api/mysteries?featured=true").json()
    assert featured["total"] == 6

    verified = client.get("/api/mysteries?status=VERIFIED").json()
    assert verified["total"] >= 4
    assert all(m["evidenceStatus"] == "VERIFIED" for m in verified["items"])


def test_single_mystery_and_404():
    res = client.get("/api/mysteries/dyatlov-pass")
    assert res.status_code == 200
    assert res.json()["title"] == "The Dyatlov Pass Incident"

    missing = client.get("/api/mysteries/non-existent-mystery")
    assert missing.status_code == 404


def test_geojson_map_markers():
    res = client.get("/api/map/markers")
    assert res.status_code == 200
    geo = res.json()
    assert geo["type"] == "FeatureCollection"
    assert len(geo["features"]) >= 15
    sample = geo["features"][0]
    assert sample["geometry"]["type"] == "Point"
    assert len(sample["geometry"]["coordinates"]) == 2


def test_sources_and_assistant():
    src_res = client.get("/api/sources?record_tier=Primary%20Record")
    assert src_res.status_code == 200
    assert src_res.json()["total"] >= 5

    ai_res = client.post(
        "/api/assistant/query",
        json={
            "question": "Where can I find original documents?",
            "mystery_slug": "wow-signal",
        },
    )
    assert ai_res.status_code == 200
    body = ai_res.json()
    assert len(body["citations"]) >= 1
    assert "Big Ear" in body["answer"]

    miss_res = client.post(
        "/api/assistant/query",
        json={"question": "completely unrelated unknown gibberish xyz123"},
    )
    assert miss_res.status_code == 200
    assert miss_res.json()["citations"] == []
    assert miss_res.json()["missingEvidenceNotice"]
