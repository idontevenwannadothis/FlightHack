def get_vpn_recommendation(origin: str, destination: str):
    """
    Provides a VPN recommendation based on the destination region and airlines.
    This acts as a rules engine for price discrimination logic.
    """
    
    # Generic rules based on regions
    # In a fully fleshed out app, this would be a database table mapped to airline base countries.
    origin = origin.upper()
    destination = destination.upper()
    
    # South America Hubs
    if destination in ["BOG", "EZE", "GRU", "GIG", "SCL", "LIM"]:
        return {
            "suggested_country": "Brazil or Argentina",
            "reason": "Flights to South America often show significantly lower prices (in local currency) when booked from a local IP due to regional purchasing power.",
            "estimated_savings": "15-30%"
        }
        
    # Asia Hubs
    if destination in ["BKK", "SGN", "HAN", "MNL", "KUL", "CGK"]:
        return {
            "suggested_country": "Vietnam, India, or Thailand",
            "reason": "Airlines like AirAsia and VietJet offer localized promos not visible to US/EU IPs. Change VPN to the destination country.",
            "estimated_savings": "10-25%"
        }
        
    # Turkish / Middle East
    if destination in ["IST", "SAW", "DXB", "DOH"]:
        return {
            "suggested_country": "Turkey",
            "reason": "Turkish Airlines and Pegasus often price tickets lower in Turkish Lira (TRY) for local IP addresses due to currency devaluation.",
            "estimated_savings": "20-40%"
        }
        
    # Default Advice
    return {
        "suggested_country": "India or Mexico",
        "reason": "Even for standard European/US routes, checking from a lower-income country's IP in an Incognito window can sometimes strip away 'premium' IP tracking markups.",
        "estimated_savings": "5-10%"
    }