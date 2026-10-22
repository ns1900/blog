@echo off
cd /d "%~dp0"
title Nanguazhen - Local Preview

echo.
echo   ================================================
echo      Nanguazhen - Local Preview
echo   ================================================
echo.
echo   Homepage:   http://localhost:4321
echo   Admin:      http://localhost:4321/admin
echo.
echo   Browser will open automatically (takes ~6s).
echo   If not, copy the admin URL above into your browser.
echo.
echo   * Keep this window open. Closing it stops the site.
echo.
echo   ================================================
echo.

rem Open admin page after 6 seconds (wait for dev server)
start "" /b cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:4321/admin"

call npm run dev
pause
