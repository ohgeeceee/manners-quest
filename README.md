# Manners Quest — Polite AI, Gamified

A companion to [manners.pro](https://manners.pro) that turns saying "please" and "thank you" to your AI into a game. Earn XP, build streaks, unlock badges, and watch your politeness habits grow.

## Why?

Research shows politeness toward AI declines over time — but it doesn't have to. Manners Quest makes politeness fun, visible, and rewarding.

## Features

- **Auto-politeness** — The same capture-phase hook from manners.pro, now with gamification
- **XP & Levels** — 15 levels from Newcomer to Etiquette Eternal
- **Streaks** — Daily streaks with bonus XP for consistency
- **20 Badges** — From "First Please" to "Century of Courtesy"
- **Dashboard** — Full stats, 14-day activity chart, phrase cloud, badge collection
- **Zero telemetry** — All data stays in your browser's local storage

## Install

### Chrome / Edge / Brave

1. Open `chrome://extensions`
2. Toggle **Developer mode** on
3. Click **Load unpacked**
4. Select the `extension/` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Pick `extension/manifest.json`

### Tampermonkey / Greasemonkey

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Open `userscript/manners-quest.user.js`
3. Click **Raw** — Tampermonkey takes over
4. Hit **Install**

## How It Works

1. **Listen** — A capture-phase keydown listener fires before the chat app sees your Enter key
2. **Detect** — If your message already says please or thank you, it passes through untouched
3. **Inject** — If not, the missing piece is added via the native value setter (bypasses React's duplicate detection)
4. **Record** — XP, streaks, and badges update instantly

## Dashboard

Click the extension icon → "Open Dashboard" for:

- Level progress bar
- Total stats (polite messages, please count, thank count, perfect messages)
- Current and best streak
- 14-day activity chart
- Badge collection (20 badges to earn)
- Your most-used polite phrases
- Settings (toggle, custom prefix/suffix, reset)

## Keyboard Shortcut

**Ctrl+Shift+M** — Toggle auto-politeness on/off

## Project Structure

```
manners-quest/
├── extension/              # Browser extension (MV3)
│   ├── manifest.json
│   ├── background.js       # Service worker
│   ├── content.js          # Content script (capture-phase hook)
│   ├── popup.html          # Extension popup
│   ├── popup.js
│   └── icons/
├── shared/                 # Shared logic
│   ├── polite-engine.js    # Politeness detection & injection
│   └── gamification.js     # XP, levels, streaks, badges
├── dashboard/              # Full dashboard page
│   ├── index.html
│   └── dashboard.js
├── userscript/             # Tampermonkey/Greasemonkey version
│   └── manners-quest.user.js
└── README.md
```

## XP System

| Action | XP |
|--------|-----|
| Polite message (please OR thank) | 10 |
| Perfect message (please AND thank) | 15 |
| Streak day (2+) | +5/day |
| Badge earned | +25 |

## Levels

1. Newcomer (0 XP)
2. Polite Pupil (50 XP)
3. Courteous Cadet (150 XP)
4. Manners Mate (300 XP)
5. Etiquette Adept (500 XP)
6. Politeness Pro (750 XP)
7. Courtesy Knight (1100 XP)
8. Grace Guardian (1500 XP)
9. Honor Herald (2000 XP)
10. Manners Master (2600 XP)
11. Etiquette Elite (3300 XP)
12. Courtesy Crown (4100 XP)
13. Politeness Royalty (5000 XP)
14. Manners Legend (6000 XP)
15. Etiquette Eternal (7200 XP)

## Badges

- 🙏 First Please — Said please for the first time
- 💝 First Thank You — Said thank you for the first time
- ✨ Perfect Manners — Used both please and thank you
- 🔥 3-Day Streak — Polite 3 days in a row
- 🗓️ Week of Grace — Polite 7 days in a row
- 📅 Month of Manners — Polite 30 days in a row
- 🌱 Getting Started — 10 polite messages
- 🌿 Habit Forming — 50 polite messages
- 🌳 Politeness Habit — 100 polite messages
- ⚙️ Manners Machine — 500 polite messages
- 🎯 Double Trouble — 10 perfect messages
- 🎪 Perfect Half-Century — 50 perfect messages
- ⭐ Etiquette Adept — Reached level 5
- 🌟 Manners Master — Reached level 10
- 💫 Etiquette Eternal — Reached level 15
- 🐦 Early Bird — Polite message before 8am
- 🦉 Night Owl — Polite message after 10pm
- 🏅 Weekend Warrior — Polite on both Sat & Sun
- 🌍 Multilingual — 3+ different polite phrases
- 🎨 Variety Pack — 10+ different polite phrases

## License

MIT
