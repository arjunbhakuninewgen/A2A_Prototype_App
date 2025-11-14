import express from "express";
import { Agent, toA2A } from "@google-labs/agent_kit";

const app = express();
app.use(express.json());

function planTrip({ origin, destination, days }) {
  return {
    trip: `${origin} → ${destination}`,
    days,
    suggestion: `Plan a ${days}-day trip to ${destination}!`
  };
}

const root = new Agent({
  name: "trip_planner_agent",
  model: "gemini-2.5-flash",
  tools: { planTrip }
});

toA2A(root, app);

app.listen(8102, () =>
  console.log("🟢 Trip Planner Agent running on http://127.0.0.1:8102")
);
