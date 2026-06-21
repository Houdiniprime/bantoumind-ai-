#!/bin/bash
# ============================================================
#   BantouMind AI - Webhook + Cloudflare Tunnel Launcher
#   Lance le serveur webhook et le tunnel HTTPS public
#   Usage : bash start-webhook.sh
# ============================================================

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🚀 BANTOUMIND WEBHOOK LAUNCHER         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Nettoyer les processus en sortant
cleanup() {
    echo ""
    echo "🛑 Arrêt du serveur webhook..."
    kill $WEBHOOK_PID 2>/dev/null || true
    echo "✅ Arrêté"
}
trap cleanup EXIT INT TERM

# Vérifier/installer cloudflared
if ! command -v cloudflared &> /dev/null; then
    if [ -f "./cloudflared" ]; then
        echo "✅ cloudflared trouvé localement"
        CLOUDFLARED="./cloudflared"
    else
        echo "📥 Téléchargement de cloudflared..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            curl -L -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64
        else
            curl -L -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
        fi
        chmod +x cloudflared
        CLOUDFLARED="./cloudflared"
        echo "✅ cloudflared téléchargé"
    fi
else
    CLOUDFLARED="cloudflared"
    echo "✅ cloudflared trouvé dans le PATH"
fi

# Vérifier que le serveur webhook n'est pas déjà lancé
echo "🔍 Vérification du serveur webhook..."
if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Serveur webhook déjà actif sur http://localhost:3000"
else
    echo "📡 Démarrage du serveur webhook..."
    node webhook-server.js &
    WEBHOOK_PID=$!
    sleep 2
    echo "✅ Serveur webhook démarré (PID: $WEBHOOK_PID)"
fi

echo ""
echo "🔗 Connexion au tunnel Cloudflare..."
echo ""
echo "⚠️  Laisse ce terminal ouvert pour recevoir les notifications"
echo "   Appuie sur Ctrl+C pour arrêter"
echo ""

# Lancer le tunnel Cloudflare
$CLOUDFLARED tunnel --url http://localhost:3000
