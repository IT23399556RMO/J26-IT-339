"""
Convenience Launcher for the FastAPI Backend
Runs uvicorn on port 8000
"""

import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add workspace directory to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn

if __name__ == "__main__":
    print("================================================================")
    print("🚀 Starting FastAPI Server for Component 3 (Project J26-IT339)")
    print("📡 Swagger Docs: http://localhost:8000/docs")
    print("📡 API Endpoint: http://localhost:8000/api/v1/itinerary/optimize")
    print("================================================================")
    uvicorn.run("backend_fastapi.main:app", host="127.0.0.1", port=8000, log_level="info")
