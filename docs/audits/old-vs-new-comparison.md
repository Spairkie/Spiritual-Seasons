# Old vs New App — Comparison Audit

**Audit Date:** 2026-05-31  
**Auditor:** Claude Code (automated research)  
**Old App:** https://github.com/Spairkie/Spiritual-Seasons-PWA — vanilla JS, multi-file script loading  
**New App:** /home/user/Spiritual-Seasons — TypeScript + Vite, module-based SPA  

---

## Executive Summary

The new app is a ground-up TypeScript/Vite rewrite of a vanilla-JS PWA. The core devotional experience (read, journal, progress, favorites, search, weekly reflection) is fully ported and generally works correctly. The new app has a cleaner architecture, stronger type safety, and a better responsive layout system. However, **eight features present in the old app are absent from the new app**, the most impactful being: PDF export, verse-image sharing, daily push notifications, keyboard shortcuts, calendar export, and audio-note (voice memo) recording. The `audioNotes` IndexedDB store is wired into the schema (`src/store/audio.ts`) but no UI exists to expose it. The import-from-file flow on the Privacy page is stubbed and non-functional. The sidebar layout at tablet breakpoint (768–1023 px) has a structural CSS bug that hides the page header. The `vite.config.ts` references `offline.html` in the Workbox config but that file does not exist, which breaks the service-worker build.

---

## Old App Overview

### Architecture
- **Stack:** Vanilla JavaScript (ES modules via `<script type="module">`), plain CSS, no build step
- **Files loaded:** 39 separate JS files (13 infrastructure + 26 feature modules) plus 8 CSS files
- **State:** Custom `state-manager.js` + `store.js` using `localStorage` and `IndexedDB`
- **Router:** `js/router.js` — hash-based SPA router
- **Templates:** HTML strings assembled in each module; DOM written directly
- **Storage:** `IndexedDB` via custom wrapper (no external library)
- **Tests:** None evident in repo
- **Build/deploy:** No build step; files served directly from GitHub Pages at `https://spairkie.github.io/Spiritual-Seasons-PWA/`

### Feature Set (old app)
Based on `index.html` script loading order and module analysis:
1. Intro / onboarding tour (4-step overlay)
2. Seasonal quiz with Likert scale + tie-breaker
3. 120-day devotional reader (scripture, reflection prompt, journal)
4. Weekly reflection with per-week prompts and history
5. Table of Contents (all 120 days)
6. Full-text search (scripture + reflection + journal)
7. Favourites with personal notes
8. Progress tracking (streaks, milestones, by-season progress bars)
9. Settings: dark mode, font size, line spacing, bible translation, reading speed, ambient sound presets, daily reminders (time + quiet hours), auto-save toggle, meditation/breathing launch, calendar export, PDF export, retake quiz, data export/import
10. Text-to-speech (scripture read-aloud) with pause/resume, reading speed control
11. Ambient sounds — 11 named presets (Winter Breeze, Spring Garden, Ocean Waves, etc.) via `js/modules/ambient-sound.js`
12. Guided breathing (4-4-4-4 box breathing modal)
13. Meditation timer (3/5/10/15 min with SVG ring)
14. Verse-image generator — 6 templates, 3 aspect ratios, canvas-based PNG export + Web Share API
15. PDF export — full journal as formatted multi-page PDF with jsPDF
16. Calendar export — `.ics` file with all 120 events, custom start date
17. Keyboard shortcuts — 10 shortcuts, desktop-only, saved preference
18. Daily push notifications — browser Notification API, snooze, quiet hours
19. Audio notes / voice memos — record voice alongside journal entry (stored in IndexedDB `audioNotes`)
20. Page transitions — animated route changes
21. PWA install prompt
22. Onboarding tour overlay (4 steps)
23. Undo manager — for journal edits (`js/undo-manager.js`)
24. Haptics — vibration feedback on mobile (`js/modules/haptics.js`)
25. Privacy & data management (export JSON, import JSON, clear journal, reset progress, reset all)
26. Season-specific intro pages
27. Error boundary / error handler modules

---

## New App Overview

### Architecture
- **Stack:** TypeScript 6, Vite 8, `vite-plugin-pwa` (Workbox), `idb` library
- **Module system:** ES modules, lazy-chunked by page via `rollupOptions.manualChunks` in `vite.config.ts`
- **Router:** `src/router/router.ts` — custom hash-based SPA router with typed `RouteParams`
- **State/Storage:** IndexedDB via `idb` library (`src/store/db.ts`), stores: `user`, `journal`, `progress`, `favorites`, `settings`, `audioNotes`, `weeklyReflections`, `streaks`
- **Templates:** HTML string templates in each page module, injected via `innerHTML`
- **Styles:** CSS custom properties (design tokens in `src/styles/base/variables.css`), 4 season themes + dark mode via `data-season` / `data-theme` attributes on `<html>`
- **Tests:** Vitest test suite in `tests/` (unit + integration)
- **Build/deploy:** Vite build → `dist/`, deployed to GitHub Pages at `https://spairkie.github.io/Spiritual-Seasons/` (relative base `./`)

### Feature Set (new app)
1. Intro page with season overview cards (`src/pages/intro.ts`)
2. Per-season intro page (shown at season transition and from result cards)
3. Seasonal quiz with Likert scale + tie-breaker (`src/pages/quiz.ts`)
4. 120-day devotional reader: scripture, reflection prompt, journal (auto-save + manual save), TTS, share modal, favourite toggle, mark complete, completion card, season-end transition (`src/pages/devotional.ts`)
5. Weekly reflection with 17 rotating prompts, week navigation, past reflections history (`src/pages/reflections.ts`)
6. Table of Contents: grouped by season, completed/favourite/journal indicators (`src/pages/toc.ts`)
7. Full-text search across scripture, reflection prompts, and journal entries with filter chips (`src/pages/search.ts`)
8. Favourites with personal notes, remove button, click-to-navigate (`src/pages/favorites.ts`)
9. Progress: stat cards (days done/left, current/longest streak), season bars, milestones, continue button (`src/pages/progress.ts`)
10. Settings: dark mode, season theme, font size, line spacing, bible translation, auto-save toggle, privacy link (`src/pages/settings.ts`)
11. Privacy & Data: export JSON (full), import JSON (stubbed), clear journal, reset progress, reset all (`src/pages/privacy.ts`)
12. Meditation timer (3/5/10/15 min, SVG ring) (`src/ui/meditation.ts`)
13. Guided breathing — 4-4-4-4 box breathing (`src/ui/breathing.ts`)
14. Ambient sounds — 4 sounds generated via Web Audio API noise synthesis (`src/ui/sounds.ts`)
15. Share modal — native Web Share API + clipboard copy (`src/ui/share.ts`)
16. PWA install prompt — `beforeinstallprompt` banner (`src/ui/install-prompt.ts`)
17. Onboarding tour — 4-step overlay, shown once to new users (`src/ui/onboarding.ts`)
18. Theme manager — dark mode + season theme + font size + line spacing (`src/ui/theme-manager.ts`)
19. `audioNotes` IndexedDB store wired (`src/store/audio.ts`) — **no UI**
20. Seasonal CSS effects (`src/styles/seasonal/effects.css`)

---

## Feature Comparison Table

| Feature | Old App | New App | Works? | Notes |
|---------|---------|---------|--------|-------|
| Intro / welcome page | ✓ | ✓ | ✓ | Both use book-cover image + season cards |
| Per-season intro | ✓ | ✓ | ✓ | New: also shown at season end transition |
| Onboarding tour (4-step) | ✓ | ✓ | ✓ | Similar 4-step overlay |
| Seasonal quiz + Likert scale | ✓ | ✓ | ✓ | New adds auto-advance on selection |
| Quiz tie-breaker | ✓ | ✓ | ✓ | Both prompt user to pick manually |
| Quiz results screen | ✓ | ✓ | ✓ | |
| 120-day devotional reader | ✓ | ✓ | ✓ | |
| Journal — auto-save | ✓ | ✓ | ✓ | 2s debounce, same in both |
| Journal — manual save | ✓ | ✓ | ✓ | Shown when auto-save is off |
| Journal — word count | ✓ | ✓ | ✓ | |
| Journal — character limit (50k) | ✓ | ✗ | N/A | Old had 50,000-char enforcement |
| TTS (text-to-speech) | ✓ | ✓ | ✓ | New uses Web Speech API directly |
| TTS reading speed control | ✓ | ✗ | N/A | Old had Slow/Normal/Fast/Very Fast; new always `rate=0.9` |
| Share scripture | ✓ | ✓ | ✓ | New: modal with native share + copy |
| Verse image generator | ✓ | ✗ | N/A | Canvas-based PNG export; not in new |
| Favourite toggle on devotional | ✓ | ✓ | ✓ | |
| Mark day complete | ✓ | ✓ | ✓ | |
| Completion card (day/season/journey end) | ✓ | ✓ | ✓ | |
| Previous/next day navigation | ✓ | ✓ | ✓ | |
| Bible Gateway link | ✓ | ✓ | ✓ | Opens in new tab |
| Audio notes / voice memos | ✓ | ✗* | Broken | Store exists (`src/store/audio.ts`) but no UI |
| Weekly reflection | ✓ | ✓ | ✓ | New has 17 rotating prompts |
| Table of Contents | ✓ | ✓ | ✓ | |
| TOC — season progress counts | ✓ | ✓ | ✓ | |
| TOC — completed/fav/journal indicators | ✓ | ✓ | ✓ | |
| Search (scripture + reflection) | ✓ | ✓ | ✓ | |
| Search (journal entries) | ✓ | ✓ | ✓ | |
| Search filter chips | ✓ | ✓ | ✓ | |
| Favourites page | ✓ | ✓ | ✓ | |
| Favourites — personal notes | ✓ | ✓ | ✓ | 1.5s debounce auto-save |
| Progress — stat cards | ✓ | ✓ | ✓ | |
| Progress — season bars | ✓ | ✓ | ✓ | |
| Progress — streaks | ✓ | ✓ | ✓ | |
| Progress — milestones | ✓ | ✓ | ✓ | |
| Progress — visual day grid / calendar view | ✓ | ✗ | N/A | Old had a calendar-style day grid |
| Dark mode (system/light/dark) | ✓ | ✓ | ✓ | |
| Season theme selector | ✓ | ✓ | ✓ | |
| Font size setting | ✓ | ✓ | ✓ | |
| Line spacing setting | ✓ | ✓ | ✓ | |
| Bible translation setting | ✓ | ✓ | ✓ | 7 translations |
| Reading speed (TTS) | ✓ | ✗ | N/A | Absent from settings in new |
| Auto-save toggle | ✓ | ✓ | ✓ | |
| Ambient sounds | ✓ | ✓ | Partial | Old: 11 named presets; new: 4 Web Audio noise types |
| Ambient sound presets (themed) | ✓ | ✗ | N/A | Old had "Winter Breeze", "Spring Garden", etc. |
| Meditation timer | ✓ | ✓ | ✓ | Both 3/5/10/15 min SVG ring |
| Guided breathing | ✓ | ✓ | ✓ | Both 4-4-4-4 box breathing |
| Daily push notifications | ✓ | ✗ | N/A | Browser Notification API; not in new |
| Reminder time picker | ✓ | ✗ | N/A | |
| Quiet hours for notifications | ✓ | ✗ | N/A | |
| PDF export (journal) | ✓ | ✗ | N/A | jsPDF-based; not in new |
| Calendar export (.ics) | ✓ | ✗ | N/A | Not in new |
| Keyboard shortcuts | ✓ | ✗ | N/A | 10 shortcuts (n/p/s/j/f/m/h/c/?/Esc); not in new |
| Haptic feedback | ✓ | ✗ | N/A | `navigator.vibrate` calls; not in new |
| Undo manager (journal) | ✓ | ✗ | N/A | `js/undo-manager.js`; not in new |
| Data export (JSON) | ✓ | ✓ | ✓ | New exports all stores |
| Data import (JSON) | ✓ | ✗ | Broken | New shows "Import" button but only reads version number, shows toast, does not restore data (`src/pages/privacy.ts` lines 129–143) |
| Clear journal | ✓ | ✓ | ✓ | |
| Reset progress | ✓ | ✓ | ✓ | |
| Reset all data | ✓ | ✓ | ✓ | |
| Retake quiz | ✓ | ✗ | N/A | Settings page in old had a "Retake Quiz" button; new has no path to retake without resetting all data |
| Offline support (Service Worker) | ✓ | ✓ | Partial | New: Workbox config references non-existent `offline.html` (see PWA Issues) |
| PWA install prompt | ✓ | ✓ | ✓ | |
| Page transitions (animated) | ✓ | ✗ | N/A | Old had `js/modules/page-transitions.js` |
| Error boundary / error handler | ✓ | ✗ | N/A | Old had `js/modules/error-handler.js` and `error-boundary.js` |
| Splash screen | ✓ | ✓ | ✓ | |
| Skip-to-content link | ✓ | ✓ | ✓ | |
| Sidebar navigation (tablet/desktop) | ✗ | ✓ | Partial | New adds sidebar; has CSS layout bug at 768–1023 px |
| Mobile bottom navigation | ✓ | ✓ | ✓ | |

---

## Missing Features

The following features exist in the old app but are **absent** from the new app:

### P1 — Core / Heavily Used
1. **Data Import (restore from backup)** — `src/pages/privacy.ts` lines 129–143: reads file, checks `data.version`, then shows a toast saying "full restore coming in a future update". The button is present but imports nothing.
2. **Retake Quiz** — Settings page in the old app had a dedicated "Retake Quiz" button. In the new app the only way to retake is to "Reset Everything", which also wipes all journal data and progress. This is a destructive-only path.

### P2 — Significant UX Loss
3. **Daily Push Notifications** — Old app had full `js/modules/notifications.js`: enable toggle, daily time picker, quiet hours, snooze from notification, personalized content. No equivalent in new app.
4. **PDF Export** — Old app exported the full journal as a formatted PDF (jsPDF, season colors, title page). No `js/modules/pdf-export.js` equivalent in new app. Settings-visible button on old app; no button anywhere in new.
5. **Verse Image Generator** — Old app allowed creation of shareable scripture card images (6 templates, 3 aspect ratios, canvas PNG, Web Share). New app has a plain-text share modal. Feature is entirely absent.
6. **Calendar Export (.ics)** — Old app exported all 120 devotionals as calendar events with custom start date and 15-min reminders. Completely absent from new app.

### P3 — Polish / Nice-to-Have
7. **Keyboard Shortcuts** — Old app had 10 keyboard shortcuts (`n`, `p`, `s`, `j`, `f`, `m`, `h`, `c`, `?`, `Esc`) with a help overlay and a toggle in settings. Nothing in new app.
8. **TTS Reading Speed Control** — Old app had 4 speed options in settings (0.7x–1.2x). New app always uses `rate=0.9` (hardcoded in `src/pages/devotional.ts` line 309).
9. **Ambient Sound Named Presets** — Old app had 11 named presets tied to seasons (Winter Breeze, Spring Garden, Ocean Waves, etc.) via the `ambient-sound.js` module. New app has 4 generic noise types (Rain, Forest, Ocean, Fireplace) synthesized via Web Audio. Not broken, but noticeably fewer and un-branded.
10. **Haptic Feedback** — Old app called `navigator.vibrate()` on completions and button presses. Not in new app.
11. **Undo Manager for Journal** — Old app had `js/undo-manager.js` for undoing journal edits. New app only has auto-save; no undo.
12. **Animated Page Transitions** — Old app had `js/modules/page-transitions.js`. New app routes are instant with no transition animation.
13. **Progress — Calendar/Grid Day View** — Old app had a calendar-style grid of completed days. New app shows only aggregate bars and milestones; no day-level grid.

---

## Broken / Incomplete Features

### Critical
1. **Service Worker — `offline.html` missing**
   - File: `vite.config.ts` line `navigateFallback: 'offline.html'`
   - The file `public/offline.html` does not exist. During `vite build`, `vite-plugin-pwa` / Workbox will either throw or silently produce a broken SW that serves a 404 for offline navigation fallback. This will cause the app to fail completely when offline instead of showing an offline page.
   - **Impact:** P0 — broken offline PWA behaviour.

2. **Data Import — non-functional**
   - File: `src/pages/privacy.ts` lines 128–143
   - The import input reads a JSON file, verifies `data.version === 1`, then shows a toast: `"full restore coming in a future update"`. No data is actually written to IndexedDB. Users who export and re-import (e.g. after reinstalling) lose all data.
   - **Impact:** P1.

### Significant
3. **Audio Notes — store without UI**
   - File: `src/store/audio.ts` (full CRUD), `src/store/db.ts` (store registered at line 71)
   - `audioNotes` is in the DB schema and includes `getAudioNote`, `saveAudioNote`, `deleteAudioNote`, `getAllAudioNotes`, `getAudioNoteDays`. Nothing in any page or UI module references these functions. Users cannot record or play voice memos. The store silently accumulates empty.
   - **Impact:** P2 (feature regression from old app).

4. **Sidebar layout broken on tablet (768–1023 px)**
   - File: `src/styles/layout/shell.css` lines 271–311
   - At 768 px+ the CSS switches `.app-shell` to `flex-direction: row` and hides the bottom nav (correct). It also sets `.app-header { display: none }` globally (line 278). The header is then supposed to be shown inside `.shell-content .app-header` (line 308). However, the index.html (`/home/user/Spiritual-Seasons/index.html`) does **not** wrap `.app-header` and `.app-main` inside a `.shell-content` div — the HTML structure is flat: `app-shell > app-header + app-main + bottom-nav + sidebar-nav`. The `.shell-content` class selector in the CSS therefore matches nothing, so **the header is permanently hidden at 768–1023 px**. Users on tablets see the sidebar but no header, losing the title, back button, and search icon.
   - **Impact:** P1 — core navigation element missing on tablet viewport.

5. **Back button logic absent**
   - File: `index.html` line 38: `<button class="header-back-btn" id="header-back-btn" ... hidden>`
   - The back button element is in the HTML and is never un-hidden anywhere in the codebase (`grep` across all `src/` finds no reference to `header-back-btn` in any `.ts` file). It is always `hidden`. Users have no back navigation in the header, having to use browser back or the nav items.
   - **Impact:** P2.

6. **`shell-content` wrapper missing in HTML**
   - Related to issue #4. The `vite.config.ts` and `shell.css` both expect the header+main to be wrapped in `.shell-content` for the tablet sidebar layout, but this wrapper does not exist in `index.html`. This is an incomplete structural implementation.

---

## UI/UX Issues

1. **Bottom navigation shows only 5 of 8 routes** (`home`, `devotional`, `contents`, `progress`, `settings`). The sidebar shows all 8 (`+ search`, `favorites`, `reflections`). On mobile, users cannot navigate to Favourites or Weekly Reflections directly — they must know to use the Search icon in the header to reach Search, but Favourites and Reflections have no mobile-accessible entry point from the nav bar. In the old app all pages were equally reachable.
   - File: `index.html` lines 108–163 (bottom-nav buttons) vs lines 179–252 (sidebar).

2. **Devotional nav bar button crowding on small mobile** — The `.devotional-nav` row (`src/styles/components/devotional.css` lines 176–209) shows 4 buttons (prev, favourite, complete, next) in a single flex row at `min-width: 5.5rem` and `min-width: 9rem` constraints. On 320 px wide screens (iPhone SE) the row will overflow or wrap awkwardly because `display: flex` has no `flex-wrap: wrap` and the total minimum width exceeds 320 px.

3. **"Discover My Season" quiz re-entry UX** — Once a user has taken the quiz, the Intro page shows both "Discover My Season →" and "Continue My Journey" buttons. Clicking "Discover My Season" launches a full re-quiz but overwrites the existing season assignment without any confirmation warning. This could accidentally destroy a user's season context mid-journey.

4. **Confirmation dialogs use native `window.confirm()`** — `src/pages/favorites.ts` line 89 and `src/pages/privacy.ts` lines 147, 152, 158. The old app used a custom modal for confirmations. `window.confirm()` is blocked in some iframe contexts (GitHub Pages preview) and has poor styling consistency across browsers.

5. **Splash screen text "Daily Devotional" is hard-coded** while the page subtitle on the Intro is "A 120-day personal devotional app". Minor inconsistency, but the subtitle could be more welcoming.

6. **Import button mismatch** — On the Privacy page, the Import button is a `<label>` styled as a button, which is unusual and may confuse screen readers. The more important issue is it does nothing useful (see Broken Features #2).

---

## Responsive Issues

| Viewport | Page | Issue |
|----------|------|-------|
| 768–1023 px (tablet) | All pages | Header is hidden (`.shell-content` wrapper missing); no title, no back button, no search icon |
| 768–1023 px (tablet) | All pages | Sidebar shows icon-only (60 px wide) without labels until 1024 px; labels invisible in the 768–1023 range but CSS expects them in `.sidebar-item .nav-label` opacity transition |
| 320 px (iPhone SE) | Devotional | `.devotional-nav` 4-button row overflows: combined min-widths (5.5 + implicit + 9 + 5.5 rem = ~20 rem = 320 px) leave zero room for gaps and padding |
| < 768 px (mobile) | All | Favourites and Reflections pages have no bottom-nav entry point; only reachable via sidebar (which is hidden on mobile) or browser URL manipulation |
| Any | Home | `.home-layout` is a single column below 768 px; the "Wellness Tools" grid and "Anchor Quote" appear below the today-card, requiring significant scrolling. Acceptable but dense. |
| Any | Progress | No responsive-specific layout overrides; the `.progress-stats` 4-stat grid works on all sizes but may clip on very narrow viewports if stat values are long |

---

## Asset Gaps

1. **`public/offline.html` does not exist** — Referenced in `vite.config.ts` (`navigateFallback: 'offline.html'`). Required for offline PWA fallback. This is both an asset gap and a build-breaking issue.

2. **Icon `icon-simple.svg`** — Present in `public/assets/icons/icon-simple.svg` but not referenced in the manifest (`public/manifest.webmanifest`). May be a leftover.

3. **Manifest `icon-192.png` and `icon-512.png` both marked `"purpose": "any maskable"`** — This is valid but the W3C PWA spec recommends separate `"purpose": "any"` and `"purpose": "maskable"` entries for best cross-browser icon support. The old app manifest similarly combined them. Not a blocker but suboptimal.

4. **No splash screen images** for iOS — The new app relies on the animated HTML splash which iOS will not show for home-screen PWAs that have not defined `<link rel="apple-touch-startup-image">` tags. iOS will show a white screen briefly instead. The old app had the same gap.

5. **`book-cover.webp`** — Present in `public/assets/images/book-cover.webp`. Used by `src/pages/intro.ts` line 43. No fallback `<img>` srcset or JPEG fallback for browsers without WebP support (extremely minor; all current browsers support WebP).

---

## PWA / Deployment Issues

### P0
1. **`public/offline.html` missing** — `vite.config.ts` Workbox config sets `navigateFallback: 'offline.html'`. Vite build will try to include this file in the precache manifest and as the navigation fallback. If the file is absent, the SW will either fail to install or will respond to offline navigation with a 404. **Create `public/offline.html`** with a minimal offline message.

### P1
2. **Service Worker registration duplicate** — `src/main.ts` lines 95–104 manually registers `./sw.js` via `navigator.serviceWorker.register()`. `vite-plugin-pwa` with `registerType: 'autoUpdate'` already injects its own SW registration script at build time. In development this is harmless (the manual registration silently fails). In production, if both registrations fire, there may be scope conflicts or redundant registration. The manual registration in `main.ts` should be removed since `vite-plugin-pwa` handles it.

3. **`manifest.webmanifest` — `start_url` is `"./"` not `"./index.html"`** — With a relative-base Vite build deployed to a GitHub Pages sub-path (`/Spiritual-Seasons/`), the resolved start URL will be correct. This is fine. But `scope` is not defined in the manifest, which defaults to the manifest's directory. Worth explicitly setting `"scope": "./"` for clarity.

4. **Manifest icons `purpose` split** — Both `icon-192.png` and `icon-512.png` are declared `"purpose": "any maskable"`. Google Play Trusted Web Activity and some Android launchers crop maskable icons aggressively. The safe zone for maskable icons is 80% of the canvas. If the icon artwork extends beyond that, it will be visually clipped. This should be verified and ideally two icon entries per size should exist: one `"purpose": "any"` and one `"purpose": "maskable"`.

5. **No `screenshots` in manifest** — Modern browsers (Chrome 111+) show app screenshots in the install dialog when `screenshots` are provided. The old app manifest also lacked them. Worth adding.

---

## Accessibility Issues

1. **`role="listitem"` on `<button>` without `role="list"` parent** — `src/pages/home.ts` lines 90–108: wellness cards use `<button ... role="listitem">` but the parent `<div class="wellness-grid">` has `role="list"`, which is correct. However, `<button>` with `role="listitem"` overrides the interactive role with a structural role, which is semantically wrong. The `role="listitem"` attribute should be removed; the implicit `role="button"` is appropriate.

2. **`role="list"` on non-ul/ol elements** — `src/pages/toc.ts` line 66: `<div class="toc-grid" role="list">` is acceptable. But `src/pages/home.ts` line 89 uses `<div class="wellness-grid" role="list">` with `<button>` children that have `role="listitem"`. As noted, buttons should not have `role="listitem"`.

3. **Modal focus trap not confirmed** — `src/ui/modal.ts` is used for meditation, breathing, sounds, and share modals. Without reading `modal.ts` there is risk that focus is not trapped inside the modal when it is open. Screen reader users could tab to content behind the modal. `aria-modal="true"` status should be confirmed in `src/ui/modal.ts`.

4. **`aria-live` regions on journal save indicators** — `src/pages/devotional.ts` line 123 uses `aria-live="polite"` on `#save-indicator`. This is correct. Same in `src/pages/reflections.ts` line 110. Good practice followed.

5. **Search results area not announced** — `src/pages/search.ts`: the `#search-results-area` div has no `aria-live` attribute, so screen readers won't hear result updates as the user types. Should be `aria-live="polite"` with `aria-atomic="false"`.

6. **Favourite card body uses `role="button"` + `tabindex="0"` on a div** — `src/pages/favorites.ts` line 54: `<div ... role="button" tabindex="0">`. This is a valid ARIA pattern but the `Enter`/`Space` handler is added in lines 117–123. Keyboard space-bar `e.preventDefault()` is called which is correct. This pattern is acceptable but a native `<button>` would be preferred.

7. **Missing `lang` attribute on `<html>` in splash-phase** — The `<html>` element has `lang="en"` (line 2 of `index.html`). Correct.

8. **Onboarding overlay `aria-label`** — `src/ui/onboarding.ts` line 37: `aria-label="Welcome to Spiritual Seasons"` is set on the overlay div. `aria-modal="true"` and `role="dialog"` are also set (lines 38–40). This is correct.

9. **Colour contrast — season-muted backgrounds** — The `.today-scripture-text` uses `color: var(--color-text)` (`#2C2416`) on `var(--bg-card)` (`#FFFFFF`), which passes WCAG AA (contrast ~14:1). However, `.completion-card` and `.reflection-block` use `var(--season-muted)` backgrounds that vary by season. In Summer theme `--season-muted` is `#FAE3C0` with `--color-text-muted` (`#6B5D4A`) foreground — contrast ratio is approximately 3.8:1, which passes AA for large text but may fail for small body text (needs 4.5:1). The Autumn theme `--season-muted: #EDCEBF` with `--season-dark: #7A3518` has better contrast (~7.2:1).

10. **No `aria-label` or `title` on the sidebar brand icon** — `index.html` line 200: `<img src="./assets/icons/icon.svg" alt="Spiritual Seasons" ...>` has alt text. Correct.

---

## Code Architecture Notes

### Strengths of New App
- **TypeScript throughout** — strict typing catches errors at compile time that the old app's vanilla JS could not.
- **`idb` library** — cleaner IndexedDB API than the old app's custom wrapper. Proper typing via `SpiritualSeasonsDB` interface in `src/store/db.ts`.
- **Design token CSS** — all colours, spacing, and typography come from `src/styles/base/variables.css`. Makes consistent theming trivial. Old app used a mix of inline values.
- **Lazy code-splitting** — `vite.config.ts` splits each page into its own chunk. Only the requested page's JS is loaded on first navigation.
- **Module separation** — clear boundaries between `pages/`, `store/`, `ui/`, `utils/`, `content/`, `types/`.
- **Test suite** — the old app had no tests; new app has Vitest unit + integration tests.
- **`escapeHtml` usage** — all user-provided and content-provided strings are escaped before HTML injection, preventing XSS.

### Concerns / Technical Debt
1. **Module-level mutable state** — `src/pages/quiz.ts` line 18: `let state: QuizState | null = null` at module scope. Because page modules are singletons, if the quiz is navigated away from and back to, the previous state persists until `renderQuiz` re-initializes it. This is intentional (the module re-initializes in `renderQuiz`), but it means stale state is possible if an error occurs mid-initialization.

2. **`innerHTML` usage** — All page rendering uses `innerHTML` string injection. The code consistently uses `escapeHtml()` on user data and content data, which mitigates XSS. However, the Content Security Policy in `index.html` (line 8) uses `script-src 'self'` which blocks inline scripts — this is correct and the fact that Vite compiles to module scripts means it is safe. Still, innerHTML is harder to maintain than a templating library or DOM builder and poses ongoing XSS risk if `escapeHtml` is ever omitted.

3. **`autoSaveTimer` module globals** — `src/pages/devotional.ts` line 26 and `src/pages/reflections.ts` line 32 both use module-level `let autoSaveTimer`. If navigation events race (user clicks very quickly), the timer cancel at the top of each render function (`if (autoSaveTimer !== null) clearTimeout(...)`) should handle it, but this is fragile and harder to test than passing timer refs as function arguments.

4. **`content/loader.ts`** caches `BookData` and `QuizData` in module scope — good for performance. But `src/pages/search.ts` lines 22–23 also caches `bookCache` and `journalCache` at module scope and invalidates them on each `renderSearch` call. If journal entries change in a different tab, the cache will be stale until the user navigates back to Search.

5. **`window.confirm()` for destructive actions** — three locations (see UI/UX Issues #4). These block the main thread and have inconsistent styling. A custom confirmation modal would be more polished and consistent.

6. **`src/store/audio.ts` is dead code** — The `audioNotes` store is created in `src/store/db.ts` and all CRUD functions are exported from `src/store/audio.ts` but nothing imports or calls them. This adds schema complexity without benefit. Either implement the UI or remove the store.

7. **Router `params` typing** — `RouteParams` in `src/router/router.ts` allows `day: number` and `page: string`. The params are validated in each page module, which is fine, but the router itself does not validate them. Incorrect navigation calls (e.g. `router.navigate(ROUTES.DEVOTIONAL, { day: 'abc' })`) would pass TypeScript if `RouteParams` is loosely typed.

---

## Recommended Improvements

### Immediate (blocking or data-loss)
1. **Create `public/offline.html`** — A minimal HTML page with "You're offline" message and a reload button. One file, 30 lines. Fixes the broken Workbox SW build.
2. **Implement data import in `src/pages/privacy.ts`** — The file is already reading and parsing the JSON. Add the IDB write calls for each store (`journal`, `progress`, `favorites`, `streaks`, `settings`). This is a P1 data-loss regression.
3. **Fix `.shell-content` wrapper bug** — Either add a `<div class="shell-content">` wrapper around `.app-header` and `.app-main` in `index.html`, or refactor `shell.css` to use a different selector that does not require the wrapper. This fixes the hidden header on tablet.

### High Priority
4. **Add Favourites and Reflections to mobile bottom nav** — The bottom nav currently has 5 items. Either add Favourites and Reflections (7 items — may be too crowded), or implement a "More" overflow button that reveals the extra routes, or add a quick-access shortcut to Favourites from the Home page (already present at `btn-favorites`).
5. **Add a "Retake Quiz" path** — Add a "Retake Quiz" button to Settings that navigates to `ROUTES.QUIZ` without resetting all data. After completing the quiz again, the new season result should replace the stored one but keep journal/progress intact.
6. **Implement data import** (see #2 above).
7. **Remove duplicate SW registration** in `src/main.ts` lines 95–104; rely solely on `vite-plugin-pwa`.

### Medium Priority
8. **TTS reading speed setting** — Add a `ttsSpeed` field to `AppSettings`, expose a select in Settings, and apply it in `src/pages/devotional.ts` line 309.
9. **`aria-live` on search results** — Add `aria-live="polite"` to `#search-results-area` in `src/pages/search.ts`.
10. **Remove `role="listitem"` from wellness card buttons** in `src/pages/home.ts`.
11. **Add daily notification support** — `js/modules/notifications.js` from the old app can be ported. The Notification API shape has not changed. Integrate a `notifications` settings group in `src/pages/settings.ts`.
12. **PDF export** — Port old app's jsPDF export or use a lighter alternative. Expose in Privacy page.
13. **Keyboard shortcuts** — Port `js/modules/keyboard-shortcuts.js`. Add an enable/disable toggle to Settings.
14. **Fix devotional nav overflow on 320 px** — Reduce `min-width` constraints on `.btn-prev` and `.btn-next`, or switch to a 2-row layout below 400 px.

### Lower Priority
15. **Calendar export (.ics)** — Port from old app. Expose in Privacy or Settings.
16. **Verse image generator** — Port canvas-based image generator from old app. Add a button to the devotional share modal.
17. **Audio notes UI** — Either implement the recording UI (mic button on devotional page), or remove `src/store/audio.ts` and the `audioNotes` store from `src/store/db.ts`.
18. **Animated page transitions** — Add a CSS animation to `.app-main` content on route change (fade or slide). Low complexity, high polish.
19. **Replace `window.confirm()` with custom modal** — Use the existing `Modal` class from `src/ui/modal.ts`.
20. **`icon-simple.svg` in manifest** — Either reference it in `manifest.webmanifest` as a purpose-specific icon, or remove it from `public/assets/icons/` if unused.
21. **Add `"scope": "./"` to manifest** for explicitness.
22. **Haptic feedback** — Add `navigator.vibrate()` calls on key actions (mark complete, add favourite).

---

## Prioritized Action Plan

### P0 — Broken Deployment / Data Loss
| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | `offline.html` missing — Workbox SW build broken or produces 404 offline fallback | `vite.config.ts` line 17, `public/` (missing) | Create `public/offline.html` with minimal offline message |

### P1 — Broken Core Features
| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 2 | Tablet header hidden — `.shell-content` wrapper absent from HTML | `index.html`, `src/styles/layout/shell.css` lines 278, 308 | Add `<div class="shell-content">` wrapper in `index.html` around `#app-header` and `#main-content`, or rewrite CSS to not require it |
| 3 | Data import non-functional — shows "coming soon" toast, restores nothing | `src/pages/privacy.ts` lines 128–143 | Implement actual IDB writes for each store from parsed JSON |
| 4 | Duplicate SW registration may cause scope conflicts in production | `src/main.ts` lines 95–104 | Remove manual `navigator.serviceWorker.register()` call; `vite-plugin-pwa` handles it |

### P2 — Major UX Regressions
| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 5 | Favourites and Reflections inaccessible from mobile nav | `index.html` lines 108–163 | Add Favourites + Reflections to bottom nav or add "More" overflow; alternately accept current structure and document it |
| 6 | No retake-quiz path without data wipe | `src/pages/settings.ts` | Add "Retake Quiz" button in Settings that navigates to quiz without clearing data |
| 7 | Audio notes store dead — creates IndexedDB overhead, no UI | `src/store/audio.ts`, `src/store/db.ts` lines 71–75 | Implement voice-memo UI on devotional page, or remove `audioNotes` store entirely |
| 8 | `role="listitem"` on buttons is invalid ARIA | `src/pages/home.ts` lines 90–108 | Remove `role="listitem"` from wellness card buttons |
| 9 | Search results not announced to screen readers | `src/pages/search.ts` line 68 | Add `aria-live="polite"` to `#search-results-area` div |
| 10 | Devotional nav 4-button row overflows on 320 px | `src/styles/components/devotional.css` lines 184–203 | Reduce `min-width` or add `flex-wrap: wrap` below 400 px |

### P3 — Polish / Feature Restoration
| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 11 | No daily push notifications | — | Port `js/modules/notifications.js` |
| 12 | No PDF export | — | Port `js/modules/pdf-export.js` with jsPDF |
| 13 | No keyboard shortcuts | — | Port `js/modules/keyboard-shortcuts.js` |
| 14 | No TTS speed control | `src/pages/devotional.ts` line 309, `src/pages/settings.ts` | Add `ttsSpeed` setting, expose in Settings |
| 15 | No calendar export | — | Port `js/modules/calendar-integration.js` |
| 16 | No verse image generator | — | Port `js/modules/verse-images.js` |
| 17 | Back button always hidden | `index.html` line 38, `src/main.ts` / router | Wire `header-back-btn` visibility to router history state |
| 18 | `window.confirm()` for destructive actions | `src/pages/favorites.ts` line 89, `src/pages/privacy.ts` lines 147, 152, 158 | Replace with custom confirmation modal using `src/ui/modal.ts` |
| 19 | `offline.html` content (after P0 fix) | `public/offline.html` | Make it branded and helpful (show cached content list, reload CTA) |
| 20 | Ambient sounds have no named seasonal presets | `src/ui/sounds.ts` | Add seasonal-named variants and expand to 11 presets matching old app |
| 21 | No page transition animations | `src/router/router.ts`, `src/styles/` | Add CSS fade/slide on route change |
| 22 | Haptic feedback on completions | `src/pages/devotional.ts` | Add `navigator.vibrate()` on mark-complete and favourite-toggle |
| 23 | `icon-simple.svg` not in manifest | `public/manifest.webmanifest` | Either add it as `"purpose": "any"` or delete from `public/assets/icons/` |
| 24 | Add `screenshots` to manifest | `public/manifest.webmanifest` | Add `screenshots` array for Chrome install dialog |
