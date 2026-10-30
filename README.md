# TravelMate - AI-Based Adaptive Itinerary Optimization
# Research Project ID:** J26-IT339
# Component:** 3 – AI-Based Adaptive Itinerary Optimization
# Researcher:** - A.A.S.P Adhikari
# Module:** BSc (Hons) Information Technology Final Year Research Project (RP)
# Research Cluster:** Software Systems & Technologies (SST) @ SLIIT
TravelMate is a decision-support platform for foreign tourists visiting Sri Lanka. It combines itinerary optimization, adaptive re-planning, attraction information, explainable recommendations, and user authentication in a responsive web application.

This repository contains **J26-IT-339 Component 3: AI-Based Adaptive and Explainable Itinerary Optimization System**.

## Core capabilities

- Generate daily itineraries using traveler preferences, available time, budget, pace, categories, and mandatory waypoints.
- Re-plan an itinerary dynamically when delays or skipped stops occur.
- Browse a curated attraction knowledge base with categories, coordinates, opening hours, costs, dwell times, and amenities.
- Use an on-site assistant for schedule-aware travel questions.
- Analyze trip costs with the AI budget agent.
- View model status and benchmark results for the Random Forest and DQN components.
- Register, log in, update profiles, and manage users with JWT authentication and role-based access.
- Use local client-side optimization fallbacks when the AI API is unavailable.

## Architecture

```text
Next.js / React client (http://localhost:3000)
             │
             ├── REST calls ──► Express auth/data API (http://localhost:5001)
             │                         │
             │                         └── PostgreSQL users database
             │
             └── REST calls ──► FastAPI AI API (http://localhost:8000)
                                       │
                                       ├── Itinerary optimizer
                                       ├── Adaptive re-planner
                                       ├── Attraction knowledge base
                                       └── ML model and budget-agent services
```

## Technology stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- FontAwesome and Lucide icons
- React Data Table Component

### Backend services

- **FastAPI:** itinerary optimization, adaptive re-planning, attractions, ML metrics, and budget analysis
- **Express 5 / TypeScript:** authentication, user profiles, and admin user management
- **PostgreSQL:** persistent user storage through `pg` and `node-pg-migrate`
- **JSON fallback:** local user storage in `server/data/users.json` when PostgreSQL is unavailable
- **JWT and bcryptjs:** authentication and password hashing

### Machine learning

- Random Forest enjoyment prediction model
- DQN itinerary optimizer with action masking
- Model training and evaluation artifacts under `backend_fastapi/models/` and `notebooks/`

## Prerequisites

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- PostgreSQL 14 or newer (recommended for persistent user storage)
- Git

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/IT23399556RMO/J26-IT-339
cd J26-IT-339
```

Install the JavaScript dependencies:

```bash
cd client
npm install

cd ..\server
npm install
```

Create a Python virtual environment and install the FastAPI dependencies:

```bash
cd ..\backend_fastapi
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Environment variables

Create `server/.env` for the Express service:

```env
PORT=5001
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=travelmate_users
```

The client uses these defaults for the backend services:

- Express API: `http://localhost:5001`
- FastAPI API: `http://127.0.0.1:8000`

To override the FastAPI URL, create `client/.env.local`:

```env
NEXT_PUBLIC_FASTAPI_URL=http://127.0.0.1:8000/api/v1
```

Do not commit `.env`, `.env.local`, passwords, tokens, or database credentials.

## Running the application

### Option 1: Start all services on Windows

From the repository root, run:

```bat
run-project.bat
```

This opens separate terminals for:

- Next.js client on port `3000`
- Express server on port `5001`
- FastAPI server on port `8000`

### Option 2: Start services individually

Start the FastAPI service:

```bash
cd backend_fastapi
venv\Scripts\activate
python run_server.py
```

Start the Express service in a second terminal:

```bash
cd server
npm run db:create
npm run migrate:up
npm run dev
```

Start the Next.js client in a third terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

> PostgreSQL is recommended, but the Express service can initialize and use `server/data/users.json` as a local fallback when a database connection cannot be established.

## API reference

### Express authentication and user API

Base URL: `http://localhost:5001`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Check Express and database availability |
| `POST` | `/api/users/register` | Public | Register a user |
| `POST` | `/api/users/login` | Public | Log in and receive a JWT |
| `PUT` | `/api/users/profile` | Authenticated | Update the current profile |
| `DELETE` | `/api/users/profile` | Authenticated | Delete the current account |
| `GET` | `/api/users/all` | Admin | List all users |

Send the JWT in the request header:

```text
Authorization: Bearer <token>
```

### FastAPI AI API

Base URL: `http://localhost:8000`

Interactive documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check FastAPI service health |
| `POST` | `/api/v1/itinerary/optimize` | Generate an optimized itinerary |
| `POST` | `/api/v1/itinerary/replan` | Re-plan after a delay or skipped stop |
| `POST` | `/api/v1/itinerary/assistant-chat` | Ask the on-site itinerary assistant |
| `POST` | `/api/v1/itinerary/ai-budget-agent` | Analyze trip costs and trade-offs |
| `GET` | `/api/v1/attractions` | List attractions; optionally filter by category |
| `GET` | `/api/v1/attractions/{attraction_id}` | Get one attraction |
| `GET` | `/api/v1/models/status` | Get current model metrics and status |
| `POST` | `/api/v1/models/train` | Retrain the enjoyment model |
| `GET` | `/api/v1/models/benchmarks` | Get optimization benchmark comparisons |

## Health checks

```bash
curl http://localhost:5001/api/health
curl http://localhost:8000/api/health
```

The FastAPI root endpoint is also available at [http://localhost:8000](http://localhost:8000).

## Project structure

```text
J26-IT-339/
├── .gitignore
├── README.md
├── run-project.bat                         # Windows launcher for all services
│
├── backend_fastapi/                         # FastAPI AI and optimization service
│   ├── __init__.py
│   ├── main.py                             # FastAPI application entry point
│   ├── run_server.py                        # Uvicorn development launcher
│   ├── requirements.txt                     # Python dependencies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_attractions.py            # Attraction knowledge-base endpoints
│   │   ├── routes_itinerary.py              # Optimize, re-plan, chat, and budget APIs
│   │   └── routes_models.py                 # Model status, training, and benchmarks
│   ├── data/
│   │   ├── attractions_dataset.json         # Curated Sri Lanka attractions
│   │   └── tourism_master_validated.csv     # Training and tourism data
│   ├── models/
│   │   ├── __init__.py
│   │   ├── dqn_agent.py                     # DQN itinerary optimizer
│   │   ├── enjoyment_model.pkl              # Trained enjoyment model
│   │   ├── model_metrics.json               # Evaluation metrics
│   │   ├── openai_budget_agent.py           # AI budget analysis agent
│   │   ├── train_enjoyment_model.py         # Model training pipeline
│   │   ├── Train_Enjoyment_Model_J26_IT339.ipynb
│   │   └── xai_engine.py                    # Explainability utilities
│   └── tests/
│       └── test_optimization.py             # Optimization tests
│
├── client/                                  # Next.js and React web application
│   ├── AGENTS.md                            # Client development guidance
│   ├── CLAUDE.md                            # Client project notes
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── README.md                            # Next.js client notes
│   ├── tsconfig.json
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── app/
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx                         # Application landing page
│       ├── context/
│       │   └── AuthContext.tsx               # Authentication state and JWT handling
│       ├── components/
│       │   ├── confirmBox/
│       │   │   ├── confirmBox.tsx
│       │   │   └── page.tsx
│       │   ├── footer/
│       │   │   ├── footer.tsx
│       │   │   └── page.tsx
│       │   ├── header/
│       │   │   ├── header.tsx
│       │   │   └── page.tsx
│       │   └── sidebar/
│       │       ├── page.tsx
│       │       └── sidebar.tsx
│       ├── home/
│       │   ├── home.tsx
│       │   └── page.tsx
│       ├── sign/
│       │   ├── login/
│       │   │   ├── login.tsx
│       │   │   └── page.tsx
│       │   └── register/
│       │       ├── page.tsx
│       │       └── register.tsx
│       ├── settings/
│       │   ├── deleteProfile/
│       │   │   ├── deleteProfile.tsx
│       │   │   └── page.tsx
│       │   ├── editProfile/
│       │   │   ├── editProfile.tsx
│       │   │   └── page.tsx
│       │   └── settings/
│       │       ├── settings.tsx
│       │       └── page.tsx
│       ├── admin/
│       │   ├── components/
│       │   │   ├── header/
│       │   │   │   ├── header.tsx
│       │   │   │   └── page.tsx
│       │   │   └── sidebar/
│       │   │       ├── page.tsx
│       │   │       └── sidebar.tsx
│       │   ├── home/
│       │   │   ├── home.tsx
│       │   │   └── page.tsx
│       │   └── users/
│       │       ├── users.tsx
│       │       └── page.tsx
│       └── itinerary/
│           ├── page.tsx                     # Itinerary feature entry page
│           ├── adaptive/page.tsx            # Adaptive re-planning screen
│           ├── day-plan/page.tsx            # Generated daily plan
│           ├── on-site/page.tsx             # On-site support assistant
│           ├── profile/page.tsx             # Traveler profile
│           ├── components/
│           │   ├── AdaptiveReplanView.tsx
│           │   ├── DayPlanView.tsx
│           │   ├── FullItineraryWizard.tsx
│           │   ├── InteractiveMap.tsx
│           │   ├── MobileBottomNav.tsx
│           │   ├── ModelEvaluationModal.tsx
│           │   ├── OnSiteSupportView.tsx
│           │   └── ProfileView.tsx
│           ├── data/
│           │   ├── attractions.ts
│           │   ├── guides.ts
│           │   ├── hotels.ts
│           │   └── vehicles.ts
│           ├── services/
│           │   └── api.ts                   # FastAPI client functions
│           ├── types/
│           │   └── index.ts                 # Itinerary domain types
│           └── utils/
│               ├── budgetEngine.ts          # Local budget calculations
│               └── optimizer.ts             # Local optimization fallback
│
├── server/                                  # Express authentication/data service
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── data/
│   │   └── users.json                       # Local fallback user store
│   ├── scripts/
│   │   └── create-db.js                     # PostgreSQL database creation
│   └── src/
│       ├── server.ts                        # Express application entry point
│       ├── controllers/
│       │   └── userController.ts            # Registration, login, and user CRUD
│       ├── middleware/
│       │   └── authMiddleware.ts            # JWT and admin authorization
│       ├── migrations/
│       │   └── 001_create_users_table.js   # Users table migration
│       ├── routes/
│       │   └── userRoutes.ts                # Authentication and user routes
│       ├── services/
│       │   └── db.ts                        # PostgreSQL pool and JSON fallback
│       └── types/
│           ├── index.ts
│           └── user.ts
│
└── notebooks/                               # Research, reports, and evaluation outputs
    ├── build_report_pdf.py
    ├── build_styled_pdf.py
    ├── generate_and_train_notebook.py
    ├── Enjoyment_Model_Final_Result_Report.html
    ├── Enjoyment_Model_Final_Result_Report.md
    ├── Enjoyment_Model_Final_Result_Report.pdf
    ├── Train_Enjoyment_Model_J26_IT339.html
    ├── Train_Enjoyment_Model_J26_IT339.ipynb
    ├── Train_Enjoyment_Model_J26_IT339.pdf
    ├── Train_Enjoyment_Model_J26_IT339_styled.html
    ├── TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf
    └── evaluation_results/
        ├── actual_vs_predicted.png
        ├── archetype_enjoyment_distribution.png
        ├── feature_importance.png
        ├── kfold_cross_validation.png
        └── residual_distribution.png
```

## Testing and quality checks

Run the frontend lint and production build:

```bash
cd client
npm run lint
npm run build
```

Build the Express server:

```bash
cd server
npm run build
```

Run the FastAPI tests:

```bash
cd backend_fastapi
venv\Scripts\activate
python -m pytest
```

## Research and model artifacts

Generated reports, notebooks, metrics, and evaluation plots are stored in `notebooks/`. The trained model and its metrics are stored in `backend_fastapi/models/`.


## 👥 Contributors

- Component lead: A.A.S.P Adhikari
- **my Contributor ** — [IT23399556RMO/J26-IT-339](https://github.com/IT23399556RMO/J26-IT-339/tree/com3-feature-itenerary)
- Project repository: [IT23399556RMO/J26-IT-339](https://github.com/IT23399556RMO/J26-IT-339)


This component is part of the TravelMate research project (J26-IT339) at SLIIT.
