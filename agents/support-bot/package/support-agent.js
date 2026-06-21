// ============================================================
//   BantouMind AI - Support Bot v2.0 (BAILEYS)
//   Support client RÉEL via WhatsApp avec Baileys
//   Install : npm install @whiskeysockets/baileys qrcode-terminal pino
//   Usage   : node support-agent.js (scannez le QR code)
// ============================================================

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');

class BantouMindSupportBot {
  constructor(config = {}) {
    this.config = {
      botName: config.botName || 'BantouMind Support',
      businessName: config.businessName || 'BantouMind AI',
      adminNumber: config.adminNumber || null,
      language: config.language || 'fr',
      ...config
    };

    this.sock = null;
    this.logger = pino({ level: 'silent' });
    this.knowledgeBase = this.loadJSON('knowledge.json', this.getDefaultKnowledge());
    this.stats = this.loadJSON('tickets.json', { conversations: 0, escalated: 0 });
    
    console.log(`
╔══════════════════════════════════════╗
║  BantouMind AI - Support Bot         ║
║       Version 2.0 (Baileys)          ║
║   Support client via WhatsApp RÉEL   ║
╚══════════════════════════════════════╝
`);
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  getDefaultKnowledge() {
    return {
      faq: [
        { q: 'horaire', a: 'Nos horaires : Lun-Sam 8h-19h | Dim: 10h-14h' },
        { q: 'commander', a: 'Pour commander, contactez-nous par email à bantoumind.ai@gmail.com. Paiement via Chariow (carte, Mobile Money, crypto).' },
        { q: 'paiement', a: 'Nous acceptons Chariow (cartes bancaires, Mobile Money, crypto) et Orange Money. Paiement sécurisé.' },
        { q: 'livraison', a: 'Installation sous 24-48h après confirmation du paiement. Guide fourni.' },
        { q: 'prix', a: 'Agents : $59-$89. Pack Duo : $109. Premium Bundle : $249 (licence revente incluse).' },
        { q: 'revente', a: 'Oui ! Le Premium Bundle inclut une licence de revente complète. Revendez à vos clients et gardez 100%.' },
        { q: 'installation', a: 'Nous installons l\'agent pour vous et vous formons en 30 minutes. Assistance incluse.' },
        { q: 'contact', a: 'Email : bantoumind.ai@gmail.com | WhatsApp : contactez-nous' }
      ],
      responses: {
        greeting: [
          'Bonjour ! 👋 Je suis {{botName}}. Comment puis-je vous aider ?',
          '👋 Bienvenue ! Je suis l\'assistant {{botName}}. Des questions ?'
        ],
        thanks: 'Avec plaisir ! 😊 N\'hésitez pas à revenir vers nous. Belle journée ! 🌟',
        unknown: 'Je vais vous mettre en relation avec notre équipe. Veuillez patienter, on vous répond sous peu ⏳'
      }
    };
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_support_info');
    
    this.sock = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      logger: this.logger,
      browser: ['BantouMind Support', 'Chrome', '2.0.0'],
      syncFullHistory: false
    });

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n📱 SCANNEZ CE QR CODE POUR LE SUPPORT CLIENT :');
        console.log('📍 Menu WhatsApp > Appareils liés > Scanner\n');
        qrcode.generate(qr, { small: true });
        console.log('\n⏳ En attente...\n');
      }

      if (connection === 'open') {
        console.log(`✅✅✅ SUPPORT BOT CONNECTÉ À WHATSAPP ! ✅✅✅`);
        console.log(`🎧 ${this.config.botName} prêt à répondre aux clients !\n`);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expirée.');
        } else {
          console.log('🔄 Reconnexion...');
          setTimeout(() => this.start(), 5000);
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async (msg) => {
      const message = msg.messages[0];
      if (!message.key.fromMe && !message.key.remoteJid.endsWith('@g.us')) {
        await this.handleMessage(message);
      }
    });
  }

  async handleMessage(msg) {
    const sender = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const pushName = msg.pushName || 'Client';

    if (!text.trim()) return;

    console.log(`💬 [${new Date().toLocaleTimeString()}] ${pushName}: ${text}`);
    this.stats.conversations++;

    // Check FAQ
    let reply = null;
    const lowerText = text.toLowerCase();
    
    for (const faq of this.knowledgeBase.faq) {
      if (lowerText.includes(faq.q)) {
        reply = faq.a;
        break;
      }
    }

    // Check greetings
    if (!reply && lowerText.match(/^(bonjour|salut|hello|hi|bsr|slt)/i)) {
      reply = this.knowledgeBase.responses.greeting[Math.floor(Math.random() * this.knowledgeBase.responses.greeting.length)];
    }

    // Check thanks
    if (!reply && lowerText.match(/merci|thanks|thank/i)) {
      reply = this.knowledgeBase.responses.thanks;
    }

    // Unknown - escalate
    if (!reply) {
      reply = this.knowledgeBase.responses.unknown;
      this.stats.escalated++;
      console.log(`⚠️ Escalade nécessaire pour ${pushName}`);
      
      if (this.config.adminNumber) {
        await this.sock.sendMessage(this.config.adminNumber + '@s.whatsapp.net', {
          text: `⚠️ *Escalade Support* ⚠️\nClient: ${pushName} (${sender})\nMessage: ${text}\n\nMerci de répondre directement.`
        });
      }
    }

    reply = reply.replace(/{{botName}}/g, this.config.botName);
    
    await this.sock.sendMessage(sender, { text: reply });
    console.log(`🤖 Réponse envoyée ✅`);

    // Save stats
    fs.writeFileSync('tickets.json', JSON.stringify(this.stats, null, 2));
  }

  // Get widget HTML for website embedding
  getWidgetHTML() {
    return `<!-- BantouMind AI Support Widget v2.0 -->
<div id="bantoumind-support" style="position:fixed;bottom:20px;right:20px;z-index:9999;font-family:sans-serif;">
  <div id="bm-chat-box" style="display:none;width:350px;height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);overflow:hidden;margin-bottom:12px;animation:slideUp 0.3s ease;">
    <div style="background:linear-gradient(135deg,#6C3FFF,#FF6B35);padding:16px;color:white;">
      <strong>💬 ${this.config.botName}</strong>
      <p style="font-size:12px;opacity:0.8;margin-top:4px;">On vous répond sous 5 min sur WhatsApp</p>
    </div>
    <div style="padding:20px;text-align:center;">
      <p style="color:#666;margin-bottom:16px;">💬 Scannez le QR code ou cliquez ci-dessous pour nous contacter directement sur WhatsApp</p>
      <a href="https://wa.me/237652420373?text=Bonjour%20%F0%9F%91%8B%20J'ai%20besoin%20d'aide" 
         style="display:inline-block;padding:14px 28px;background:#25D366;color:white;text-decoration:none;border-radius:50px;font-weight:600;font-size:16px;">
        💬 Contacter sur WhatsApp
      </a>
      <p style="color:#999;font-size:12px;margin-top:12px;">Ou envoyez un email à bantoumind.ai@gmail.com</p>
    </div>
  </div>
  <button onclick="toggleChat()" 
          style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#6C3FFF,#FF6B35);color:white;border:none;font-size:28px;cursor:pointer;box-shadow:0 4px 20px rgba(108,63,255,0.4);float:right;transition:transform 0.3s;">
    💬
  </button>
</div>
<style>
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
</style>
<script>
function toggleChat() {
  var box = document.getElementById('bm-chat-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}
</script>`;
  }

  getStats() {
    return `
📊 STATISTIQUES SUPPORT - ${this.config.businessName}
═══════════════════════════════════
💬 Conversations : ${this.stats.conversations}
⚠️ Escaladés : ${this.stats.escalated}
🎧 Agent : ${this.config.botName}
✅ Statut : ${this.sock?.user ? 'EN LIGNE ✅' : 'HORS LIGNE ❌'}
═══════════════════════════════════`;
  }
}

// ===== START =====
console.log('🚀 Démarrage du Support Bot BantouMind...\n');

const agent = new BantouMindSupportBot({
  botName: 'BantouMind Support',
  businessName: 'BantouMind AI',
  adminNumber: null, // Mettez votre numéro ici pour les escalades
  language: 'fr'
});

agent.start();

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du Support Bot...');
  process.exit(0);
});

module.exports = BantouMindSupportBot;
