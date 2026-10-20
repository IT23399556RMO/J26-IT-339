@echo off
title TravelMate - J26-IT-339 Runner
chcp 65001 >nul
cls

echo ========================================================
echo       Starting TravelMate System (Project J26-IT-339)
echo ========================================================
echo.

set "PROJECT_DIR=%~dp0"

REM Resolve Python interpreter
set "PYTHON_EXE=python"
if exist "C:\Python314\python.exe" (
    set "PYTHON_EXE=C:\Python314\python.exe"
) else if exist "%PROJECT_DIR%backend_fastapi\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%PROJECT_DIR%backend_fastapi\venv\Scripts\python.exe"
)

echo [1/3] Starting FastAPI AI Backend (Port 8000)...
start "TravelMate - FastAPI Backend (:8000)" /D "%PROJECT_DIR%backend_fastapi" cmd /k ""%PYTHON_EXE%" run_server.py"

echo [2/3] Starting Express Auth/Data Server (Port 5001)...
start "TravelMate - Express Server (:5001)" /D "%PROJECT_DIR%server" cmd /k "npm run dev"

echo [3/3] Starting Next.js Frontend Client (Port 3000)...
start "TravelMate - Next.js Client (:3000)" /D "%PROJECT_DIR%client" cmd /k "npm run dev"

echo.
echo ========================================================
echo All services launched!
echo - Frontend:  http://localhost:3000
echo - Express:   http://localhost:5001
echo - FastAPI:   http://localhost:8000 (Docs: http://localhost:8000/docs)
echo ========================================================
ping 127.0.0.1 -n 6 >nul
start http://localhost:3000
