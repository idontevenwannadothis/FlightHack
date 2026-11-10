"""Tests for fetch_single_route: params, formatting, hacked-route detection, caching."""
import asyncio

from services.serpapi_service import fetch_single_route, search_anywhere
from tests.conftest import FakeClient, make_leg, make_flight


def run(coro):
    return asyncio.run(coro)


class TestParams:
    def test_passengers_sent_as_adults(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026", passengers=3))
        assert client.calls[0]["params"]["adults"] == 3

    def test_passengers_defaults_to_one(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        assert client.calls[0]["params"]["adults"] == 1

    def test_one_way_type(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        params = client.calls[0]["params"]
        assert params["type"] == "2"
        assert "return_date" not in params

    def test_round_trip_type_and_return_date(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026", "31/12/2026"))
        params = client.calls[0]["params"]
        assert params["type"] == "1"
        assert params["return_date"] == "2026-12-31"

    def test_date_format_converted(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        assert client.calls[0]["params"]["outbound_date"] == "2026-12-25"


class TestHackedRouteDetection:
    def test_multi_carrier_connection_is_hacked(self):
        flight = make_flight(42, [make_leg("Ryanair", "BGY", "STN"), make_leg("Wizz Air", "STN", "OTP")])
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "OTP", "25/12/2026"))
        assert results[0]["is_hacked_route"] is True

    def test_single_carrier_connection_is_not_hacked(self):
        flight = make_flight(42, [make_leg("Lufthansa", "BGY", "FRA"), make_leg("Lufthansa", "FRA", "JFK")])
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "JFK", "25/12/2026"))
        assert results[0]["is_hacked_route"] is False

    def test_direct_flight_is_not_hacked(self):
        flight = make_flight(42, [make_leg("Ryanair", "BGY", "STN")])
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "STN", "25/12/2026"))
        assert results[0]["is_hacked_route"] is False

    def test_google_self_transfer_flag_is_hacked(self):
        flight = make_flight(
            42,
            [make_leg("Ryanair", "BGY", "STN"), make_leg("Ryanair", "STN", "OTP")],
            extensions=["Separate tickets booked together", "Self transfer"],
        )
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "OTP", "25/12/2026"))
        assert results[0]["is_hacked_route"] is True


class TestFormatting:
    def test_flights_without_price_skipped(self):
        payload = {"best_flights": [{"flights": [make_leg("Ryanair", "BGY", "STN")]}]}
        results = run(fetch_single_route(FakeClient(payload), "BGY", "STN", "25/12/2026"))
        assert results == []

    def test_best_and_other_flights_combined(self):
        payload = {
            "best_flights": [make_flight(50, [make_leg("Ryanair", "BGY", "STN")])],
            "other_flights": [make_flight(60, [make_leg("Wizz Air", "BGY", "STN")])],
        }
        results = run(fetch_single_route(FakeClient(payload), "BGY", "STN", "25/12/2026"))
        assert len(results) == 2
        assert {r["price"] for r in results} == {50, 60}

    def test_route_leg_fields_mapped(self):
        flight = make_flight(42, [make_leg("Ryanair", "BGY", "STN")])
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "STN", "25/12/2026"))
        leg = results[0]["route"][0]
        assert leg["flyFrom"] == "BGY"
        assert leg["flyTo"] == "STN"
        assert leg["airline"] == "Ryanair"

    def test_deep_link_contains_route(self):
        flight = make_flight(42, [make_leg("Ryanair", "BGY", "STN")])
        results = run(fetch_single_route(FakeClient({"best_flights": [flight]}), "BGY", "STN", "25/12/2026"))
        assert results[0]["deep_link"].startswith("https://www.google.com/travel/flights?q=")


class TestCaching:
    def test_second_identical_call_served_from_cache(self):
        flight = make_flight(42, [make_leg("Ryanair", "BGY", "STN")])
        client = FakeClient({"best_flights": [flight]})
        first = run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        second = run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        assert first == second
        assert len(client.calls) == 1  # only one HTTP request was made

    def test_different_passengers_not_cached_together(self):
        client = FakeClient({"best_flights": []})
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026", passengers=1))
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026", passengers=2))
        assert len(client.calls) == 2

    def test_error_response_not_cached(self):
        client = FakeClient({}, status=500)
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        run(fetch_single_route(client, "BGY", "STN", "25/12/2026"))
        assert len(client.calls) == 2  # errors are retried, never cached


class TestSearchAnywhere:
    def test_results_sorted_and_capped(self, monkeypatch):
        async def fake_fetch(client, origin, dest, date_from, date_to=None, passengers=1):
            # Each destination returns one flight priced by destination index
            return [{"id": dest, "price": abs(hash(dest)) % 500 + 1, "route": []}]

        monkeypatch.setattr("services.serpapi_service.fetch_single_route", fake_fetch)
        results = run(search_anywhere("BGY", "25/12/2026"))
        prices = [r["price"] for r in results]
        assert prices == sorted(prices)
        assert len(results) <= 30

    def test_origin_excluded_from_destinations(self, monkeypatch):
        seen = []

        async def fake_fetch(client, origin, dest, date_from, date_to=None, passengers=1):
            seen.append(dest)
            return []

        monkeypatch.setattr("services.serpapi_service.fetch_single_route", fake_fetch)
        run(search_anywhere("STN", "25/12/2026"))
        assert "STN" not in seen
