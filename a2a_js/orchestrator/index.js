/**
 * Root orchestrator agent that coordinates multiple remote A2A agents
 * Location: ./root_orchestrator/index.js
 * Run on: port 8100
 */

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_MODEL = "gemini-2.5-flash";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "your_api_key_here";

// ---- LOCAL INVESTMENT TOOL ----
function investment_tool({ risk, amount }) {
  const riskProfiles = {
    low: {
      advice: "80% FD, 20% bonds",
      allocation: { FD: 0.8, bonds: 0.2 }
    },
    medium: {
      advice: "50% MF, 30% bonds, 20% stocks",
      allocation: { MF: 0.5, bonds: 0.3, stocks: 0.2 }
    },
    high: {
      advice: "80% stocks, 20% crypto",
      allocation: { stocks: 0.8, crypto: 0.2 }
    }
  };

  const profile = riskProfiles[risk.toLowerCase()];
  if (!profile) {
    return { error: "Unknown risk category. Use: low, medium, or high" };
  }

  return {
    ...profile,
    amount,
    risk
  };
}

// ---- CALL REMOTE AGENTS VIA A2A ----
async function callSpendingAgent(query) {
  try {
    const response = await fetch("http://localhost:8101/a2a/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: query }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "No response from spending agent";
  } catch (err) {
    return `Error calling spending agent: ${err.message}`;
  }
}

async function callTripAgent(query) {
  try {
    const response = await fetch("http://localhost:8102/a2a/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: query }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "No response from trip agent";
  } catch (err) {
    return `Error calling trip agent: ${err.message}`;
  }
}

// ---- ORCHESTRATOR LOGIC ----
async function orchestrate(userQuery) {
  const query = userQuery.toLowerCase();

  // Route to spending agent
  if (query.includes("spending") || query.includes("expenses") || 
      query.includes("transactions") || query.includes("money spent") ||
      query.includes("analysis")) {
    return await callSpendingAgent(userQuery);
  }

  // Route to trip agent
  if (query.includes("travel") || query.includes("trip") || 
      query.includes("vacation") || query.includes("hotel") ||
      query.includes("plan") || query.includes("journey")) {
    return await callTripAgent(userQuery);
  }

  // Use local investment tool
  if (query.includes("invest") || query.includes("investment") || 
      query.includes("portfolio") || query.includes("risk") ||
      query.includes("money allocation")) {
    const riskMatch = query.match(/\b(low|medium|high)\s*risk\b/i);
    const amountMatch = query.match(/₹?(\d+(?:,\d+)*)/);
    
    if (riskMatch && amountMatch) {
      const risk = riskMatch[1].toLowerCase();
      const amount = parseInt(amountMatch[1].replace(/,/g, ""));
      return JSON.stringify(investment_tool({ risk, amount }), null, 2);
    }
    return "Please specify risk level (low/medium/high) and amount to invest.";
  }

  // Default response
  return `Banking Orchestrator ready! I can help with:\n
- Spending Analysis (e.g., "Show my spending for user_123")\n
- Trip Planning (e.g., "Plan 3-day trip to Goa")\n
- Investment Advice (e.g., "Invest 50000 with medium risk")\n
What would you like to do?`;
}

// ---- ENDPOINTS ----
app.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        error: "Query cannot be empty",
        status: "error"
      });
    }

    const result = await orchestrate(query);
    return res.json({
      result: result || "No response",
      status: "success",
      query: query
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(400).json({
      error: error.message,
      status: "error"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "BankingOrchestrator" });
});

// ---- START SERVER ----
const PORT = 8100;
app.listen(PORT, () => {
  console.log(`🟢 BankingOrchestrator running on http://localhost:${PORT}`);
  console.log(`   Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`   Health check: GET http://localhost:${PORT}/health`);
});