// ============================================================
// Manners Quest — Gamification Engine
// Streaks, XP, levels, badges. Pure logic, no DOM.
// ============================================================

const Gamification = (() => {
  // ---- XP & Levels ----
  const XP_PER_POLITE_MESSAGE = 10;
  const XP_PER_PERFECT_MESSAGE = 15; // both please + thank
  const XP_PER_STREAK_DAY = 5; // bonus per day of streak
  const XP_PER_BADGE = 25;

  const LEVELS = [
    { level: 1,  name: 'Newcomer',        xp: 0 },
    { level: 2,  name: 'Polite Pupil',    xp: 50 },
    { level: 3,  name: 'Courteous Cadet',  xp: 150 },
    { level: 4,  name: 'Manners Mate',    xp: 300 },
    { level: 5,  name: 'Etiquette Adept', xp: 500 },
    { level: 6,  name: 'Politeness Pro',  xp: 750 },
    { level: 7,  name: 'Courtesy Knight', xp: 1100 },
    { level: 8,  name: 'Grace Guardian',  xp: 1500 },
    { level: 9,  name: 'Honor Herald',    xp: 2000 },
    { level: 10, name: 'Manners Master',  xp: 2600 },
    { level: 11, name: 'Etiquette Elite', xp: 3300 },
    { level: 12, name: 'Courtesy Crown',  xp: 4100 },
    { level: 13, name: 'Politeness Royalty', xp: 5000 },
    { level: 14, name: 'Manners Legend',  xp: 6000 },
    { level: 15, name: 'Etiquette Eternal', xp: 7200 },
  ];

  // ---- Badges ----
  const BADGES = [
    { id: 'first_please',   name: 'First Please',        desc: 'Said please for the first time',           icon: '🙏', condition: (s) => s.totalPlease >= 1 },
    { id: 'first_thank',    name: 'First Thank You',     desc: 'Said thank you for the first time',        icon: '💝', condition: (s) => s.totalThank >= 1 },
    { id: 'first_perfect',  name: 'Perfect Manners',     desc: 'Used both please and thank you',           icon: '✨', condition: (s) => s.totalPerfect >= 1 },
    { id: 'streak_3',       name: '3-Day Streak',        desc: 'Polite 3 days in a row',                  icon: '🔥', condition: (s) => s.bestStreak >= 3 },
    { id: 'streak_7',       name: 'Week of Grace',       desc: 'Polite 7 days in a row',                  icon: '🗓️', condition: (s) => s.bestStreak >= 7 },
    { id: 'streak_30',      name: 'Month of Manners',    desc: 'Polite 30 days in a row',                 icon: '📅', condition: (s) => s.bestStreak >= 30 },
    { id: 'streak_100',     name: 'Century of Courtesy', desc: 'Polite 100 days in a row',                icon: '💯', condition: (s) => s.bestStreak >= 100 },
    { id: 'messages_10',    name: 'Getting Started',     desc: 'Sent 10 polite messages',                 icon: '🌱', condition: (s) => s.totalPolite >= 10 },
    { id: 'messages_50',    name: 'Habit Forming',       desc: 'Sent 50 polite messages',                 icon: '🌿', condition: (s) => s.totalPolite >= 50 },
    { id: 'messages_100',   name: 'Politeness Habit',    desc: 'Sent 100 polite messages',                icon: '🌳', condition: (s) => s.totalPolite >= 100 },
    { id: 'messages_500',   name: 'Manners Machine',     desc: 'Sent 500 polite messages',                icon: '⚙️', condition: (s) => s.totalPolite >= 500 },
    { id: 'messages_1000',  name: 'Politeness Legend',   desc: 'Sent 1,000 polite messages',              icon: '🏆', condition: (s) => s.totalPolite >= 1000 },
    { id: 'perfect_10',     name: 'Double Trouble',      desc: '10 perfect messages (please + thank)',    icon: '🎯', condition: (s) => s.totalPerfect >= 10 },
    { id: 'perfect_50',     name: 'Perfect Half-Century', desc: '50 perfect messages',                    icon: '🎪', condition: (s) => s.totalPerfect >= 50 },
    { id: 'perfect_100',    name: 'Perfect Century',     desc: '100 perfect messages',                    icon: '🎭', condition: (s) => s.totalPerfect >= 100 },
    { id: 'level_5',        name: 'Etiquette Adept',     desc: 'Reached level 5',                         icon: '⭐', condition: (s) => s.level >= 5 },
    { id: 'level_10',       name: 'Manners Master',      desc: 'Reached level 10',                        icon: '🌟', condition: (s) => s.level >= 10 },
    { id: 'level_15',       name: 'Etiquette Eternal',   desc: 'Reached level 15',                        icon: '💫', condition: (s) => s.level >= 15 },
    { id: 'early_bird',     name: 'Early Bird',          desc: 'Sent a polite message before 8am',        icon: '🐦', condition: (s) => s.earlyBird },
    { id: 'night_owl',      name: 'Night Owl',           desc: 'Sent a polite message after 10pm',        icon: '🦉', condition: (s) => s.nightOwl },
    { id: 'weekend_warrior', name: 'Weekend Warrior',    desc: 'Sent polite messages on both Sat & Sun',   icon: '🏅', condition: (s) => s.weekendWarrior },
    { id: 'multilingual',   name: 'Multilingual',        desc: 'Used 3+ different polite phrases',        icon: '🌍', condition: (s) => s.uniquePhrases >= 3 },
    { id: 'variety',        name: 'Variety Pack',        desc: 'Used 10+ different polite phrases',       icon: '🎨', condition: (s) => s.uniquePhrases >= 10 },
  ];

  // ---- State ----
  function defaultState() {
    return {
      xp: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      lastPoliteDate: null, // YYYY-MM-DD
      totalPolite: 0,
      totalPlease: 0,
      totalThank: 0,
      totalPerfect: 0,
      totalMessages: 0,
      badges: [], // badge ids
      uniquePhrases: 0,
      earlyBird: false,
      nightOwl: false,
      weekendWarrior: false,
      weekendDays: { sat: false, sun: false },
      phraseHistory: {}, // phrase -> count
      dailyLog: {}, // YYYY-MM-DD -> { polite, please, thank, perfect }
      createdAt: new Date().toISOString(),
    };
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function getLevel(xp) {
    let lvl = LEVELS[0];
    for (const l of LEVELS) {
      if (xp >= l.xp) lvl = l;
    }
    return lvl;
  }

  function getNextLevel(xp) {
    for (const l of LEVELS) {
      if (xp < l.xp) return l;
    }
    return null;
  }

  function getProgress(xp) {
    const current = getLevel(xp);
    const next = getNextLevel(xp);
    if (!next) return { current, next: null, percent: 100, xpIntoLevel: 0, xpForNext: 0 };
    const xpIntoLevel = xp - current.xp;
    const xpForNext = next.xp - current.xp;
    const percent = Math.round((xpIntoLevel / xpForNext) * 100);
    return { current, next, percent, xpIntoLevel, xpForNext };
  }

  // ---- Record a polite message ----
  function recordMessage(state, analysis) {
    const s = { ...state };
    const t = today();
    const hour = new Date().getHours();

    s.totalMessages++;
    s.totalPolite++;
    s.xp += analysis.score === 2 ? XP_PER_PERFECT_MESSAGE : XP_PER_POLITE_MESSAGE;

    if (analysis.hasPlease) s.totalPlease++;
    if (analysis.hasThank) s.totalThank++;
    if (analysis.score === 2) s.totalPerfect++;

    // Streak
    if (s.lastPoliteDate === t) {
      // already counted today
    } else if (s.lastPoliteDate === yesterday()) {
      s.currentStreak++;
    } else {
      s.currentStreak = 1;
    }
    s.lastPoliteDate = t;
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;

    // Streak bonus XP
    if (s.currentStreak > 1) {
      s.xp += XP_PER_STREAK_DAY;
    }

    // Time-based badges
    if (hour < 8) s.earlyBird = true;
    if (hour >= 22) s.nightOwl = true;

    // Weekend warrior
    const day = new Date().getDay();
    if (day === 0) s.weekendDays.sun = true;
    if (day === 6) s.weekendDays.sat = true;
    if (s.weekendDays.sat && s.weekendDays.sun) s.weekendWarrior = true;

    // Daily log
    if (!s.dailyLog[t]) s.dailyLog[t] = { polite: 0, please: 0, thank: 0, perfect: 0 };
    s.dailyLog[t].polite++;
    if (analysis.hasPlease) s.dailyLog[t].please++;
    if (analysis.hasThank) s.dailyLog[t].thank++;
    if (analysis.score === 2) s.dailyLog[t].perfect++;

    // Level
    s.level = getLevel(s.xp).level;

    // Check badges
    const newBadges = [];
    for (const badge of BADGES) {
      if (!s.badges.includes(badge.id) && badge.condition(s)) {
        s.badges.push(badge.id);
        newBadges.push(badge);
        s.xp += XP_PER_BADGE;
      }
    }

    return { state: s, newBadges, xpGained: analysis.score === 2 ? XP_PER_PERFECT_MESSAGE : XP_PER_POLITE_MESSAGE };
  }

  // ---- Track unique phrases ----
  function trackPhrase(state, phrase) {
    const s = { ...state };
    const p = phrase.toLowerCase().trim();
    if (!s.phraseHistory[p]) {
      s.phraseHistory[p] = 0;
      s.uniquePhrases++;
    }
    s.phraseHistory[p]++;
    return s;
  }

  // ---- Get stats for dashboard ----
  function getStats(state) {
    const progress = getProgress(state.xp);
    const todayLog = state.dailyLog[today()] || { polite: 0, please: 0, thank: 0, perfect: 0 };
    const badges = BADGES.map((b) => ({
      ...b,
      earned: state.badges.includes(b.id),
    }));
    return {
      ...state,
      progress,
      todayLog,
      badges,
      badgesEarned: state.badges.length,
      badgesTotal: BADGES.length,
    };
  }

  return {
    defaultState,
    recordMessage,
    trackPhrase,
    getStats,
    getLevel,
    getNextLevel,
    getProgress,
    BADGES,
    LEVELS,
    XP_PER_POLITE_MESSAGE,
    XP_PER_PERFECT_MESSAGE,
    XP_PER_STREAK_DAY,
    XP_PER_BADGE,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Gamification;
