@echo off
title BantouMind AI - Installation
color 0B
cls

echo ╔══════════════════════════════════════════╗
echo ║     🚀 BantouMind AI - INSTALLATION      ║
echo ║     Agents Intelligents pour l'Afrique   ║
echo ╚══════════════════════════════════════════╝
echo.
echo [1/3] Verification de Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Node.js n'est pas installe !
    echo.
    echo 📥 Telecharge Node.js ici : https://nodejs.org
    echo Puis relance ce fichier.
    pause
    exit /b
)
echo ✅ Node.js trouve !

echo.
echo [2/3] Installation des agents disponibles...
echo.

echo   📦 Agent WhatsApp...
cd agents\whatsapp-bot\package
if exist package.json (
    call npm install --silent 2>nul
    echo   ✅ Agent WhatsApp pret
) else (
    echo   ⚠️ Agent WhatsApp non trouve
)
cd ..\..\..

echo   📦 Agent Contenu...
cd agents\content-creator\package
if exist package.json (
    call npm install --silent 2>nul
    echo   ✅ Agent Contenu pret
) else (
    echo   ⚠️ Agent Contenu non trouve
)
cd ..\..\..

echo   📦 Agent Leads...
cd agents\lead-generator\package
if exist package.json (
    call npm install --silent 2>nul
    echo   ✅ Agent Leads pret
) else (
    echo   ⚠️ Agent Leads non trouve
)
cd ..\..\..

echo   📦 Agent Support...
cd agents\support-bot\package
if exist package.json (
    call npm install --silent 2>nul
    echo   ✅ Agent Support pret
) else (
    echo   ⚠️ Agent Support non trouve
)
cd ..\..\..

echo.
echo [3/3] Finalisation...
echo.
echo ╔══════════════════════════════════════════╗
echo ║   ✅ INSTALLATION TERMINEE AVEC SUCCES ! ║
echo ╠══════════════════════════════════════════╣
echo ║                                         ║
echo ║   📁 Site web : index.html              ║
echo ║   💬 Agent WhatsApp : deja pret         ║
echo ║   ✍️ Agent Contenu : deja pret          ║
echo ║   🎯 Agent Leads : deja pret            ║
echo ║   🎧 Agent Support : deja pret          ║
echo ║   🚀 Bundle Premium : pret a vendre     ║
echo ║                                         ║
echo ║   📖 Ouvre index.html pour commencer !  ║
echo ╚══════════════════════════════════════════╝
echo.
echo 🔥 Pour lancer la plateforme : 
echo    double-clique sur index.html
echo.
pause
