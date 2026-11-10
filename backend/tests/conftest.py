"""Shared fixtures and fakes for backend tests."""
import pytest

from services import serpapi_service


@pytest.fixture(autouse=True)
def clear_cache():
    """Every test starts with an empty response cache."""
    serpapi_service._cache.clear()
    yield
    serpapi_service._cache.clear()


class FakeResponse:
    def __init__(self, data, status=200):
        self.status_code = status
        self._data = data

    def json(self):
        return self._data


class FakeClient:
    """Minimal stand-in for httpx.AsyncClient (only .get is used)."""

    def __init__(self, data, status=200):
        self.data = data
        self.status = status
        self.calls = []

    async def get(self, url, params=None):
        self.calls.append({"url": url, "params": params})
        return FakeResponse(self.data, self.status)


def make_leg(airline, dep_id, arr_id, dep_time="2026-12-25 08:00", arr_time="2026-12-25 09:30"):
    return {
        "airline": airline,
        "flight_number": "XX123",
        "departure_airport": {"id": dep_id, "time": dep_time},
        "arrival_airport": {"id": arr_id, "time": arr_time},
        "duration": 90,
        "airplane": "A320",
        "travel_class": "Economy",
    }


def make_flight(price, legs, extensions=None, total_duration=180):
    flight = {
        "price": price,
        "total_duration": total_duration,
        "flights": legs,
        "carbon_emissions": {"this_flight": 100000},
    }
    if extensions is not None:
        flight["extensions"] = extensions
    return flight
