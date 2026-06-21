// ===== BantouMind AI - Main JavaScript =====

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    mobileMenuBtn.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    mobileMenuBtn.textContent = '☰';
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// FAQ Toggle
function toggleFaq(element) {
  const item = element.parentElement;
  item.classList.toggle('active');
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.agent-card, .pricing-card, .step, .testimonial-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// Copy contact number
function copyNumber() {
  const number = '+237652420373';
  navigator.clipboard.writeText(number).then(() => {
    alert('Numéro copié !');
  });
}

// Agent selection helper
function selectAgent(name, price) {
  const message = encodeURIComponent(
    `Bonjour BantouMind AI ! Je suis intéressé(e) par l'agent : ${name} (${price}). Merci de m'envoyer les informations pour commander.`
  );
  window.open(`https://wa.me/237652420373?text=${message}`, '_blank');
}

// Orange Money payment simulation
function showPaymentInfo(product, amount) {
  const message = encodeURIComponent(
    `BantouMind AI - Commande ${product}\n\nMontant : ${amount} FCFA\nOrange Money : +237 652 420 373\n\nAprès paiement, envoyez la confirmation ici.`
  );
  alert(`📱 Envoie ${amount} FCFA par Orange Money au +237 652 420 373\n\n📸 Envoie la capture d'écran ici après paiement.`);
}

console.log('🚀 BantouMind AI - Agents Intelligents pour l\'Afrique');
