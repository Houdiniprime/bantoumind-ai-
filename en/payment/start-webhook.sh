#!/bin/bash
# ============================================================
#   BantouMind AI - Webhook + Tunnel Launcher
#   Lance le serveur webhook et le tunnel HTTPS public
#   Usage : bash start-webhook.sh
# ============================================================

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🚀 BANTOUMIND WEBHOOK LAUNCHER         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Lancer le serveur webhook
cd "$(dirname "$0")"
echo "📡 Démarrage du serveur webhook..."
node webhook-server.js &
WEBHOOK_PID=$!
sleep 2

# Vérifier que le serveur tourne
if curl -s -o /dev/null -w "" http://localhost:3000/ 2>/dev/null; then
    echo "✅ Serveur webhook actif sur http://localhost:3000"
else
    echo "❌ Erreur : le serveur webhook n'a pas démarré"
    exit 1
fi

echo ""
echo "🔗 Connexion au tunnel HTTPS public..."
echo ""

# Lancer le tunnel HTTPS via localhost.run
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 nokey@localhost.run 2>&1

echo ""
echo "⚠️  Le tunnel est fermé."
echo "   Pour le relancer : bash start-webhook.sh"
echo ""
