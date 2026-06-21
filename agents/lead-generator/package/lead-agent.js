// ==========================================
//   BantouMind AI - Lead Generator Agent v1.0
//   Génération automatique de prospects
// ==========================================

const fs = require('fs');

class LeadGeneratorAgent {
  constructor(config = {}) {
    this.config = {
      businessName: config.businessName || 'Mon Business',
      industry: config.industry || 'général',
      targetArea: config.targetArea || 'Abidjan',
      ...config
    };
    this.leads = this.loadJSON('leads.json', { prospects: [], campaigns: [], stats: {} });
    console.log(`🎯 Agent Lead Generator BantouMind AI - Prêt à prospecter !`);
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  searchProspects(industry = this.config.industry, count = 10) {
    const prospects = [];
    const businesses = [
      { sector: 'restaurant', name: 'Chez Mama', profiles: ['Gérant', 'Propriétaire'] },
      { sector: 'boutique', name: 'Nouvelle Mode', profiles: ['Responsable commercial', 'Directeur'] },
      { sector: 'service', name: 'Services Pro', profiles: ['CEO', 'Fondateur'] },
      { sector: ['tech', 'digital'], name: 'Digital Plus', profiles: ['CTO', 'Fondateur'] }
    ];

    for (let i = 0; i < count; i++) {
      const b = businesses[Math.floor(Math.random() * businesses.length)];
      prospects.push({
        id: `lead_${Date.now()}_${i}`,
        business: `${b.name} ${i + 1}`,
        sector: Array.isArray(b.sector) ? b.sector[0] : b.sector,
        contact: `contact${i + 1}@email.com`,
        phone: `+225 ${Math.floor(Math.random() * 100000000)}`,
        profile: b.profiles[Math.floor(Math.random() * b.profiles.length)],
        location: this.config.targetArea,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'nouveau',
        dateFound: new Date().toISOString()
      });
    }
    
    this.leads.prospects.push(...prospects);
    fs.writeFileSync('leads.json', JSON.stringify(this.leads, null, 2));
    return prospects;
  }

  qualifyLead(lead) {
    const score = lead.score;
    if (score >= 85) return '🔥 CHAUD - Prêt à acheter';
    if (score >= 70) return '👍 TIÈDE - À suivre';
    return '🧊 FROID - À nourrir';
  }

  generateCampaign(targetSector = 'restaurant') {
    const templates = [
      `Bonjour ! 👋 Je suis ${this.config.businessName}. Nous avons une solution qui peut aider votre ${targetSector} à augmenter ses ventes. Intéressé ?`,
      `👋 Découvrez comment nous aidons les ${targetSector}s comme le vôtre à gagner plus de clients. Une démo de 5 min ?`,
      `🔥 Offre spéciale pour les ${targetSector}s ! -30% sur notre solution. Ça vous dit ?`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  getReport() {
    const chaud = this.leads.prospects.filter(l => l.score >= 85).length;
    const tiede = this.leads.prospects.filter(l => l.score >= 70 && l.score < 85).length;
    const froid = this.leads.prospects.filter(l => l.score < 70).length;
    
    return `
🎯 RAPPORT PROSPECTION - ${this.config.businessName}
═══════════════════════════════════
📊 Total prospects : ${this.leads.prospects.length}
🔥 Chauds (prêts) : ${chaud}
👍 Tièdes (à suivre) : ${tiede}
🧊 Froids (à nourrir) : ${froid}
📍 Zone : ${this.config.targetArea}
✅ Statut : ACTIF
═══════════════════════════════════`;
  }
}

module.exports = LeadGeneratorAgent;
