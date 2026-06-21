// ============================================================
//   BantouMind AI - Webhook Server
//   Reçoit les notifications de paiement Chariow (Pulses)
//   et les affiche dans le terminal + sauvegarde dans un fichier
// ============================================================
//   Usage : node webhook-server.js
//   URL à mettre dans Chariow : http://TON_IP:3000/webhook
//   Dashboard Chariow → Settings → Pulses → Add Pulse
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const WEBHOOK_SECRET = 'bantoumind_secret_2024'; // Change ce mot de passe si tu veux

// ===== Fichier de log des ventes =====
const LOG_FILE = path.join(__dirname, 'sales-log.json');

function appendToLog(data) {
  let logs = [];
  try {
    if (fs.existsSync(LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
  } catch(e) { /* le fichier sera créé */ }
  
  logs.push({
    received_at: new Date().toISOString(),
    event: data
  });
  
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

// ===== Créer le serveur =====
const server = http.createServer((req, res) => {
  // Autoriser les requêtes de n'importe où (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Gérer les requêtes OPTIONS (pré-vérification CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  // ===== Route : Accueil =====
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>BantouMind Webhook</title>
      <style>
        body{font-family:sans-serif;background:#0a0a1a;color:#fff;padding:40px;text-align:center}
        h1{color:#6c3fff}
        .status{color:#00d4aa;font-size:24px;margin:20px 0}
        code{background:#1a1a3e;padding:10px 20px;border-radius:8px;display:inline-block;margin:10px 0}
        .url{color:#a0a0c0;font-size:14px;margin-top:30px}
        a{color:#6c3fff}
      </style>
      </head>
      <body>
        <h1>🚀 BantouMind AI</h1>
        <div class="status">✅ Webhook Server ACTIF</div>
        <code>POST /webhook</code>
        <div class="url">
          URL à mettre dans Chariow :<br>
          <strong>http://TON_IP:${PORT}/webhook</strong>
        </div>
        <p style="margin-top:30px;color:#8080a0;font-size:13px;">
          📋 Les ventes sont sauvegardées dans <code>sales-log.json</code>
        </p>
      </body>
      </html>
    `);
    return;
  }

  // ===== Route : Voir les logs =====
  if (req.method === 'GET' && req.url === '/logs') {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Aucune vente reçue pour le moment' }));
      }
    } catch(e) {
      res.writeHead(500).end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ===== Route : Webhook (pour Chariow) =====
  if (req.method === 'POST' && req.url.startsWith('/webhook?')) {
    // Vérifier le token de sécurité
    const params = new URLSearchParams(req.url.split('?')[1]);
    if (params.get('token') !== WEBHOOK_SECRET) {
      console.warn('⚠️  Token invalide, requête ignorée');
      res.writeHead(403).end(JSON.stringify({ error: 'Invalid token' }));
      return;
    }
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Afficher la notification dans le terminal
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   🔔 NOTIFICATION CHARIOW REÇUE !       ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('📅 Date :', new Date().toLocaleString('fr-FR'));
        console.log('📦 Événement :', data.event || data.type || 'Vente');
        console.log('');
        
        // Afficher les infos de la vente
        if (data.data) {
          const sale = data.data;
          console.log('💰 PRODUIT :', sale.product_name || sale.product || 'N/A');
          console.log('💵 MONTANT :', sale.amount ? `${sale.amount} ${sale.currency || 'USD'}` : 'N/A');
          console.log('👤 CLIENT :', sale.customer_name || sale.customer?.name || 'N/A');
          console.log('📧 EMAIL :', sale.customer_email || sale.customer?.email || 'N/A');
          console.log('🔑 LICENSE :', sale.license_key || 'N/A');
        } else {
          console.log('📦 Données :', JSON.stringify(data, null, 2));
        }
        
        console.log('');
        console.log('────────────────────────────────────────────');
        console.log('');
        
        // Sauvegarder dans le fichier de log
        appendToLog(data);
        
        // Répondre à Chariow
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'success', received: true }));
        
      } catch (e) {
        console.error('❌ Erreur de parsing JSON:', e.message);
        console.error('📩 Données reçues:', body);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
    return;
  }

  // ===== 404 =====
  res.writeHead(404).end('Not found');
});

// ===== Démarrer le serveur =====
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🚀 BANTOUMIND WEBHOOK SERVER          ║');
  console.log('║   Prêt à recevoir les notifications     ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 URL du serveur :`);
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log(`🔗 URL à mettre dans Chariow (Pulses) :`);
  console.log(`   http://TON_ADRESSE_IP:${PORT}/webhook`);
  console.log('');
  console.log(`📋 Pour voir les ventes :`);
  console.log(`   http://localhost:${PORT}/logs`);
  console.log('');
  console.log('⏳ En attente de notifications...');
  console.log('');
});
