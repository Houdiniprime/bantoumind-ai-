// ==========================================
//   BantouMind AI - WhatsApp Agent  v1.0
//   Agent WhatsApp Automatique
//   Prêt à l'emploi - Zéro configuration
// ==========================================

const fs = require('fs');
const path = require('path');

class WhatsAppAgent {
  constructor(config = {}) {
    this.config = {
      botName: config.botName || 'BantouMind Assistant',
      businessName: config.businessName || 'Mon Business',
      welcomeMessage: config.welcomeMessage || 'Bonjour ! 👋 Bienvenue ! Je suis votre assistant automatique.',
      contactPhone: config.contactPhone || '+237652420373',
      contactEmail: config.contactEmail || 'contact@business.com',
      businessHours: config.businessHours || 'Lun-Sam: 8h-18h',
      catalogLink: config.catalogLink || '#',
      autoReply: config.autoReply !== false,
      language: config.language || 'fr',
      ...config
    };
    
    this.database = this.loadJSON('database.json', { contacts: [], conversations: [], stats: {} });
    this.templates = this.loadJSON('templates.json', this.getDefaultTemplates());
    
    console.log(`\n╔═══════════════════════════════════╗`);
    console.log(`║   BantouMind AI - WhatsApp Agent   ║`);
    console.log(`║         Version 1.0.0               ║`);
    console.log(`╚═══════════════════════════════════╝`);
    console.log(`✅ Agent initialisé avec succès !`);
    console.log(`📱 Bot: ${this.config.botName}`);
    console.log(`🏢 Business: ${this.config.businessName}`);
    console.log(`⏰ Mode: 24/7 - Automatique\n`);
  }

  loadJSON(filename, defaultValue) {
    try {
      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
      }
    } catch (e) {
      console.log(`⚠️ Fichier ${filename} non trouvé, création...`);
    }
    fs.writeFileSync(filename, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }

  getDefaultTemplates() {
    return {
      welcome: [
        "Bonjour ! 👋 Bienvenue chez {{business_name}}. Je suis {{bot_name}}, votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
        "👋 Salut ! Moi c'est {{bot_name}}, l'assistant IA. En quoi puis-je vous être utile ?",
        "Bienvenue sur {{business_name}} ! 🎉 Je suis là pour vous aider. Que puis-je faire pour vous ?"
      ],
      catalog: "📋 Voici notre catalogue :\n\n1️⃣ {{product_1}} - {{price_1}} FCFA\n2️⃣ {{product_2}} - {{price_2}} FCFA\n3️⃣ {{product_3}} - {{price_3}} FCFA\n\nSouhaitez-vous commander ? 🛒",
      order: {
        request: "🛒 Super ! Pour passer commande, j'ai besoin de :\n\n1️⃣ Nom du produit\n2️⃣ Quantité\n3️⃣ Adresse de livraison\n4️⃣ Téléphone\n\nEnvoyez ces infos ✅",
        confirm: "✅ Commande #{{order_id}} reçue ! Récapitulatif :\n\n{{order_details}}\n\n📞 Nous vous contacterons sous 24h pour la livraison.",
        delivery: "📦 Votre commande #{{order_id}} a été livrée ! Merci pour votre confiance 🙏"
      },
      followup: [
        "Bonjour ! 👋 Vous aviez demandé des infos sur nos produits. Souhaitez-vous commander maintenant ?",
        "Petit rappel : {{business_name}} est là pour vous servir ! 📋",
        "Offre spéciale en ce moment ! -10% sur votre première commande 🎉"
      ],
      info: `📍 Nous contacter :\n📞 {{contact_phone}}\n📧 {{contact_email}}\n⏰ {{business_hours}}`
    };
  }

  handleMessage(from, text) {
    const response = this.generateResponse(text);
    this.logConversation(from, text, response);
    return response;
  }

  generateResponse(text) {
    if (!text || text.trim() === '') {
      return this.fillTemplate(this.templates.welcome[0]);
    }

    const msg = text.toLowerCase().trim();
    
    // Salutations
    if (msg.match(/^(bonjour|salut|hello|bonsoir|bsr|slt|hi|cc)/i)) {
      return this.fillTemplate(this.getRandom(this.templates.welcome));
    }
    
    // Catalogue / Produits
    if (msg.match(/catalogue|produit|article|tarif|prix|combien|menu|service/i)) {
      return this.fillTemplate(this.templates.catalog);
    }
    
    // Commande / Achat
    if (msg.match(/commander|acheter|achat|prendre|réserv|command|buy|order/i)) {
      const orderId = Math.floor(Math.random() * 9999) + 1000;
      return `🛒 Super ! Pour passer commande, j'ai besoin de :\n\n1️⃣ Nom du produit\n2️⃣ Quantité\n3️⃣ Adresse de livraison\n4️⃣ Téléphone\n\nEnvoyez ces infos et je prépare votre commande #${orderId} ! ✅`;
    }
    
    // Contact / Adresse
    if (msg.match(/contact|adresse|localis|où|ou .*(?!trouv)/i)) {
      return this.fillTemplate(this.templates.info);
    }
    
    // Remerciement
    if (msg.match(/merci|mercii|thx|thanks|thank/i)) {
      return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Belle journée ! 🌟";
    }
    
    // Horaires
    if (msg.match(/horaire|heure|quand|ouvrir|fermé/i)) {
      return `⏰ Nos horaires d'ouverture :\n${this.config.businessHours}\n\nNous sommes joignables 7j/7 par message ! 💬`;
    }
    
    // Réponse par défaut
    return `Merci pour votre message ! ✅\n\nJe suis votre assistant automatique. Voici ce que je peux faire :\n\n📋 Voir le catalogue\n🛒 Passer une commande\n📍 Nos coordonnées\n💬 Parler à un conseiller\n\nQue souhaitez-vous ?`;
  }

  fillTemplate(template) {
    return template
      .replace(/{{bot_name}}/g, this.config.botName)
      .replace(/{{business_name}}/g, this.config.businessName)
      .replace(/{{contact_phone}}/g, this.config.contactPhone)
      .replace(/{{contact_email}}/g, this.config.contactEmail)
      .replace(/{{business_hours}}/g, this.config.businessHours)
      .replace(/{{catalog_link}}/g, this.config.catalogLink)
      .replace(/{{product_1}}/g, 'Produit A').replace(/{{price_1}}/g, '10 000')
      .replace(/{{product_2}}/g, 'Produit B').replace(/{{price_2}}/g, '25 000')
      .replace(/{{product_3}}/g, 'Produit C').replace(/{{price_3}}/g, '50 000');
  }

  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  logConversation(from, message, response) {
    const conv = { from, message, response, timestamp: new Date().toISOString() };
    this.database.conversations.push(conv);
    
    if (!this.database.contacts.find(c => c.number === from)) {
      this.database.contacts.push({ number: from, firstContact: new Date().toISOString(), status: 'new' });
    }
    
    this.database.stats.totalConversations = (this.database.stats.totalConversations || 0) + 1;
    fs.writeFileSync('database.json', JSON.stringify(this.database, null, 2));
  }

  getReport() {
    const today = new Date().toDateString();
    const todayConvs = this.database.conversations.filter(c => new Date(c.timestamp).toDateString() === today);
    
    return `
╔═══════════════════════════════════╗
║   📊 RAPPORT BantouMind AI        ║
╠═══════════════════════════════════╣
║ 📱 Conversations : ${String(this.database.stats.totalConversations || 0).padEnd(18)}║
║ 👥 Contacts      : ${String(this.database.contacts.length).padEnd(18)}║
║ 📈 Aujourd'hui   : ${String(todayConvs.length).padEnd(18)}║
║ ✅ Statut        : ACTIF            ║
║ ⏰ Uptime        : 24/7             ║
╚═══════════════════════════════════╝`;
  }
}

// ===== Démarrage =====
const agent = new WhatsAppAgent({
  botName: 'BantouMind Assistant',
  businessName: 'Mon Business',
  contactPhone: '+225 01 02 03 04 05',
  businessHours: 'Lun-Sam: 8h-19h | Dim: 10h-14h'
});

// Simulation d'interactions
console.log('🤖 Agent prêt - En attente de messages...\n');
console.log('📝 Exemple d\'interaction :');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👤 Client: Bonjour');
console.log(`🤖 Agent: ${agent.handleMessage('+225000000', 'Bonjour')}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📊 Rapport :');
console.log(agent.getReport());

// Export pour intégration
module.exports = WhatsAppAgent;
