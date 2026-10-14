@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto prerequisites
where npm >nul 2>nul
if errorlevel 1 goto prerequisites
where cargo >nul 2>nul
if errorlevel 1 goto prerequisites
where rustup >nul 2>nul
if errorlevel 1 goto prerequisites
call rustup show active-toolchain | findstr /i "msvc" >nul
if errorlevel 1 goto prerequisites
call npm ci
if errorlevel 1 goto failed
call npm test
if errorlevel 1 goto failed
call npm run check:config
if errorlevel 1 goto failed
call npm run windows -- --target x86_64-pc-windows-msvc
if errorlevel 1 goto failed
if not exist "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\*.exe" goto failed
echo.
echo Installer gereed. De uitvoermap wordt geopend.
explorer "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis"
pause
exit /b 0
:prerequisites
echo Installeer Node.js 24 LTS, Rust met MSVC en Microsoft C++ Build Tools.
echo Kies bij Build Tools: Desktop development with C++ en Windows SDK.
echo Lees WINDOWS_START.txt en start daarna deze computer opnieuw.
pause
exit /b 1
:failed
echo De Windows-build is mislukt. Lees de foutmelding hierboven.
echo Er wordt geen ongecontroleerd installatiebestand uitgeleverd.
pause
exit /b 1
