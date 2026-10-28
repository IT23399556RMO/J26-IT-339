# 🌴 TravelMate: AI-Enabled Tourism Decision Support System

**Research Project ID:** J26-IT339  
**Module:** BSc (Hons) Information Technology Final Year Research Project (RP)  
**Research Cluster:** Software Systems & Technologies (SST) @ SLIIT  

---

## 🌍 The Problem We Are Solving

Sri Lanka is a premier global tourist destination, but it presents a highly complex and unpredictable environment for inbound foreign travelers. 

When international tourists arrive, they face a massive cognitive burden. They must navigate hyper-localized micro-climates (where a sunny beach is just an hour away from a torrential mountain downpour), unpredictable crowd surges at heritage sites, foreigner entrance fees that can unexpectedly drain travel budgets, and a rich but highly allergenic local cuisine. 

Generic travel apps and basic weather widgets leave tourists guessing, often leading to ruined excursions, severe heat exhaustion, or blown budgets. 

**TravelMate** was built to eliminate this guesswork. We have moved entirely away from basic CRUD web applications to engineer a decentralized, microservice-based AI ecosystem. Our platform mathematically translates atmospheric physics, crowd dynamics, reinforcement learning routing, and computer vision into a single, personalized travel concierge.

---

## 🔬 Core Research Components & Team

TravelMate is the synthesis of four distinct academic research pillars, developed concurrently by our engineering team to create a flawless user journey:

### 1. Environmental Suitability & Comfort Intelligence
**Lead Researcher:** Raveen M.O. (IT23399556)
*   **The Engine:** XGBoost and Random Forest regressors trained on 630,000 ERA5 historical meteorological records.
*   **The Innovation:** We don't just show temperature. We fuse a 13-feature tensor—including real-time Air Quality (PM2.5), UV spikes, and the user's biological tolerances—to generate a personalized 0-100 Suitability Score. 
*   **Active Defense:** If a destination becomes hazardous (e.g., thunderstorms or extreme heat), a PostGIS spatial query instantly pivots the user, recommending safe, indoor alternatives within a 50km radius.

### 2. Smart Crowd Forecasting & Prediction System
**Lead Researcher:** De Silva J.G.M.N.
*   **The Engine:** Time-series predictive forecasting models combined with secure Role-Based Access Control (RBAC).
*   **The Innovation:** Over-tourism ruins the travel experience and harms local ecosystems. This module analyzes historical visitor trends and time-of-day occupancy to accurately forecast congestion. It provides color-coded severity indicators, allowing tourists to schedule their arrivals during optimal, low-crowd windows.

### 3. Adaptive Explainable Itinerary Optimization
**Lead Researcher:** A.A.S.P. Adhikari (IT23286900)
*   **The Engine:** Deep Q-Network (DQN) with Action-Masking, paired with NLP Sentiment Analysis.
*   **The Innovation:** A dual-stage AI pipeline that guarantees a 0% budget violation rate. It dynamically sequences itineraries to maximize enjoyment while strictly adhering to time constraints and wallet sizes. If sudden rain strikes, the system re-routes the entire day in under 0.45 seconds and suggests autonomous budget trade-offs (e.g., swapping a hired van for a sedan to afford a premium ticket).

### 4. AI-Based Food Recognition and Dietary Guidance
**Lead Researcher:** Ridmi Pavithra K.P.
*   **The Engine:** TensorFlow / Keras utilizing the EfficientNetB0 Convolutional Neural Network architecture.
*   **The Innovation:** Foreigners often struggle to identify local Sri Lankan dishes, posing severe allergy risks. Users simply snap a photo; our vision model classifies the food and instantly cross-references the ingredients against the user's securely stored medical and allergy profile to provide critical safety guidance.

---

## ⚙️ Unified Technology Stack

To support these intensive AI operations without sacrificing mobile performance, we split our architecture into three specialized, highly scalable tiers:

### 🎨 The Client Interface (Frontend)
*   **Technologies:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
*   **Architectural Justification:** Ensures a lightning-fast, mobile-first Progressive Web App (PWA) experience. This minimizes battery drain and cognitive load for travelers out in the field under high-glare tropical sunlight.

### 🚦 The Orchestration Gateway (Backend Node.js)
*   **Technologies:** Node.js, Express.js 5, TypeScript, Prisma ORM.
*   **Database:** PostgreSQL extended with PostGIS for spatial geographic routing.
*   **Architectural Justification:** Handles stateful authentication (JWT), cross-device search history (using a strict Server-Side FIFO queue), and orchestrates massive data payloads between our database, the Open-Meteo APIs, and our Python AI engines.

### 🧠 The AI Inference Cluster (Microservices)
*   **Technologies:** Python 3.12+, FastAPI, Uvicorn, PyTorch, TensorFlow, Scikit-Learn.
*   **Architectural Justification:** Heavy machine learning models (like our DQN agent and Random Forest regressors) are serialized and kept entirely in RAM. This allows FastAPI to deliver complex predictions back to the Node.js server in under 500 milliseconds.

---

## 🚀 Getting Started (Local Development)

We have engineered the local setup to be as frictionless as possible. You will need **Node.js (v18+)**, **Python (3.12+)**, and **PostgreSQL (with the PostGIS extension)** installed on your machine.

### 1. Clone & Configure

First, clone the repository to your local machine:
```bash
git clone https://github.com/IT23399556RMO/J26-IT-339.git
cd J26-IT-339
```

Next, create your environment configuration files. You must never commit these to version control.

**Create `server/.env`:**
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=travelmate_db
DATABASE_URL=postgresql://postgres:your_database_password@localhost:5432/travelmate_db
JWT_SECRET=your_super_secret_jwt_key
```

**Create `client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### 2. Booting the Ecosystem

**The Automated Way (Windows):**
If you are on Windows, simply double-click the `run-project.bat` script in the root directory. It will automatically install dependencies, spin up virtual environments, and launch all three servers in separate terminal windows.

**The Manual Way (Mac/Linux/Windows):**
If you prefer terminal control, boot the three tiers in this specific order:

**Terminal 1: Python AI Engine**
```bash
cd backend_fastapi
python -m venv venv
# Activate the venv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python run_server.py
# The Swagger UI will be available at http://localhost:8000/docs
```

**Terminal 2: Node.js Orchestrator**
```bash
cd server
npm install
npm run db:create
npm run migrate:up 
npm run dev
# The health check will be available at http://localhost:5001/api/health
```

**Terminal 3: Next.js Client**
```bash
cd client
npm install
npm run dev
# The application is live at http://localhost:3000
```

---

## 🧪 Testing the Application

Once the system is live, you can explore the primary research features through our professional web interface:

*   **Environmental Dashboard (`/environment`):** Test the spatial pivot logic by selecting a location during a severe thunderstorm. Watch the system automatically mask closed destinations and suggest safe, indoor alternatives nearby.
*   **Itinerary Optimizer (`/itinerary`):** Enter a strict budget and watch the Deep Q-Network sequence a full day of travel. Click the "Simulate Rain Delay" button to witness the sub-second route recalculation in real-time.
*   **Crowd Forecaster (`/crowds`):** View the predicted crowd levels and severity badges to identify the quietest hours to visit heritage sites.
*   **Food Scanner (`/food`):** Upload an image of a local Sri Lankan dish and review the retrieved allergy warnings cross-referenced with your profile.
