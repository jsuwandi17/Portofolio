/**
 * JAENUDIN SUWANDI — ADMIN DASHBOARD LOGIC (FIXED DATA FETCHING)
 */

let currentData = null;

// 1. Auth Management
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
    initAdminData();
  } else {
    if (errorElement) errorElement.textContent = 'Username atau password salah! (admin / admin123)';
    passInput.value = '';
    passInput.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem('admin_logged_in');
  checkAuth();
}

// 2. Data Initialization — ABSOLUTE PATH FIX
async function initAdminData() {
  try {
    // Memakai Absolute Path /data/content.json agar selalu tepat di Vercel & Lokal
    const res = await fetch('/data/content.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      currentData = await res.json();
    } else {
      throw new Error('HTTP ' + res.status);
    }
  } catch (err) {
    console.warn('[Admin] Server fetch gagal, mencoba localStorage cache...', err);
    const cached = localStorage.getItem('portfolio_content');
    if (cached) {
      try { currentData = JSON.parse(cached); } catch (e) { currentData = null; }
    }
  }

  if (!currentData) {
    console.error('[Admin] Gagal memuat data dari content.json.');
    return;
  }

  localStorage.setItem('portfolio_content', JSON.stringify(currentData));
  populateAllTabs();
}

// 3. Tab Populators
function populateAllTabs() {
  if (!currentData) return;
  populateProfileTab();
  populateProjectsTab();
  populateExperienceTab();
  populateSkillsTab();
  populateAchievementsTab();
  populateSettingsTab();
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
    card.style.border = '1px solid #cbd5e1';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: #0f172a; margin: 0;">Project #${idx + 1}: ${proj.title}</h4>
        <button type="button" class="btn-admin btn-admin-danger" onclick="deleteProject(${idx})">Delete</button>
      </div>
      <div class="form-grid-2" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Project Title</label>
          <input type="text" class="form-control" value="${proj.title || ''}" onchange="currentData.projects[${idx}].title = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Category / Badge</label>
          <input type="text" class="form-control" value="${proj.category || ''}" onchange="currentData.projects[${idx}].category = this.value">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Summary</label>
        <input type="text" class="form-control" value="${proj.summary || ''}" onchange="currentData.projects[${idx}].summary = this.value">
      </div>
      <div class="form-grid-2">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Business Challenge</label>
          <textarea class="form-control" rows="3" onchange="currentData.projects[${idx}].challenge = this.value">${proj.challenge || ''}</textarea>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Technical Solution</label>
          <textarea class="form-control" rows="3" onchange="currentData.projects[${idx}].solution = this.value">${proj.solution || ''}</textarea>
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
    card.style.border = '1px solid #cbd5e1';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: #0f172a; margin:0;">${exp.role} @ ${exp.company}</h4>
        <button type="button" class="btn-admin btn-admin-danger" onclick="deleteExperience(${idx})">Delete</button>
      </div>
      <div class="form-grid-3" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Job Role</label>
          <input type="text" class="form-control" value="${exp.role || ''}" onchange="currentData.experience[${idx}].role = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Company Name</label>
          <input type="text" class="form-control" value="${exp.company || ''}" onchange="currentData.experience[${idx}].company = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Period</label>
          <input type="text" class="form-control" value="${exp.period || ''}" onchange="currentData.experience[${idx}].period = this.value">
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Description Summary</label>
        <textarea class="form-control" rows="2" onchange="currentData.experience[${idx}].description = this.value">${exp.description || ''}</textarea>
      </div>
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Key Accomplishments (1 per baris)</label>
        <textarea class="form-control" rows="3" onchange="currentData.experience[${idx}].bulletPoints = this.value.split('\\n').filter(s=>s.trim())">${(exp.bulletPoints || []).join('\n')}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateSkillsTab() {
  const opsContainer = document.getElementById('opsSkillsContainer');
  const techContainer = document.getElementById('techSkillsContainer');
  if (!opsContainer || !techContainer || !currentData.skills) return;

  opsContainer.innerHTML = '<h3 style="color:#0f172a; margin-bottom:0.75rem;">Operations Skills</h3>';
  techContainer.innerHTML = '<h3 style="color:#0f172a; margin-bottom:0.75rem;">Tech Skills</h3>';

  (currentData.skills.operations || []).forEach((sk, idx) => {
    const row = document.createElement('div');
    row.className = 'form-grid-2';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <input type="text" class="form-control" value="${sk.name}" onchange="currentData.skills.operations[${idx}].name = this.value">
      <input type="number" min="0" max="100" class="form-control" value="${sk.level}" onchange="currentData.skills.operations[${idx}].level = +this.value">
    `;
    opsContainer.appendChild(row);
  });

  (currentData.skills.tech || []).forEach((sk, idx) => {
    const row = document.createElement('div');
    row.className = 'form-grid-2';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <input type="text" class="form-control" value="${sk.name}" onchange="currentData.skills.tech[${idx}].name = this.value">
      <input type="number" min="0" max="100" class="form-control" value="${sk.level}" onchange="currentData.skills.tech[${idx}].level = +this.value">
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
    card.style.border = '1px solid #cbd5e1';

    card.innerHTML = `
      <div class="form-grid-3" style="margin-bottom: 1rem;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Title</label>
          <input type="text" class="form-control" value="${ach.title || ''}" onchange="currentData.achievements[${idx}].title = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Organization</label>
          <input type="text" class="form-control" value="${ach.organization || ''}" onchange="currentData.achievements[${idx}].organization = this.value">
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">Date</label>
          <input type="text" class="form-control" value="${ach.date || ''}" onchange="currentData.achievements[${idx}].date = this.value">
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateSettingsTab() {
  const s = currentData.settings || {};
  if (document.getElementById('settingLogoUrl')) document.getElementById('settingLogoUrl').value = s.logoUrl || '';
  if (document.getElementById('settingBackgroundUrl')) document.getElementById('settingBackgroundUrl').value = s.backgroundUrl || '';
}

// 4. Actions
function addProject() {
  if (!currentData.projects) currentData.projects = [];
  currentData.projects.push({
    id: 'proj-' + Date.now(),
    title: 'New Industrial Project',
    category: 'Full-Stack Web App',
    summary: 'Project summary...',
    challenge: 'Key problem...',
    solution: 'Solution...'
  });
  populateProjectsTab();
}

function deleteProject(idx) {
  if (confirm('Hapus project ini?')) {
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
    description: 'Duties...',
    bulletPoints: ['Key achievement 1']
  });
  populateExperienceTab();
}

function deleteExperience(idx) {
  if (confirm('Hapus pengalaman ini?')) {
    currentData.experience.splice(idx, 1);
    populateExperienceTab();
  }
}

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

  localStorage.setItem('portfolio_content', JSON.stringify(currentData));

  try {
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentData)
    });
    if (res.ok) {
      alert('Data berhasil disimpan dan disinkronkan!');
      return;
    }
  } catch (err) {
    alert('Tersimpan di browser (localStorage).');
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
}
