/**
 * JAENUDIN SUWANDI — INTERACTIVE RESUME & PORTFOLIO
 * High-performance, zero-bloat client-side logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Mobile Navigation Menu Toggle
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // =========================================================================
  // 2. Active Scroll Spy
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // =========================================================================
  // 3. Animated KPI Number Counters
  // =========================================================================
  const counters = document.querySelectorAll('.counter');
  let hasCounted = false;

  const runCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1200; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(ease * target);

        counter.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  // IntersectionObserver for trigger
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCounted) {
        hasCounted = true;
        runCounters();
      }
    });
  }, { threshold: 0.2 });

  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroObserver.observe(heroSection);
  }

  // =========================================================================
  // 4. Core Competencies Filter Tabs
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const compCards = document.querySelectorAll('.competency-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update button active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      compCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // =========================================================================
  // 5. Toast Notification System
  // =========================================================================
  const toastMsg = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  let toastTimer = null;

  const showToast = (message) => {
    if (!toastMsg) return;
    toastText.textContent = message;
    toastMsg.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3200);
  };

  // Copy Email to Clipboard
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailText = document.getElementById('emailText');

  if (copyEmailBtn && emailText) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailText.textContent.trim())
        .then(() => {
          showToast('Email copied to clipboard: jaenudin.suwandi17@gmail.com');
        })
        .catch(() => {
          showToast('Email: jaenudin.suwandi17@gmail.com');
        });
    });
  }

  // =========================================================================
  // 6. Executive CV Modal Management
  // =========================================================================
  const cvModal = document.getElementById('cvModal');
  const openCvModalBtn = document.getElementById('openCvModalBtn');
  const heroCvBtn = document.getElementById('heroCvBtn');
  const closeCvModalBtn = document.getElementById('closeCvModalBtn');

  const openCV = () => {
    if (cvModal) {
      cvModal.classList.add('active');
      cvModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCV = () => {
    if (cvModal) {
      cvModal.classList.remove('active');
      cvModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (openCvModalBtn) openCvModalBtn.addEventListener('click', openCV);
  if (heroCvBtn) heroCvBtn.addEventListener('click', openCV);
  if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCV);

  // Close when clicking modal backdrop
  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) closeCV();
    });
  }

  // =========================================================================
  // 7. Project Deep-Dive Modal Data & Handler
  // =========================================================================
  const projectModal = document.getElementById('projectModal');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectCategory = document.getElementById('modalProjectCategory');
  const modalProjectContent = document.getElementById('modalProjectContent');
  const projectDetailBtns = document.querySelectorAll('.btn-project-detail');

  const projectDetails = {
    'jumbo-bag': {
      title: 'Corporate Web & Custom Admin Panel — Jumbo Bag Manufacturing',
      category: 'Full-Stack Web App • Laravel & Filament Admin',
      content: `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; color: #cbd5e1;">
          <div>
            <h4 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: #06b6d4;">✦</span> Project Background & Business Challenge
            </h4>
            <p style="font-size: 0.95rem; line-height: 1.6;">
              An industrial manufacturer producing heavy-duty flexible intermediate bulk containers (FIBC / Jumbo Bags) relied on static inquiries and disorganized manual price estimation sheets. Non-technical plant managers were unable to update technical load capacity ratings (Safe Working Load / SWL), safety factor specifications, loop styles, or discharge spout configurations.
            </p>
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.25rem;">
            <h5 style="color: #38bdf8; font-family: var(--font-mono); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.75rem;">System Architecture</h5>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
              <li><strong>• Frontend:</strong> High-performance corporate profile styled with modern Tailwind CSS and responsive interactive inquiry builder.</li>
              <li><strong>• Backend:</strong> Modular Laravel 11 architecture utilizing Eloquent ORM, custom form requests, and secure authentication.</li>
              <li><strong>• Backoffice Admin:</strong> Filament Admin v3 custom resources delivering zero-friction CRUD for product variants, photo uploads, technical data sheets (TDS), and lead routing.</li>
              <li><strong>• AI-Assisted Velocity:</strong> Built with Cursor / Antigravity workflows for clean code structure, schema migrations, and rapid UI prototyping.</li>
            </ul>
          </div>

          <div>
            <h4 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: #10b981;">✓</span> Concrete Business Impact
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 1rem;">
                <div style="color: #34d399; font-weight: 700; font-size: 1.25rem;">100% Autonomy</div>
                <div style="font-size: 0.85rem; color: #e2e8f0; margin-top: 0.25rem;">Zero developer reliance for product spec updates or new catalog listings.</div>
              </div>
              <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 1rem;">
                <div style="color: #38bdf8; font-weight: 700; font-size: 1.25rem;">&lt; 24h Turnaround</div>
                <div style="font-size: 0.85rem; color: #e2e8f0; margin-top: 0.25rem;">Direct structured RFQs (Requests for Quote) channeled instantly to sales team WhatsApp & email.</div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    'inventory-tracker': {
      title: 'Production & Inventory Tracking Concepts',
      category: 'Operations Intelligence • SAP ERP & Advanced Data Analytics',
      content: `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; color: #cbd5e1;">
          <div>
            <h4 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: #06b6d4;">✦</span> Problem Context
            </h4>
            <p style="font-size: 0.95rem; line-height: 1.6;">
              In fast-paced paint and chemical manufacturing, sudden variations in customer demand can drain critical pigments and resins before standard weekly SAP MRP runs are processed. Traditional manual reviews produced lag time that risked emergency line stoppages.
            </p>
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.25rem;">
            <h5 style="color: #38bdf8; font-family: var(--font-mono); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.75rem;">Solution Design & Technical Logic</h5>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
              <li><strong>• Automated Data Extraction:</strong> Scheduled dumps of SAP material ledger (MB52 / MD04) parsed into structured data tables.</li>
              <li><strong>• Dynamic Safety Stock Variance:</strong> Custom mathematical model calculating standard deviation of actual daily consumption vs planned BoM targets.</li>
              <li><strong>• Early Warning Visual Trigger:</strong> Color-coded thresholds identifying SKUs entering critical buffer states 48–72 hours prior to scheduled mixing runs.</li>
              <li><strong>• Stock Reconciliation Engine:</strong> Automated variance detection matching physical floor counts against system book quantities.</li>
            </ul>
          </div>

          <div>
            <h4 style="color: #fff; font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: #10b981;">✓</span> Tangible Operational Results
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 1rem;">
                <div style="color: #34d399; font-weight: 700; font-size: 1.25rem;">99.4% Accuracy</div>
                <div style="font-size: 0.85rem; color: #e2e8f0; margin-top: 0.25rem;">Sustained material record accuracy across all active chemical and packaging SKUs.</div>
              </div>
              <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 1rem;">
                <div style="color: #38bdf8; font-weight: 700; font-size: 1.25rem;">Zero Stockouts</div>
                <div style="font-size: 0.85rem; color: #e2e8f0; margin-top: 0.25rem;">Eliminated line stoppage penalties due to undetected raw material exhaustion.</div>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  const openProjectModal = (projectKey) => {
    const data = projectDetails[projectKey];
    if (!data || !projectModal) return;

    modalProjectTitle.textContent = data.title;
    modalProjectCategory.textContent = data.category;
    modalProjectContent.innerHTML = data.content;

    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    if (projectModal) {
      projectModal.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  projectDetailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      openProjectModal(projectKey);
    });
  });

  if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCV();
      closeProjectModal();
    }
  });

});
