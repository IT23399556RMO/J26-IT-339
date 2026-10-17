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

@app.on_event("startup")
async def load_model():
    """Loads the serialized Joblib/ONNX model into RAM to satisfy the <500ms latency requirement."""
    global model
    try:
        model = joblib.load("models/suitability_rf_model.pkl")
        print("Supervised ML Inference Engine loaded successfully into RAM.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load serialized model. {e}")

@app.post("/api/predict/suitability")
async def predict_suitability(payload: InferencePayload):
    """
    Translates multi-dimensional atmospheric data and user preferences 
    into an activity-sensitive Suitability Score (0-100).
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Inference Engine unavailable.")

    try:
        # Convert the strict Pydantic payload to a Pandas DataFrame
        input_data = pd.DataFrame([payload.dict()])
        
        # Execute the supervised machine learning regression pipeline
        raw_score = model.predict(input_data)[0]
        
        # Clamp score to mathematical boundaries
        score = max(0.0, min(100.0, float(raw_score)))
        
        # Determine discrete categorical class
        if score >= 80:
            suitability_class = "Excellent"
        elif score >= 60:
            suitability_class = "Good"
        elif score >= 40:
            suitability_class = "Moderate"
        else:
            suitability_class = "Poor"
        
        # JSON Data Handoff Payload for Component 3 Routing
        return {
            "status": "success",
            "suitability_score": round(score, 2),
            "suitability_class": suitability_class
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
