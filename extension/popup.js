// ============================================================
// Manners Quest — Popup Script
// ============================================================

let state = Gamification.defaultState();
let config = { enabled: true };

// ---- Load state ----
chrome.storage.sync.get(['mq_state', 'mq_config'], (data) => {
  if (data.mq_state) state = { ...Gamification.defaultState(), ...data.mq_state };
  if (data.mq_config) config = { ...config, ...data.mq_config };
  render();
});

// ---- Listen for updates from content script ----
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'MQ_MESSAGE_RECORDED') {
    state = message.state;
    render();
    if (message.newBadges && message.newBadges.length > 0) {
      showNewBadges(message.newBadges);
    }
  }
});

// ---- Render ----
function render() {
  const stats = Gamification.getStats(state);

  // Level
  document.getElementById('levelName').textContent = stats.progress.current.name;
  if (stats.progress.next) {
    document.getElementById('levelXp').textContent = `${stats.xp} / ${stats.progress.next.xp} XP`;
    document.getElementById('progressFill').style.width = stats.progress.percent + '%';
    document.getElementById('progressText').textContent = `Level ${stats.level} → ${stats.progress.next.name}`;
  } else {
    document.getElementById('levelXp').textContent = `${stats.xp} XP (MAX)`;
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressText').textContent = `Level ${stats.level} — Max Level!`;
  }

  // Stats
  document.getElementById('statPolite').textContent = stats.totalPolite;
  document.getElementById('statPlease').textContent = stats.totalPlease;
  document.getElementById('statThank').textContent = stats.totalThank;

  // Streak
  document.getElementById('streakNum').textContent = stats.currentStreak;
  document.getElementById('bestStreak').textContent = stats.bestStreak;

  // Today
  document.getElementById('todayPolite').textContent = stats.todayLog.polite;
  document.getElementById('todayPlease').textContent = stats.todayLog.please;
  document.getElementById('todayThank').textContent = stats.todayLog.thank;
  document.getElementById('todayPerfect').textContent = stats.todayLog.perfect;

  // Badges
  document.getElementById('badgeCount').textContent = `${stats.badgesEarned}/${stats.badgesTotal}`;
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = '';
  for (const badge of stats.badges) {
    const div = document.createElement('div');
    div.className = 'badge-item ' + (badge.earned ? 'badge-earned' : 'badge-locked');
    div.innerHTML = `${badge.icon}<span class="tooltip">${badge.name}: ${badge.desc}</span>`;
    grid.appendChild(div);
  }

  // Toggle
  const toggle = document.getElementById('toggleBtn');
  toggle.className = 'toggle' + (config.enabled ? ' active' : '');
}

// ---- Toggle ----
document.getElementById('toggleBtn').addEventListener('click', () => {
  config.enabled = !config.enabled;
  chrome.storage.sync.set({ mq_config: config });
  render();
});

// ---- Dashboard link ----
document.getElementById('dashboardLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
});

// ---- New badge toast ----
function showNewBadges(badges) {
  const container = document.getElementById('newBadges');
  container.innerHTML = '';
  for (const badge of badges) {
    const div = document.createElement('div');
    div.className = 'new-badge-toast';
    div.textContent = `🏅 New Badge: ${badge.icon} ${badge.name}`;
    container.appendChild(div);
  }
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}
