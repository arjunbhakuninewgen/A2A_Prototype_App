"""
Remote trip planning microservice
Location: F:\a2abankingsystem\remote_trip\agent.py
Run on port 8102
"""

from typing import Dict, Any, List
from google.adk.agents import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a

GEMINI_MODEL = "gemini-2.5-flash"

def plan_trip(
    origin: str,
    destination: str,
    days: int,
    budget_inr: int,
    travel_style: str = "balanced",
) -> Dict[str, Any]:
    """
    Create a travel itinerary.
    
    Args:
        origin: Starting city (e.g., 'Bangalore')
        destination: Destination city (e.g., 'Goa')
        days: Number of days for trip
        budget_inr: Budget in INR
        travel_style: 'cheap', 'balanced', or 'premium'
    
    Returns:
        Dictionary with travel plan and recommendations
    """
    base_hotel = {
        "cheap": "Budget hotel / hostel near city center (₹500-800/night)",
        "balanced": "3-star hotel with breakfast included (₹1500-2500/night)",
        "premium": "5-star resort with ocean/city view (₹5000+/night)",
    }.get(travel_style, "3-star hotel")
    
    daily_plan: List[Dict[str, Any]] = []
    for day in range(1, days + 1):
        daily_plan.append({
            "day": day,
            "morning": f"Explore local attractions in {destination}",
            "afternoon": f"Try popular local cuisine and street food",
            "evening": f"Relax at {base_hotel}",
        })
    
    budget_breakdown = {
        "hotel": int(budget_inr * 0.4),
        "food": int(budget_inr * 0.3),
        "activities": int(budget_inr * 0.2),
        "transport": int(budget_inr * 0.1),
    }
    
    return {
        "status": "ok",
        "origin": origin,
        "destination": destination,
        "days": days,
        "budget_inr": budget_inr,
        "travel_style": travel_style,
        "hotel_suggestion": base_hotel,
        "daily_plan": daily_plan,
        "budget_breakdown": budget_breakdown,
        "total_budget": sum(budget_breakdown.values()),
        "note": "Detailed itinerary with real-time bookings available"
    }

# ---- TRIP PLANNING AGENT ----
root_agent = Agent(
    model=GEMINI_MODEL,
    name="trip_planner_agent",
    instruction=(
        "You are a trip planning microservice. When asked about trips:\n"
        "1. Extract: origin, destination, days, budget, travel_style from the query\n"
        "2. Use plan_trip to generate an itinerary\n"
        "3. Return a formatted trip plan with daily activities and budget breakdown\n"
        "4. Give friendly travel tips and recommendations\n\n"
        "Travel styles: cheap, balanced, premium"
    ),
    tools=[plan_trip],
)

# ---- EXPOSE VIA A2A ----
a2a_app = to_a2a(root_agent, port=8102)