# 🚀 A2A Banking Microservices System (Google Gemini ADK)

This project demonstrates a **full Agent-to-Agent (A2A) microservice architecture** using:

- **Google Gemini 2.0 Flash**
- **Google ADK A2A protocol**
- **Remote A2A Agents (microservices)**
- **FastAPI**
- **Uvicorn**

This repo contains **three agents**:

| Service | Port | Description |
|--------|------|-------------|
| 🧠 Main Orchestrator Agent | **8100** | Calls all other agents and provides final answers |
| 💸 Spending Analysis Agent | **8101** | Provides structured spending summaries |
| 🧳 Trip Planner Agent | **8102** | Provides itinerary planning and travel suggestions |

Each agent is a **Google ADK Agent** exposed through an **A2A endpoint**, making this a complete microservice-based LLM system.

---

# 🔍 What is A2A (Agent-to-Agent)?

A2A = **Agent-to-Agent communication protocol**, allowing AI agents to talk to each other through:

- Typed structured messages  
- Standardized API endpoints  
- Automatic tool routing  
- Automatic agent card discovery  
- Zero custom HTTP code

In this project:

- The **main agent** orchestrates work
- The **remote agents** expose their capabilities through `/a2a`
- The orchestrator invokes them using **RemoteA2aAgent**

This mirrors real-world banking architectures:
- Spending engine microservice  
- Travel engine microservice  
- Central advisor orchestrator  

---

# 🏗️ Architecture

                      ┌─────────────────────┐
                      │     User / Client    │
                      └───────────┬──────────┘
                                  │ Query
                                  ▼
                    ┌────────────────────────────┐
                    │   Main Orchestrator Agent   │ (8100)
                    │    portfolio_orchestrator   │
                    └──────────┬───────────┬──────┘
                               │           │
                A2A Call       │           │      A2A Call
                               ▼           ▼
      ┌─────────────────────────────┐    ┌────────────────────────┐
      │   Remote Spending Agent     │    │   Remote Trip Agent     │
      │  spending_agent (8101)      │    │ trip_planner_agent (8102)│
      └─────────────────────────────┘    └────────────────────────┘

---

# 📂 Project Structure

A2A_Testing/
│
├── agent.py # Main Orchestrator Agent (8100)
│
├── remote_spending/
│ ├── agent.py # Spending A2A microservice (8101)
│ └── init.py
│
├── remote_trip/
│ ├── agent.py # Trip planner A2A microservice (8102)
│ └── init.py
│
└── README.md

yaml
Copy code

---

# 🛠 Installation

### 1️⃣ Install dependencies
pip install fastapi uvicorn google-genai google-adk

shell
Copy code

### 2️⃣ Set your Gemini API key
setx GOOGLE_API_KEY "YOUR_API_KEY_HERE"

yaml
Copy code

Or in PowerShell:
$env:GOOGLE_API_KEY="YOUR_API_KEY_HERE"

yaml
Copy code

---

# ▶ Running All Agents

Before running anything:

$env:PYTHONPATH = "F:\a2abankingsystem"

yaml
Copy code

---

### **1. Start Spending Agent (8101)**

uvicorn A2A_Testing.remote_spending.agent:a2a_app --port 8101

shell
Copy code

### **2. Start Trip Agent (8102)**

uvicorn A2A_Testing.remote_trip.agent:a2a_app --port 8102

shell
Copy code

### **3. Start Main Orchestrator (8100)**

uvicorn A2A_Testing.agent:a2a_app --port 8100

yaml
Copy code

---

# 🧪 Testing the System

### **Orchestrator chat endpoint**
POST http://127.0.0.1:8100/chat?query=plan+my+trip+from+Goa+to+Delhi

markdown
Copy code

### **Ask about spending**
POST http://127.0.0.1:8100/chat?query=show+my+spending+user_123

markdown
Copy code

### **Ask for investment advice**
POST http://127.0.0.1:8100/chat?query=investment+advice+moderate+5000

yaml
Copy code

---

# 🧰 Supported Workflows

### ✔ Budget & Spending  
Main agent → remote_spending_agent → returns structured category totals

### ✔ Trip Planning  
Main agent → remote_trip_planner_agent → returns full itinerary

### ✔ Investment Advisory  
Main agent → local tool → returns portfolio allocation

---

# 📦 Tools & Agents Summary

### 🌐 Remote Agents
- `/a2a` endpoint auto-generated via `to_a2a()`
- Standard A2A card discovery
- Structured JSON responses

### 🛠 Local Tool
`simple_portfolio_recommendation(risk, amount)`

---

# 📮 Postman Collection

A ready-to-import JSON file is included below.

---

# 🧪 Auto Testing Script (optional)

python a2a_auto_test.py

yaml
Copy code

Validates:
- all agents alive  
- JSON responses valid  
- orchestrator routing correct  

---

# 🎯 Summary

This project demonstrates:

- Multi-agent orchestration  
- A2A microservice patterns  
- Google Gemini reasoning + tools  
- Realistic banking/fintech workflows  
- Highly modular system for future agents  
- 100% production-style architecture  

You can easily extend with:
- Fraud detection agent  
- EMI calculator agent  
- Credit risk agent  
- Personal finance advice agent  
- Bill payment agent  

---

# 🙌 Need More?

I can generate:

✔ Docker-compose (all agents runnable with one command)  
✔ Swagger UI for each service  
✔ Frontend UI for your A2A system  
✔ Logging + monitoring setup  
✔ More agents (loans, credit card, fraud)  

Just ask!
