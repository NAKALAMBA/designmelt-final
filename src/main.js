import './styles.css';
import Lenis from 'lenis';
import { animate, inView, stagger } from 'motion';
import { createClient } from '@supabase/supabase-js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseTable = import.meta.env.VITE_SUPABASE_TABLE || 'booking_requests';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const bookButtons = document.querySelectorAll('.js-book-call');
const schedulerSection = document.querySelector('#scheduler');
const schedulerForm = document.querySelector('#scheduler-form');
const schedulerStatus = document.querySelector('#scheduler-status');

let lenisInstance = null;

if (!prefersReducedMotion) {
  lenisInstance = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    touchMultiplier: 1.05
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      lenisInstance.scrollTo(target, { offset: -70, duration: 1 });
      closeMobileNav();
    });
  });
}

const onScroll = () => {
  topbar?.classList.toggle('is-scrolled', window.scrollY > 16);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function closeMobileNav() {
  mobileNav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  mobileNav?.setAttribute('aria-hidden', 'true');
}

menuToggle?.addEventListener('click', () => {
  const open = mobileNav?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
  mobileNav?.setAttribute('aria-hidden', String(!open));
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});

const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealElements.forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
} else {
  inView('.section, .hero, .marquee, .footer', (section) => {
    const items = section.querySelectorAll('.reveal');
    if (!items.length) return;

    animate(
      items,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
      { duration: 0.7, delay: stagger(0.08), easing: [0.22, 1, 0.36, 1] }
    );
  }, { margin: '-10% 0px -10% 0px' });

  const floatingCards = document.querySelectorAll('.hero-card-float');
  floatingCards.forEach((card, index) => {
    animate(
      card,
      { y: [0, index % 2 === 0 ? -12 : 12, 0] },
      { duration: 4.8 + index, repeat: Infinity, easing: 'ease-in-out' }
    );
  });

  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    animate(
      marqueeTrack,
      { x: ['0%', '-50%'] },
      { duration: 28, repeat: Infinity, easing: 'linear' }
    );
  }
}

function focusSchedulerForm() {
  const firstInput = schedulerForm?.querySelector('input, select, textarea');
  firstInput?.focus();
}

function openSchedulerForm() {
  if (!schedulerSection) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(schedulerSection, { offset: -70, duration: 1 });
  } else {
    schedulerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.setTimeout(focusSchedulerForm, prefersReducedMotion ? 50 : 450);
}

bookButtons.forEach((button) => {
  button.addEventListener('click', openSchedulerForm);
});

function updateSchedulerStatus(message, state) {
  if (!schedulerStatus) return;
  schedulerStatus.textContent = message;
  schedulerStatus.classList.remove('is-error', 'is-success');
  if (state) {
    schedulerStatus.classList.add(state);
  }
}

schedulerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = schedulerForm.querySelector('button[type="submit"]');

  if (!supabase) {
    updateSchedulerStatus('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'is-error');
    return;
  }

  const formData = new FormData(schedulerForm);
  const payload = {
    name: formData.get('name')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    service: formData.get('service')?.toString().trim() || '',
    preferred_date: formData.get('preferred_date')?.toString() || '',
    brief: formData.get('message')?.toString().trim() || '',
    source: 'website'
  };

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }
  updateSchedulerStatus('Saving request...', null);

  const { error } = await supabase.from(supabaseTable).insert(payload);

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit booking request';
  }

  if (error) {
    updateSchedulerStatus('Could not save request. Check table permissions or column names in Supabase.', 'is-error');
    return;
  }

  schedulerForm.reset();
  updateSchedulerStatus('Booking request submitted. We will contact you shortly.', 'is-success');
});
