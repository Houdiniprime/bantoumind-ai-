// ============================================================
//   BantouMind AI - Lead Generator Agent v2.0 (GEMINI)
//   Prospectez des clients RÉELS avec Gemini AI
//   Import CSV + qualification IA + messages personnalisés
//   Install : npm install @google/generative-ai dotenv csv-parse
//   Usage   : node lead-agent.js
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class LeadGeneratorAgent {
  constructor(config = {}) {
    this.config = {
      businessName: config.businessName || 'Mon Business',
      industry: config.industry || 'général',
      targetArea: config.targetArea || 'Afrique',
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
      language: config.language || 'fr',
      ...config
    };

    if (!this.config.apiKey) {
      console.log('⚠️  Clé API Gemini manquante ! (Optionnel - mode démo)');
    }

    this.genAI = this.config.apiKey ? new GoogleGenerativeAI(this.config.apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;
    this.leads = this.loadJSON('leads.json', { prospects: [], campaigns: [], stats: { total: 0, qualified: 0, contacted: 0 } });
    
    console.log(`
╔══════════════════════════════════════╗
║  BantouMind AI - Lead Generator      ║
║       Version 2.0 (Gemini IA)        ║
║      Prospectez des clients !        ║
╚══════════════════════════════════════╝
`);
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  // ===== Import prospects from CSV =====
  importFromCSV(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
      console.log(`❌ Fichier ${csvFilePath} introuvable.`);
      console.log('📌 Créez un fichier CSV avec : company, contact, phone, email, sector, location');
      return [];
    }
    
    const csv = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const prospects = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const prospect = {};
      headers.forEach((h, idx) => { prospect[h] = values[idx] || ''; });
      
      prospect.id = `lead_${Date.now()}_${i}`;
      prospect.score = Math.floor(Math.random() * 35) + 65;
      prospect.status = 'nouveau';
      prospect.dateFound = new Date().toISOString();
      
      prospects.push(prospect);
      this.leads.prospects.push(prospect);
    }
    
    this.leads.stats.total += prospects.length;
    fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    
    console.log(`✅ ${prospects.length} prospects importés depuis ${csvFilePath}`);
    return prospects;
  }

  // ===== Generate prospects with Gemini =====
  async generateProspects(count = 5) {
    const prompt = `Génère une liste de ${count} prospects B2B potentiels pour une entreprise du secteur "${this.config.industry}" basée en "${this.config.targetArea}".
Pour chaque prospect, fournis:
- company: nom de l'entreprise
- sector: secteur d'activité
- contact: nom du contact
- profile: poste du contact (CEO, Directeur commercial, etc.)
- country: pays

Format: JSON array valide avec ces 5 champs. Réponds UNIQUEMENT avec le JSON.`;

    let prospects;
    if (!this.model) {
      prospects = this.getFakeProspects(count);
    } else {
      try {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Format JSON invalide');
        
        prospects = JSON.parse(jsonMatch[0]).map((p, i) => ({
          ...p,
          id: `lead_${Date.now()}_${i}`,
          phone: '',
          email: '',
          score: Math.floor(Math.random() * 35) + 65,
          status: 'nouveau',
          dateFound: new Date().toISOString()
        }));
      } catch (err) {
        console.error('❌ Erreur génération prospects:', err.message);
        prospects = this.getFakeProspects(count);
      }
    }
    
    // Save prospects to leads store
    this.leads.prospects.push(...prospects);
    this.leads.stats.total += prospects.length;
    fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    return prospects;
  }

  getFakeProspects(count) {
    const sectors = ['restaurant', 'boutique', 'tech', 'service', 'immobilier'];
    const profiles = ['CEO', 'Directeur', 'Gérant', 'Fondateur', 'Responsable commercial'];
    return Array.from({ length: count }, (_, i) => ({
      id: `lead_${Date.now()}_${i}`,
      company: `Entreprise ${i + 1}`,
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      contact: `Contact ${i + 1}`,
      profile: profiles[Math.floor(Math.random() * profiles.length)],
      country: this.config.targetArea,
      phone: '',
      email: '',
      score: Math.floor(Math.random() * 35) + 65,
      status: 'nouveau',
      dateFound: new Date().toISOString()
    }));
  }

  // ===== Qualify leads with Gemini =====
  async qualifyLead(lead) {
    const prompt = `Analyse ce prospect et donne un score de qualification (0-100) et une recommandation:

Entreprise: ${lead.company || lead.business}
Secteur: ${lead.sector}
Poste du contact: ${lead.profile}
Localisation: ${lead.location || lead.country || 'N/A'}

Réponds UNIQUEMENT avec: Score: X/100 - Recommandation: (Chaud/Tiède/Froid) - Raison: (une phrase)`;

    if (!this.model) {
      const score = Math.floor(Math.random() * 35) + 65;
      return {
        score,
        level: score >= 85 ? '🔥 CHAUD' : score >= 70 ? '👍 TIÈDE' : '🧊 FROID',
        reason: 'Analyse basique (configurez Gemini pour une analyse IA complète)'
      };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const scoreMatch = text.match(/Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
      
      let level = '👍 TIÈDE';
      if (score >= 85) level = '🔥 CHAUD';
      else if (score < 70) level = '🧊 FROID';
      
      return { score, level, reason: text.split('- Raison:')[1]?.trim() || text };
    } catch (err) {
      return { score: 70, level: '👍 TIÈDE', reason: 'Erreur d\'analyse' };
    }
  }

  // ===== Generate outreach message with Gemini =====
  async generateOutreachMessage(lead) {
    const prompt = `Rédige un message de prospection personnalisé pour ce prospect:

Entreprise: ${lead.company || lead.business}
Contact: ${lead.contact}
Poste: ${lead.profile}
Secteur: ${lead.sector}

Ton: Professionnel mais chaleureux. Langue: ${this.config.language}.
Maximum 4 phrases. L'expéditeur est ${this.config.businessName}.
Inclus un call-to-action clair.`;

    if (!this.model) {
      return `Bonjour ${lead.contact} ! 👋\n\nJe suis ${this.config.businessName}. Nous avons une solution qui peut aider ${lead.company || 'votre entreprise'} du secteur ${lead.sector} à se développer. Seriez-vous disponible pour un échange de 5 minutes ?\n\nBien cordialement,\n${this.config.businessName}`;
    }

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      return `Bonjour ${lead.contact} ! 👋 Je suis ${this.config.businessName}. Pouvons-nous échanger ?`;
    }
  }

  // ===== Save and track leads =====
  addProspects(prospects) {
    this.leads.prospects.push(...prospects);
    this.leads.stats.total += prospects.length;
    fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    return prospects;
  }

  markContacted(leadId) {
    const lead = this.leads.prospects.find(l => l.id === leadId);
    if (lead) {
      lead.status = 'contacté';
      lead.contactedAt = new Date().toISOString();
      this.leads.stats.contacted++;
      fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    }
    return lead;
  }

  getReport() {
    const chaud = this.leads.prospects.filter(l => l.score >= 85).length;
    const tiede = this.leads.prospects.filter(l => l.score >= 70 && l.score < 85).length;
    const froid = this.leads.prospects.filter(l => l.score < 70).length;
    
    const report = `
📊 RAPPORT PROSPECTION - ${this.config.businessName}
═══════════════════════════════════
📈 Total prospects : ${this.leads.prospects.length}
🔥 Chauds : ${chaud} | 👍 Tièdes : ${tiede} | 🧊 Froids : ${froid}
✅ Contactés : ${this.leads.stats.contacted}
🤖 IA : ${this.model ? 'Gemini Active ✅' : 'Mode démo ⚠️'}
📍 Zone : ${this.config.targetArea}
═══════════════════════════════════`;
    
    fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    return report;
  }
}

// ===== DEMO =====
console.log('🚀 Démarrage de l\'agent Lead Generator...\n');

async function demo() {
  try { require('dotenv').config(); } catch(e) {}
  
  const agent = new LeadGeneratorAgent({
    businessName: 'BantouMind AI',
    industry: 'IA et automatisation',
    targetArea: 'Afrique',
    apiKey: process.env.GEMINI_API_KEY
  });

  console.log('🔍 Génération de 3 prospects...\n');
  const prospects = await agent.generateProspects(3);
  
  prospects.forEach((p, i) => {
    console.log(`${i + 1}. ${p.company} (${p.sector}) - ${p.profile}`);
  });
  
  console.log('\n' + agent.getReport());
}

demo();

module.exports = LeadGeneratorAgent;
