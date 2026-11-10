"""Tests for the VPN price-discrimination rules engine."""
from services.vpn_service import get_vpn_recommendation


class TestRegionRules:
    def test_south_america(self):
        rec = get_vpn_recommendation("BGY", "GRU")
        assert "Brazil" in rec["suggested_country"]

    def test_asia(self):
        rec = get_vpn_recommendation("BGY", "BKK")
        assert "Vietnam" in rec["suggested_country"]

    def test_turkey_middle_east(self):
        rec = get_vpn_recommendation("BGY", "IST")
        assert rec["suggested_country"] == "Turkey"

    def test_default_fallback(self):
        rec = get_vpn_recommendation("BGY", "STN")
        assert "India" in rec["suggested_country"]

    def test_lowercase_codes_accepted(self):
        rec = get_vpn_recommendation("bgy", "gru")
        assert "Brazil" in rec["suggested_country"]

    def test_recommendation_shape(self):
        rec = get_vpn_recommendation("BGY", "STN")
        assert set(rec.keys()) == {"suggested_country", "reason", "estimated_savings"}
