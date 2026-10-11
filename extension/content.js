// ============================================================
// Manners Quest — Content Script
// Listens for Enter keydowns in capture phase, polite-fies
// the message, and records gamification stats.
// ============================================================

(function () {
  // ---- State ----
  let state = Gamification.defaultState();
  let config = { enabled: true, prefix: 'Please. ', suffix: ' Thank you.' };

  // ---- Load persisted state ----
  chrome.storage.sync.get('mq_state', (data) => {
    if (data.mq_state) {
      state = { ...Gamification.defaultState(), ...data.mq_state };
    }
  });

  chrome.storage.sync.get('mq_config', (data) => {
    if (data.mq_config) {
      config = { ...config, ...data.mq_config };
    }
  });

  // ---- Persist state ----
  function saveState() {
    chrome.storage.sync.set({ mq_state: state });
  }

  // ---- DOM helpers ----
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function readValue(el) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value;
    return el.textContent || el.innerText || '';
  }

  function setNativeValue(el, value) {
    const proto = el.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : el.tagName === 'INPUT'
        ? HTMLInputElement.prototype
        : HTMLElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
      || Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'textContent')?.set;
    if (setter) {
      setter.call(el, value);
    } else {
      el.textContent = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ---- Analyze & record ----
  function recordPoliteMessage(originalText) {
    const analysis = PoliteEngine.analyze(originalText);
    if (!analysis.isPolite) return;

    const result = Gamification.recordMessage(state, analysis);
    state = result.state;
    saveState();

    // Track unique phrases
    if (analysis.hasPlease) {
      const match = originalText.toLowerCase().match(/(please|pls|plz|kindly)/);
      if (match) state = Gamification.trackPhrase(state, match[0]);
    }
    if (analysis.hasThank) {
      const match = originalText.toLowerCase().match(/(thank you|thanks|thx|cheers)/);
      if (match) state = Gamification.trackPhrase(state, match[0]);
    }

    // Notify popup
    chrome.runtime.sendMessage({
      type: 'MQ_MESSAGE_RECORDED',
      analysis,
      newBadges: result.newBadges,
      xpGained: result.xpGained,
      state: Gamification.getStats(state),
    }).catch(() => {});
  }

  // ---- Keydown handler (capture phase) ----
  document.addEventListener('keydown', function (e) {
    if (!config.enabled) return;
    if (e.key !== 'Enter') return;
    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

    const el = e.target;
    if (!isEditable(el)) return;

    const original = readValue(el);
    if (!original.trim()) return;

    // Check if already polite
    const analysis = PoliteEngine.analyze(original);
    if (analysis.isPolite) {
      // Already polite — just record it
      recordPoliteMessage(original);
      return; // Let the message send normally
    }

    // Not polite — patch it
    const polite = PoliteEngine.politeize(original);
    setNativeValue(el, polite);

    // Record the polite message
    recordPoliteMessage(polite);
  }, true);

  // ---- Click handler for send buttons (backup) ----
  document.addEventListener('click', function (e) {
    if (!config.enabled) return;
    const el = e.target;
    if (!isEditable(el)) return;

    const original = readValue(el);
    if (!original.trim()) return;

    const analysis = PoliteEngine.analyze(original);
    if (analysis.isPolite) {
      recordPoliteMessage(original);
    } else {
      const polite = PoliteEngine.politeize(original);
      setNativeValue(el, polite);
      recordPoliteMessage(polite);
    }
  }, true);

  // ---- Listen for config changes ----
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.mq_config) {
      config = { ...config, ...changes.mq_config.newValue };
    }
  });
})();
