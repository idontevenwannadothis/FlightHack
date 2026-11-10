"""Tests for date formatting and the in-memory response cache."""
import time

from services.serpapi_service import format_date, _cache_key, _cache_get, _cache_set, _cache


class TestFormatDate:
    def test_european_format_converted(self):
        assert format_date("25/12/2026") == "2026-12-25"

    def test_iso_format_passes_through(self):
        assert format_date("2026-12-25") == "2026-12-25"

    def test_garbage_passes_through(self):
        assert format_date("not-a-date") == "not-a-date"


class TestCache:
    def test_set_then_get(self):
        key = _cache_key("BGY", "STN", "25/12/2026", None, 1)
        _cache_set(key, [{"price": 42}])
        assert _cache_get(key) == [{"price": 42}]

    def test_miss_returns_none(self):
        key = _cache_key("BGY", "STN", "25/12/2026", None, 1)
        assert _cache_get(key) is None

    def test_expired_entry_evicted(self):
        key = _cache_key("BGY", "STN", "25/12/2026", None, 1)
        _cache[key] = (time.time() - 1, [{"price": 42}])  # already expired
        assert _cache_get(key) is None
        assert key not in _cache

    def test_key_normalizes_origin_destination_case(self):
        assert _cache_key("bgy", "stn", "25/12/2026", None, 1) == _cache_key("BGY", "STN", "25/12/2026", None, 1)

    def test_key_normalizes_date_format(self):
        assert _cache_key("BGY", "STN", "25/12/2026", None, 1) == _cache_key("BGY", "STN", "2026-12-25", None, 1)

    def test_passengers_part_of_key(self):
        assert _cache_key("BGY", "STN", "25/12/2026", None, 1) != _cache_key("BGY", "STN", "25/12/2026", None, 2)
