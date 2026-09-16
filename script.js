/* ==============================================================
   RUSTEEZ — SITE SCRIPT
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScrollState();
  initMobileNav();
  initWorkRotators();
  initPackageCards();
  initEnquiryForm();
  initFooterYear();
});

/* --------------------------------------------------------------
   Header: add a shadow once the page has scrolled past the top
   -------------------------------------------------------------- */
function initHeaderScrollState() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------
   Mobile nav: hamburger toggle + close on link click
   -------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------
   "Our Work" rotators
   Each .rotator element auto-cycles through its .rotator-img
   children. Add or remove <img> tags in index.html — this script
   picks them up automatically, no JS edits required.

   Optional: set data-interval="5000" on a .rotator element in the
   HTML to change its rotation speed (milliseconds). Defaults to 4000ms.
   -------------------------------------------------------------- */
function initWorkRotators() {
  const rotators = document.querySelectorAll('.rotator');

  rotators.forEach((rotator) => {
    const images = Array.from(rotator.querySelectorAll('.rotator-img'));
    if (images.length <= 1) return; // nothing to rotate

    const interval = parseInt(rotator.dataset.interval, 10) || 4000;
    const dotsWrap = rotator.querySelector('.rotator-dots');

    // Build one dot per image for a quick visual progress indicator
    if (dotsWrap) {
      images.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('is-active');
        dotsWrap.appendChild(dot);
      });
    }
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    let current = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // leave the first image static

    setInterval(() => {
      images[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');

      current = (current + 1) % images.length;

      images[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }, interval);
  });
}

/* --------------------------------------------------------------
   Package cards
   Each "Send Enquiry" button on a package card jumps to the
   enquiry form (plain #enquiry anchor) and pre-fills the message
   box so visitors don't have to type it themselves.
   -------------------------------------------------------------- */
function initPackageCards() {
  const buttons = document.querySelectorAll('.package-cta');
  const messageField = document.getElementById('message');
  if (!buttons.length || !messageField) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      messageField.value = 'I want to enquire regarding the available packages';
    });
  });
}

/* --------------------------------------------------------------
   Enquiry form
   Currently client-side only: validates the fields and shows a
   confirmation message. Nothing is sent anywhere yet.

   EDIT: to actually send enquiries, replace the body of
   handleEnquirySubmit's try block with either:

     a) a hosted form service, e.g. Formspree:
        const res = await fetch('https://formspree.io/f/yourFormId', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

     b) your own backend endpoint:
        const res = await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData))
        });
   -------------------------------------------------------------- */
function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleEnquirySubmit(form, status);
  });
}

async function handleEnquirySubmit(form, status) {
  const name = form.name.value.trim();
  const mobile = form.mobile.value.trim();
  const message = form.message.value.trim();

  if (!name || !mobile || !message) {
    status.textContent = 'Please fill in every field before sending.';
    status.className = 'form-status is-error';
    return;
  }

  // Very light phone check — loosen/tighten this to suit your market
  const mobilePattern = /^[0-9+\s()-]{8,}$/;
  if (!mobilePattern.test(mobile)) {
    status.textContent = 'That mobile number doesn\'t look right — please check it.';
    status.className = 'form-status is-error';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  status.textContent = 'Sending...';
  status.className = 'form-status';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      status.textContent = `Thanks ${name.split(' ')[0]}, we've got your enquiry and will be in touch shortly.`;
      status.className = 'form-status is-success';
      form.reset();
    } else {
      status.textContent = 'Something went wrong sending that — please try again or call us directly.';
      status.className = 'form-status is-error';
    }
  } catch (err) {
    status.textContent = 'Something went wrong sending that — please check your connection and try again.';
    status.className = 'form-status is-error';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

/* --------------------------------------------------------------
   Footer year
   -------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
