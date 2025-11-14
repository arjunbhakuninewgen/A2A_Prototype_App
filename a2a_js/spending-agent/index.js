import express from "express";
import { Agent, toA2A } from "@google-labs/agent_kit";

const app = express();
app.use(express.json());

// Fake spending DB
const DATA = {
  user_123: [
    { category: "Food", amount: 2500 },
    { category: "Travel", amount: 1000 },
    { category: "Shopping", amount: 5000 }
  ]
};

// Spending function
function getSpendingSummary({ user_id }) {
  const tx = DATA[user_id] || [];
  const total = tx.reduce((sum, t) => sum + t.amount, 0);
  return { user_id, total, transactions: tx };
}

// A2A Agent
const root = new Agent({
  name: "spending_agent",
  model: "gemini-2.5-flash",
  description: "Spending analysis agent",
  tools: { getSpendingSummary }
});

// Expose via A2A
toA2A(root, app);

app.listen(8101, () =>
  console.log("🟢 Spending Agent running on http://127.0.0.1:8101")
);
