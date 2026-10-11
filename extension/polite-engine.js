// ============================================================
// Manners Quest — Shared Politeness Engine
// Used by both the browser extension and the dashboard.
// ============================================================

const PoliteEngine = (() => {
  const PLEASE_PATTERNS = [
    'please', 'pls', 'plz', 'kindly', 'if you could', "if you'd be so kind",
    'would you mind', 'could you', 'can you', 'may i', 'i would appreciate',
    "i'd appreciate", 'i would be grateful', 'i would be thankful',
    'when you have a moment', 'when you get a chance', 'at your convenience',
    'if possible', 'if you don\'t mind', 'if you wouldn\'t mind',
    'i was wondering if', 'would it be possible', 'do you think you could',
    'i\'d be grateful', 'i\'d be thankful', 'i\'d appreciate it',
    'it would be great if', 'it would be nice if', 'it would be helpful if',
    'would you be able to', 'are you able to', 'is there any chance',
    'i was hoping', 'i was hoping you could', 'i was hoping you would',
    'would you happen to', 'do you happen to', 'i was curious if',
    'i was wondering whether', 'would you mind if', 'do you mind if',
    'if it\'s not too much trouble', 'if it\'s not too much to ask',
    'if you get a chance', 'if you have time', 'if you have a moment',
    'when you can', 'when you\'re able', 'when you\'re free',
    'at your earliest convenience', 'at your leisure',
  ];

  const THANK_PATTERNS = [
    'thank', 'thx', 'thanks', 'cheers', 'appreciate', 'grateful',
    'thank you', 'thanks a lot', 'thanks so much', 'thank you so much',
    'thank you very much', 'much appreciated', 'many thanks',
    'thanks a bunch', 'thanks a million', 'thanks a ton',
    'i appreciate it', 'i appreciate that', 'i appreciate your help',
    'i appreciate you', 'i appreciate the help', 'i appreciate the assistance',
    'i\'m grateful', 'i am grateful', 'i\'m thankful', 'i am thankful',
    'that\'s very kind', 'that\'s very helpful', 'that\'s great',
    'that\'s awesome', 'that\'s perfect', 'that\'s exactly what i needed',
    'you\'re the best', 'you\'re awesome', 'you\'re amazing',
    'you\'re a lifesaver', 'you\'re a gem', 'you\'re a star',
    'great job', 'well done', 'nice work', 'good job',
    'awesome work', 'excellent work', 'perfect work',
    'that helps a lot', 'that helps so much', 'that\'s really helpful',
    'that\'s really useful', 'that\'s exactly right', 'that\'s spot on',
    'you nailed it', 'you got it right', 'you figured it out',
    'you solved it', 'you fixed it', 'you helped me so much',
    'you\'ve been a huge help', 'you\'ve been very helpful',
    'you\'ve been a great help', 'you\'ve been so helpful',
    'you\'ve been amazing', 'you\'ve been awesome',
    'you\'re incredibly helpful', 'you\'re so helpful',
    'you\'re very helpful', 'you\'re really helpful',
    'you\'re always so helpful', 'you\'re always helpful',
    'you\'re always there for me', 'you\'re always there to help',
    'you\'re a great assistant', 'you\'re a wonderful assistant',
    'you\'re an amazing assistant', 'you\'re an excellent assistant',
    'you\'re the best assistant', 'you\'re a fantastic assistant',
    'you\'re a brilliant assistant', 'you\'re a superb assistant',
    'you\'re a stellar assistant', 'you\'re a remarkable assistant',
    'you\'re an outstanding assistant', 'you\'re a phenomenal assistant',
    'you\'re a terrific assistant', 'you\'re a splendid assistant',
    'you\'re a marvelous assistant', 'you\'re a fabulous assistant',
    'you\'re a magnificent assistant', 'you\'re a grand assistant',
    'you\'re a splendid assistant', 'you\'re a superb assistant',
    'you\'re a stellar assistant', 'you\'re a remarkable assistant',
    'you\'re an outstanding assistant', 'you\'re a phenomenal assistant',
    'you\'re a terrific assistant', 'you\'re a splendid assistant',
    'you\'re a marvelous assistant', 'you\'re a fabulous assistant',
    'you\'re a magnificent assistant', 'you\'re a grand assistant',
  ];

  function hasAny(text, patterns) {
    const lower = text.toLowerCase();
    return patterns.some((p) => lower.includes(p));
  }

  function hasPlease(text) {
    return hasAny(text, PLEASE_PATTERNS);
  }

  function hasThank(text) {
    return hasAny(text, THANK_PATTERNS);
  }

  function analyze(text) {
    const trimmed = text.trim();
    if (!trimmed) return { isPolite: false, hasPlease: false, hasThank: false, score: 0 };
    const p = hasPlease(trimmed);
    const t = hasThank(trimmed);
    const score = (p ? 1 : 0) + (t ? 1 : 0);
    return { isPolite: p || t, hasPlease: p, hasThank: t, score };
  }

  function politeize(text) {
    const trimmed = text.trim();
    if (!trimmed) return text;
    const a = analyze(trimmed);
    let result = trimmed;
    if (!a.hasPlease) result = 'Please. ' + result;
    if (!a.hasThank) result = result + ' Thank you.';
    return result;
  }

  return { analyze, politeize, hasPlease, hasThank, PLEASE_PATTERNS, THANK_PATTERNS };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PoliteEngine;
