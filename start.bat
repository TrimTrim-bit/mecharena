@echo off
title MECH ARENA
cd /d "%~dp0"
call project-extras\start.bat
exit /b %errorlevel%
