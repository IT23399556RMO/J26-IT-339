from typing import Union, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

# Initialize the FastAPI application
app = FastAPI(title="TravelMate Environmental Suitability API")

# Global variable to hold the model in RAM
model = None

# Define the strict 13-feature data contract required by the SST evaluation panel
class InferencePayload(BaseModel):
    # Core Meteorological Variables (ERA5)
    temperature_2m: float
    relative_humidity_2m: float
    apparent_temperature: float
    precipitation: float
    cloud_cover: float
    wind_speed_10m: float
    shortwave_radiation: float
    
    # Critical Air Quality Extensions
    pm10: float
    pm2_5: float
    
    # Encoded User Preference Vector
    thermal_tolerance: int
    rain_tolerance: int
    uv_sensitivity: int
    wind_preference: int

def categorize_score(score: float) -> str:
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Moderate"
    else:
        return "Poor"

@app.on_event("startup")
async def load_model():
    """Loads the serialized Joblib/ONNX model into RAM to satisfy the <500ms latency requirement."""
    global model
    try:
        model = joblib.load("models/xgboost_suitability_model.pkl")
        print("Supervised ML Inference Engine loaded successfully into RAM.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load serialized model. {e}")

@app.post("/api/predict/suitability")
async def predict_suitability(payload: Union[InferencePayload, List[InferencePayload]]):
    """
    Translates multi-dimensional atmospheric data and user preferences 
    into an activity-sensitive Suitability Score (0-100).
    Supports single payload object or batch array of payloads.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Inference Engine unavailable.")

    try:
        is_batch = isinstance(payload, list)
        items = payload if is_batch else [payload]
        payload_dicts = [item.dict() for item in items]

        # Align payload features with the model's expected training schema
        expected_features = getattr(model, "feature_names_in_", None)
        if expected_features is not None and len(payload_dicts) > 0:
            aligned_cols = [f for f in expected_features if f in payload_dicts[0]]
            input_data = pd.DataFrame(payload_dicts)[aligned_cols]
        else:
            input_data = pd.DataFrame(payload_dicts)
        
        # Execute the supervised machine learning regression pipeline
        raw_scores = model.predict(input_data)
        
        results = []
        for raw in raw_scores:
            clamped = max(0.0, min(100.0, float(raw)))
            results.append({
                "status": "success",
                "suitability_score": round(clamped, 2),
                "suitability_class": categorize_score(clamped)
            })

        if is_batch:
            return results
        return results[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
