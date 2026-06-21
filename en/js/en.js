// ===== BantouMind AI - English International Version =====

function toggleFaq(element) {
  const item = element.parentElement;
  item.classList.toggle('active');
}

function copyEmail() {
  const email = 'bantoumind.ai@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    alert('Email copied!');
  });
}

// Stripe payment info
function showStripePayment(product, amount) {
  alert(`💳 Pay $${amount} for ${product} via Stripe\n\nContact us at bantoumind.ai@gmail.com\nWe'll send you a secure Stripe payment link.`);
}

console.log('🚀 BantouMind AI - International Version');
