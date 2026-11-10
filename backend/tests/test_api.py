"""API-level tests for the FastAPI app (services mocked out)."""
import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client():
    return TestClient(main.app)


@pytest.fixture
def mock_search(monkeypatch):
    async def fake_search(origin, destination, date_from, date_to=None, passengers=1):
        return [{"id": "STN_0", "price": 42, "route": [], "is_hacked_route": False}]

    monkeypatch.setattr(main, "search_flights", fake_search)
    # Avoid touching Supabase during tests
    monkeypatch.setattr(main, "save_search", lambda *a, **k: None)


class TestSearchEndpoint:
    def test_specific_destination(self, client, mock_search):
        res = client.get("/api/search", params={"origin": "BGY", "destination": "STN", "date_from": "25/12/2026"})
        assert res.status_code == 200
        body = res.json()
        assert body["is_anywhere"] is False
        assert body["results"][0]["price"] == 42
        assert body["vpn_recommendation"] is not None  # VPN advice shown for specific routes

    def test_anywhere_mode(self, client, mock_search):
        res = client.get("/api/search", params={"origin": "BGY", "destination": "ANY", "date_from": "25/12/2026"})
        body = res.json()
        assert body["is_anywhere"] is True
        assert body["vpn_recommendation"] is None  # no VPN advice in anywhere mode

    def test_missing_destination_defaults_to_anywhere(self, client, mock_search):
        res = client.get("/api/search", params={"origin": "BGY", "date_from": "25/12/2026"})
        assert res.json()["is_anywhere"] is True

    def test_missing_required_param_returns_422(self, client, mock_search):
        res = client.get("/api/search", params={"destination": "STN"})
        assert res.status_code == 422

    def test_service_error_returns_500(self, client, monkeypatch):
        async def boom(*a, **k):
            raise RuntimeError("SerpApi down")

        monkeypatch.setattr(main, "search_flights", boom)
        monkeypatch.setattr(main, "save_search", lambda *a, **k: None)
        res = client.get("/api/search", params={"origin": "BGY", "destination": "STN", "date_from": "25/12/2026"})
        assert res.status_code == 500


class TestSavedFlightsEndpoints:
    def test_get_saved_flights(self, client, monkeypatch):
        monkeypatch.setattr(main, "get_saved_flights", lambda uid: [{"flight_id": "x"}])
        res = client.get("/api/saved-flights", params={"user_id": "u1"})
        assert res.status_code == 200
        assert res.json()["flights"] == [{"flight_id": "x"}]

    def test_save_flight(self, client, monkeypatch):
        monkeypatch.setattr(main, "add_saved_flight", lambda data: data)
        payload = {"user_id": "u1", "flight_id": "STN_0", "price": 42.0}
        res = client.post("/api/saved-flights", json=payload)
        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_remove_flight(self, client, monkeypatch):
        monkeypatch.setattr(main, "remove_saved_flight", lambda uid, fid: None)
        res = client.delete("/api/saved-flights/STN_0", params={"user_id": "u1"})
        assert res.status_code == 200
        assert res.json()["success"] is True
