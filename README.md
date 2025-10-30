# Fantasy Football Team Ranker

A React + TypeScript web app that ranks fantasy football teams via head-to-head comparisons using a quicksort-inspired engine to minimize total comparisons.

## Overview
- Load league rosters from an Excel file (SheetJS)
- Show two anonymous rosters side-by-side
- Choose the better roster with arrow buttons or keyboard
- Track progress and complete a final power rankings list with expandable team cards

## Tech Stack
- React 18 + TypeScript
- Vite + Vitest + React Testing Library
- SheetJS (xlsx)
- CSS Modules

## Development
```
npm install
npm run dev    # Start dev server
npm run test   # Run tests
npm run build  # Build for production
npm run preview # Preview build
```

## Data
- The app loads: `data/roster_dub.xlsx` (checked into the repo)
- Columns: Team Name, Player Name, Position, NFL Team, Roster Slot, Injury Status

## Manual Testing Checklist
- [ ] App loads without errors
- [ ] League data loads correctly
- [ ] First comparison appears
- [ ] Arrow buttons work
- [ ] Keyboard controls work (left/right arrows)
- [ ] Progress bar updates
- [ ] View toggle switches correctly
- [ ] Both rosters update together
- [ ] Roster slots align horizontally
- [ ] Comparisons complete (~40 for 12 teams)
- [ ] Rankings screen appears
- [ ] All 12 teams shown in order
- [ ] Clicking card expands roster
- [ ] Roster displays correctly (starters/bench/IR)
- [ ] Colors match spec (purple, gray, white)
- [ ] No console errors
- [ ] Smooth animations
- [ ] Responsive on mobile (basic)

## Known Limitations
- No persistence of progress; session only
- Tie-breakers are implicit in quicksort flow

## Project Structure
See PLAN.md and SPEC.md for detailed implementation phases and requirements.

