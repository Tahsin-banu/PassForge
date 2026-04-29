// =============================================
//  PassForge – script.js  (Full Interactive)
//  Handles: Navigation, Generation, History,
//           Strength, Copy, Toggle visibility
// =============================================

const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const LEVELS = [
  { label:'Very Weak',  color:'#ef4444', segs:1 },
  { label:'Weak',       color:'#f97316', segs:2 },
  { label:'Fair',       color:'#eab308', segs:3 },
  { label:'Strong',     color:'#22c55e', segs:4 },
  { label:'Very Strong',color:'#22d3ee', segs:4 }
];

// --- State ---
let passwords     = { home:'', gen:'' };
let visible       = { home:true, gen:true };
let history       = JSON.parse(localStorage.getItem('pf_history') || '[]');

// =============================================
//  NAVIGATION
// =============================================
document.querySelectorAll('.nav-links li').forEach(li => {
  li.addEventListener('click', () => {
    // Update active nav
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    li.classList.add('active');
    // Show section
    const target = li.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    // Refresh history list when opening history tab
    if (target === 'history') renderHistory();
  });
});

// =============================================
//  STRENGTH
// =============================================
function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 20) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(Math.floor(score / 1.2), 4);
}

function applyStrength(pwd, segIds, badgeId, labelId) {
  const lvl = calcStrength(pwd);
  const { label, color, segs } = LEVELS[lvl];
  segIds.forEach((id, i) => {
    document.getElementById(id).style.background = i < segs ? color : 'rgba(255,255,255,0.08)';
  });
  const badge = document.getElementById(badgeId);
  const lbl   = document.getElementById(labelId);
  lbl.textContent       = label;
  badge.style.background   = color + '18';
  badge.style.borderColor  = color + '44';
  badge.style.color        = color;
}

// =============================================
//  PASSWORD GENERATION
// =============================================
function buildCharset(upId, loId, numId, symId) {
  let c = '';
  if (document.getElementById(upId).checked)  c += CHARSET.uppercase;
  if (document.getElementById(loId).checked)  c += CHARSET.lowercase;
  if (document.getElementById(numId).checked) c += CHARSET.numbers;
  if (document.getElementById(symId).checked) c += CHARSET.symbols;
  return c;
}

function makePassword(len, charset) {
  if (!charset) return null;
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(v => charset[v % charset.length]).join('');
}

// ---- HOME generator ----
function generateHome() {
  const len     = parseInt(document.getElementById('lengthSlider').value);
  const charset = buildCharset('chkUp','chkLo','chkNum','chkSym');
  if (!charset) { alert('Select at least one option!'); return; }
  const pwd = makePassword(len, charset);
  passwords.home = pwd;
  visible.home   = true;
  document.getElementById('passText').textContent = pwd;
  document.getElementById('toggleBtn').innerHTML  = '<i class="fas fa-eye"></i>';
  applyStrength(pwd, ['s1','s2','s3','s4'], 'strBadge', 'strLabel');
  addToHistory(pwd);
  saveToBackend(pwd, len, 'chkUp','chkLo','chkNum','chkSym');
}

// ---- GENERATOR PAGE ----
function generateGen() {
  const len     = parseInt(document.getElementById('lengthSlider2').value);
  const charset = buildCharset('chkUp2','chkLo2','chkNum2','chkSym2');
  if (!charset) { alert('Select at least one option!'); return; }
  const pwd = makePassword(len, charset);
  passwords.gen = pwd;
  visible.gen   = true;
  document.getElementById('passText2').textContent = pwd;
  document.getElementById('toggleBtn2').innerHTML  = '<i class="fas fa-eye"></i>';
  applyStrength(pwd, ['s1b','s2b','s3b','s4b'], 'strBadge2', 'strLabel2');
  addToHistory(pwd);
  saveToBackend(pwd, len, 'chkUp2','chkLo2','chkNum2','chkSym2');
}

// =============================================
//  SLIDERS
// =============================================
function bindSlider(sliderId, numId) {
  const sl  = document.getElementById(sliderId);
  const num = document.getElementById(numId);
  function update() {
    const pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
    sl.style.setProperty('--pct', pct + '%');
    num.textContent = sl.value;
  }
  sl.addEventListener('input', update);
  update();
}
bindSlider('lengthSlider',  'lenNum');
bindSlider('lengthSlider2', 'lenNum2');

// =============================================
//  OPTION CARD TOGGLES
// =============================================
function bindOpts(pairs) {
  pairs.forEach(([cbId, cardId]) => {
    const card = document.getElementById(cardId);
    card.addEventListener('click', () => {
      setTimeout(() => {
        const checked = document.getElementById(cbId).checked;
        card.classList.toggle('active', checked);
        const box = card.querySelector('.chk-box');
        box.classList.toggle('on', checked);
      }, 0);
    });
  });
}
bindOpts([
  ['chkUp','optUp'],['chkLo','optLo'],['chkNum','optNum'],['chkSym','optSym'],
  ['chkUp2','optUp2'],['chkLo2','optLo2'],['chkNum2','optNum2'],['chkSym2','optSym2']
]);

// =============================================
//  COPY
// =============================================
function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(showToast).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast();
  });
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

document.getElementById('copyBtn').addEventListener('click',      () => copyText(passwords.home));
document.getElementById('copyIconBtn').addEventListener('click',  () => copyText(passwords.home));
document.getElementById('copyBtn2').addEventListener('click',     () => copyText(passwords.gen));
document.getElementById('copyIconBtn2').addEventListener('click', () => copyText(passwords.gen));

// =============================================
//  TOGGLE VISIBILITY
// =============================================
function bindToggle(btnId, textId, key) {
  document.getElementById(btnId).addEventListener('click', () => {
    visible[key] = !visible[key];
    const pwd = passwords[key];
    document.getElementById(textId).textContent =
      visible[key] ? (pwd || '—') : '•'.repeat((pwd || '').length || 10);
    document.getElementById(btnId).innerHTML =
      visible[key] ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });
}
bindToggle('toggleBtn',  'passText',  'home');
bindToggle('toggleBtn2', 'passText2', 'gen');

// =============================================
//  HISTORY
// =============================================
function addToHistory(pwd) {
  const lvl = calcStrength(pwd);
  history.unshift({
    pw:       pwd,
    strength: LEVELS[lvl].label,
    color:    LEVELS[lvl].color,
    time:     new Date().toLocaleTimeString()
  });
  if (history.length > 30) history.pop();
  localStorage.setItem('pf_history', JSON.stringify(history));
}

function renderHistory() {
  const list  = document.getElementById('histList');
  const count = document.getElementById('histCount');
  count.textContent = `${history.length} password${history.length !== 1 ? 's' : ''} generated`;
  if (history.length === 0) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-shield-halved"></i><p>No passwords yet.<br/>Go to Generator and create one!</p></div>`;
    return;
  }
  list.innerHTML = history.map((h, i) => `
    <div class="hist-item" id="hi${i}">
      <span class="hist-pw">${h.pw}</span>
      <div class="hist-meta">
        <span class="hist-str" style="background:${h.color}18;color:${h.color};border:1px solid ${h.color}33">${h.strength}</span>
        <span class="hist-time">${h.time}</span>
      </div>
      <button class="hist-del" onclick="deleteHistory(${i})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function deleteHistory(i) {
  history.splice(i, 1);
  localStorage.setItem('pf_history', JSON.stringify(history));
  renderHistory();
}

document.getElementById('clearBtn').addEventListener('click', () => {
  if (history.length === 0) return;
  if (confirm('Clear all password history?')) {
    history = [];
    localStorage.setItem('pf_history', JSON.stringify(history));
    renderHistory();
  }
});

// =============================================
//  BACKEND SAVE
// =============================================
async function saveToBackend(pwd, len, upId, loId, numId, symId) {
  try {
    const lvl = calcStrength(pwd);
    await fetch('http://localhost:5000/api/password/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: pwd, length: len,
        options: {
          uppercase: document.getElementById(upId).checked,
          lowercase: document.getElementById(loId).checked,
          numbers:   document.getElementById(numId).checked,
          symbols:   document.getElementById(symId).checked
        },
        strength: LEVELS[lvl].label
      })
    });
  } catch { console.info('Backend offline – standalone mode.'); }
}

// =============================================
//  GENERATE ON LOAD
// =============================================
generateHome();