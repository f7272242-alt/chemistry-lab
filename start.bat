@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the Node.js LTS version first.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Installing project dependencies. Internet is required for this first setup.
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
if not exist ".env" (
  echo.
  echo AI is not configured yet.
  echo Copy .env.example to .env and enter your API provider settings.
  echo The website can still run, but AI chat will show a configuration message.
  echo.
)
start "Chemistry AI API" cmd /k "node server.js"
echo Starting Chemistry Lab on localhost...
call npm run dev
