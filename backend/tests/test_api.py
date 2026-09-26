from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert "llm_connected" in data


def test_analyze_endpoint_raw_text():
    payload = {
        "source_type": "raw_text",
        "raw_text": "How do I deploy FastAPI on Hetzner?\nIs Docker required for local development?\nGreat tutorial!",
        "max_comments": 50,
        "generate_ideas": True,
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "job_id" in data
    assert "timestamp" in data
    assert data["metadata"]["source_type"] == "raw_text"
    assert data["metadata"]["total_comments_scanned"] == 3
    assert data["metadata"]["questions_found"] == 2
    assert len(data["themes"]) > 0

    first_theme = data["themes"][0]
    assert "theme_id" in first_theme
    assert "name" in first_theme
    assert "summary" in first_theme
    assert "questions" in first_theme
    assert "generated_ideas" in first_theme


def test_analyze_endpoint_invalid_url():
    payload = {
        "source_type": "youtube",
        "url": "not_a_valid_url",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "INVALID_URL"
    assert "message" in data


def test_analyze_endpoint_missing_input():
    payload = {
        "source_type": "youtube",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "INVALID_URL"


def test_analyze_endpoint_fetch_all():
    lines = [f"Why does this happen in step {i}?" for i in range(1, 15)]
    payload = {
        "source_type": "raw_text",
        "raw_text": "\n".join(lines),
        "fetch_all": True,
        "max_comments": 5,
        "generate_ideas": False,
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["total_comments_scanned"] == 14
