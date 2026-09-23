/**
 * JAENUDIN SUWANDI — ADMIN DASHBOARD LOGIC (FIXED utk Vercel + local)
 */

let currentData = null;

// =========================================================================
// 1. Authentication Manager
// =========================================================================

function checkAuth() {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;

  const isAuth = sessionStorage.getItem('admin_logged_in') === 'true';
  overlay.style.display = isAuth ? 'none' : 'flex';
}

function handleLogin(e) {
  if (e) e.preventDefault();

  const userInput = document.getElementById('adminUser');
  const passInput = document.getElementById('adminPass');
  const errorElement = document.getElementById('authError');

  if (!userInput || !passInput) return;

  const user = userInput.value.trim();
  const pass = passInput.value;

  if (user === 'admin' && pass === 'admin123') {
    sessionStorage.setItem('admin_logged_in', 'true');
    if (errorElement) errorElement.textContent = '';
    checkAuth();
    showAdminToast('Login successful. Welcome Jaenudin!');
  } else {
    if (errorElement) errorElement.textContent = 'Username atau password salah (admin / admin123).';
    passInput.value = '';
    passInput.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem('admin_logged_in');
  checkAuth();
}

// =========================================================================
// 2. Data Initialization — NETWORK FIRST
// =========================================================================
async function initAdminData() {
  try {
    const res = await fetch('../data/content.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      currentData = await res.json();
    } else {
      throw new Error('HTTP ' + res.status);
    }
  } catch (err) {
    console.warn('[Admin] Server tidak reachable, pakai cache localStorage.', err);
    const cached = localStorage.getItem('portfolio_content');
    if (cached) {
      try { currentData = JSON.parse(cached); } catch (e) { currentData = null; }
    }
  }

  if (!currentData) {
    showAdminToast('Could not load content data. Pastikan data/content.json ada.');
    return;
  }

  localStorage.setItem('portfolio_content', JSON.stringify(currentData));
  populateAllTabs();
}

// =========================================================================
// 3. Tab Populators & Form Bindings
// =========================================================================
function populateAllTabs() {
  if (!currentData) return;
  populateProfileTab();
  populateProjectsTab();
  populateExperienceTab();
  populateSkillsTab();
  populateAchievementsTab();
  populateSettingsTab();
}

function populateSettingsTab() {
  const s = currentData.settings || {};
  const logoInput = document.getElementById('settingLogoUrl');
  const bgInput = document.getElementById('settingBackgroundUrl');
  if (logoInput) logoInput.value = s.logoUrl || '';
  if (bgInput) bgInput.value = s.backgroundUrl || '';
}

function populateProfileTab() {
  const p = currentData.profile;
  if (!p) return;

  if (document.getElementById('profileName')) document.getElementById('profileName').value = p.name || '';
  if (document.getElementById('profileRolePrimary')) document.getElementById('profileRolePrimary').value = p.rolePrimary || '';
  if (document.getElementById('profileRoleSecondary')) document.getElementById('profileRoleSecondary').value = p.roleSecondary || '';
  if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = p.email || '';
  if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = p.phone || '';
  if (document.getElementById('profileLocation')) document.getElementById('profileLocation').value = p.location || '';
  if (document.getElementById('profileHeadline')) document.getElementById('profileHeadline').value = p.heroHeadline || '';
  if (document.getElementById('profileBio')) document.getElementById('profileBio').value = p.heroBio || '';
  if (document.getElementById('profileDiff')) document.getElementById('profileDiff').value = p.differentiator || '';
}

function populateProjectsTab() {
  const container = document.getElementById('projectsContainer');
  if (!container || !currentData.projects) return;
  container.innerHTML = '';

  currentData.projects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'item-editor-card';
    card.style.background = '#ffffff';
    card.style.padding = '1.25rem';
    card.style.borderRadius = '8px';
    card.style.marginBottom = '1rem';
    card.style.border = '1px solid #e2e8f0';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: #0f172a;">Project #${idx + 1}: ${proj.title}</h4>
        <button type="button" class="btn-admin btn-admin-danger" onclick="deleteProject(${idx})">Delete</button>
      </div>
      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Project Title</label>
          <input type="text" class="form-control" value="${proj.title}" onchange="currentData.projects[${idx}].title = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Category / Badge</label>
          <input type="text" class="form-control" value="${proj.category}" onchange="currentData.projects[${idx}].category = this.value">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Summary</label>
        <input type="text" class="form-control" value="${proj.summary}" onchange="currentData.projects[${idx}].summary = this.value">
      </div>
      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Business Challenge</label>
          <textarea class="form-control" rows="3" onchange="currentData.projects[${idx}].challenge = this.value">${proj.challenge || ''}</textarea>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Technical Solution & Impact</label>
          <textarea class="form-control" rows="3" onchange="currentData.projects[${idx}].solution = this.value">${proj.solution || ''}</textarea>
        </div>
      </div>
      <div class="form-grid-2">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Key Metrics</label>
          <input type="text" class="form-control" value="${proj.metrics || ''}" onchange="currentData.projects[${idx}].metrics = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Tech Stack (Comma Separated)</label>
          <input type="text" class="form-control" value="${(proj.techStack || []).join(', ')}" onchange="currentData.projects[${idx}].techStack = this.value.split(',').map(s=>s.trim())">
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateExperienceTab() {
  const container = document.getElementById('experienceContainer');
  if (!container || !currentData.experience) return;
  container.innerHTML = '';

  currentData.experience.forEach((exp, idx) => {
    const card = document.createElement('div');
    card.className = 'item-editor-card';
    card.style.background = '#ffffff';
    card.style.padding = '1.25rem';
    card.style.borderRadius = '8px';
    card.style.marginBottom = '1rem';
    card.style.border = '1px solid #e2e8f0';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: #0f172a;">${exp.role} @ ${exp.company}</h4>
        <button type="button" class="btn-admin btn-admin-danger" onclick="deleteExperience(${idx})">Delete</button>
      </div>
      <div class="form-grid-3" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Job Role</label>
          <input type="text" class="form-control" value="${exp.role}" onchange="currentData.experience[${idx}].role = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Company Name</label>
          <input type="text" class="form-control" value="${exp.company}" onchange="currentData.experience[${idx}].company = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Period / Date Range</label>
          <input type="text" class="form-control" value="${exp.period}" onchange="currentData.experience[${idx}].period = this.value">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Description Summary</label>
        <textarea class="form-control" rows="2" onchange="currentData.experience[${idx}].description = this.value">${exp.description || ''}</textarea>
      </div>
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Key Accomplishments (One per line)</label>
        <textarea class="form-control" rows="4" onchange="currentData.experience[${idx}].bulletPoints = this.value.split('\\n').filter(s=>s.trim())">${(exp.bulletPoints || []).join('\n')}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateSkillsTab() {
  const opsContainer = document.getElementById('opsSkillsContainer');
  const techContainer = document.getElementById('techSkillsContainer');
  if (!opsContainer || !techContainer || !currentData.skills) return;

  opsContainer.innerHTML = '';
  techContainer.innerHTML = '';

  (currentData.skills.operations || []).forEach((sk, idx) => {
    const row = document.createElement('div');
    row.className = 'form-grid-2';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <input type="text" class="form-control" value="${sk.name}" onchange="currentData.skills.operations[${idx}].name = this.value">
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input type="number" min="0" max="100" class="form-control" style="width: 80px;" value="${sk.level}" onchange="currentData.skills.operations[${idx}].level = +this.value">
        <span>%</span>
        <input type="text" class="form-control" value="${sk.badge || ''}" placeholder="Badge" onchange="currentData.skills.operations[${idx}].badge = this.value">
      </div>
    `;
    opsContainer.appendChild(row);
  });

  (currentData.skills.tech || []).forEach((sk, idx) => {
    const row = document.createElement('div');
    row.className = 'form-grid-2';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <input type="text" class="form-control" value="${sk.name}" onchange="currentData.skills.tech[${idx}].name = this.value">
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input type="number" min="0" max="100" class="form-control" style="width: 80px;" value="${sk.level}" onchange="currentData.skills.tech[${idx}].level = +this.value">
        <span>%</span>
        <input type="text" class="form-control" value="${sk.badge || ''}" placeholder="Badge" onchange="currentData.skills.tech[${idx}].badge = this.value">
      </div>
    `;
    techContainer.appendChild(row);
  });
}

function populateAchievementsTab() {
  const container = document.getElementById('achievementsContainer');
  if (!container || !currentData.achievements) return;
  container.innerHTML = '';

  currentData.achievements.forEach((ach, idx) => {
    const card = document.createElement('div');
    card.className = 'item-editor-card';
    card.style.background = '#ffffff';
    card.style.padding = '1.25rem';
    card.style.borderRadius = '8px';
    card.style.marginBottom = '1rem';
    card.style.border = '1px solid #e2e8f0';

    card.innerHTML = `
      <div class="form-grid-3" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Achievement Title</label>
          <input type="text" class="form-control" value="${ach.title}" onchange="currentData.achievements[${idx}].title = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Organization / Company</label>
          <input type="text" class="form-control" value="${ach.organization}" onchange="currentData.achievements[${idx}].organization = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Date / Month</label>
          <input type="text" class="form-control" value="${ach.date}" onchange="currentData.achievements[${idx}].date = this.value">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Financial or Operational Value</label>
        <input type="text" class="form-control" value="${ach.value || ''}" onchange="currentData.achievements[${idx}].value = this.value">
      </div>
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Description Details</label>
        <textarea class="form-control" rows="3" onchange="currentData.achievements[${idx}].description = this.value">${ach.description || ''}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

// =========================================================================
// 4. Add & Delete Actions
// =========================================================================
function addProject() {
  if (!currentData.projects) currentData.projects = [];
  currentData.projects.push({
    id: 'proj-' + Date.now(),
    title: 'New Industrial Project',
    category: 'Full-Stack Web App',
    summary: 'Brief project summary...',
    challenge: 'Key problem faced...',
    solution: 'Architecture solution implemented...',
    metrics: 'Measurable ROI outcome',
    techStack: ['Laravel', 'MySQL']
  });
  populateProjectsTab();
  showAdminToast('New project draft added. Click Save when done.');
}

function deleteProject(idx) {
  if (confirm('Delete this project?')) {
    currentData.projects.splice(idx, 1);
    populateProjectsTab();
  }
}

function addExperience() {
  if (!currentData.experience) currentData.experience = [];
  currentData.experience.unshift({
    id: 'exp-' + Date.now(),
    role: 'New Position',
    company: 'Company Name',
    period: '2026 — Present',
    current: true,
    description: 'Overview of duties...',
    bulletPoints: ['Key achievement 1', 'Key achievement 2'],
    tags: ['Operations', 'Planning']
  });
  populateExperienceTab();
  showAdminToast('New role draft added. Click Save when done.');
}

function deleteExperience(idx) {
  if (confirm('Delete this experience entry?')) {
    currentData.experience.splice(idx, 1);
    populateExperienceTab();
  }
}

// =========================================================================
// 5. Persistence
// =========================================================================
async function saveAllChanges() {
  if (currentData.profile) {
    if (document.getElementById('profileName')) currentData.profile.name = document.getElementById('profileName').value;
    if (document.getElementById('profileRolePrimary')) currentData.profile.rolePrimary = document.getElementById('profileRolePrimary').value;
    if (document.getElementById('profileRoleSecondary')) currentData.profile.roleSecondary = document.getElementById('profileRoleSecondary').value;
    if (document.getElementById('profileEmail')) currentData.profile.email = document.getElementById('profileEmail').value;
    if (document.getElementById('profilePhone')) currentData.profile.phone = document.getElementById('profilePhone').value;
    if (document.getElementById('profileLocation')) currentData.profile.location = document.getElementById('profileLocation').value;
    if (document.getElementById('profileHeadline')) currentData.profile.heroHeadline = document.getElementById('profileHeadline').value;
    if (document.getElementById('profileBio')) currentData.profile.heroBio = document.getElementById('profileBio').value;
    if (document.getElementById('profileDiff')) currentData.profile.differentiator = document.getElementById('profileDiff').value;
  }

  if (!currentData.settings) currentData.settings = {};
  const logoInput = document.getElementById('settingLogoUrl');
  const bgInput = document.getElementById('settingBackgroundUrl');
  if (logoInput) currentData.settings.logoUrl = logoInput.value;
  if (bgInput) currentData.settings.backgroundUrl = bgInput.value;

  localStorage.setItem('portfolio_content', JSON.stringify(currentData));

  try {
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentData)
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        showAdminToast(result.message || 'Changes saved & synced live!');
        return;
      }
    }
    throw new Error('Save API error');
  } catch (err) {
    showAdminToast('Tersimpan di browser (localStorage).');
  }
}

function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "content.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showAdminToast('content.json downloaded successfully!');
}

function resetToDefault() {
  if (confirm('Reset to original file content? Any unsaved edits will be discarded.')) {
    localStorage.removeItem('portfolio_content');
    location.reload();
  }
}

function showAdminToast(msg) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Tab Navigation Controller
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initAdminData();

  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabSections = document.querySelectorAll('.admin-tab-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabSections.forEach(s => s.style.display = 'none');

      btn.classList.add('active');
      const targetSec = document.getElementById(target + 'Section');
      if (targetSec) targetSec.style.display = 'block';
    });
  });

  document.getElementById('authForm')?.addEventListener('submit', handleLogin);
});
