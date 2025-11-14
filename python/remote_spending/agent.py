"""
Remote spending analysis microservice
Location: F:\a2abankingsystem\remote_spending\agent.py
Run on port 8101
"""

from typing import Dict, Any
from google.adk.agents import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a

GEMINI_MODEL = "gemini-2.5-flash"

# ---- FAKE DATA LAYER ----
FAKE_TRANSACTIONS: Dict[str, list[Dict[str, Any]]] = {
    "user_123": [
        {"category": "Food", "amount": 2500, "merchant": "Swiggy"},
        {"category": "Transport", "amount": 1200, "merchant": "Ola"},
        {"category": "Shopping", "amount": 4500, "merchant": "Amazon"},
        {"category": "Utilities", "amount": 800, "merchant": "Electricity"},
        {"category": "Entertainment", "amount": 1500, "merchant": "Netflix"},
    ],
    "user_456": [
        {"category": "Food", "amount": 1800, "merchant": "Zomato"},
        {"category": "Rent", "amount": 15000, "merchant": "Landlord"},
        {"category": "Shopping", "amount": 3200, "merchant": "Flipkart"},
    ],
    "user_789": [
        {"category": "Gym", "amount": 500, "merchant": "Fitness"},
        {"category": "Food", "amount": 3000, "merchant": "Restaurant"},
        {"category": "Transport", "amount": 2000, "merchant": "Auto"},
    ]
}

def get_spending_summary(user_id: str, month: str = None) -> Dict[str, Any]:
    """
    Return spending summary for a user.
    
    Args:
        user_id: User identifier (e.g., "user_123")
        month: Optional month in format "2025-11"
    
    Returns:
        Dictionary with spending breakdown and insights
    """
    txns = FAKE_TRANSACTIONS.get(user_id, [])
    
    summary: Dict[str, int] = {}
    total = 0
    
    for t in txns:
        cat = t["category"]
        amt = t["amount"]
        total += amt
        summary[cat] = summary.get(cat, 0) + amt
    
    if not txns:
        return {
            "status": "ok",
            "user_id": user_id,
            "total_spent": 0,
            "by_category": {},
            "insight": f"No transactions found for {user_id}",
        }
    
    top_cat = max(summary, key=summary.get)
    return {
        "status": "ok",
        "user_id": user_id,
        "total_spent": total,
        "by_category": summary,
        "top_category": top_cat,
        "top_category_amount": summary[top_cat],
        "transaction_count": len(txns),
        "insight": f"User spent ₹{total:,} across {len(txns)} transactions. Top category: {top_cat} (₹{summary[top_cat]:,})",
    }

# ---- SPENDING AGENT ----
root_agent = Agent(
    model=GEMINI_MODEL,
    name="spending_agent",
    instruction=(
        "You are a spending analysis microservice. When asked about spending:\n"
        "1. Extract the user_id from the query\n"
        "2. Use get_spending_summary to retrieve their spending data\n"
        "3. Return a friendly, formatted analysis\n"
        "4. Include insights about their top spending category and patterns\n\n"
        "Available users: user_123, user_456, user_789"
    ),
    tools=[get_spending_summary],
)

# ---- EXPOSE VIA A2A ----
a2a_app = to_a2a(root_agent, port=8101)