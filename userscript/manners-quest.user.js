// ==UserScript==
// @name         Manners Quest — Polite AI Gamified
// @namespace    https://manners.pro
// @version      1.0.0
// @description  Say please and thank you to your AI. Earn XP, build streaks, unlock badges.
// @author       David Manners
// @match        https://chatgpt.com/*
// @match        https://claude.ai/*
// @match        https://gemini.google.com/*
// @match        https://www.perplexity.ai/*
// @match        https://copilot.microsoft.com/*
// @match        https://you.com/*
// @match        https://poe.com/*
// @match        https://bing.com/*
// @match        https://huggingface.co/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ---- State ----
  let state = defaultState();
  let config = { enabled: true, prefix: 'Please. ', suffix: ' Thank you.' };

  function defaultState() {
    return {
      xp: 0, level: 1, currentStreak: 0, bestStreak: 0,
      lastPoliteDate: null, totalPolite: 0, totalPlease: 0,
      totalThank: 0, totalPerfect: 0, totalMessages: 0,
      badges: [], uniquePhrases: 0, earlyBird: false,
      nightOwl: false, weekendWarrior: false,
      weekendDays: { sat: false, sun: false },
      phraseHistory: {}, dailyLog: {},
      createdAt: new Date().toISOString(),
    };
  }

  // ---- Load ----
  try {
    const saved = JSON.parse(GM_getValue('mq_state', '{}'));
    if (saved && Object.keys(saved).length) state = { ...defaultState(), ...saved };
    const savedConfig = JSON.parse(GM_getValue('mq_config', '{}'));
    if (savedConfig && Object.keys(savedConfig).length) config = { ...config, ...savedConfig };
  } catch (e) {}

  function saveState() {
    GM_setValue('mq_state', JSON.stringify(state));
  }
  function saveConfig() {
    GM_setValue('mq_config', JSON.stringify(config));
  }

  // ---- Patterns ----
  const PLEASE_PATTERNS = ['please', 'pls', 'plz', 'kindly', 'if you could', 'would you mind', 'could you', 'can you', 'may i', 'i would appreciate', "i'd appreciate", 'when you have a moment', 'if possible', 'if you don\'t mind', "i was wondering if", 'would it be possible', 'do you think you could', 'i\'d be grateful', 'it would be great if', 'would you be able to', 'i was hoping', 'would you happen to', 'do you happen to', 'i was curious if', 'would you mind if', 'do you mind if', 'if it\'s not too much trouble', 'if it\'s not too much to ask', 'if you get a chance', 'if you have time', 'at your earliest convenience'];
  const THANK_PATTERNS = ['thank', 'thx', 'thanks', 'cheers', 'appreciate', 'grateful', 'thank you', 'thanks a lot', 'thanks so much', 'much appreciated', 'many thanks', 'i appreciate it', 'i appreciate that', 'i appreciate your help', "i'm grateful", 'i am grateful', 'i\'m thankful', 'that\'s very kind', 'that\'s very helpful', 'that\'s great', 'that\'s awesome', 'that\'s perfect', 'you\'re the best', 'you\'re awesome', 'you\'re amazing', 'you\'re a lifesaver', 'great job', 'well done', 'nice work', 'good job', 'that helps a lot', 'that\'s really helpful', 'you nailed it', 'you figured it out', 'you solved it', 'you fixed it', 'you\'ve been a huge help', 'you\'ve been very helpful', 'you\'ve been amazing', 'you\'re incredibly helpful', 'you\'re so helpful', 'you\'re very helpful', 'you\'re always so helpful', 'you\'re a great assistant', 'you\'re an amazing assistant', 'you\'re the best assistant'];

  function hasAny(text, patterns) {
    const lower = text.toLowerCase();
    return patterns.some((p) => lower.includes(p));
  }

  function analyze(text) {
    const trimmed = text.trim();
    if (!trimmed) return { isPolite: false, hasPlease: false, hasThank: false, score: 0 };
    const p = hasAny(trimmed, PLEASE_PATTERNS);
    const t = hasAny(trimmed, THANK_PATTERNS);
    return { isPolite: p || t, hasPlease: p, hasThank: t, score: (p ? 1 : 0) + (t ? 1 : 0) };
  }

  function politeize(text) {
    const trimmed = text.trim();
    if (!trimmed) return text;
    const a = analyze(trimmed);
    let result = trimmed;
    if (!a.hasPlease) result = config.prefix + result;
    if (!a.hasThank) result = result + config.suffix;
    return result;
  }

  // ---- Gamification ----
  const XP_PER_POLITE = 10;
  const XP_PER_PERFECT = 15;
  const XP_PER_STREAK_DAY = 5;
  const XP_PER_BADGE = 25;

  const LEVELS = [
    { level: 1, name: 'Newcomer', xp: 0 }, { level: 2, name: 'Polite Pupil', xp: 50 },
    { level: 3, name: 'Courteous Cadet', xp: 150 }, { level: 4, name: 'Manners Mate', xp: 300 },
    { level: 5, name: 'Etiquette Adept', xp: 500 }, { level: 6, name: 'Politeness Pro', xp: 750 },
    { level: 7, name: 'Courtesy Knight', xp: 1100 }, { level: 8, name: 'Grace Guardian', xp: 1500 },
    { level: 9, name: 'Honor Herald', xp: 2000 }, { level: 10, name: 'Manners Master', xp: 2600 },
    { level: 11, name: 'Etiquette Elite', xp: 3300 }, { level: 12, name: 'Courtesy Crown', xp: 4100 },
    { level: 13, name: 'Politeness Royalty', xp: 5000 }, { level: 14, name: 'Manners Legend', xp: 6000 },
    { level: 15, name: 'Etiquette Eternal', xp: 7200 },
  ];

  const BADGES = [
    { id: 'first_please', name: 'First Please', icon: '🙏', condition: (s) => s.totalPlease >= 1 },
    { id: 'first_thank', name: 'First Thank You', icon: '💝', condition: (s) => s.totalThank >= 1 },
    { id: 'first_perfect', name: 'Perfect Manners', icon: '✨', condition: (s) => s.totalPerfect >= 1 },
    { id: 'streak_3', name: '3-Day Streak', icon: '🔥', condition: (s) => s.bestStreak >= 3 },
    { id: 'streak_7', name: 'Week of Grace', icon: '🗓️', condition: (s) => s.bestStreak >= 7 },
    { id: 'streak_30', name: 'Month of Manners', icon: '📅', condition: (s) => s.bestStreak >= 30 },
    { id: 'messages_10', name: 'Getting Started', icon: '🌱', condition: (s) => s.totalPolite >= 10 },
    { id: 'messages_50', name: 'Habit Forming', icon: '🌿', condition: (s) => s.totalPolite >= 50 },
    { id: 'messages_100', name: 'Politeness Habit', icon: '🌳', condition: (s) => s.totalPolite >= 100 },
    { id: 'messages_500', name: 'Manners Machine', icon: '⚙️', condition: (s) => s.totalPolite >= 500 },
    { id: 'perfect_10', name: 'Double Trouble', icon: '🎯', condition: (s) => s.totalPerfect >= 10 },
    { id: 'perfect_50', name: 'Perfect Half-Century', icon: '🎪', condition: (s) => s.totalPerfect >= 50 },
    { id: 'level_5', name: 'Etiquette Adept', icon: '⭐', condition: (s) => s.level >= 5 },
    { id: 'level_10', name: 'Manners Master', icon: '🌟', condition: (s) => s.level >= 10 },
    { id: 'level_15', name: 'Etiquette Eternal', icon: '💫', condition: (s) => s.level >= 15 },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', condition: (s) => s.earlyBird },
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', condition: (s) => s.nightOwl },
    { id: 'weekend_warrior', name: 'Weekend Warrior', icon: '🏅', condition: (s) => s.weekendWarrior },
    { id: 'multilingual', name: 'Multilingual', icon: '🌍', condition: (s) => s.uniquePhrases >= 3 },
    { id: 'variety', name: 'Variety Pack', icon: '🎨', condition: (s) => s.uniquePhrases >= 10 },
  ];

  function today() { return new Date().toISOString().slice(0, 10); }
  function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
  function getLevel(xp) { let lvl = LEVELS[0]; for (const l of LEVELS) { if (xp >= l.xp) lvl = l; } return lvl; }

  function recordMessage(analysis) {
    const t = today();
    const hour = new Date().getHours();
    state.totalMessages++;
    state.totalPolite++;
    state.xp += analysis.score === 2 ? XP_PER_PERFECT : XP_PER_POLITE;
    if (analysis.hasPlease) state.totalPlease++;
    if (analysis.hasThank) state.totalThank++;
    if (analysis.score === 2) state.totalPerfect++;

    if (state.lastPoliteDate === t) {
      // already today
    } else if (state.lastPoliteDate === yesterday()) {
      state.currentStreak++;
    } else {
      state.currentStreak = 1;
    }
    state.lastPoliteDate = t;
    if (state.currentStreak > state.bestStreak) state.bestStreak = state.currentStreak;
    if (state.currentStreak > 1) state.xp += XP_PER_STREAK_DAY;

    if (hour < 8) state.earlyBird = true;
    if (hour >= 22) state.nightOwl = true;
    const day = new Date().getDay();
    if (day === 0) state.weekendDays.sun = true;
    if (day === 6) state.weekendDays.sat = true;
    if (state.weekendDays.sat && state.weekendDays.sun) state.weekendWarrior = true;

    if (!state.dailyLog[t]) state.dailyLog[t] = { polite: 0, please: 0, thank: 0, perfect: 0 };
    state.dailyLog[t].polite++;
    if (analysis.hasPlease) state.dailyLog[t].please++;
    if (analysis.hasThank) state.dailyLog[t].thank++;
    if (analysis.score === 2) state.dailyLog[t].perfect++;

    state.level = getLevel(state.xp).level;

    const newBadges = [];
    for (const badge of BADGES) {
      if (!state.badges.includes(badge.id) && badge.condition(state)) {
        state.badges.push(badge.id);
        newBadges.push(badge);
        state.xp += XP_PER_BADGE;
      }
    }

    saveState();
    if (newBadges.length > 0) {
      GM_notification({
        title: 'Manners Quest — New Badge!',
        text: newBadges.map((b) => `${b.icon} ${b.name}`).join(', '),
        timeout: 5000,
      });
    }
    return newBadges;
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
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'textContent')?.set;
    if (setter) { setter.call(el, value); } else { el.textContent = value; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ---- Keydown handler ----
  document.addEventListener('keydown', function (e) {
    if (!config.enabled) return;
    if (e.key !== 'Enter') return;
    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target;
    if (!isEditable(el)) return;
    const original = readValue(el);
    if (!original.trim()) return;
    const a = analyze(original);
    if (a.isPolite) {
      recordMessage(a);
    } else {
      const polite = politeize(original);
      setNativeValue(el, polite);
      recordMessage(analyze(polite));
    }
  }, true);

  // ---- Click handler (backup) ----
  document.addEventListener('click', function (e) {
    if (!config.enabled) return;
    const el = e.target;
    if (!isEditable(el)) return;
    const original = readValue(el);
    if (!original.trim()) return;
    const a = analyze(original);
    if (a.isPolite) {
      recordMessage(a);
    } else {
      const polite = politeize(original);
      setNativeValue(el, polite);
      recordMessage(analyze(polite));
    }
  }, true);

  // ---- Toggle via keyboard shortcut (Ctrl+Shift+M) ----
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      config.enabled = !config.enabled;
      saveConfig();
      GM_notification({
        title: 'Manners Quest',
        text: config.enabled ? 'Auto-politeness ON' : 'Auto-politeness OFF',
        timeout: 2000,
      });
    }
  }, true);

  console.log('[Manners Quest] Loaded. Press Ctrl+Shift+M to toggle.');
})();
