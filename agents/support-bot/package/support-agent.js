// ==========================================
//   BantouMind AI - Support Bot Agent v1.0
//   Assistant Support Client Automatique
// ==========================================

const fs = require('fs');

class SupportBotAgent {
  constructor(config = {}) {
    this.config = {
      businessName: config.businessName || 'Mon Business',
      botName: config.botName || 'BantouMind Support',
      primaryLang: config.primaryLang || 'fr',
      ...config
    };
    this.knowledgeBase = this.loadJSON('knowledge.json', this.getDefaultKnowledge());
    this.tickets = this.loadJSON('tickets.json', { open: [], closed: [], stats: {} });
    console.log(`🎧 Agent Support Client BantouMind AI - Prêt à assister vos clients !`);
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  getDefaultKnowledge() {
    return {
      faq: [
        { q: "quels sont vos horaires", a: "Nos horaires d'ouverture : Lun-Sam 8h-18h" },
        { q: "comment commander", a: "Pour commander, dites-nous le produit souhaité et la quantité" },
        { q: "quels sont les moyens de paiement", a: "Nous acceptons Orange Money, Wave et virement bancaire" },
        { q: "délai de livraison", a: "Livraison sous 24-48h selon votre localisation" }
      ],
      responses: {
        greeting: "Bonjour ! 👋 Je suis {{bot_name}}. Comment puis-je vous aider ?",
        thanks: "Avec plaisir ! 😊 N'hésitez pas à revenir vers nous !",
        unknown: "Je vais vous mettre en relation avec un conseiller. Veuillez patienter ⏳"
      }
    };
  }

  handleRequest(clientName, message) {
    const msg = message.toLowerCase();
    let response = null;
    
    // Recherche dans la FAQ
    for (const faq of this.knowledgeBase.faq) {
      if (msg.includes(faq.q)) {
        response = faq.a;
        break;
      }
    }
    
    if (!response) {
      response = this.knowledgeBase.responses.unknown;
      this.createTicket(clientName, message);
    }
    
    this.logInteraction(clientName, message, response);
    return response;
  }

  createTicket(client, issue) {
    const ticket = {
      id: `TICKET-${Date.now()}`,
      client,
      issue,
      status: 'ouvert',
      date: new Date().toISOString()
    };
    this.tickets.open.push(ticket);
    fs.writeFileSync('tickets.json', JSON.stringify(this.tickets, null, 2));
    return ticket;
  }

  logInteraction(client, message, response) {
    console.log(`[${new Date().toLocaleTimeString()}] ${client}: ${message}`);
    console.log(`[Bot] ${response}\n`);
  }

  getStats() {
    return {
      totalTickets: this.tickets.open.length + this.tickets.closed.length,
      openTickets: this.tickets.open.length,
      resolvedTickets: this.tickets.closed.length
    };
  }

  getWidgetHTML() {
    return `<!-- BantouMind AI Support Widget -->
<div id="bantoumind-support" style="position:fixed;bottom:20px;right:20px;z-index:9999;">
  <div id="bm-chat-box" style="display:none;width:350px;height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);overflow:hidden;margin-bottom:12px;">
    <div style="background:linear-gradient(135deg,#6C3FFF,#FF6B35);padding:16px;color:white;">
      <strong>💬 ${this.config.botName}</strong>
      <p style="font-size:12px;opacity:0.8;">On vous répond sous 5 min</p>
    </div>
    <div style="padding:16px;height:350px;overflow-y:auto;" id="bm-messages">
      <div style="background:#f0f0f0;padding:10px 16px;border-radius:12px;margin-bottom:8px;max-width:80%;">
        Bonjour ! 👋 Comment puis-je vous aider ?
      </div>
    </div>
    <div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px;">
      <input type="text" id="bm-input" placeholder="Votre message..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;outline:none;">
      <button onclick="sendMessage()" style="padding:10px 16px;background:linear-gradient(135deg,#6C3FFF,#FF6B35);color:white;border:none;border-radius:8px;cursor:pointer;">Envoyer</button>
    </div>
  </div>
  <button onclick="toggleChat()" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#6C3FFF,#FF6B35);color:white;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 20px rgba(108,63,255,0.4);float:right;">💬</button>
</div>
<script>
function toggleChat() {
  const box = document.getElementById('bm-chat-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}
function sendMessage() {
  const input = document.getElementById('bm-input');
  if(input.value.trim()) {
    const msgs = document.getElementById('bm-messages');
    msgs.innerHTML += '<div style="background:#6C3FFF;color:white;padding:10px 16px;border-radius:12px;margin-bottom:8px;max-width:80%;margin-left:auto;">'+input.value+'</div>';
    msgs.innerHTML += '<div style="background:#f0f0f0;padding:10px 16px;border-radius:12px;margin-bottom:8px;max-width:80%;">Merci ! Un conseiller vous répond sous peu 📩</div>';
    input.value = '';
  }
}
<\/script>`;
  }
}

const agent = new SupportBotAgent({ businessName: 'Mon Business', botName: 'BantouMind Support' });
console.log(agent.handleRequest('Client', 'Bonjour'));
console.log(agent.getStats());
module.exports = SupportBotAgent;
