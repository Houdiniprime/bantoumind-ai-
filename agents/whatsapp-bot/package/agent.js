// ============================================================
//   BantouMind AI - WhatsApp Agent  v2.0 (BAILEYS)
//   Connexion WhatsApp RÉELLE via Baileys Library
//   Install : npm install @whiskeysockets/baileys qrcode-terminal pino
//   Usage   : node agent.js (scannez le QR code avec WhatsApp)
// ============================================================

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');

class BantouMindWhatsAppBot {
  constructor(config = {}) {
    this.config = {
      botName: config.botName || 'BantouMind Assistant',
      businessName: config.businessName || 'Mon Business',
      adminNumber: config.adminNumber || null, // Numéro du propriétaire (pour escalation)
      contactEmail: config.contactEmail || 'bantoumind.ai@gmail.com',
      businessHours: config.businessHours || 'Lun-Sam: 8h-19h',
      language: config.language || 'fr',
      ...config
    };
    
    this.sock = null;
    this.store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    this.logger = pino({ level: 'silent' }); // Silence Baileys logs
    
    console.log(`
╔══════════════════════════════════════╗
║    BantouMind AI - WhatsApp Agent    ║
║         Version 2.0 (Baileys)        ║
║     Connexion WhatsApp RÉELLE        ║
╚══════════════════════════════════════╝
`);
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    this.sock = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      logger: this.logger,
      browser: ['BantouMind AI', 'Chrome', '2.0.0'],
      syncFullHistory: false
    });

    this.store.bind(this.sock.ev);

    // QR Code event
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n📱 SCANNEZ CE QR CODE AVEC VOTRE WHATSAPP :');
        console.log('📍 Menu WhatsApp > Appareils liés > Scanner le code\n');
        qrcode.generate(qr, { small: true });
        console.log('\n⏳ En attente du scan...\n');
      }

      if (connection === 'open') {
        console.log('✅✅✅ CONNECTÉ À WHATSAPP ! ✅✅✅');
        console.log(`🤖 ${this.config.botName} est en ligne !`);
        console.log(`🏢 ${this.config.businessName}\n`);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expirée. Supprimez le dossier auth_info_baileys et relancez.');
        } else {
          console.log('🔄 Reconnexion dans 5 secondes...');
          setTimeout(() => this.start(), 5000);
        }
      }
    });

    // Save credentials
    this.sock.ev.on('creds.update', saveCreds);

    // Listen for messages
    this.sock.ev.on('messages.upsert', async (msg) => {
      const message = msg.messages[0];
      if (!message.key.fromMe && !message.key.remoteJid.endsWith('@g.us')) {
        await this.handleIncomingMessage(message);
      }
    });
  }

  async handleIncomingMessage(message) {
    const sender = message.key.remoteJid;
    const text = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || 
                 '';
    const pushName = message.pushName || 'Client';

    if (!text.trim()) return;

    console.log(`📩 [${new Date().toLocaleTimeString()}] ${pushName}: ${text}`);

    const reply = this.generateReply(text);
    await this.sock.sendMessage(sender, { text: reply });
    console.log(`🤖 Réponse: ${reply.substring(0, 50)}...`);
  }

  generateReply(text) {
    const msg = text.toLowerCase().trim();
    const lang = this.config.language;

    // Greetings
    if (msg.match(/^(bonjour|salut|hello|hi|bsr|slt|cc|good morning|good evening)/i)) {
      const greetings = lang === 'fr' 
        ? [`Bonjour ! 👋 Bienvenue chez ${this.config.businessName} ! Je suis ${this.config.botName}, votre assistant IA. Comment puis-je vous aider ? 😊`,
           `👋 Salut ! Je suis ${this.config.botName}. En quoi puis-je vous être utile aujourd'hui ?`]
        : [`Hello! 👋 Welcome to ${this.config.businessName}! I'm ${this.config.botName}, your AI assistant. How can I help you? 😊`,
           `👋 Hi there! I'm ${this.config.botName}. How can I assist you today?`];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Catalog / Products
    if (msg.match(/catalogue|catalog|produit|product|prix|price|tarif|combien|how much|menu|service|bundle|agent/i)) {
      return lang === 'fr'
        ? `📋 *Notre Catalogue IA :*\n\n1️⃣ 🤖 *WhatsApp Agent* - automatise vos messages\n2️⃣ ✍️ *Content Agent* - crée du contenu pour vous\n3️⃣ 🎯 *Lead Agent* - trouve des clients\n4️⃣ 🎧 *Support Bot* - répond à vos clients\n5️⃣ 🚀 *Premium Bundle* - tous les agents + licence revente\n\n👉 Contactez-nous pour commander !`
        : `📋 *Our AI Catalog:*\n\n1️⃣ 🤖 *WhatsApp Agent* - automate your messages\n2️⃣ ✍️ *Content Agent* - create content for you\n3️⃣ 🎯 *Lead Agent* - find customers\n4️⃣ 🎧 *Support Bot* - answer your customers\n5️⃣ 🚀 *Premium Bundle* - all agents + reseller license\n\n👉 Contact us to order!`;
    }

    // Order / Buy
    if (msg.match(/commander|acheter|buy|order|achat|prendre|purchase|payer|pay/i)) {
      return lang === 'fr'
        ? `🛒 *Pour commander :*\n\n1️⃣ Choisissez votre agent\n2️⃣ Paiement sécurisé via *Chariow* (carte, Mobile Money, crypto)\n3️⃣ Installation sous 24-48h\n\n📱 Contactez-nous par email : ${this.config.contactEmail}\n💰 Paiement Mobile Money aussi accepté !`
        : `🛒 *To order:*\n\n1️⃣ Choose your agent\n2️⃣ Secure payment via *Chariow* (card, Mobile Money, crypto)\n3️⃣ Installation within 24-48h\n\n📱 Contact us by email: ${this.config.contactEmail}\n💰 Mobile Money payment also accepted!`;
    }

    // Contact / Info
    if (msg.match(/contact|info|adresse|address|email|phone|téléphone/i)) {
      return lang === 'fr'
        ? `📍 *Nous contacter :*\n📧 Email : ${this.config.contactEmail}\n⏰ ${this.config.businessHours}\n\n💬 Je suis là pour vous aider !`
        : `📍 *Contact us:*\n📧 Email: ${this.config.contactEmail}\n⏰ ${this.config.businessHours}\n\n💬 I'm here to help!`;
    }

    // Thanks
    if (msg.match(/merci|thanks|thank|thx/i)) {
      return lang === 'fr'
        ? `Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Bonne journée ! 🌟`
        : `You're welcome! 😊 Feel free to ask if you have any other questions. Have a great day! 🌟`;
    }

    // Hours
    if (msg.match(/horaire|hour|heure|when|quand|ouvrir|open/i)) {
      return lang === 'fr'
        ? `⏰ *Nos horaires :* ${this.config.businessHours}\n\nMais je suis là 24/7 pour répondre à vos questions ! 💬`
        : `⏰ *Our hours:* ${this.config.businessHours}\n\nBut I'm here 24/7 to answer your questions! 💬`;
    }

    // Pricing
    if (msg.match(/prix|price|combien|cost|tarif|how much/i)) {
      return lang === 'fr'
        ? `💰 *Nos tarifs :*\n\n🤖 Agent simple : 35 000 - 50 000 FCFA\n🚀 Pack Duo : 65 000 FCFA\n💎 Premium Bundle : 150 000 FCFA (tous les agents + licence revente)\n\n🌍 Paiement via Chariow (Mobile Money, carte, crypto) accepté !`
        : `💰 *Our pricing:*\n\n🤖 Single Agent: $59 - $89\n🚀 Duo Pack: $109\n💎 Premium Bundle: $249 (all agents + reseller license)\n\n🌍 Payment via Chariow (Mobile Money, card, crypto) accepted!`;
    }

    // Default response
    return lang === 'fr'
      ? `Merci pour votre message ! ✅\n\nJe suis ${this.config.botName}. Voici ce que je peux faire :\n\n📋 *Catalogue* - Voir nos agents IA\n🛒 *Commander* - Acheter un agent\n💰 *Tarifs* - Voir les prix\n📍 *Contact* - Nos coordonnées\n\nQue souhaitez-vous ?`
      : `Thank you for your message! ✅\n\nI'm ${this.config.botName}. Here's what I can do:\n\n📋 *Catalog* - See our AI agents\n🛒 *Order* - Buy an agent\n💰 *Pricing* - See prices\n📍 *Contact* - Our info\n\nWhat would you like?`;
  }

  async sendMessage(number, text) {
    if (!this.sock) throw new Error('Agent not connected');
    const jid = number.includes('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text });
  }

  async stop() {
    if (this.sock) {
      this.sock.end(new Error('Agent stopped'));
      console.log('🛑 Agent WhatsApp arrêté.');
    }
  }
}

// ===== START =====
console.log('🚀 Démarrage de l\'agent WhatsApp BantouMind...\n');

const bot = new BantouMindWhatsAppBot({
  botName: 'BantouMind Assistant',
  businessName: 'BantouMind AI',
  contactEmail: 'bantoumind.ai@gmail.com',
  businessHours: 'Mon-Sat: 8AM-7PM | Sun: 10AM-2PM',
  language: 'fr'
});

bot.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt...');
  await bot.stop();
  process.exit(0);
});

module.exports = BantouMindWhatsAppBot;
