@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Nanguazhen - Publish

echo ==========================================
echo    Nanguazhen - Publish to GitHub
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] git not found. Install Git for Windows.
    pause
    exit /b 1
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
    echo [!] No remote configured. Setting up now...
    git remote add origin git@github.com:ns1900/blog.git
    echo [OK] Remote set to github.com/ns1900/blog
    echo.
)

git add -A

set "MSG="
set /p MSG=What changed? (Enter = default): 
if "!MSG!"=="" set "MSG=Update site content"

git -c user.name="NS" -c user.email="ns@ns1900.com" commit -m "!MSG!" >nul 2>nul
if errorlevel 1 (
    echo [i] No new changes detected.
) else (
    echo [OK] Changes committed.
)

echo.
echo Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. Check:
    echo   1. Network connection
    echo   2. SSH key still on GitHub: https://github.com/settings/keys
    echo   3. Remote URL: git remote -v
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   [OK] Pushed successfully!
echo   Vercel rebuilds in 30-60 seconds.
echo   Dashboard: https://vercel.com/dashboard
echo   Site:      https://ns1900.com
echo ==========================================
echo.
pause
