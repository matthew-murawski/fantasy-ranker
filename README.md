# Fantasy Football Team Ranker

A React + TypeScript web app that ranks fantasy football teams via head‑to‑head comparisons using a Swiss System tournament algorithm to minimize comparisons.

**What it does**
- Loads an Excel of league rosters
- Shows two anonymous rosters side‑by‑side for selection
- Accepts clicks or left/right arrow keys
- Tracks progress and produces final Power Rankings with expandable team cards

**Tech stack**
- React 18 + TypeScript, Vite
- Vitest + React Testing Library
- SheetJS (xlsx)
- CSS Modules with theme variables

## Setup & Commands
- npm install
- npm run dev  (start dev server)
- npm run test (run tests)
- npm run build (prod build)
- npm run preview (serve build locally)

## Data File
- Default path: `data/roster_dub.xlsx`
- Expected headers (row 1):
  - Team Name, Player Name, Position, NFL Team, Roster Slot, Injury Status, Percent Started (optional)
- Data rows start at row 2.

Accepted values
- Roster Slot: `QB`, `RB`, `WR`, `TE`, `K`, `D/ST`, `RB/WR/TE` (FLEX), `BE` (bench), `IR` (injured reserve)
- Injury Status: `ACTIVE` (or empty), `INJURY_RESERVE`, `IR`
- Percent Started: number 0–100 (optional; used to auto‑fill missing starters)

Auto‑fill for missing starters
- If a team has fewer than 9 starters after reading the sheet, the app will try to promote bench players into missing slots using the “Percent Started” column:
  - For each missing slot (QB, RB×2, WR×2, TE, FLEX, K, D/ST), pick the eligible bench player with the highest Percent Started and promote them into that slot.
  - FLEX accepts RB/WR/TE positions.
  - If no eligible bench exists for a missing slot, that slot remains empty.
- Note: Validation expects exactly 9 starters per team. The auto‑fill aims to reach 9; if it cannot (no eligible players), validation will still fail for that team until the sheet is adjusted or additional eligible players are added.

## Ranking Algorithm

The app uses a **Swiss System tournament** algorithm to rank teams efficiently:

- **Dynamic league support**: Works with any league size (2-20+ teams)
- **Reduced comparisons**: ~50% fewer comparisons than previous quicksort approach
  - 8 teams: ~12-15 comparisons
  - 10 teams: ~20-24 comparisons
  - 12 teams: ~24-28 comparisons
  - 14 teams: ~28-32 comparisons
  - 16 teams: ~32-38 comparisons

**How it works**:
1. **Swiss rounds**: Teams are paired in rounds based on current records (like a tournament)
   - Number of rounds: `ceil(log₂(team count))`
   - Teams with similar records face each other
   - No rematches across rounds
2. **Tiebreakers**: After Swiss rounds, ties are resolved using:
   - Head-to-head results (if teams played each other)
   - Strength of schedule (opponent win percentage)
   - Additional comparisons if needed (when SOS is equal)
3. **Final ranking**: Complete ordered list from best to worst team

The algorithm runs entirely in the background—users just see a continuous flow of comparisons until complete.

## Features
- Comparison screen
  - Side‑by‑side roster panels with view toggle (Starters/Bench/IR or By Position)
  - Arrow buttons and keyboard controls (Left/Right)
  - Progress bar showing estimated completion

- Rankings screen
  - "POWER RANKINGS" list
  - Expandable team cards to view full rosters

- Accessibility & theming
  - Keyboard accessible buttons with aria‑labels
  - Focus indicators on actionable elements
  - Theme variables in `src/styles/theme.css` used across components

## Deployment (GitHub Pages)
- A workflow is included: `.github/workflows/pages.yml`
- In GitHub → Settings → Pages, choose “GitHub Actions” for Source.
- The workflow builds with `--base=/fantasy-ranker/`. If your repo name differs, update that base accordingly.
- After a push to `main`/`master`, the site publishes to `https://<username>.github.io/<repo>/`.

## Manual Testing Checklist
- [ ] App loads without errors
- [ ] League data loads correctly from `data/roster_dub.xlsx`
- [ ] First comparison appears
- [ ] Arrow buttons work and keyboard arrows work
- [ ] Progress bar updates
- [ ] View toggle switches and both rosters update together
- [ ] Roster slots align across panels
- [ ] Comparisons complete (see Ranking Algorithm section for expected counts)
- [ ] Rankings screen appears
- [ ] All teams shown in rank order; cards expand to show rosters
- [ ] Theme colors (purple/gray/white) and spacing look consistent
- [ ] No console errors
- [ ] Responsive on mobile (panels stack)

## Known Limitations
- No persistence of progress (session‑based)
- If a team cannot reach 9 starters even after auto‑fill, validation fails until data is corrected

## Reference
- See `SPEC.md` and `PLAN.md` for functional details and development phases.
