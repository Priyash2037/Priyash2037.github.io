/* ============================================================
   PRIYASH RODE — PORTFOLIO JAVASCRIPT
   Handles:
     1. Custom cursor (dot + ring with easing)
     2. Magnetic button effect on primary CTAs
     3. Spotlight / radial-gradient hover on cards
     4. Navbar scroll behaviour
     5. Mobile hamburger menu
     6. Scroll-reveal (IntersectionObserver)
     7. Active nav-link highlighting
   ============================================================ */

/* ─── 1. CUSTOM CURSOR ───────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  // Live mouse position
  let mouseX = 0, mouseY = 0;
  // Lagged position for the ring
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Move the dot instantly
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Animate the ring with easing (requestAnimationFrame loop)
  function animateRing() {
    // Lerp (linear interpolation) — 0.12 = easing factor
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    requestAnimationFrame(animateRing);
  }
  animateRing();

  // ── Hover state on interactive elements ──
  const interactables = 'a, button, .btn, .project-card, .skill-badge, .timeline-card, .edu-card';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();


/* ─── 2. MAGNETIC BUTTON EFFECT ─────────────────────────── */
(function initMagneticButtons() {
  /**
   * Magnetic pull: when the mouse enters a magnetic button zone (1.6× the
   * button bounds) the button content shifts toward the cursor.  On leave it
   * springs back.
   */
  const MAGNETIC_STRENGTH = 0.38; // 0 = none, 1 = full follow
  const ZONE_MULTIPLIER   = 1.6;  // How far outside the button the effect activates

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;

      const deltaX = (e.clientX - centerX) * MAGNETIC_STRENGTH;
      const deltaY = (e.clientY - centerY) * MAGNETIC_STRENGTH;

      btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      // Spring back
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.transform  = 'translate(0, 0)';

      // Remove the transition override after it completes so hover CSS takes over
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease';
    });
  });
})();


/* ─── 3. SPOTLIGHT / CARD GLOW EFFECT ───────────────────── */
(function initSpotlight() {
  /**
   * As the mouse moves over a spotlight-enabled card, a radial gradient is
   * applied via a CSS custom property (--spotlight) that follows the cursor.
   * The ::before pseudo-element on the card renders this gradient.
   */
  const cards = document.querySelectorAll('.project-card, .timeline-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      // Mouse position relative to the card (%)
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;

      card.style.setProperty(
        '--spotlight',
        `radial-gradient(circle at ${x}% ${y}%,
          rgba(0, 240, 255, 0.10) 0%,
          rgba(123, 47, 255, 0.05) 40%,
          transparent 65%)`
      );
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty(
        '--spotlight',
        'radial-gradient(circle at 50% 50%, transparent, transparent)'
      );
    });
  });
})();


/* ─── 4. NAVBAR SCROLL BEHAVIOUR ────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load in case page is already scrolled
})();


/* ─── 5. MOBILE HAMBURGER MENU ───────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Animate hamburger → X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
})();


/* ─── 6. SCROLL-REVEAL (IntersectionObserver) ───────────── */
(function initScrollReveal() {
  /**
   * Elements with the class `.reveal` are invisible (opacity:0, translateY)
   * by default.  Once they cross the viewport threshold they receive the
   * `.visible` class which transitions them in.
   * A `data-delay` attribute (ms) can stagger child elements.
   */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => {
            el.classList.add('visible');
          }, Number(delay));
          observer.unobserve(el); // Only animate once
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ─── 7. ACTIVE NAV-LINK HIGHLIGHTING ───────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(sec => observer.observe(sec));
})();


/* ─── 8. TYPED HEADLINE EFFECT ───────────────────────────── */
(function initTypedEffect() {
  const el = document.getElementById('typed-headline');
  if (!el) return;

  const phrases = [
    'Electronics & Telecom Engineer.',
    'Software Developer.',
    'Full-Stack Builder.',
    'Embedded Systems Enthusiast.',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  const TYPE_SPEED   = 55;   // ms per character (type)
  const DELETE_SPEED = 28;   // ms per character (delete)
  const PAUSE_END    = 1800; // ms pause when phrase is fully typed
  const PAUSE_START  = 300;  // ms pause before typing next phrase

  function tick() {
    const phrase   = phrases[phraseIndex];
    const current  = phrase.substring(0, charIndex);
    el.textContent = current;

    if (!isDeleting && charIndex < phrase.length) {
      charIndex++;
      setTimeout(tick, TYPE_SPEED);
    } else if (!isDeleting && charIndex === phrase.length) {
      isDeleting = true;
      setTimeout(tick, PAUSE_END);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(tick, DELETE_SPEED);
    } else {
      isDeleting  = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, PAUSE_START);
    }
  }

  tick();
})();
