"""
Root orchestrator agent that coordinates multiple remote A2A agents
Location: F:\a2abankingsystem\A2A_Testing\agent.py
"""

from google.adk.agents import Agent
from google.adk.agents.remote_a2a_agent import RemoteA2aAgent, AGENT_CARD_WELL_KNOWN_PATH
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import warnings

# Suppress experimental warnings
warnings.filterwarnings("ignore", category=UserWarning)

GEMINI_MODEL = "gemini-2.5-flash"

# ---- CONNECT TO REMOTE AGENTS USING RemoteA2aAgent ----
spending_agent = RemoteA2aAgent(
    name="spending_agent",
    description="Remote spending analysis agent",
    agent_card=f"http://localhost:8101/a2a/spending_agent{AGENT_CARD_WELL_KNOWN_PATH}",
)

trip_agent = RemoteA2aAgent(
    name="trip_planner_agent",
    description="Remote trip planning agent",
    agent_card=f"http://localhost:8102/a2a/trip_planner_agent{AGENT_CARD_WELL_KNOWN_PATH}",
)

# ---- LOCAL INVESTMENT TOOL ----
def investment_tool(risk: str, amount: int):
    """Provide investment advice based on risk profile."""
    if risk == "low":
        return {"advice": "80% FD, 20% bonds", "allocation": {"FD": 0.8, "bonds": 0.2}}
    elif risk == "medium":
        return {"advice": "50% MF, 30% bonds, 20% stocks", "allocation": {"MF": 0.5, "bonds": 0.3, "stocks": 0.2}}
    elif risk == "high":
        return {"advice": "80% stocks, 20% crypto", "allocation": {"stocks": 0.8, "crypto": 0.2}}
    else:
        return {"error": "Unknown risk category"}

# ---- ROOT ORCHESTRATOR AGENT ----
root_agent = Agent(
    name="BankingOrchestrator",
    model=GEMINI_MODEL,
    instruction="""
You are a banking orchestrator agent. Route user queries to the appropriate service:

1. If query mentions: spending, expenses, transactions, money spent, analysis -> delegate to spending_agent
   - Ask for user_id to get spending summary
   
2. If query mentions: travel, trip, vacation, hotels, plan, journey, tour -> delegate to trip_planner_agent
   - Ask for origin, destination, days, budget, travel_style
   
3. If query mentions: invest, investment, portfolio, returns, risk, money allocation -> use investment_tool
   - Ask for risk level (low/medium/high) and amount
   
4. For greetings/general queries -> respond directly

Always extract relevant parameters and pass them to the appropriate service.
Be conversational and helpful. Return structured, easy-to-read responses.
""",
    sub_agents=[
        spending_agent,
        trip_agent,
    ],
    tools=[investment_tool]
)

# ---- CREATE A2A APP ----
a2a_starlette_app = to_a2a(root_agent, port=8100)

# ---- WRAP WITH FASTAPI FOR ADDITIONAL ENDPOINTS ----
a2a_app = FastAPI()

# Add CORS middleware
a2a_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount A2A app
a2a_app.mount("/a2a", a2a_starlette_app)

# ---- ADD /chat ENDPOINT FOR FRONTEND ----
from fastapi import Form

@a2a_app.post("/chat")
async def chat_endpoint(query: str = Form(...)):
    """Simple chat endpoint for frontend compatibility"""
    if not query or not query.strip():
        return JSONResponse({"error": "Query cannot be empty", "status": "error"}, status_code=400)
    
    try:
        # Call the agent directly with the query
        result = await root_agent(query)
        return JSONResponse({
            "result": str(result) if result else "No response",
            "status": "success",
            "query": query
        })
    except Exception as e:
        import traceback
        print("Error occurred:")
        traceback.print_exc()
        return JSONResponse({
            "error": str(e),
            "status": "error",
            "query": query
        }, status_code=400)

# ---- HEALTH CHECK ----
@a2a_app.get("/health")
async def health():
    return {"status": "ok", "service": "BankingOrchestrator"}