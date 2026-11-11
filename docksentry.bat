@echo off
setlocal enabledelayedexpansion
title DOCKSENTRY Desktop
echo ========================================================
echo       DOCKSENTRY - Autonomous Docker Security
echo ========================================================
echo.

REM 1. Check if backend API server is already running on :8000
netstat -ano | findstr ":8000" > nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Backend API Engine is already running on :8000.
) else (
    echo [*] Starting Backend Engine...
    if exist "backend\.venv\bin\python.exe" (
        start /B "" "backend\.venv\bin\python.exe" backend\run.py
    ) else (
        start /B "" python backend\run.py
    )
)

REM 2. Check if Vite Dev Server is running on :5173
netstat -ano | findstr ":5173" > nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Frontend server is already active on :5173.
    set TARGET_URL=http://localhost:5173
) else (
    REM If frontend dist exists, port 8000 serves the full app
    if exist "frontend\dist\index.html" (
        echo [✓] Production bundle detected. Serving via port :8000.
        set TARGET_URL=http://127.0.0.1:8000
    ) else (
        echo [*] Starting Vite Frontend Server...
        cd frontend
        start /B "" npm.cmd run dev
        cd ..
        set TARGET_URL=http://localhost:5173
    )
)

echo [*] Opening DOCKSENTRY application window...
timeout /t 1 /nobreak > nul

REM 3. Launch in standalone App Window Mode if Brave/Edge/Chrome exists, else open default browser tab
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --app=%TARGET_URL%
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=%TARGET_URL%
) else (
    start %TARGET_URL%
)

echo [✓] DOCKSENTRY is now active at %TARGET_URL%
