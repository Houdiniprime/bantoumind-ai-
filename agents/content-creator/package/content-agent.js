// ============================================================
//   BantouMind AI - Content Creator Agent v2.0 (GEMINI)
//   Création de contenu RÉELLE via Google Gemini API (GRATUIT)
//   Install : npm install @google/generative-ai dotenv
//   Usage   : node content-agent.js
//   Obtenez une clé API gratuite : https://aistudio.google.com/apikey
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class ContentCreatorAgent {
  constructor(config = {}) {
    this.config = {
      brandName: config.brandName || 'Ma Marque',
      brandVoice: config.brandVoice || 'professionnel et engageant',
      language: config.language || 'fr',
      platforms: config.platforms || ['facebook', 'instagram', 'linkedin', 'blog'],
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
      ...config
    };

    if (!this.config.apiKey) {
      console.log('⚠️  Clé API Gemini manquante !');
      console.log('📌 Obtenez une clé gratuite : https://aistudio.google.com/apikey');
      console.log('📌 Puis : export GEMINI_API_KEY=votre_clé\n');
    }

    this.genAI = this.config.apiKey ? new GoogleGenerativeAI(this.config.apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;
    this.content = this.loadJSON('content.json', { posts: [], schedule: [], stats: { totalGenerated: 0 } });

    console.log(`
╔══════════════════════════════════════╗
║  BantouMind AI - Content Creator     ║
║       Version 2.0 (Gemini IA)        ║
║    Génération de contenu RÉELLE      ║
╚══════════════════════════════════════╝
`);
    if (this.model) console.log('✅ Gemini IA connectée !\n');
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  async generateWithGemini(prompt) {
    if (!this.model) {
      return `⚠️ Configuration requise :\n\nPour générer du vrai contenu, configurez votre clé API Gemini gratuite :\n1. Allez sur https://aistudio.google.com/apikey\n2. Créez une clé (gratuite, 60 requêtes/min)\n3. Définissez la variable : export GEMINI_API_KEY=votre_clé\n\nSinon, voici un exemple de contenu généré :\n\n${this.getExamplePost()}`;
    }
    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      this.content.stats.totalGenerated++;
      this.saveContent();
      return text;
    } catch (err) {
      console.error('❌ Erreur Gemini:', err.message);
      return `⚠️ Erreur de génération : ${err.message}\n\nContenu de secours :\n${this.getExamplePost()}`;
    }
  }

  getExamplePost() {
    const examples = [
      `✨ Découvrez comment ${this.config.brandName} révolutionne votre quotidien ! 🚀\n\n💡 Innovation, qualité, service - notre engagement envers vous.\n\n#Innovation #Qualité ${this.config.brandName.replace(/\\s/g, '')}`,
      `🔥 NOUVEAUTÉ ! Nous sommes fiers de présenter notre dernier service chez ${this.config.brandName} 🎉\n\nDes résultats exceptionnels pour nos clients. Rejoignez le mouvement ! 👇\n\n#Nouveauté ${this.config.brandName.replace(/\\s/g, '')}`
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  }

  async generatePost(platform = 'facebook') {
    const prompts = {
      facebook: `Rédige un post Facebook engageant et professionnel pour ${this.config.brandName}. Ton: ${this.config.brandVoice}. Langue: ${this.config.language}. 3-4 phrases avec emojis pertinents.`,
      instagram: `Rédige une légende Instagram pour ${this.config.brandName}. Ton: ${this.config.brandVoice}. Langue: ${this.config.language}. 5-6 lignes avec hashtags pertinents. Inclus un call-to-action.`,
      linkedin: `Rédige un post LinkedIn professionnel pour ${this.config.brandName}. Ton: ${this.config.brandVoice} mais plus formel. Langue: ${this.config.language}. 4-5 phrases avec des données ou conseils utiles.`,
      blog: `Rédige le début d'un article de blog (intro + 2 paragraphes) pour ${this.config.brandName}. Sujet: les tendances actuelles dans notre secteur. Ton: ${this.config.brandVoice}. Langue: ${this.config.language}.`,
      twitter: `Rédige un tweet/X engageant pour ${this.config.brandName}. Ton: ${this.config.brandVoice}. Langue: ${this.config.language}. Maximum 280 caractères avec 2-3 hashtags.`,
      newsletter: `Rédige le début d'une newsletter (objet + intro) pour ${this.config.brandName}. Ton: ${this.config.brandVoice} mais chaleureux. Langue: ${this.config.language}. 3-4 phrases.`
    };

    const prompt = prompts[platform] || prompts.facebook;
    const content = await this.generateWithGemini(prompt);
    
    const post = {
      id: `post_${Date.now()}`,
      platform,
      content,
      createdAt: new Date().toISOString(),
      scheduledFor: null
    };
    
    this.content.posts.push(post);
    this.saveContent();
    return post;
  }

  async generateProductDescription(name, features = [], price = '') {
    const prompt = `Rédige une description produit convaincante pour "${name}" de ${this.config.brandName}. 
Caractéristiques: ${features.join(', ')}. Prix: ${price}. 
Ton: ${this.config.brandVoice}. Langue: ${this.config.language}.
Inclus: titre accrocheur, 3 avantages clés, call-to-action. Maximum 150 mots.`;

    return this.generateWithGemini(prompt);
  }

  async generateContentPlan(days = 7) {
    const platforms = this.config.platforms;
    const plan = [];
    
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      
      for (const platform of platforms) {
        const post = await this.generatePost(platform);
        plan.push({
          date: dateStr,
          platform,
          content: post.content,
          status: 'scheduled'
        });
      }
    }
    
    this.content.schedule = plan;
    this.saveContent();
    return plan;
  }

  saveContent() {
    fs.writeFileSync('content.json', JSON.stringify(this.content, null, 2));
  }

  getReport() {
    return `
📊 RAPPORT - ${this.config.brandName}
═══════════════════════════════════
📝 Posts générés : ${this.content.posts.length}
📅 Planifiés : ${this.content.schedule.length}
🤖 IA : ${this.model ? 'Gemini Active ✅' : 'Mode démo ⚠️'}
📱 Plateformes : ${this.config.platforms.join(', ')}
✅ Statut : ACTIF
═══════════════════════════════════`;
  }
}

// ===== DEMO =====
console.log('🚀 Démarrage de l\'agent de création de contenu...\n');

async function demo() {
  // Essaye de charger la clé depuis .env
  try { require('dotenv').config(); } catch(e) {}
  
  const agent = new ContentCreatorAgent({
    brandName: 'BantouMind AI',
    brandVoice: 'professionnel, innovant et accessible',
    language: 'fr',
    platforms: ['facebook', 'instagram', 'linkedin'],
    apiKey: process.env.GEMINI_API_KEY
  });

  console.log('\n📱 Génération d\'un post Facebook...\n');
  const post = await agent.generatePost('facebook');
  console.log(post.content);

  console.log('\n' + agent.getReport());
}

demo();

module.exports = ContentCreatorAgent;
