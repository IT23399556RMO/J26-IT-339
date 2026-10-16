@echo off
setlocal
set PATH=C:\src\flutter\bin;%PATH%
echo ========================================================
echo Starting AI Tourism Frontend on http://localhost:3000/
echo ========================================================
cd /d "%~dp0client"
echo Launching Flutter Web Server on port 3000...
call flutter run -d web-server --web-port=3000 --web-hostname=localhost
pause
