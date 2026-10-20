"""
Supervised Enjoyment Prediction Model Training Pipeline
Research Project ID: J26-IT339 - Component 3
Trains a Random Forest Regressor on the complete validated TripAdvisor reviews dataset
(16,156 reviews / 48,468 archetype-stratified samples across Sri Lanka destinations)
to predict personalized tourist enjoyment (1-5 scale) with MAE <= 0.70.
"""

import sys
import os
import re
import json
import joblib

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DATA_PATH = os.path.join(BASE_DIR, "data", "tourism_master_validated.csv")
JSON_DATA_PATH = os.path.join(BASE_DIR, "data", "attractions_dataset.json")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_OUTPUT_PATH = os.path.join(MODEL_DIR, "enjoyment_model.pkl")
METRICS_OUTPUT_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

CATEGORY_MAPPING = {
    "Religious Sites": "Cultural",
    "Historic Sites": "Heritage",
    "Museums": "Heritage",
    "National Parks": "Wildlife",
    "Nature & Wildlife Areas": "Wildlife",
    "Waterfalls": "Nature",
    "Gardens": "Nature",
    "Bodies of Water": "Nature",
    "Beaches": "Beaches",
    "Farms": "Culinary",
    "Zoological Gardens": "Wildlife",
}


def clean_origin_country(loc_str: str) -> str:
    """Extracts and standardizes country of origin from TripAdvisor user location strings."""
    if not isinstance(loc_str, str) or not loc_str.strip():
        return "International"
    parts = loc_str.split(",")
    country = parts[-1].strip()
    country = re.sub(r"[^\w\s]", "", country).strip()

    # Normalize common abbreviations and territories
    if country in ["UK", "England", "Scotland", "Wales"]:
        country = "United Kingdom"
    elif country in ["USA", "US", "United States of America", "California", "Texas", "Florida", "New York"]:
        country = "United States"
    elif country in ["UAE", "Dubai", "Abu Dhabi"]:
        country = "United Arab Emirates"
    elif country in ["Holland"]:
        country = "The Netherlands"
    elif not country:
        country = "International"

    return country


def estimate_foreigner_fee_usd(location_name: str, category: str) -> float:
    """Translates destination name and category to standard foreigner admission fee in USD."""
    loc_lower = str(location_name).lower()
    if any(k in loc_lower for k in ["sigiriya", "polonnaruwa", "anuradhapura"]):
        return 30.0
    elif any(k in loc_lower for k in ["national park", "safari", "minneriya", "yala", "wilpattu", "horton plains", "kumana", "kaudulla", "bundala"]):
        return 25.0
    elif any(k in loc_lower for k in ["temple", "vihara", "sacred tooth", "dambulla", "koneswaram", "dagaba", "stupa"]):
        return 12.0
    elif any(k in loc_lower for k in ["museum"]):
        return 10.0
    elif any(k in loc_lower for k in ["botanic", "garden"]):
        return 10.0
    elif any(k in loc_lower for k in ["tea factory", "tea museum", "tea estate", "farm", "ambewela"]):
        return 6.0
    elif any(k in loc_lower for k in ["beach", "falls", "lake"]):
        return 0.0
    else:
        fee_map = {
            "Heritage": 20.0,
            "Wildlife": 25.0,
            "Cultural": 10.0,
            "Nature": 5.0,
            "Culinary": 5.0,
            "Beaches": 0.0,
            "Adventure": 15.0,
        }
        return fee_map.get(category, 5.0)


def rating_to_vader_compound(rating: float) -> float:
    """Calibrates 1-5 TripAdvisor star rating to normalized VADER compound sentiment range [-1.0, 1.0]."""
    mapping = {5: 0.88, 4: 0.62, 3: 0.15, 2: -0.40, 1: -0.78}
    return mapping.get(int(rating), 0.50)


def load_dataset() -> pd.DataFrame:
    """
    Loads and preprocesses training data.
    Prioritizes the master validated CSV dataset (16,156 raw reviews -> 48,468 archetype records).
    Falls back to synthetic generation from attractions_dataset.json if CSV is unavailable.
    """
    if os.path.exists(CSV_DATA_PATH):
        print(f"Loading master validated reviews from: {CSV_DATA_PATH}")
        df_raw = pd.read_csv(CSV_DATA_PATH)
        print(f"Loaded {len(df_raw)} validated TripAdvisor review records.")

        records = []
        archetypes = ["solo", "couple", "family"]

        for _, row in df_raw.iterrows():
            loc_type = str(row.get("Location_Type", "")).strip()
            loc_name = str(row.get("Location_Name", "Sri Lanka Destination")).strip()
            
            # Map category, designating high-intensity natural sites as Adventure where applicable
            if "Waterfalls" in loc_type or any(k in loc_name.lower() for k in ["summit", "rock", "hiking", "trail", "falls"]):
                category = "Adventure" if any(k in loc_name.lower() for k in ["falls", "summit", "trail"]) else CATEGORY_MAPPING.get(loc_type, "Nature")
            else:
                category = CATEGORY_MAPPING.get(loc_type, "Cultural")

            dwell = int(row["visit_duration_min"]) if pd.notnull(row.get("visit_duration_min")) else 90
            country = clean_origin_country(row.get("User_Location", ""))
            rating = float(row["Rating"]) if pd.notnull(row.get("Rating")) else 4.0
            vader = rating_to_vader_compound(rating)
            fee = estimate_foreigner_fee_usd(loc_name, category)

            solo_score = float(row["solo_enjoyment"]) if pd.notnull(row.get("solo_enjoyment")) else 4.0
            couple_score = float(row["couple_enjoyment"]) if pd.notnull(row.get("couple_enjoyment")) else 4.2
            family_score = float(row["family_enjoyment"]) if pd.notnull(row.get("family_enjoyment")) else 4.1

            # Detect primary archetype from text heuristics
            text = (str(row.get("Title", "")) + " " + str(row.get("Text", ""))).lower()
            if any(w in text for w in ["family", "kids", "children", "son", "daughter", "parents"]):
                primary_arch = "family"
            elif any(w in text for w in ["couple", "husband", "wife", "honeymoon", "partner", "romantic", "anniversary"]):
                primary_arch = "couple"
            elif any(w in text for w in ["solo", "alone", "myself", "backpacking", "single"]):
                primary_arch = "solo"
            else:
                primary_arch = None

            for arch in archetypes:
                if arch == "solo":
                    base = solo_score
                    is_match = (primary_arch == "solo")
                elif arch == "couple":
                    base = couple_score
                    is_match = (primary_arch == "couple")
                else:
                    base = family_score
                    is_match = (primary_arch == "family")

                # Target enjoyment score: 60% archetype destination baseline + 40% individual rating
                target_score = 0.60 * base + 0.40 * rating
                if is_match:
                    target_score += 0.05
                target_score = max(1.0, min(5.0, round(target_score, 3)))

                records.append({
                    "category": category,
                    "traveler_type": arch,
                    "origin_country": country,
                    "vader_sentiment": round(vader, 3),
                    "foreigner_fee_usd": float(fee),
                    "typical_dwell_minutes": int(dwell),
                    "enjoyment_score": target_score,
                })

        # Also inject baseline JSON attraction entries to ensure full category coverage
        if os.path.exists(JSON_DATA_PATH):
            with open(JSON_DATA_PATH, "r", encoding="utf-8") as f:
                json_attractions = json.load(f)
            for a in json_attractions:
                for arch in archetypes:
                    base = a["solo_score"] if arch == "solo" else (a["couple_score"] if arch == "couple" else a["family_score"])
                    records.append({
                        "category": a["category"],
                        "traveler_type": arch,
                        "origin_country": "United Kingdom",
                        "vader_sentiment": float(a.get("vader_sentiment", 0.92)),
                        "foreigner_fee_usd": float(a.get("foreigner_fee_usd", 20.0)),
                        "typical_dwell_minutes": int(a.get("typical_dwell_minutes", 90)),
                        "enjoyment_score": round(base, 3),
                    })

        return pd.DataFrame(records)

    else:
        # Fallback to synthetic data generation
        print(f"Warning: Master CSV not found at {CSV_DATA_PATH}. Falling back to synthetic generation.")
        with open(JSON_DATA_PATH, "r", encoding="utf-8") as f:
            attractions = json.load(f)

        np.random.seed(42)
        archetypes = ["solo", "couple", "family"]
        origins = ["United Kingdom", "Germany", "France", "Australia", "United States", "India", "Netherlands"]

        records = []
        for _ in range(5000):
            attraction = np.random.choice(attractions)
            archetype = np.random.choice(archetypes, p=[0.25, 0.45, 0.30])
            origin = np.random.choice(origins)
            base = attraction["solo_score"] if archetype == "solo" else (attraction["couple_score"] if archetype == "couple" else attraction["family_score"])
            vader = max(-1.0, min(1.0, float(attraction["vader_sentiment"]) + np.random.normal(0, 0.05)))
            noise = np.random.normal(0, 0.25)
            true_enjoyment = max(1.0, min(5.0, round(base + (vader - 0.9) * 1.2 + noise, 2)))

            records.append({
                "category": attraction["category"],
                "traveler_type": archetype,
                "origin_country": origin,
                "vader_sentiment": round(vader, 3),
                "foreigner_fee_usd": attraction["foreigner_fee_usd"],
                "typical_dwell_minutes": attraction["typical_dwell_minutes"],
                "enjoyment_score": true_enjoyment,
            })

        return pd.DataFrame(records)


def train_model():
    """
    Executes feature engineering, 5-fold cross validation,
    Random Forest training, and metrics serialization.
    """
    print("=" * 70)
    print("[TRAINING] Supervised Random Forest Enjoyment Regressor (J26-IT339)")
    print("=" * 70)

    df = load_dataset()
    print(f"Prepared Training Dataset: {len(df):,} samples.")
    print(f"Categories ({df['category'].nunique()}): {sorted(df['category'].unique())}")
    print(f"Archetypes: {sorted(df['traveler_type'].unique())}")
    print(f"Countries: {df['origin_country'].nunique()} unique international origins.")

    features = [
        "category",
        "traveler_type",
        "origin_country",
        "vader_sentiment",
        "foreigner_fee_usd",
        "typical_dwell_minutes",
    ]
    target = "enjoyment_score"

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    categorical_features = ["category", "traveler_type", "origin_country"]
    numerical_features = ["vader_sentiment", "foreigner_fee_usd", "typical_dwell_minutes"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numerical_features),
        ]
    )

    rf_model = RandomForestRegressor(
        n_estimators=120,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", rf_model),
    ])

    # 5-fold Cross-Validation
    print("\nExecuting 5-Fold Cross Validation on 80% Training Split...")
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = -cross_val_score(
        pipeline, X_train, y_train, cv=kfold, scoring="neg_mean_absolute_error", n_jobs=-1
    )
    cv_mae = float(np.mean(cv_scores))
    print(f"5-Fold CV MAE: {cv_mae:.4f} (Target <= 0.70: {'PASSED [OK]' if cv_mae <= 0.70 else 'FAILED'})")

    # Fit pipeline
    print("Fitting Random Forest Pipeline on Training Set...")
    pipeline.fit(X_train, y_train)

    # Evaluate on test split (unseen 20%)
    preds = pipeline.predict(X_test)
    test_mae = float(mean_absolute_error(y_test, preds))
    test_mse = float(mean_squared_error(y_test, preds))
    test_rmse = float(np.sqrt(test_mse))
    test_r2 = float(r2_score(y_test, preds))

    print("\n--- Model Evaluation on Unseen 20% Test Split ---")
    print(f"MAE:       {test_mae:.4f} (Proposal Target: <= 0.70) -> {'PASSED [OK]' if test_mae <= 0.70 else 'FAILED'}")
    print(f"RMSE:      {test_rmse:.4f}")
    print(f"R-squared: {test_r2:.4f}")

    # Baseline comparison (Greedy mean baseline)
    mean_baseline_preds = np.full_like(y_test, y_train.mean())
    baseline_mae = float(mean_absolute_error(y_test, mean_baseline_preds))
    improvement_pct = ((baseline_mae - test_mae) / baseline_mae) * 100.0
    print(f"Greedy Baseline MAE:       {baseline_mae:.4f}")
    print(f"Improvement over Baseline: {improvement_pct:.1f}%")

    # Save model artifact
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"\nTrained Model Artifact saved to: {MODEL_OUTPUT_PATH}")

    metrics = {
        "model_name": "Random Forest Regressor (Validated TripAdvisor Dataset)",
        "project_id": "J26-IT339",
        "dataset_source": "Tourism_Master_Validated.csv",
        "total_records": len(df),
        "test_mae": round(test_mae, 4),
        "target_mae": 0.70,
        "is_target_met": bool(test_mae <= 0.70),
        "cv_mae": round(cv_mae, 4),
        "test_rmse": round(test_rmse, 4),
        "test_r2": round(test_r2, 4),
        "baseline_mae": round(baseline_mae, 4),
        "improvement_pct": round(improvement_pct, 2),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "hyperparameters": {
            "n_estimators": 120,
            "max_depth": 16,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
        },
    }

    with open(METRICS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"Metrics serialized to: {METRICS_OUTPUT_PATH}")
    print("=" * 70)
    return pipeline, metrics


if __name__ == "__main__":
    train_model()
