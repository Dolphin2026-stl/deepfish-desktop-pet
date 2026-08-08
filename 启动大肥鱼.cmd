@echo off
setlocal

for %%I in ("%~dp0.") do set "PROJECT_DIR=%%~fI"
set "ELECTRON_EXE=%PROJECT_DIR%\node_modules\electron\dist\electron.exe"
cd /d "%PROJECT_DIR%"

if /I "%DEEPFISH_LAUNCHER_DRY_RUN%"=="1" (
  echo PROJECT_DIR=%PROJECT_DIR%
  echo ELECTRON_EXE=%ELECTRON_EXE%
  exit /b 0
)

if not exist "%ELECTRON_EXE%" (
  where npm.cmd >nul 2>nul
  if errorlevel 1 (
    echo Node.js and npm were not found. Install Node.js 20 or newer first.
    pause
    exit /b 1
  )

  echo Installing DeepFish Pet dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed. Check the messages above and try again.
    pause
    exit /b 1
  )
)

start "" "%ELECTRON_EXE%" "%PROJECT_DIR%"
if errorlevel 1 (
  echo DeepFish Pet failed to start.
  pause
  exit /b 1
)

endlocal
exit /b 0
