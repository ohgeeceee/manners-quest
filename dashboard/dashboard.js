// ============================================================
// Manners Quest — Dashboard Script
// ============================================================

let state = Gamification.defaultState();
let config = { enabled: true, prefix: 'Please. ', suffix: ' Thank you.' };

// ---- Load state ----
chrome.storage.sync.get(['mq_state', 'mq_config'], (data) => {
  if (data.mq_state) state = { ...Gamification.defaultState(), ...data.mq_state };
  if (data.mq_config) config = { ...config, ...data.mq_config };
  render();
});

// ---- Listen for updates ----
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'MQ_MESSAGE_RECORDED') {
    state = message.state;
    render();
  }
});

// ---- Render ----
function render() {
  const stats = Gamification.getStats(state);

  // Level
  document.getElementById('levelName').textContent = stats.progress.current.name;
  if (stats.progress.next) {
    document.getElementById('levelXp').textContent = `${stats.xp} XP`;
    document.getElementById('progressFill').style.width = stats.progress.percent + '%';
    document.getElementById('levelCurrent').textContent = `Level ${stats.level}`;
    document.getElementById('levelNext').textContent = `Next: ${stats.progress.next.name} (${stats.progress.next.xp} XP)`;
  } else {
    document.getElementById('levelXp').textContent = `${stats.xp} XP (MAX)`;
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('levelCurrent').textContent = `Level ${stats.level} — Max!`;
    document.getElementById('levelNext').textContent = '';
  }

  // Stats
  document.getElementById('statPolite').textContent = stats.totalPolite;
  document.getElementById('statPlease').textContent = stats.totalPlease;
  document.getElementById('statThank').textContent = stats.totalThank;
  document.getElementById('statPerfect').textContent = stats.totalPerfect;

  // Streak
  document.getElementById('streakNum').textContent = stats.currentStreak;
  document.getElementById('bestStreak').textContent = stats.bestStreak;

  // Daily chart
  renderDailyChart(stats);

  // Badges
  document.getElementById('badgeCount').textContent = `${stats.badgesEarned}/${stats.badgesTotal}`;
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = '';
  for (const badge of stats.badges) {
    const div = document.createElement('div');
    div.className = 'badge-item ' + (badge.earned ? 'badge-earned' : 'badge-locked');
    div.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <span class="badge-name">${badge.name}</span>
      <span class="badge-desc">${badge.desc}</span>
    `;
    grid.appendChild(div);
  }

  // Phrase cloud
  const cloud = document.getElementById('phraseCloud');
  cloud.innerHTML = '';
  const phrases = Object.entries(stats.phraseHistory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  if (phrases.length === 0) {
    cloud.innerHTML = '<span style="color: #6b6780; font-size: 13px;">No phrases yet — start being polite!</span>';
  } else {
    for (const [phrase, count] of phrases) {
      const tag = document.createElement('span');
      tag.className = 'phrase-tag';
      tag.innerHTML = `${phrase} <span class="count">×${count}</span>`;
      cloud.appendChild(tag);
    }
  }

  // Settings
  const toggle = document.getElementById('toggleEnabled');
  toggle.className = 'toggle' + (config.enabled ? ' active' : '');
  document.getElementById('prefixInput').value = config.prefix;
  document.getElementById('suffixInput').value = config.suffix;
}

// ---- Daily chart ----
function renderDailyChart(stats) {
  const chart = document.getElementById('dailyChart');
  chart.innerHTML = '';

  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const log = stats.dailyLog[key] || { polite: 0 };
    days.push({ key, label, count: log.polite });
  }

  const max = Math.max(...days.map((d) => d.count), 1);

  for (const day of days) {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    const height = Math.max((day.count / max) * 100, 4);
    bar.style.height = height + '%';
    bar.innerHTML = `
      <span class="bar-value">${day.count || ''}</span>
      <span class="bar-label">${day.label}</span>
    `;
    chart.appendChild(bar);
  }
}

// ---- Settings handlers ----
document.getElementById('toggleEnabled').addEventListener('click', () => {
  config.enabled = !config.enabled;
  chrome.storage.sync.set({ mq_config: config });
  render();
});

document.getElementById('prefixInput').addEventListener('change', (e) => {
  config.prefix = e.target.value;
  chrome.storage.sync.set({ mq_config: config });
});

document.getElementById('suffixInput').addEventListener('change', (e) => {
  config.suffix = e.target.value;
  chrome.storage.sync.set({ mq_config: config });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Reset all progress? This cannot be undone.')) {
    state = Gamification.defaultState();
    chrome.storage.sync.set({ mq_state: state });
    render();
  }
});
