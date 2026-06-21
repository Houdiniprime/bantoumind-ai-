// ==========================================
//   BantouMind AI - Content Creator Agent v1.0
//   Création de contenu automatique
// ==========================================

const fs = require('fs');
const path = require('path');

class ContentCreatorAgent {
  constructor(config = {}) {
    this.config = {
      brandName: config.brandName || 'Ma Marque',
      brandVoice: config.brandVoice || 'professionnel',
      language: config.language || 'fr',
      platforms: config.platforms || ['facebook', 'instagram', 'linkedin', 'blog'],
      ...config
    };
    
    this.content = this.loadJSON('content.json', { posts: [], schedule: [], stats: {} });
    
    console.log(`✍️ Agent Création de Contenu BantouMind AI v1.0`);
    console.log(`📝 Prêt à générer du contenu pour ${this.config.brandName}`);
  }

  loadJSON(file, def) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } 
    catch { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  }

  // Génération de posts (simulé - l'IA génère du contenu varié)
  generatePost(type = 'facebook') {
    const templates = {
      facebook: {
        engaged: [
          "🔥 QUESTION DU JOUR : Qu'est-ce qui vous motive chaque matin ? Dites-nous en commentaire ! 👇",
          "💡 Le saviez-vous ? {{fact}} 🧠\n\nChez {{brand}}, on partage nos connaissances avec vous !",
          "📢 NOUVEAUTÉ ! Nous sommes fiers de vous présenter {{product}} 🎉\n\nDécouvrez-le dès maintenant 👉"
        ],
        promotion: [
          "🎁 OFFRE SPÉCIALE cette semaine ! -20% sur {{product}} 🎉\n\n📱 Commander maintenant 👉",
          "🏆 {{brand}} vous remercie pour votre confiance ! Profitez de -10% avec le code MERCI10 💝"
        ]
      },
      instagram: {
        engaged: [
          "🔥 C'est le moment de partager ! Taggez un ami qui a besoin de voir ça 👇",
          "✨ Derrière les coulisses de {{brand}} 🚀",
          "📸 Votre avis nous intéresse ! Dites-nous tout en story 👋"
        ]
      },
      linkedin: {
        professional: [
          "🚀 L'industrie évolue, et nous aussi ! Voici comment {{brand}} innove en 2025 💡",
          "📊 3 conseils pour booster votre activité cette semaine :\n\n1️⃣ {{tip1}}\n2️⃣ {{tip2}}\n3️⃣ {{tip3}}\n\nQuel est votre meilleur conseil ?",
          "🎯 Retour d'expérience : ce que nous avons appris cette année chez {{brand}}"
        ]
      },
      blog: [
        "📝 Article : {{topic}}\n\nDécouvrez comment {{benefit}} dans notre nouvel article de blog !\n\n👉 Lire la suite",
        "📖 Guide complet : {{topic}}\n\n{{brand}} vous partage son expertise en {{field}}"
      ],
      product: [
        "🛍️ {{product_name}}\n💰 {{price}} FCFA\n✅ {{feature1}}\n✅ {{feature2}}\n✅ {{feature3}}\n\n📱 Commander : {{order_link}}"
      ]
    };

    const platformTemplates = templates[type] || templates.facebook;
    const category = Object.keys(platformTemplates)[Math.floor(Math.random() * Object.keys(platformTemplates).length)];
    const template = platformTemplates[category][Math.floor(Math.random() * platformTemplates[category].length)];
    
    return this.fillTemplate(template);
  }

  fillTemplate(t) {
    const facts = [
      "80% des clients préfèrent les entreprises réactives sur les réseaux sociaux",
      "les posts avec images génèrent 2.3x plus d'engagement",
      "le marketing automation peut réduire les coûts de 30%"
    ];
    return t
      .replace(/{{brand}}/g, this.config.brandName)
      .replace(/{{fact}}/g, facts[Math.floor(Math.random() * facts.length)])
      .replace(/{{product}}/g, 'Notre nouveau service')
      .replace(/{{topic}}/g, 'Comment booster votre activité avec l\'IA')
      .replace(/{{benefit}}/g, 'gagner du temps et augmenter vos ventes')
      .replace(/{{field}}/g, 'marketing digital')
      .replace(/{{tip1}}/g, 'Soignez votre présence en ligne')
      .replace(/{{tip2}}/g, 'Automatisez les tâches répétitives')
      .replace(/{{tip3}}/g, 'Fidélisez vos clients');
  }

  generateContentPlan(days = 7) {
    const platforms = this.config.platforms;
    const plan = [];
    const types = ['engaged', 'promotion', 'professional', 'product'];
    
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      
      for (const platform of platforms) {
        plan.push({
          date: date.toISOString().split('T')[0],
          platform,
          type: types[Math.floor(Math.random() * types.length)],
          content: this.generatePost(platform),
          time: `${8 + Math.floor(Math.random() * 10)}h${Math.random() > 0.5 ? '00' : '30'}`
        });
      }
    }
    
    this.content.schedule = plan;
    fs.writeFileSync('content.json', JSON.stringify(this.content, null, 2));
    return plan;
  }

  generateProductDescription(name, price, features) {
    return `✨ ${name}\n\n💰 ${price} FCFA\n\n📌 Caractéristiques :\n${features.map(f => `✅ ${f}`).join('\n')}\n\n📱 Commandez dès maintenant et recevez sous 24-48h ! #${this.config.brandName.replace(/\s/g, '')}`;
  }

  getWeeklyReport() {
    const totalPosts = this.content.schedule.length;
    return `
📊 RAPPORT HEBDOMADAIRE - ${this.config.brandName}
═══════════════════════════════════
📝 Posts programmés : ${totalPosts}
📱 Plateformes : ${this.config.platforms.join(', ')}
🎯 Prochaine publication : ${this.content.schedule[0]?.date || 'Aucune'}
✅ Statut : ACTIF
═══════════════════════════════════`;
  }
}

// Demo
const agent = new ContentCreatorAgent({ brandName: 'Ma Marque', brandVoice: 'professionnel' });
console.log('\n📱 Exemple de post Facebook :');
console.log(agent.generatePost('facebook'));
console.log('\n📅 Plan de contenu généré :');
console.log(agent.generateContentPlan(3));
module.exports = ContentCreatorAgent;
