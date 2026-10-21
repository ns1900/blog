@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   Nanguazhen - Publish to GitHub
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] git not found. Install Git for Windows: https://git-scm.com/download/win
    pause
    exit /b 1
)

set REPO_OK=0
for /f "delims=" %%i in ('git remote 2^>nul') do (
    if "%%i"=="origin" set REPO_OK=1
)

if "!REPO_OK!"=="0" (
    echo [!] No remote repository configured yet.
    echo.
    echo Create an EMPTY repository on GitHub first, then paste its URL below.
    echo Example: https://github.com/yourname/nanguazhen.git
    echo.
    set /p REPO_URL=Paste repository URL: 
    if "!REPO_URL!"=="" (
        echo Cancelled.
        pause
        exit /b 1
    )
    git remote add origin "!REPO_URL!"
    echo [OK] Remote configured.
    echo.
)

git add -A

echo.
set "MSG="
set /p MSG=What changed? (press Enter for default): 
if "!MSG!"=="" set "MSG=Update site content"

git -c user.name="NS" -c user.email="ns@ns1900.com" commit -m "!MSG!" >nul 2>nul
if errorlevel 1 (
    echo [i] No new changes to commit.
) else (
    echo [OK] Committed.
)

echo.
echo Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. Common causes:
    echo   1. First push needs login: username = GitHub username, password = Personal Access Token
    echo   2. Network issue, try again
    echo   3. Wrong repository URL
    pause
    exit /b 1
)

echo.
echo ============================================
echo   [OK] Pushed successfully!
echo   Vercel will rebuild within 30-60 seconds.
echo   Check progress: https://vercel.com/dashboard
echo ============================================
echo.
pause
