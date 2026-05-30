# Test Plan & Checklist — Spiritual Seasons PWA v2

---

## Phase 1 — Project Foundation

### Automated Tests

- [x] `getSeasonForDay` returns correct season for all 120 days
- [x] `getDayInSeason` returns 1–30 correctly within each season
- [ ] (Phase 1 store layer tests — added in Phase 2+)

### Manual Checks — Phase 1 Shell

Run `npm run dev` and verify:

| Check | Pass? |
|---|---|
| Dev server starts without errors | |
| App shell renders (header + nav area visible) | |
| Splash screen appears on load | |
| Splash screen fades out after ~600ms | |
| Bottom nav visible on mobile (< 768px) | |
| Sidebar nav visible on tablet (768px+) | |
| Sidebar nav expands labels on desktop (1024px+) | |
| Clicking "Home" nav item navigates to #home | |
| Clicking "Read" nav item navigates to #devotional | |
| Clicking "Contents" nav item navigates to #contents | |
| Clicking "Progress" nav item navigates to #progress | |
| Clicking "Settings" nav item navigates to #settings | |
| Active nav item is highlighted | |
| Direct URL `#settings` renders settings page | |
| Direct URL `#devotional/42` renders devotional placeholder with "Day 42" | |
| Dark mode: `[data-theme="dark"]` on `<html>` changes background color | |
| Winter season: `[data-season="winter"]` on `<html>` changes accent color to blue | |
| Spring season: green accent | |
| Summer season: golden accent | |
| Autumn season: rust accent | |
| Skip link appears on Tab keypress, targets #main-content | |
| All nav buttons have aria-label | |
| Active nav item has aria-current="page" | |
| No console errors on load | |
| No console errors on navigation | |

---

## Phase 2 — Store Layer (Future)

Tests to write in `tests/unit/store/`:

| Test File | Coverage Target |
|---|---|
| `journal.test.ts` | save, retrieve, update timestamps, delete |
| `progress.test.ts` | mark complete, mark incomplete, count completed |
| `favorites.test.ts` | toggle, add note, remove note |
| `settings.test.ts` | save setting, retrieve default, reset |
| `user.test.ts` | save quiz results, current day advance |
| `streaks.test.ts` | streak increment, streak break, milestone earned |

---

## Phase 3 — Core Reading (Future)

Manual checks to add:

- [ ] Home page shows today's devotional card
- [ ] Devotional page renders scripture and reflection prompt
- [ ] Journal saves to IndexedDB after 2s debounce
- [ ] Mark Complete advances current day
- [ ] TOC shows all 120 days with indicators
- [ ] TOC sticky season headers work on scroll

---

## Phase 4 — Quiz & Intro (Future)

- [ ] Intro carousel advances/retreats with Next/Prev
- [ ] Quiz shows 4 seasons × 4–5 questions
- [ ] Tiebreaker shown when two seasons are tied
- [ ] Quiz result saves to IndexedDB
- [ ] First-time user routes to intro, not home

---

## Phase 5–10 (Future)

See `05-rebuild-roadmap.md` for detailed per-phase test items.

---

## Accessibility Checklist (All Phases)

- [ ] Skip link visible on Tab keypress
- [ ] All interactive elements have visible focus ring
- [ ] All icon buttons have `aria-label`
- [ ] Nav has `role="navigation"` and `aria-label`
- [ ] Active nav item has `aria-current="page"`
- [ ] No keyboard traps (modals included)
- [ ] No content only distinguishable by color
- [ ] Seasonal animations respect `prefers-reduced-motion`
- [ ] Screen reader: NVDA/VoiceOver navigation test

---

## Performance Checklist (Phase 10)

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse PWA = 100
- [ ] Initial JS bundle < 75 KB
- [ ] No per-item IndexedDB reads in TOC or Search
- [ ] Seasonal animations paused when tab not visible

---

## Browser Matrix

| Browser | Version | Priority |
|---|---|---|
| Chrome | Latest | P0 |
| Safari iOS | Latest | P0 |
| Firefox | Latest | P1 |
| Edge | Latest | P1 |
| Chrome Android | Latest | P0 |
| Samsung Internet | Latest | P2 |
| Safari macOS | Latest | P1 |
