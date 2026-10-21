@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 南瓜镇 · 本地预览

echo.
echo   ================================================
echo      南瓜镇 - 本地预览
echo   ================================================
echo.
echo   站点首页：  http://localhost:4321
echo   写文章：    http://localhost:4321/admin
echo.
echo   浏览器会自动打开，如果没打开请手动复制上面的地址。
echo.
echo   * 这个黑窗口不要关，关了网站就停了。
echo   * 用完后直接关闭这个窗口即可。
echo.
echo   ================================================
echo.

rem 延迟 6 秒后自动打开后台页面（等服务器起来）
start "" /b cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:4321/admin"

call npm run dev
pause
