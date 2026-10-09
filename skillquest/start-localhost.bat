@echo off
cd /d "%~dp0"
echo Starting SkillQuest at http://localhost:8000
echo Keep this window open while you use the site. Press Ctrl+C to stop.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run the local server. Install Node.js and try again.
  pause
  exit /b 1
)
node server.js
pause
