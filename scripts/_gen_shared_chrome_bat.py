from pathlib import Path

bat = """@echo off
REM OpenClaw shared browser - dedicated Chrome CDP profile (NOT your personal Chrome)
set PORT=9222
set UDDIR=%LOCALAPPDATA%\\OpenClaw\\ChromeCDP
set CHROME=
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set CHROME=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe
if "%CHROME%"=="" (
  echo Chrome not found.
  pause
  exit /b 1
)
echo Starting dedicated Chrome for Nova shared browser...
echo Profile: %UDDIR%
echo CDP port: %PORT%
start "OpenClawCDP" "%CHROME%" --remote-debugging-port=%PORT% --user-data-dir="%UDDIR%" about:blank
timeout /t 3 /nobreak >nul
echo.
echo === CDP version (must show JSON) ===
curl.exe -sS http://127.0.0.1:%PORT%/json/version
echo.
echo === listeners ===
netstat -ano | findstr :%PORT%
echo.
echo If JSON appeared, tell Nova: chrome up
echo If curl failed, keep this window open and paste the error to Nova.
pause
"""

paths = [
    Path("/home/mrbig3/.openclaw/workspace/scripts/Start-OpenClaw-Shared-Chrome.bat"),
    Path("/mnt/c/Users/jason/AppData/Local/OpenClaw/Start-OpenClaw-Shared-Chrome.bat"),
    Path("/mnt/c/Users/jason/Desktop/Start-OpenClaw-Shared-Chrome.bat"),
]
for p in paths:
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(bat, encoding="utf-8", newline="\r\n")
        print("wrote", p)
    except Exception as e:\n        print("skip", p, e)
