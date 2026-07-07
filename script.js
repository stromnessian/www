/* ════════════════════════════════════════════════════
   Orkney IT — script.js
   Handles: sticky nav, mobile menu, scroll reveal,
            form submission, footer year
   ════════════════════════════════════════════════════ */

'use strict';

// ── Footer year ──────────────────────────────────────
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ── Sticky nav ───────────────────────────────────────
const header = document.getElementById('site-header');
const SCROLL_THRESHOLD = 20;

function updateHeader() {
  if (window.scrollY > SCROLL_THRESHOLD) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ── Mobile navigation ────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

function openMenu() {
  navLinks.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

// Close when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
});

// ── Scroll reveal ────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings that appear at the same time
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')]
          : [];
        const delay = siblings.indexOf(entry.target);
        const stagger = Math.min(delay * 80, 320);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, stagger);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── Smooth active nav highlight ──────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

// ── Contact form ─────────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.classList.remove('field-error');
      if (!field.value.trim()) {
        field.classList.add('field-error');
        valid = false;
      }
    });

    // Email format check
    const emailField = contactForm.querySelector('#email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && emailField.value && !emailPattern.test(emailField.value)) {
      emailField.classList.add('field-error');
      valid = false;
    }

    if (!valid) {
      const firstError = contactForm.querySelector('.field-error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Build mailto as fallback (replace with your backend/form service endpoint)
    const data = new FormData(contactForm);
    const name    = data.get('name')    || '';
    const email   = data.get('email')   || '';
    const company = data.get('company') || '';
    const service = data.get('service') || '';
    const message = data.get('message') || '';

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService: ${service}\n\n${message}`
    );
    const subject = encodeURIComponent('Website enquiry — Orkney IT');
    const mailtoHref = `mailto:hello@orkney.it?subject=${subject}&body=${body}`;

    // Short delay for perceived feedback, then open mailto
    await new Promise(resolve => setTimeout(resolve, 600));

    window.location.href = mailtoHref;

    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send message';

    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// Field-error style — add via CSS custom property so no extra class needed
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .field-error {
      border-color: #e05252 !important;
      box-shadow: 0 0 0 3px rgba(224,82,82,0.15) !important;
    }
  </style>
`);
