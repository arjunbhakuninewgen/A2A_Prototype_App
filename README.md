# 🚀 A2A Banking Microservices System (Google Gemini ADK)

A **complete Agent-to-Agent (A2A) microservice architecture** demonstrating how multiple AI agents communicate using Google's ADK protocol.

---

## 📚 Table of Contents
1. [What is A2A?](#what-is-a2a)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [API Endpoints](#api-endpoints)
7. [Understanding A2A](#understanding-a2a)

---

## 🤔 What is A2A?

### Agent-to-Agent (A2A) Communication

**A2A** is a standardized protocol by Google that enables **AI agents to communicate with each other** in a structured, type-safe manner.

### Why A2A?

Traditional microservices require you to write custom HTTP endpoints for each integration. **A2A eliminates this**:

| Traditional Approach | A2A Approach |
|-----------------|-----------|
| Custom JSON parsing | Structured messages with schemas |
| Manual error handling | Automatic validation |
| No discovery | Auto-discovery via agent cards |
| Manual serialization | Type-safe communication |

### Real-World Analogy

Imagine a bank:
- **Customer calls the main branch** (Orchestrator Agent)
- **Main branch routes to specialists** (Remote Agents)
  - "I need spending analysis" → Sends to spending specialist
  - "I need trip planning" → Sends to travel specialist
- **Specialists respond with structured data** (A2A protocol)

**That's exactly what this system does!**

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────┐
│      User / Client              │
│   (curl, Postman, Frontend)     │
└────────────────┬────────────────┘
                 │ HTTP POST /chat
                 ▼
┌──────────────────────────────────────────────┐
│   🧠 Main Orchestrator Agent (Port 8100)    │
│   - Routes queries intelligently             │
│   - Calls remote agents via A2A              │
│   - Provides final response                  │
│   - Name: BankingOrchestrator               │
└────┬──────────────────────────────┬──────────┘
     │ A2A Call                     │ A2A Call
     │                              │
     ▼                              ▼
┌─────────────────────────┐  ┌──────────────────────┐
│ 💰 Spending Agent       │  │ 🧳 Trip Planner      │
│ (Port 8101)             │  │ (Port 8102)          │
│ - Analyzes transactions │  │ - Creates itineraries│
│ - Returns summaries     │  │ - Plans budgets      │
│ - Tool: get_spending()  │  │ - Tool: plan_trip()  │
└─────────────────────────┘  └──────────────────────┘
        ▲ A2A Response              ▲ A2A Response
        └─────────────────┬─────────┘
                    Structured JSON
```

### Communication Flow

```
1. Client sends query to orchestrator
   POST /chat?query="Show my spending"

2. Orchestrator receives query
   → Identifies intent (spending analysis)
   → Routes to spending_agent via A2A

3. Spending Agent processes
   → Validates request via A2A schema
   → Calls local tool: get_spending_summary()
   → Returns structured response via A2A

4. Orchestrator formats response
   → Returns to client as JSON
```

---

## 📊 Deep Dive: How A2A Works

### 1. Agent Card Discovery

Each A2A agent publishes a **`.well-known/a2a-agent.json`** file:

```json
{
  "name": "spending_agent",
  "description": "Spending analysis microservice",
  "capabilities": [
    {
      "name": "get_spending_summary",
      "description": "Get spending summary for a user",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"}
        }
      }
    }
  ],
  "protocol_version": "1.0"
}
```

The **orchestrator discovers this automatically** without hardcoding details.

### 2. Structured Messages

All A2A communication uses **typed messages**:

```javascript
// Request
{
  "messages": [
    {
      "role": "user",
      "content": "Get spending for user_123"
    }
  ]
}

// Response
{
  "content": [
    {
      "type": "text",
      "text": "Spending summary: ..."
    }
  ]
}
```

### 3. Tool Invocation Flow

When an orchestrator agent uses a remote agent's tool:

```
Orchestrator                 Spending Agent
    │                              │
    ├─ A2A Call ────────────────>  │
    │  {tool: "get_spending",      │
    │   args: {user_id: "123"}}    │
    │                              │
    │                         [Execute Tool]
    │                         [Generate Response]
    │                              │
    │  <────── A2A Response ───────┤
    │  {status: "ok",              │
    │   total: 10000,              │
    │   categories: {...}}         │
    │                              │
```

### 4. Error Handling

A2A includes automatic error handling:

```javascript
// If tool fails
{
  "error": {
    "code": "INVALID_USER",
    "message": "User not found",
    "details": {...}
  }
}
```

---

## 🔄 Why Use A2A Over REST?

| Feature | REST API | A2A |
|---------|----------|-----|
| **Schema Validation** | Manual | Automatic |
| **Discovery** | Manual config | Auto via agent card |
| **Type Safety** | None | Full type checking |
| **Error Handling** | Custom per endpoint | Standardized |
| **Scalability** | Hard to add agents | Just deploy new agent |
| **Documentation** | Manual OpenAPI | Auto-generated |

---

## 📋 Project Structure

```
a2a_banking_system/
│
├── root_orchestrator/
│   └── index.js                 # Main agent (Port 8100)
│       ├── Calls spending agent
│       ├── Calls trip agent
│       └── Uses investment tool
│
├── remote_spending/
│   └── index.js                 # Spending microservice (Port 8101)
│       ├── A2A endpoint at /a2a
│       ├── Tool: get_spending_summary()
│       └── Fake data: FAKE_TRANSACTIONS
│
├── remote_trip/
│   └── index.js                 # Trip planner (Port 8102)
│       ├── A2A endpoint at /a2a
│       ├── Tool: plan_trip()
│       └── Budget calculations
│
├── package.json
├── .env                         # Store API key here
└── README.md                    # This file
```

---

## 💾 Installation

### Prerequisites
- **Node.js 18+**
- **npm**
- **Google API Key** (Get free at: https://aistudio.google.com/app/apikey)

### Step 1: Clone & Setup

```bash
cd a2a_banking_system
npm install
```

### Step 2: Install Dependencies

```bash
npm install express cors node-fetch @google-adk-js/core @google-adk-js/adapters
```

### Step 3: Create .env File

```bash
# .env
GOOGLE_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

**Don't have an API key?**
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env`

### Step 4: Verify Installation

```bash
npm list @google-adk-js/core @google-adk-js/adapters
```

Should show version info, not errors.

---

## ▶️ Running Services

### Option 1: Start All Services (Recommended)

```bash
npm run start:all
```

**Output should show:**
```
🟢 Spending Agent running on http://localhost:8101
🟢 Trip Planner Agent running on http://localhost:8102
🟢 BankingOrchestrator running on http://localhost:8100
```

### Option 2: Start Services Individually

**Terminal 1 - Spending Microservice (Port 8101):**
```bash
npm run start:spending
```

**Terminal 2 - Trip Planner Microservice (Port 8102):**
```bash
npm run start:trip
```

**Terminal 3 - Root Orchestrator (Port 8100):**
```bash
npm run start:orchestrator
```

### What Each Service Does

| Service | Port | Role | A2A |
|---------|------|------|-----|
| Root Orchestrator | 8100 | Routes queries | Client of remote agents |
| Spending Agent | 8101 | Analyzes spending | Exposes via `/a2a` |
| Trip Planner | 8102 | Plans trips | Exposes via `/a2a` |

---

## 🧪 Testing

### Test 1: Health Check

```bash
curl http://localhost:8100/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "BankingOrchestrator"
}
```

### Test 2: Spending Analysis (via A2A)

```bash
curl -X POST http://localhost:8100/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Show spending for user_123"}'
```

**What happens:**
1. Orchestrator receives query
2. Detects keyword "spending"
3. Makes **A2A call** to spending_agent on port 8101
4. Spending agent executes `get_spending_summary(user_123)`
5. Returns structured response back through A2A
6. Orchestrator formats and returns to client

**Response:**
```json
{
  "result": "User spent ₹10,500 across 5 transactions...",
  "status": "success",
  "query": "Show spending for user_123"
}
```

### Test 3: Trip Planning (via A2A)

```bash
curl -X POST http://localhost:8100/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Plan a 3-day trip from Bangalore to Goa with 20000 budget in balanced style"}'
```

**What happens:**
1. Orchestrator detects keyword "trip"
2. Makes **A2A call** to trip_planner_agent on port 8102
3. Trip agent extracts parameters (origin, destination, days, budget, style)
4. Executes `plan_trip()` with extracted parameters
5. Returns **structured itinerary** through A2A
6. Orchestrator returns formatted response

### Test 4: Investment Advice (Local Tool)

```bash
curl -X POST http://localhost:8100/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"I want to invest 50000 rupees with medium risk"}'
```

**What happens:**
1. Orchestrator detects keyword "invest"
2. **Uses local tool** (no A2A call needed)
3. Calls `investment_tool(risk="medium", amount=50000)`
4. Returns portfolio recommendation directly

### Test 5: Using Postman

**Create a POST request:**
- URL: `http://localhost:8100/chat`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "query": "Show spending for user_123"
}
```

---

## 📡 API Endpoints

### Root Orchestrator (Port 8100)

| Endpoint | Method | Purpose | A2A Usage |
|----------|--------|---------|-----------|
| `/health` | GET | Health check | ❌ Direct |
| `/chat` | POST | Main interface | ✅ Routes to remote agents |

### Spending Agent (Port 8101)

| Endpoint | Method | Purpose | A2A |
|----------|--------|---------|-----|
| `/a2a` | POST | **A2A Protocol** | ✅ Agent Card Discovery |
| `/api/spend` | POST | Direct REST | ❌ Bypass A2A |

**A2A Endpoint Usage:**
```javascript
// Orchestrator calling via A2A
POST http://localhost:8101/a2a
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Get spending summary for user_123"
    }
  ]
}
```

### Trip Planner Agent (Port 8102)

| Endpoint | Method | Purpose | A2A |
|----------|--------|---------|-----|
| `/a2a` | POST | **A2A Protocol** | ✅ Agent Card Discovery |
| `/api/plan` | POST | Direct REST | ❌ Bypass A2A |

---

## 🎯 Understanding A2A: Step-by-Step

### Scenario: User asks "Show my spending"

#### Step 1: Request Arrives at Orchestrator
```
User Query:
POST /chat
{"query": "Show my spending"}
```

#### Step 2: Orchestrator Routes the Query
```javascript
// In root_orchestrator/index.js
if (query.includes("spending")) {
  // Make A2A call to spending agent
  return await callSpendingAgent(query);
}
```

#### Step 3: A2A Call Made to Remote Agent
```javascript
// A2A Protocol Request
POST http://localhost:8101/a2a
{
  "messages": [
    {
      "role": "user",
      "content": "Show spending for user_123"
    }
  ]
}
```

#### Step 4: Spending Agent Receives via A2A
```javascript
// /a2a endpoint receives structured message
// Automatically validated against agent schema
// Tool called: get_spending_summary(user_id="user_123")
```

#### Step 5: Tool Execution
```javascript
function get_spending_summary({ user_id }) {
  const txns = FAKE_TRANSACTIONS[user_id];
  return {
    status: "ok",
    total_spent: 10500,
    by_category: {...}
  }
}
```

#### Step 6: A2A Response Returned
```javascript
// Structured A2A Response
{
  "content": [
    {
      "type": "text",
      "text": "User spent ₹10,500 across 5 transactions..."
    }
  ]
}
```

#### Step 7: Orchestrator Formats & Returns
```json
{
  "result": "User spent ₹10,500 across 5 transactions. Top category: Food (₹2,500)",
  "status": "success",
  "query": "Show my spending"
}
```

---

## 🔒 A2A Security Features

A2A includes built-in security:

### 1. **Schema Validation**
```javascript
// Only inputs matching this schema are accepted
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string", "minLength": 1},
    "month": {"type": "string", "pattern": "\\d{4}-\\d{2}"}
  },
  "required": ["user_id"]
}
```

### 2. **Type Checking**
- Invalid types rejected automatically
- No arbitrary code execution

### 3. **Audit Trail**
- All A2A calls can be logged
- Full message history preserved

---

## 📈 Extending the System

### Adding a New Agent (e.g., Fraud Detection)

1. **Create new microservice:**
```
remote_fraud/
└── index.js
```

2. **Define A2A endpoint:**
```javascript
const agent = new Agent({
  name: "fraud_detection_agent",
  tools: [
    {
      name: "detect_fraud",
      handler: detect_fraud_function
    }
  ]
});
```

3. **Register in orchestrator:**
```javascript
const fraudClient = new A2aClient("http://localhost:8103");

// In root agent tools:
fraud_detection_agent: fraudClient.asTool("fraud_detection_agent")
```

4. **Start new service:**
```bash
node remote_fraud/index.js  # Port 8103
```

**That's it!** A2A automatically handles:
- ✅ Discovery
- ✅ Schema validation
- ✅ Error handling
- ✅ Type safety

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

**Windows:**
```bash
netstat -ano | findstr :8100
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:8100 | xargs kill -9
```

### Issue: "Cannot call remote agent"

**Check:**
1. ✅ All 3 services running
2. ✅ Ports 8100, 8101, 8102 open
3. ✅ No firewall blocking
4. ✅ API key valid

### Issue: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "A2A endpoint not responding"

**Check logs:**
```bash
# Should see "A2A endpoint: http://localhost:8101/a2a"
npm run start:spending
```

---

## 📊 Data Reference

### Available Users (Spending)

| User ID | Spending Data |
|---------|---------------|
| `user_123` | Food (₹2500), Transport (₹1200), Shopping (₹4500), Utilities (₹800), Entertainment (₹1500) |
| `user_456` | Food (₹1800), Rent (₹15000), Shopping (₹3200) |
| `user_789` | Gym (₹500), Food (₹3000), Transport (₹2000) |

### Investment Risk Profiles

| Risk Level | Portfolio Allocation |
|-----------|---------------------|
| `low` | 80% FD, 20% Bonds |
| `medium` | 50% Mutual Funds, 30% Bonds, 20% Stocks |
| `high` | 80% Stocks, 20% Crypto |

### Trip Travel Styles

| Style | Accommodation |
|-------|---------------|
| `cheap` | Budget hotel / hostel (₹500-800/night) |
| `balanced` | 3-star hotel with breakfast (₹1500-2500/night) |
| `premium` | 5-star resort (₹5000+/night) |

---

## 📚 Key A2A Concepts Summary

| Concept | Explanation |
|---------|-------------|
| **A2A Protocol** | Standardized way agents communicate |
| **Agent Card** | JSON file describing agent capabilities |
| **Remote Agent** | Microservice exposing A2A endpoint |
| **Orchestrator** | Main agent routing queries to others |
| **Tool** | Function that agents can call |
| **Schema** | Defines input/output structure |
| **A2A Endpoint** | `/a2a` where agents listen |

---

## 🎓 Learning Path

1. **Beginner:** Run the system and make test requests
2. **Intermediate:** Understand the routing logic in orchestrator
3. **Advanced:** Add a new microservice agent
4. **Expert:** Implement custom A2A protocol handlers

---

## 🚀 Next Steps

- ✅ Run all services
- ✅ Make test requests
- ✅ Read the code comments
- ✅ Add your own agent
- ✅ Deploy to production

---

## 📞 Support & Resources

**Google A2A Documentation:**
- https://docs.anthropic.com/en/docs/build-with-claude

**Google Gemini API:**
- https://ai.google.dev/gemini-api/docs

**Agent Development Kit:**
- https://github.com/google/adk-js

---

## ✨ Summary

This project demonstrates **enterprise-grade agent architecture** using Google's A2A protocol:

- ✅ **Microservices** - Independent agents
- ✅ **Type-Safe** - Schema validation
- ✅ **Discoverable** - Auto agent cards
- ✅ **Scalable** - Easy to add agents
- ✅ **Production-Ready** - Error handling & logging

**The key insight:** A2A removes boilerplate and lets you focus on **business logic**, not HTTP plumbing.

Happy building! 🎉