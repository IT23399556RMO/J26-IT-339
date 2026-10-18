"""
Attractions Knowledge Base API Routes
Endpoints:
- GET /api/v1/attractions
- GET /api/v1/attractions/{attraction_id}
"""

import json
import os
from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter(prefix="/attractions", tags=["Attractions Knowledge Base"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "attractions_dataset.json")


def load_attractions():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("")
async def get_all_attractions(category: Optional[str] = None):
    """
    Returns curated destination knowledge base with coordinates,
    operational hours, entrance costs (USD), dwell times, and amenities.
    """
    attractions = load_attractions()
    if category:
        attractions = [a for a in attractions if a["category"].lower() == category.lower()]
    return {
        "success": True,
        "count": len(attractions),
        "data": attractions,
    }


@router.get("/{attraction_id}")
async def get_attraction_by_id(attraction_id: str):
    """Returns single destination operational details."""
    attractions = load_attractions()
    match = next((a for a in attractions if a["id"] == attraction_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Attraction not found")
    return {"success": True, "data": match}
