// =============================================
//  PassForge – script.js
//  FULLY DEBUGGED VERSION
// =============================================

// --- Character Sets ---
const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// --- Strength Levels ---
const LEVELS = [
  { label: 'Very Weak',   color: '#ef4444', segs: 1 },
  { label: 'Weak',        color: '#f97316', segs: 2 },
  { label: 'Fair',        color: '#eab308', segs: 3 },
  { label: 'Strong',      color: '#22c55e', segs: 4 },
  { label: 'Very Strong', color: '#22d3ee', segs: 4 }
];

// --- State ---
let currentPassword  = '';
let currentPassword2 = '';
let visible1 = true;
let visible2 = true;
let history  = [];

// Load history from localStorage safely
try {
  history = JSON.parse(localStorage.getItem('pf_history') || '[]');
} catch(e) {
  history = [];
}

// =============================================
//  WAIT FOR DOM TO LOAD
// =============================================
document.addEventListener('DOMContentLoaded', function() {

  // ---- Get all elements ----
  const passText      = document.getElementById('passText');
  const passText2     = document.getElementById('passText2');
  const lengthSlider  = document.getElementById('lengthSlider');
  const lengthSlider2 = document.getElementById('lengthSlider2');
  const lenNum        = document.getElementById('lenNum');
  const lenNum2       = document.getElementById('lenNum2');
  const generateBtn   = document.getElementById('generateBtn');
  const generateBtn2  = document.getElementById('generateBtn2');
  const copyBtn       = document.getElementById('copyBtn');
  const copyBtn2      = document.getElementById('copyBtn2');
  const copyIconBtn   = document.getElementById('copyIconBtn');
  const copyIconBtn2  = document.getElementById('copyIconBtn2');
  const toggleBtn     = document.getElementById('toggleBtn');
  const toggleBtn2    = document.getElementById('toggleBtn2');
  const strBadge      = document.getElementById('strBadge');
  const strBadge2     = document.getElementById('strBadge2');
  const strLabel      = document.getElementById('strLabel');
  const strLabel2     = document.getElementById('strLabel2');
  const toast         = document.getElementById('toast');
  const histList      = document.getElementById('histList');
  const histCount     = document.getElementById('histCount');
  const clearBtn      = document.getElementById('clearBtn');

  const segs1 = ['s1','s2','s3','s4'].map(id => document.getElementById(id));
  const segs2 = ['s1b','s2b','s3b','s4b'].map(id => document.getElementById(id));

  // =============================================
  //  NAVIGATION
  // =============================================
  document.querySelectorAll('.nav-links li').forEach(function(li) {
    li.addEventListener('click', function() {
      // Remove active from all nav items
      document.querySelectorAll('.nav-links li').forEach(function(l) {
        l.classList.remove('active');
      });
      // Add active to clicked
      li.classList.add('active');

      // Hide all sections
      document.querySelectorAll('.section').forEach(function(s) {
        s.classList.remove('active');
      });

      // Show target section
      var target = li.getAttribute('data-section');
      var targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Render history when history tab clicked
      if (target === 'history') {
        renderHistory();
      }
    });
  });

  // =============================================
  //  SLIDERS
  // =============================================
  function updateSlider(slider, display) {
    var val = slider.value;
    var min = slider.min;
    var max = slider.max;
    var pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
    display.textContent = val;
  }

  lengthSlider.addEventListener('input', function() {
    updateSlider(lengthSlider, lenNum);
  });

  lengthSlider2.addEventListener('input', function() {
    updateSlider(lengthSlider2, lenNum2);
  });

  // Initialize sliders
  updateSlider(lengthSlider, lenNum);
  updateSlider(lengthSlider2, lenNum2);

  // =============================================
  //  OPTION CARD TOGGLES
  // =============================================
  var optPairs = [
    ['chkUp',  'optUp'],
    ['chkLo',  'optLo'],
    ['chkNum', 'optNum'],
    ['chkSym', 'optSym'],
    ['chkUp2', 'optUp2'],
    ['chkLo2', 'optLo2'],
    ['chkNum2','optNum2'],
    ['chkSym2','optSym2']
  ];

  optPairs.forEach(function(pair) {
    var cbId   = pair[0];
    var cardId = pair[1];
    var card   = document.getElementById(cardId);
    var cb     = document.getElementById(cbId);

    if (card && cb) {
      card.addEventListener('click', function() {
        setTimeout(function() {
          card.classList.toggle('active', cb.checked);
          var box = card.querySelector('.chk-box');
          if (box) {
            if (cb.checked) {
              box.classList.add('on');
            } else {
              box.classList.remove('on');
            }
          }
        }, 0);
      });
    }
  });

  // =============================================
  //  BUILD CHARACTER SET
  // =============================================
  function buildCharset(upId, loId, numId, symId) {
    var charset = '';
    if (document.getElementById(upId) && document.getElementById(upId).checked)  charset += CHARSET.uppercase;
    if (document.getElementById(loId) && document.getElementById(loId).checked)  charset += CHARSET.lowercase;
    if (document.getElementById(numId) && document.getElementById(numId).checked) charset += CHARSET.numbers;
    if (document.getElementById(symId) && document.getElementById(symId).checked) charset += CHARSET.symbols;
    return charset;
  }

  // =============================================
  //  GENERATE PASSWORD
  // =============================================
  function makePassword(len, charset) {
    var arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    var pwd = '';
    for (var i = 0; i < len; i++) {
      pwd += charset[arr[i] % charset.length];
    }
    return pwd;
  }

  // =============================================
  //  STRENGTH CALCULATOR
  // =============================================
  function calcStrength(pwd) {
    var score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 20) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(Math.floor(score / 1.2), 4);
  }

  // =============================================
  //  UPDATE STRENGTH BAR
  // =============================================
  function applyStrength(pwd, segs, badge, label) {
    var lvl   = calcStrength(pwd);
    var level = LEVELS[lvl];

    segs.forEach(function(seg, i) {
      if (seg) {
        seg.style.background = i < level.segs ? level.color : 'rgba(255,255,255,0.08)';
      }
    });

    if (badge) {
      badge.style.background  = level.color + '18';
      badge.style.borderColor = level.color + '44';
      badge.style.color       = level.color;
    }
    if (label) {
      label.textContent = level.label;
    }
  }

  // =============================================
  //  HOME — GENERATE
  // =============================================
  function generateHome() {
    var len     = parseInt(lengthSlider.value);
    var charset = buildCharset('chkUp', 'chkLo', 'chkNum', 'chkSym');

    if (!charset) {
      alert('Please select at least one character type!');
      return;
    }

    var pwd = makePassword(len, charset);
    currentPassword = pwd;
    visible1 = true;

    passText.textContent = pwd;
    toggleBtn.innerHTML  = '<i class="fas fa-eye"></i>';

    applyStrength(pwd, segs1, strBadge, strLabel);
    addToHistory(pwd);
    saveToBackend(pwd, len, 'chkUp', 'chkLo', 'chkNum', 'chkSym');
  }

  // =============================================
  //  GENERATOR PAGE — GENERATE
  // =============================================
  function generateGen() {
    var len     = parseInt(lengthSlider2.value);
    var charset = buildCharset('chkUp2', 'chkLo2', 'chkNum2', 'chkSym2');

    if (!charset) {
      alert('Please select at least one character type!');
      return;
    }

    var pwd = makePassword(len, charset);
    currentPassword2 = pwd;
    visible2 = true;

    passText2.textContent = pwd;
    toggleBtn2.innerHTML  = '<i class="fas fa-eye"></i>';

    applyStrength(pwd, segs2, strBadge2, strLabel2);
    addToHistory(pwd);
    saveToBackend(pwd, len, 'chkUp2', 'chkLo2', 'chkNum2', 'chkSym2');
  }

  // =============================================
  //  GENERATE BUTTON EVENTS
  // =============================================
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      generateHome();
    });
  }

  if (generateBtn2) {
    generateBtn2.addEventListener('click', function() {
      generateGen();
    });
  }

  // =============================================
  //  COPY TO CLIPBOARD
  // =============================================
  function copyText(text) {
    if (!text || text === 'Click Generate to forge your password' || text === 'Your password will appear here') {
      alert('Please generate a password first!');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast();
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      showToast();
    } catch(e) {
      alert('Copy failed! Please copy manually.');
    }
    document.body.removeChild(el);
  }

  function showToast() {
    toast.classList.add('show');
    setTimeout(function() {
      toast.classList.remove('show');
    }, 2200);
  }

  // Copy button events
  if (copyBtn)      copyBtn.addEventListener('click',      function() { copyText(currentPassword); });
  if (copyIconBtn)  copyIconBtn.addEventListener('click',  function() { copyText(currentPassword); });
  if (copyBtn2)     copyBtn2.addEventListener('click',     function() { copyText(currentPassword2); });
  if (copyIconBtn2) copyIconBtn2.addEventListener('click', function() { copyText(currentPassword2); });

  // =============================================
  //  TOGGLE VISIBILITY
  // =============================================
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      visible1 = !visible1;
      if (!currentPassword) return;
      passText.textContent = visible1 ? currentPassword : '•'.repeat(currentPassword.length);
      toggleBtn.innerHTML  = visible1 ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  }

  if (toggleBtn2) {
    toggleBtn2.addEventListener('click', function() {
      visible2 = !visible2;
      if (!currentPassword2) return;
      passText2.textContent = visible2 ? currentPassword2 : '•'.repeat(currentPassword2.length);
      toggleBtn2.innerHTML  = visible2 ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  }

  // =============================================
  //  HISTORY
  // =============================================
  function addToHistory(pwd) {
    var lvl = calcStrength(pwd);
    history.unshift({
      pw:       pwd,
      strength: LEVELS[lvl].label,
      color:    LEVELS[lvl].color,
      time:     new Date().toLocaleTimeString()
    });
    if (history.length > 30) history.pop();
    try {
      localStorage.setItem('pf_history', JSON.stringify(history));
    } catch(e) {}
  }

  function renderHistory() {
    if (!histList || !histCount) return;
    histCount.textContent = history.length + ' password' + (history.length !== 1 ? 's' : '') + ' generated';

    if (history.length === 0) {
      histList.innerHTML = '<div class="empty-state"><i class="fas fa-shield-halved"></i><p>No passwords yet.<br/>Go to Generator and create one!</p></div>';
      return;
    }

    var html = '';
    history.forEach(function(h, i) {
      html += '<div class="hist-item">' +
        '<span class="hist-pw">' + h.pw + '</span>' +
        '<div class="hist-meta">' +
          '<span class="hist-str" style="background:' + h.color + '18;color:' + h.color + ';border:1px solid ' + h.color + '33">' + h.strength + '</span>' +
          '<span class="hist-time">' + h.time + '</span>' +
        '</div>' +
        '<button class="hist-del" onclick="deleteHistoryItem(' + i + ')" type="button"><i class="fas fa-trash"></i></button>' +
      '</div>';
    });
    histList.innerHTML = html;
  }

  // Make delete function global
  window.deleteHistoryItem = function(i) {
    history.splice(i, 1);
    try {
      localStorage.setItem('pf_history', JSON.stringify(history));
    } catch(e) {}
    renderHistory();
  };

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (history.length === 0) return;
      if (confirm('Clear all password history?')) {
        history = [];
        try {
          localStorage.setItem('pf_history', JSON.stringify(history));
        } catch(e) {}
        renderHistory();
      }
    });
  }

  // =============================================
  //  BACKEND SAVE (silent - won't break if offline)
  // =============================================
  function saveToBackend(pwd, len, upId, loId, numId, symId) {
    try {
      var lvl = calcStrength(pwd);
      fetch('http://localhost:5000/api/password/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          length:   len,
          options: {
            uppercase: document.getElementById(upId) ? document.getElementById(upId).checked : false,
            lowercase: document.getElementById(loId) ? document.getElementById(loId).checked : false,
            numbers:   document.getElementById(numId) ? document.getElementById(numId).checked : false,
            symbols:   document.getElementById(symId) ? document.getElementById(symId).checked : false
          },
          strength: LEVELS[lvl].label
        })
      }).catch(function() {
        // Backend offline - frontend still works fine
        console.log('Backend offline - running in standalone mode');
      });
    } catch(e) {
      console.log('Backend not available');
    }
  }

  // =============================================
  //  AUTO GENERATE ON PAGE LOAD
  // =============================================
  generateHome();

}); // END DOMContentLoaded
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