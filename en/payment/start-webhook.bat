@echo off
chcp 65001 >nul
title BantouMind AI - Webhook Server

echo.
echo ╔══════════════════════════════════════════╗
echo ║   🚀 BANTOUMIND AI WEBHOOK              ║
echo ║   Serveur de notification de paiements   ║
echo ╚══════════════════════════════════════════╝
echo.

:: Aller dans le dossier du script
cd /d "%~dp0"

:: Vérifier que cloudflared existe
if not exist "cloudflared.exe" (
    echo 📥 Téléchargement de cloudflared...
    curl -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    if errorlevel 1 (
        echo ❌ Erreur de téléchargement. Télécharge-le manuellement :
        echo    https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
        pause
        exit /b 1
    )
    echo ✅ cloudflared installé
)

:: Vérifier que le serveur webhook n'est pas déjà lancé
echo 🔍 Vérification du serveur webhook...
curl -s -o nul http://localhost:3000/ 2>nul
if %errorlevel% equ 0 (
    echo ✅ Serveur webhook déjà actif sur http://localhost:3000
) else (
echo 📡 Démarrage du serveur webhook...
start /b node webhook-server.js
timeout /t 3 /nobreak >nul
echo ✅ Serveur webhook démarré
)

echo.
echo 🔗 Connexion au tunnel Cloudflare...
echo.
echo ⚠️  Laisse cette fenêtre ouverte tant que tu veux recevoir les notifications
echo.
echo 📋 Appuie sur Ctrl+C pour arrêter le tunnel
echo.

:: Lancer le tunnel Cloudflare
cloudflared tunnel --url http://localhost:3000

echo.
echo ⚠️  Tunnel fermé. Arrêt du serveur webhook...
taskkill /f /im node.exe /fi "WINDOWTITLE eq node webhook-server.js" 2>nul || true
echo ✅ Serveur webhook arrêté
echo.
pause
