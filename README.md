# A2A – Agent-to-Agent Microservices System  
A lightweight demonstration of an **Agent-to-Agent (A2A)** architecture using **FastAPI** microservices.

---

# 📌 What is A2A (Agent-to-Agent)?
A2A stands for **Agent-to-Agent** communication.  
It means:

- One service (agent) can communicate with another service (agent).
- Each agent performs a specific job.
- The main orchestrator agent decides which other agents should be called.
- The system becomes modular, scalable, and easy to extend.

### ✔ Why A2A?
- Microservice-level autonomy  
- Each agent can run independently  
- Parallel / distributed processing  
- Scalable architecture for enterprise workflows  

---

# 📦 Project Overview

This project contains **3 FastAPI microservices**:

| Service | Port | Description |
|--------|------|-------------|
| **Main A2A Orchestrator** | `8100` | Receives user request → calls other agents |
| **Remote Spending Service** | `8101` | Calculates / validates spending details |
| **Remote Trip Service** | `8102` | Calculates / validates trip details |

---

# 🏗 Architecture Diagram

           ┌─────────────────────┐
           │    User / Client    │
           └──────────┬──────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │  Main A2A Service   │  (8100)
           │  Orchestrator Agent │
           └──────────┬──────────┘
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────────────┐ ┌──────────────────────┐
│ Remote Spending Agent │ │ Remote Trip Agent │
│ (8101) │ │ (8102) │
└──────────────────────┘ └──────────────────────┘



---

# 🚀 How the System Works (Flow)

### **Example: Process Total Request**
User hits:

GET http://127.0.0.1:8100/process-total



Main Orchestrator:

1. Calls **remote_spending** service  
   → `/calc-spending`

2. Calls **remote_trip** service  
   → `/calc-trip`

3. Combines both  
4. Returns final JSON

---

# 📂 Folder Structure

A2A_Testing/
│
├── init.py
├── agent.py → Main A2A orchestrator (8100)
│
├── remote_spending/
│ ├── init.py
│ └── agent.py → Spending service (8101)
│
└── remote_trip/
├── init.py
└── agent.py → Trip service (8102)


---

# ⚙ Installation

### **1. Install Python dependencies**

pip install fastapi uvicorn requests

---

# ▶ How to Run All Services

Before running, set PYTHONPATH:

### **Windows PowerShell**



---

## **1. Start Remote Spending (8101)**

uvicorn A2A_Testing.remote_spending.agent:a2a_app --host 127.0.0.1 --port 8101

shell
Copy code

## **2. Start Remote Trip (8102)**

uvicorn A2A_Testing.remote_trip.agent:a2a_app --host 127.0.0.1 --port 8102

shell
Copy code

## **3. Start Main Orchestrator (8100)**

uvicorn A2A_Testing.agent:a2a_app --host 127.0.0.1 --port 8100

yaml
Copy code

---

# 🧪 Testing Endpoints

### ✔ Spending Service (direct)
GET http://127.0.0.1:8101/calc-spending

shell
Copy code

### ✔ Trip Service (direct)
GET http://127.0.0.1:8102/calc-trip

shell
Copy code

### ✔ Main → Spending
GET http://127.0.0.1:8100/spending

shell
Copy code

### ✔ Main → Trip
GET http://127.0.0.1:8100/trip

shell
Copy code

### ✔ Main → Process Total (calls both agents)
GET http://127.0.0.1:8100/process-total

yaml
Copy code

---

# 📊 Example JSON Responses

### Spending Service
```json
{
  "status": "ok",
  "spending": 1200
}
Trip Service
json
Copy code
{
  "status": "ok",
  "trip_cost": 450
}
Combined Output
json
Copy code
{
  "spending": 1200,
  "trip_cost": 450,
  "total": 1650
}
🧪 Automated Test Script
Run:

nginx
Copy code
python a2a_auto_test.py
This validates:

All servers are running

JSON responses are valid

Total = spending + trip_cost

📦 Postman Collection
Import the included:

pgsql
Copy code
A2A_System.postman_collection.json
🎯 Summary
This A2A demo shows:

Multi-agent microservice orchestration

FastAPI distributed architecture

Service-to-service communication

Scalable modular design


