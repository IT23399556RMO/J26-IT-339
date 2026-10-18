"""
FastAPI Backend Application Entrypoint
Research Project ID: J26-IT339
Component 3: AI-Based Adaptive and Explainable Itinerary Optimization System for Foreign Tourists in Sri Lanka
"""

import sys
import os

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend_fastapi.api.routes_itinerary import router as itinerary_router
from backend_fastapi.api.routes_attractions import router as attractions_router
from backend_fastapi.api.routes_models import router as models_router

app = FastAPI(
    title="AI-Based Adaptive & Explainable Itinerary Optimization API",
    description=(
        "Backend Decision Support System for Foreign Tourists in Sri Lanka (Project J26-IT339 - Component 3). "
        "Integrates Random Forest Sentiment Prediction, Deep Q-Network (DQN) with Action-Masking, "
        "and Sub-Second Dynamic Re-Planning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration allowing frontend Next.js application access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(itinerary_router, prefix="/api/v1")
app.include_router(attractions_router, prefix="/api/v1")
app.include_router(models_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "project": "AI-Based Adaptive and Explainable Itinerary Optimization System",
        "project_id": "J26-IT339",
        "author": "A.A.S.P. Adhikari - IT23286900",
        "component": "Component 3 (Itinerary Optimization)",
        "status": "Operational",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI AI Optimization Gateway",
        "python_version": sys.version,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_fastapi.main:app", host="0.0.0.0", port=8000, reload=True)
