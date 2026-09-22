/**
 * JAENUDIN SUWANDI — MAIN APPLICATION CONTROLLER (FIXED)
 * - Network-first content loading (server data/content.json selalu prioritas,
 *   localStorage hanya fallback + sinkronisasi antar-tab)
 * - Merender SEMUA halaman (home, portfolio, experience, contact) dari JSON
 * - Live update antar tab via event 'storage'
 */

window.portfolioData = null;

// =========================================================================
// 1. Content Loader — NETWORK FIRST, localStorage sebagai fallback/sync
// =========================================================================
async function loadSiteContent() {
  let data = null;

  // 1) Coba ambil data terbaru dari server (server.js / data/content.json)
  try {
    const res = await fetch('data/content.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      data = await res.json();
      // Sinkronkan cache lokal supaya tab lain & mode offline ikut update
      localStorage.setItem('portfolio_content', JSON.stringify(data));
    }
  } catch (err) {
    console.warn('[Content] Server tidak reachable, pakai cache localStorage.', err);
  }

  // 2) Fallback ke localStorage kalau server gak bisa diakses
  if (!data) {
    const cached = localStorage.getItem('portfolio_content');
    if (cached) {
      try { data = JSON.parse(cached); } catch (e) { data = null; }
    }
  }

  window.portfolioData = data;
  renderAllPages(data);

  // Event kompatibilitas (kalau ada script lain yang mendengarkan)
  window.dispatchEvent(new CustomEvent('contentLoaded', { detail: data }));
}

// Live-sync: kalau Admin save di tab lain, tab ini otomatis re-render
window.addEventListener('storage', (e) => {
  if (e.key === 'portfolio_content' && e.newValue) {
    try {
      window.portfolioData = JSON.parse(e.newValue);
      renderAllPages(window.portfolioData);
    } catch (err) { /* abaikan data corrupt */ }
  }
});

// =========================================================================
// Helpers
// =========================================================================
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function highlightHeadline(text) {
  let t = esc(text);
  t = t.replace(/SAP ERP/g, '<span class="chain-text">SAP ERP</span>');
  t = t.replace(/Digital Solutions/g, '<span class="dev-text">Digital Solutions</span>');
  t = t.replace(/web apps/gi, '<span class="dev-text">web apps</span>');
  return t;
}

// =========================================================================
// 2. Master Renderer — panggil semua renderer per halaman
// =========================================================================
function renderAllPages(data) {
  if (!data) return;
  applySettings(data.settings);
  renderHomePage(data);
  renderPortfolioProjects(data.projects || []);
  renderExperiencePage(data);
  renderContactPage(data.profile || {});
}

function applySettings(settings) {
  if (!settings) return;
  const logoImg = document.getElementById('siteLogoImg');
  if (logoImg && settings.logoUrl) {
    logoImg.src = settings.logoUrl;
  }
  if (settings.backgroundUrl) {
    document.body.style.backgroundImage = `url('${settings.backgroundUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = '';
  }
}

// =========================================================================
// 3. HOME PAGE renderer
// =========================================================================
function renderHomePage(data) {
  const p = data.profile || {};

  // Hero
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle && p.heroHeadline) heroTitle.innerHTML = highlightHeadline(p.heroHeadline);

  const heroBio = document.getElementById('heroBio');
  if (heroBio && p.heroBio) heroBio.innerHTML = esc(p.heroBio).replace(esc(p.name || ''), `<strong>${esc(p.name)}</strong>`);

  // Dual persona
  const sc = (data.persona && data.persona.supplyChain) || {};
  const dv = (data.persona && data.persona.developer) || {};

  setText('personaChainTitle', sc.title);
  setText('personaChainSubtitle', sc.subtitle);
  setText('personaChainDesc', sc.description);
  renderTags('personaChainTags', sc.skills);

  setText('personaDevTitle', dv.title);
  setText('personaDevSubtitle', dv.subtitle);
  setText('personaDevDesc', dv.description);
  renderTags('personaDevTags', dv.skills);

  // Featured work = project pertama
  const featured = document.getElementById('featuredProject');
  if (featured && data.projects && data.projects.length) {
    featured.innerHTML = buildProjectCard(data.projects[0], '');
  }

  // Award spotlight
  const ach = (data.achievements && data.achievements[0]) || {};
  setText('homeAwardBadge', ach.date ? ach.date + ' Recognition' : '');
  setText('homeAwardTitle', ach.title);
  setText('homeAwardMeta', ach.organization && ach.value ? `${ach.organization} • Salvaged ${ach.value}` : '');
  setText('homeAwardDesc', ach.description);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null && value !== '') {
    el.textContent = value;
  }
}

function renderTags(containerId, skills) {
  const box = document.getElementById(containerId);
  if (!box || !Array.isArray(skills)) return;
  box.innerHTML = skills.map((s) => `<span class="tag-item">${esc(s)}</span>`).join('');
}

function buildProjectCard(proj, altClass) {
  const techPills = (proj.techStack || []).map((t) => `<span class="tag-item">${esc(t)}</span>`).join('');
  const metrics = proj.metrics
    ? `<div style="margin-bottom: 1.25rem;"><span class="badge badge-chain" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">${esc(proj.metrics)}</span></div>`
    : '';
  return `
    <div class="project-card-visual ${altClass}">
      <div class="browser-mockup">
        <div class="browser-bar">
          <span class="browser-dot dot-red"></span>
          <span class="browser-dot dot-yellow"></span>
          <span class="browser-dot dot-green"></span>
        </div>
        <div class="browser-screen">
          <div>// ${esc(proj.category || 'Project')}</div>
          <div class="metric-big">${esc((proj.title || '').split('—')[0].trim())}</div>
        </div>
      </div>
    </div>
    <div class="project-card-content">
      <div class="project-card-eyebrow">
        <span class="badge badge-dev">${esc(proj.badge || proj.category || 'Project')}</span>
      </div>
      <h3 class="project-card-title">${esc(proj.title)}</h3>
      <p class="project-card-desc">${esc(proj.summary || '')}</p>
      ${proj.challenge ? `<div class="project-detail-box"><strong>The Business Challenge:</strong>${esc(proj.challenge)}</div>` : ''}
      ${proj.solution ? `<div class="project-detail-box" style="border-left: 3px solid var(--accent-chain);"><strong>Technical Solution &amp; Impact:</strong>${esc(proj.solution)}</div>` : ''}
      ${metrics}
      <div class="project-tech-pills">${techPills}</div>
    </div>`;
}

// =========================================================================
// 4. PORTFOLIO PAGE renderer
// =========================================================================
function renderPortfolioProjects(projects) {
  const container = document.getElementById('portfolioProjectsList');
  if (!container) return;

  container.innerHTML = '';

  if (!projects || projects.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 4rem 0; color: #94a3b8; font-family: var(--font-mono); font-size: 0.9rem;">// No projects yet. Add one from the Admin panel.</div>';
    return;
  }

  const accentAlts = ['', 'alt-chain'];

  projects.forEach((proj, idx) => {
    const article = document.createElement('article');
    article.className = 'project-case-card';
    article.innerHTML = buildProjectCard(proj, accentAlts[idx % 2]);
    container.appendChild(article);
  });
}

// =========================================================================
// 5. EXPERIENCE PAGE renderer
// =========================================================================
function renderExperiencePage(data) {
  // Award banner
  const ach = (data.achievements && data.achievements[0]) || {};
  setText('awardBadge', ach.date ? `Special Recognition — ${ach.date}` : '');
  setText('awardTitle', ach.title);
  setText('awardMeta', ach.organization && ach.value ? `${ach.organization} • Salvaged ${ach.value} in Inventory Value` : '');
  setText('awardDesc', ach.description);

  // Timeline
  const stream = document.getElementById('timelineStream');
  if (stream && Array.isArray(data.experience) && data.experience.length) {
    stream.innerHTML = data.experience.map((exp) => `
      <div class="timeline-entry">
        <div class="timeline-node ${exp.current ? 'current' : ''}"></div>
        <div class="timeline-card-clean">
          <div class="entry-header">
            <div>
              <h3 class="entry-role">${esc(exp.role)}</h3>
              <div class="entry-company">${esc(exp.company)}</div>
            </div>
            <span class="entry-period">${esc(exp.period)}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">${esc(exp.description || '')}</p>
          <ul class="entry-bullets">
            ${(exp.bulletPoints || []).map((b) => `<li>${esc(b)}</li>`).join('')}
          </ul>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem;">
            ${(exp.tags || []).map((t) => `<span class="tag-item">${esc(t)}</span>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }

  // Skills — Operations
  const opsBox = document.getElementById('opsSkills');
  if (opsBox && data.skills && Array.isArray(data.skills.operations)) {
    opsBox.innerHTML = data.skills.operations.map((sk) => `
      <div class="skill-row">
        <div class="skill-meta">
          <span>${esc(sk.name)}</span>
          <span style="color: var(--accent-chain);">${esc(sk.level)}%${sk.badge ? ' • ' + esc(sk.badge) : ''}</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: ${Number(sk.level) || 0}%;"></div>
        </div>
      </div>`).join('');
  }

  // Skills — Tech
  const techBox = document.getElementById('techSkills');
  if (techBox && data.skills && Array.isArray(data.skills.tech)) {
    techBox.innerHTML = data.skills.tech.map((sk) => `
      <div class="skill-row">
        <div class="skill-meta">
          <span>${esc(sk.name)}</span>
          <span style="color: var(--accent-dev);">${esc(sk.level)}%${sk.badge ? ' • ' + esc(sk.badge) : ''}</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill dev" style="width: ${Number(sk.level) || 0}%;"></div>
        </div>
      </div>`).join('');
  }

  // Education
  const edu = data.education || {};
  setText('eduDegree', edu.degree);
  setText('eduInst', edu.institution ? `${edu.institution}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}` : '');
  setText('eduDesc', edu.description);
}

// =========================================================================
// 6. CONTACT PAGE renderer
// =========================================================================
function renderContactPage(p) {
  setText('contactLocation', p.location);
  setText('contactEmail', p.email);
  setText('contactPhone', p.phone);

  // Update semua link WhatsApp dinamis
  if (p.whatsappUrl) {
    document.querySelectorAll('.wa-dynamic-link').forEach((a) => {
      a.href = p.whatsappUrl;
    });
  }
}

// =========================================================================
// 7. Theme Management (Light / Dark toggle)
// =========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('site_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('site_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  } else {
    icon.innerHTML = '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }
}

// =========================================================================
// 8. Navigation & Active Page Spy
// =========================================================================
function initNav() {
  const navLinks = document.querySelectorAll('.nav-item');
  const path = window.location.pathname.toLowerCase();

  navLinks.forEach((link) => {
    const href = link.getAttribute('href').toLowerCase();
    if (path.endsWith(href) || (href === 'index.html' && (path.endsWith('/') || path === ''))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }
}

// =========================================================================
// 9. Interactive Dual-Persona Controller
// =========================================================================
function initDualPersona() {
  const tabBtns = document.querySelectorAll('.persona-tab-btn');
  const chainHalf = document.querySelector('.persona-half.chain-side');
  const devHalf = document.querySelector('.persona-half.dev-side');

  if (!tabBtns.length || !chainHalf || !devHalf) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'chain') {
        chainHalf.style.opacity = '1';
        chainHalf.style.transform = 'scale(1.02)';
        devHalf.style.opacity = '0.35';
        devHalf.style.transform = 'scale(0.98)';
      } else if (target === 'dev') {
        devHalf.style.opacity = '1';
        devHalf.style.transform = 'scale(1.02)';
        chainHalf.style.opacity = '0.35';
        chainHalf.style.transform = 'scale(0.98)';
      } else {
        chainHalf.style.opacity = '1';
        chainHalf.style.transform = 'scale(1)';
        devHalf.style.opacity = '1';
        devHalf.style.transform = 'scale(1)';
      }
    });
  });
}

// =========================================================================
// 10. Toast Notification System
// =========================================================================
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Global copy email helper — dipanggil dari onclick di HTML
function copyEmail(emailStr) {
  navigator.clipboard.writeText(emailStr)
    .then(() => showToast('Email copied to clipboard: ' + emailStr))
    .catch(() => showToast('Email: ' + emailStr));
}

// =========================================================================
// Document Ready Execution
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initDualPersona();
  loadSiteContent();
});
