# TravelMate — Environmental Suitability Intelligence
(`J26-IT-339-com1-feature-environmental`)

An AI-driven biometeorological decision support system that translates complex atmospheric physics, air quality metrics, and individual user preferences into an activity-specific Suitability Score (0-100) for foreign tourists in Sri Lanka

---

## 📌 Project Overview

International tourists visiting Sri Lanka frequently face severe cognitive barriers when attempting to translate raw meteorological indicators into actionable safety decisions across highly diverse micro-climates.
 **Component 1** solves this problem by acting as an intelligent translation layer. It abandons rigid static formulas (like the TCI/HCI) and uses supervised machine learning to predict personalized, activity-aware environmental safety and comfort.

### Target Users
- **Inbound Foreign Tourists:** Planning daily excursions without deep local climate knowledge.
- **Travelers with Specific Vulnerabilities:** Users requiring customized thresholds for thermal comfort, rain, or high UV index.
---

## ✨ Features

### Currently Implemented
- **Personalized Suitability Engine:** XGBoost model predicting a continuous 0-100 Suitability Score and discrete categorical class (Excellent, Good, Moderate, Poor).
- **13-Feature Environmental Tensor:** Fuses real-time ERA5 weather variables, PM2.5/PM10 air quality metrics, and individualized biological tolerances.
- **Diurnal Batch Processing:** Evaluates 12-hour daylight blocks (06:00 - 18:00) to visually recommend the safest travel windows on the dashboard.
- **Server-Side State Management:** PostgreSQL-backed FIFO queue to manage search history and a persistent active watchlist across devices.
- **Professional UI/UX:** High-contrast, production-grade Next.js dashboard featuring a Circular Progress Gauge and a 2x3 Metric Grid optimized for outdoor mobile glare.

### Upcoming Roadmap (In Development)
- **Spatial Pivot Engine (Location Suggestions):** PostGIS-driven `ST_DWithin` spatial queries to automatically recommend the top 5 alternative safe destinations within a 50km radius when the primary location becomes hazardous (Score < 40)
- **Context-Aware AI Chatbot:** An integrated conversational agent to explain the biometeorological reasoning behind the Suitability Score and provide live environmental safety tips.

---

## 🛠️ Technologies Used

### Frontend (`client/`)
- **Next.js & React.js** (TypeScript)
- **Tailwind CSS** (Clean, enterprise-grade travel UI)

### Orchestration Backend (`server/`)
- **Node.js & Express.js** (TypeScript)
- **JSON Web Tokens (JWT)** for stateless authentication

### ML Inference Engine (`ml_service/`)
- **Python 3 & FastAPI** (Asynchronous API gateway)
- **XGBoost & Scikit-Learn** (Joblib serialized models in RAM)
- **Pandas & NumPy** (Data framing and manipulation)

### Database
- **PostgreSQL** with **PostGIS** extension (for geographic radius queries)

### Tools
- **Git & GitHub**
- **Visual Studio Code**
- **Postman** (REST API testing)

---

## 🏗️ System Architecture

The application follows a decoupled, microservice-based architecture[cite: 26]:

```text
Next.js / React Frontend (Port 3000)
        │
        ▼  HTTP / REST API 
Express.js Orchestration Backend (Port 5001)
        │
        ├──► Python FastAPI ML Engine (Port 8000) -> XGBoost Model
        │
        ▼  SQL Queries / PostGIS Spatial Filters
PostgreSQL Relational Database (Port 5432)

```

---

## 📋 Prerequisites

Make sure you have the following installed on your machine before setting up the project:

* **Node.js** (v18.x or v20+ recommended)
* **Python** (3.10 or higher)
* **PostgreSQL** (with the PostGIS extension installed and enabled)
* **Git**

---

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/IT23399556RMO/J26-IT-339.git
```
Then select ```com1-feature-environmental``` branch.

To pull only specific ```com1-feature-environmental``` branch, use the `-b` flag:


### 2. Set Up the ML Inference Service (`ml_service`)

Navigate to the Python backend, install dependencies, and start the FastAPI server:

```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

```

*(Ensure your `xgboost_suitability_model.pkl` is placed inside the `ml_service/models/` directory).*

### 3. Set Up the Orchestration Backend (`server`)

Navigate to the Express backend, install dependencies, run migrations, and start the server:

```bash
cd ../server
npm install
npm run migrate
npm run dev

```

### 4. Set Up the Frontend (`client`)

Navigate to the Next.js frontend, install dependencies, and start the development server:

```bash
cd ../client
npm install
npm run dev

```

---

## 💻 Usage

1. Start your local **PostgreSQL** database service.
2. Ensure the **FastAPI ML Engine** (Port 8000), **Express Backend** (Port 5001), and **Next.js Frontend** (Port 3000) are all actively running.
3. Open your browser and navigate to `http://localhost:3000`.
4. Use the Spatio-Temporal Configuration Panel to select a destination, date, and time.
5. View the personalized Suitability Score, 2x3 Metric Grid, and rule-based safety alerts generated by the ML pipeline.

---

## 📁 Project Structure

```text
J26-IT-339-com1-suitability/
├── client/                          # Next.js Frontend
│   ├── app/
│   │   ├── environment/             # Environmental Dashboard UI
│   │   └── services/                # Axios API callers
├── ml_service/                      # Python FastAPI ML Engine
│   ├── models/                      # Serialized .pkl machine learning models
│   └── main.py                      # FastAPI inference endpoints
├── server/                          # Node.js Express Orchestrator
│   ├── src/
│   │   ├── controllers/             # Data fusion & history queue logic
│   │   └── migrations/              # PostgreSQL schema definitions
├── .gitignore
└── README.md

```

---

## 🔐 Environment Variables

Create `.env` files in both your `server/` and `client/` directories.

**server/.env**

```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=travelmate_db
JWT_SECRET=your_super_secret_jwt_key

```

**client/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api

```

> **Important:** Never commit `.env` files or database credentials to GitHub.

---

## 🧪 Testing

1. **API Testing with Postman:** Validate the 13-feature JSON payload by sending a direct POST request to the FastAPI endpoint at `http://127.0.0.1:8000/api/predict/suitability`.
2. **Safety Override Testing:** Select a location currently experiencing a Thunderstorm (WMO Code 95) via Open-Meteo to verify that the Express backend artificially caps the Suitability Score below 40 ("Poor") regardless of the ML output.


3. **Latency Benchmarking:** Ensure the combined round-trip request from Next.js -> Express -> FastAPI -> Next.js resolves in under 500 milliseconds.



---

## 👥 Contributors

* **Raveen M.O. (IT23399556)** — Component 1 Lead (Environmental Suitability Intelligence)


* SLIIT Research Project Group J26-IT-339
