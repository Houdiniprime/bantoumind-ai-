// ============================================================
//   BantouMind AI - Chariow Payment Integration
//   Paiement sécurisé via Chariow API
//   Install : npm install dotenv
//   Usage   : node chariow-payment.js
//   Obtenez votre clé API : https://app.chariow.com/settings/api
//   Doc     : https://chariow.dev/api-reference/checkout/init-checkout
// 
//   ⚠️  Webhooks (Pulses) :
//   Configurez un webhook dans https://app.chariow.com/settings/api/pulses
//   pour recevoir les notifications de paiement `successful.sale`.
//   Endpoint recommandé : email, ou un webhook qui vous notifie.
//   Événement à écouter : successful.sale
// ============================================================

// Produits BantouMind AI sur Chariow
const PRODUCTS = {
  whatsapp: {
    id: 'prd_whatsapp_agent',    // Remplace par l'ID réel depuis Chariow
    name: 'WhatsApp Auto Agent',
    price: 59,
    description: 'AI agent that automatically replies to customers on WhatsApp'
  },
  content: {
    id: 'prd_content_agent',
    name: 'Content Creator Agent',
    price: 79,
    description: 'AI agent that creates content for your business'
  },
  lead: {
    id: 'prd_lead_agent',
    name: 'Lead Generator Agent',
    price: 69,
    description: 'AI agent that finds and qualifies prospects'
  },
  support: {
    id: 'prd_support_agent',
    name: 'Customer Support Bot',
    price: 59,
    description: 'AI chatbot for website and WhatsApp support'
  },
  finance: {
    id: 'prd_finance_agent',
    name: 'Finance & Accounting Agent',
    price: 89,
    description: 'AI agent for invoicing and financial management'
  },
  duo: {
    id: 'prd_duo_pack',
    name: 'Duo Pack (2 agents)',
    price: 109,
    description: 'Any 2 AI agents of your choice'
  },
  bundle: {
    id: 'prd_premium_bundle',
    name: 'Premium Bundle',
    price: 249,
    description: 'All 5 AI agents + Reseller License'
  }
};

// ===== Créer un lien de paiement Chariow =====
async function createCheckoutLink(productSlug, customerEmail, customerName) {
  const product = PRODUCTS[productSlug];
  if (!product) throw new Error(`Produit "${productSlug}" inconnu`);

  const CHARIOW_API_KEY = process.env.CHARIOW_API_KEY || '';
  if (!CHARIOW_API_KEY) {
    console.log('⚠️  Clé API Chariow manquante !');
    console.log('📌 Obtenez-la sur https://app.chariow.com/settings/api');
    console.log('📌 Puis : export CHARIOW_API_KEY=sk_live_votre_cle\n');
    return getManualLink(productSlug);
  }

  const nameParts = (customerName || 'Client BantouMind').split(' ');
  const phone = { number: '0000000000', country_code: 'US' };

  try {
    const response = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHARIOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: product.id,
        email: customerEmail || 'client@example.com',
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || 'Client',
        phone: phone,
        redirect_url: 'https://houdiniprime.github.io/bantoumind-ai-/en/payment/success.html'
      })
    });

    const result = await response.json();
    
    if (result.data?.step === 'payment' && result.data?.payment?.checkout_url) {
      console.log(`✅ Lien de paiement généré pour ${product.name}`);
      console.log(`🔗 ${result.data.payment.checkout_url}`);
      return result.data.payment.checkout_url;
    } else {
      console.log('⚠️ Réponse inattendue:', JSON.stringify(result));
      return getManualLink(productSlug);
    }
  } catch (err) {
    console.error('❌ Erreur API Chariow:', err.message);
    return getManualLink(productSlug);
  }
}

// ===== Lien manuel (si pas d'API) =====
function getManualLink(productSlug) {
  const product = PRODUCTS[productSlug];
  const links = {
    whatsapp: 'https://wa.me/237652420373?text=Je%20veux%20le%20WhatsApp%20Agent%20($59)',
    content: 'https://wa.me/237652420373?text=Je%20veux%20le%20Content%20Agent%20($79)',
    lead: 'https://wa.me/237652420373?text=Je%20veux%20le%20Lead%20Agent%20($69)',
    support: 'https://wa.me/237652420373?text=Je%20veux%20le%20Support%20Bot%20($59)',
    finance: 'https://wa.me/237652420373?text=Je%20veux%20le%20Finance%20Agent%20($89)',
    duo: 'https://wa.me/237652420373?text=Je%20veux%20le%20Duo%20Pack%20($109)',
    bundle: 'https://wa.me/237652420373?text=Je%20veux%20le%20Premium%20Bundle%20($249)'
  };
  return links[productSlug] || links.bundle;
}

// ===== GÉNÉRER TOUS LES LIENS =====
async function generateAllLinks() {
  console.log(`
╔══════════════════════════════════════╗
║   BantouMind AI - Chariow Payments   ║
║   Génération des liens de paiement   ║
╚══════════════════════════════════════╝
`);
  
  const products = Object.keys(PRODUCTS);
  
  for (const slug of products) {
    const product = PRODUCTS[slug];
    console.log(`\n📦 ${product.name} - $${product.price}`);
    const link = await createCheckoutLink(slug, 'client@bantoumind.ai', 'Client');
    console.log(`🔗 ${link}`);
  }
  
  console.log('\n✅ Terminé !\n');
}

// ===== Export =====
module.exports = { createCheckoutLink, PRODUCTS, generateAllLinks };

// ===== Lire les vrais produits Chariow depuis l'API =====
async function listProductsFromAPI() {
  const CHARIOW_API_KEY = process.env.CHARIOW_API_KEY || '';
  if (!CHARIOW_API_KEY) {
    console.log('⚠️  Clé API Chariow manquante !');
    console.log('📌 Obtenez-la sur https://app.chariow.com/settings/api\n');
    console.log('📦 Produits par défaut (définis dans ce script) :');
    Object.entries(PRODUCTS).forEach(([slug, p]) => {
      console.log(`  ${p.id.padEnd(25)} → ${slug.padEnd(12)} $${p.price} - ${p.name}`);
    });
    return;
  }

  try {
    console.log('\n🔍 Récupération des produits depuis Chariow...\n');
    const response = await fetch('https://api.chariow.com/v1/products?per_page=50', {
      headers: {
        'Authorization': `Bearer ${CHARIOW_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.data?.data && Array.isArray(result.data.data)) {
      console.log(`✅ ${result.data.data.length} produits trouvés sur Chariow :\n`);
      console.log('ID PRODUIT'.padEnd(28) + '| NOM');
      console.log('-'.repeat(60));
      result.data.data.forEach(p => {
        console.log(`${(p.id || 'N/A').padEnd(28)}| ${p.name || 'Sans nom'}${p.price ? ` ($${p.price/100})` : ''}`);
      });
      console.log('\n💡 Copiez les IDs ci-dessus et mettez à jour PRODUCTS dans ce script.');
    } else {
      console.log('⚠️ Réponse inattendue de l\'API:', JSON.stringify(result).slice(0, 300));
    }
  } catch (err) {
    console.error('❌ Erreur API:', err.message);
    console.log('\n📦 Produits par défaut (définis dans ce script) :');
    Object.entries(PRODUCTS).forEach(([slug, p]) => {
      console.log(`  ${p.id.padEnd(25)} → ${slug.padEnd(12)} $${p.price} - ${p.name}`);
    });
  }
}

// ===== CLI =====
if (require.main === module) {
  try { require('dotenv').config(); } catch(e) {}
  
  const args = process.argv.slice(2);
  
  if (args[0] === '--all') {
    generateAllLinks();
  } else if (args[0] === '--list-products' || args[0] === '-l') {
    listProductsFromAPI();
  } else if (args[0] && PRODUCTS[args[0]]) {
    const email = args[1] || 'client@example.com';
    const name = args[2] || 'Client BantouMind';
    createCheckoutLink(args[0], email, name).then(link => {
      console.log(`\n🔗 ${link}\n`);
    });
  } else {
    console.log(`
📋 Usage:
  node chariow-payment.js <product> [email] [name]   → Créer un lien de paiement
  node chariow-payment.js --all                       → Générer tous les liens
  node chariow-payment.js --list-products              → Lister les produits Chariow

📦 Produits disponibles:
${Object.entries(PRODUCTS).map(([slug, p]) => `  - ${slug}: ${p.name} ($${p.price})`).join('\n')}

🔔 Webhook : Configurez un Pulse dans votre dashboard Chariow
   pour recevoir les notifications successful.sale.
   Dashboard → Settings → API → Pulses

🌍 Paiement via Chariow : https://app.chariow.com
`);
  }
}
