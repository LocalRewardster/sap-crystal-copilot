"""
Basic API tests for Crystal Copilot.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint returns basic info."""
    response = client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert "status" in data
    assert data["service"] == "SAP Crystal Copilot AI Report Editor"


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "crystal-copilot-api"


def test_reports_list_empty():
    """Test listing reports when none exist."""
    response = client.get("/api/v1/reports/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_upload_endpoint_no_file():
    """Test upload endpoint without a file."""
    response = client.post("/api/v1/upload/")
    assert response.status_code == 422  # Validation error


def test_upload_endpoint_invalid_file():
    """Test upload endpoint with invalid file type."""
    files = {"file": ("test.txt", b"test content", "text/plain")}
    response = client.post("/api/v1/upload/", files=files)
    assert response.status_code == 400
    
    data = response.json()
    assert "Unsupported file type" in data["detail"]


def test_nonexistent_report():
    """Test accessing a non-existent report."""
    response = client.get("/api/v1/reports/nonexistent-id")
    assert response.status_code == 404
    
    data = response.json()
    assert data["detail"] == "Report not found"


def test_query_nonexistent_report():
    """Test querying a non-existent report."""
    query_data = {"query": "What fields does this report have?"}
    response = client.post("/api/v1/query/nonexistent-id", json=query_data)
    assert response.status_code == 404


def test_metrics_endpoint():
    """Test that metrics endpoint is available."""
    response = client.get("/metrics")
    # Metrics endpoint should be available
    assert response.status_code == 200