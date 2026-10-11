// ============================================================
// Manners Quest — Background Service Worker
// Handles badge notifications and extension icon updates.
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MQ_MESSAGE_RECORDED') {
    updateBadge(message.state);
    if (message.newBadges && message.newBadges.length > 0) {
      showBadgeNotification(message.newBadges);
    }
    sendResponse({ ok: true });
  }
  return true;
});

function updateBadge(state) {
  const stats = Gamification.getStats(state);
  const text = stats.level > 1 ? String(stats.level) : '';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#7c3aed' });
}

function showBadgeNotification(badges) {
  const badge = badges[0];
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🏅 New Badge Earned!',
    message: `${badge.icon} ${badge.name}: ${badge.desc}`,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('mq_state', (data) => {
    if (data.mq_state) updateBadge(data.mq_state);
  });
});
