Fantasy Football Team Ranker - Development Blueprint & Implementation Prompts
Overview
This document provides a comprehensive blueprint for building the Fantasy Football Team Ranker web application. The project is broken down into 18 carefully-sized steps, each building incrementally on the previous work. Each step includes a detailed prompt for a code-generation LLM that emphasizes test-driven development and integration.

Project Architecture
Technology Stack:

React 18+ with TypeScript
SheetJS (xlsx) for Excel parsing
Jest + React Testing Library for testing
CSS Modules for styling

Key Components:

Data Layer: Excel parsing and roster management
Algorithm Layer: Quicksort comparison engine
UI Layer: React components for display and interaction
State Management: React Context for app-wide state

File Structure:
src/
├── components/
│   ├── PlayerCard/
│   ├── RosterList/
│   ├── RosterPanel/
│   ├── ComparisonScreen/
│   ├── RankingsScreen/
│   └── ...
├── services/
│   ├── excelParser.ts
│   ├── dataService.ts
│   └── comparisonAlgorithm.ts
├── types/
│   └── index.ts
├── utils/
└── App.tsx
```

---

## Development Phases

### Phase 1: Foundation (Steps 1-5)
Building the data layer and core algorithm

### Phase 2: Core UI Components (Steps 6-10)
Creating reusable roster display components

### Phase 3: Comparison Interface (Steps 11-15)
Building the head-to-head comparison screen

### Phase 4: Rankings & Integration (Steps 16-18)
Final rankings display and complete integration

---

# Implementation Prompts

## Step 1: Project Setup

**Context:** Starting a new React project with TypeScript for a fantasy football team ranking application.

**Prompt:**
```
Create a new React project with TypeScript using Vite. Set up the project with the following requirements:

1. Initialize a new Vite + React + TypeScript project
2. Install these dependencies:
   - xlsx (for Excel file parsing)
   - @testing-library/react
   - @testing-library/jest-dom
   - @testing-library/user-event
   - vitest (for testing)

3. Configure vitest for testing:
   - Set up vitest.config.ts
   - Configure test environment as 'jsdom'
   - Add test scripts to package.json

4. Create the basic folder structure:
   - src/components/
   - src/services/
   - src/types/
   - src/utils/
   - src/__tests__/

5. Create a simple App.tsx that renders "Fantasy Football Ranker" heading

6. Write a basic test for App.tsx that verifies the heading renders

7. Ensure all tests pass and the app runs with `npm run dev`

Provide complete file contents for: package.json, vitest.config.ts, App.tsx, and App.test.tsx
```

---

## Step 2: Data Models

**Context:** We need TypeScript interfaces to represent our roster data structure. The Excel file has columns for Team Name, Player Name, Position, NFL Team, Roster Slot, and Injury Status.

**Prompt:**
```
Create TypeScript type definitions for the fantasy football roster data. Based on this specification:

Excel file structure (rosters.xlsx):
- Column A: Team Name
- Column B: Player Name  
- Column C: Position (QB, RB, WR, TE, K, D/ST)
- Column D: NFL Team
- Column E: Roster Slot (QB, RB, WR, TE, K, D/ST, RB/WR/TE, BE)
- Column F: Injury Status (values include ACTIVE, QUESTIONABLE, NORMAL, INJURY_RESERVE)

Create a file src/types/index.ts with these interfaces:

1. Player interface with properties:
   - playerName: string
   - position: string
   - nflTeam: string
   - rosterSlot: string
   - injuryStatus: string
   - isIR: boolean (computed from injuryStatus === 'INJURY_RESERVE')

2. Team interface with properties:
   - teamName: string
   - players: Player[]
   - starters: Player[] (computed: players where rosterSlot is not 'BE')
   - bench: Player[] (computed: players where rosterSlot is 'BE' and not IR)
   - ir: Player[] (computed: players where isIR is true)

3. Roster interface with properties:
   - teams: Team[]

4. ComparisonPair interface with properties:
   - teamA: Team
   - teamB: Team

5. Create helper type guards and utility functions:
   - isStarter(player: Player): boolean
   - isBench(player: Player): boolean
   - isIR(player: Player): boolean

Write comprehensive tests for the utility functions in src/__tests__/types.test.ts

Ensure all types are properly exported and tests pass.
```

---

## Step 3: Excel Parser

**Context:** We need a utility to parse the Excel file and convert it into our TypeScript data structures. The file is located at public/league-data/roster_dub.xlsx.

**Prompt:**
```
Create an Excel file parser utility that reads roster data and converts it to our TypeScript types.

Requirements:

1. Create src/services/excelParser.ts with a function:
   - parseRosterFile(file: File | ArrayBuffer): Promise<Team[]>
   - Uses the xlsx library to read the file
   - Expects data starting at row 2 (row 1 is headers)
   - Maps columns A-F to: Team Name, Player Name, Position, NFL Team, Roster Slot, Injury Status
   - Groups players by team name
   - Creates Player objects with isIR computed from injuryStatus
   - Returns array of Team objects

2. Handle edge cases:
   - Empty cells
   - Missing data
   - Invalid roster slots
   - Multiple teams with same name (throw error)

3. Create src/__tests__/excelParser.test.ts with tests for:
   - Parsing a valid Excel file with 2 teams
   - Correctly grouping players by team
   - Correctly identifying IR players
   - Correctly separating starters, bench, and IR
   - Handling empty cells gracefully
   - Throwing error for invalid data

4. For testing, create a mock Excel buffer using xlsx.utils:
   - Create a simple worksheet with 2 teams, 6 players total
   - Include at least one IR player
   - Include starters and bench players

Ensure all imports are correct (from 'xlsx' and '../types') and all tests pass.
```

---

## Step 4: Data Service

**Context:** We need a service layer to load the Excel file and manage the roster data throughout the app lifecycle.

**Prompt:**
```
Create a data service that loads and manages roster data for the application.

Requirements:

1. Create src/services/dataService.ts with these functions:

   - loadLeagueData(leagueName: string): Promise<Team[]>
     - Fetches the Excel file from public/league-data/roster_{leagueName}.xlsx
     - Uses the parseRosterFile function from step 3
     - Returns parsed teams array
     - Throws descriptive error if file not found or parsing fails

   - getTeamByName(teams: Team[], teamName: string): Team | undefined
     - Helper to find a team by name

   - validateRosterData(teams: Team[]): boolean
     - Validates that each team has:
       - At least 1 starter
       - Exactly 9 starters (1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 D/ST)
       - Valid roster slots
     - Returns true if valid, throws error with details if invalid

2. Create src/__tests__/dataService.test.ts with tests for:
   - Loading league data successfully (mock fetch)
   - Handling file not found error
   - Finding team by name
   - Validating correct roster structure
   - Catching invalid roster structures (missing positions, wrong counts)

3. Use these mocking strategies:
   - Mock global fetch for loadLeagueData tests
   - Create valid and invalid team fixtures for validation tests

Ensure all functions are properly typed, exported, and all tests pass.
```

---

## Step 5: Comparison Algorithm

**Context:** We need a quicksort-based algorithm to track head-to-head comparisons and generate a ranking. The algorithm should minimize comparisons (around 35-40 for 12 teams) and handle tie-breaking.

**Prompt:**
```
Create a comparison algorithm based on quicksort that tracks user decisions and generates team rankings.

Requirements:

1. Create src/services/comparisonAlgorithm.ts with a class ComparisonEngine:

   Constructor:
   - constructor(teams: Team[])
   - Initializes with array of teams to rank
   - Sets up internal state for tracking comparisons

   Properties:
   - teams: Team[] (teams being ranked)
   - comparisons: Map<string, number> (stores results: "teamA_vs_teamB" -> 1 if A wins, -1 if B wins)
   - comparisonQueue: ComparisonPair[] (queue of comparisons needed)
   - isComplete: boolean (whether ranking is determined)

   Methods:
   - getNextComparison(): ComparisonPair | null
     - Returns next pair of teams to compare
     - Returns null if ranking is complete
     - Uses quicksort partitioning strategy

   - recordComparison(winnerTeam: Team, loserTeam: Team): void
     - Records result of a comparison
     - Updates internal state
     - Generates next comparisons based on quicksort logic

   - needsTieBreaker(): ComparisonPair | null
     - Checks if two teams have same implied ranking
     - Returns pair that needs direct comparison
     - Returns null if no tie-breaker needed

   - getFinalRanking(): Team[]
     - Returns teams sorted by rank (best to worst)
     - Only callable when isComplete is true
     - Throws error if called before completion

   - getProgress(): { completed: number; estimated: number }
     - Returns comparison progress

2. Implement quicksort comparison logic:
   - Use modified quicksort that requests comparisons instead of direct comparison
   - Track which comparisons have been made
   - Minimize total comparisons needed
   - Aim for O(n log n) comparisons

3. Create src/__tests__/comparisonAlgorithm.test.ts with tests for:
   - Initializing with teams
   - Getting first comparison
   - Recording comparisons and getting next
   - Completing full ranking with simulated comparisons (12 teams)
   - Detecting tie-breaker scenarios
   - Calculating progress accurately
   - Handling edge cases (2 teams, 3 teams)

4. For testing, create deterministic comparison scenarios:
   - "Team A always beats everyone" scenario
   - Random but consistent comparisons
   - Verify final ranking is transitive and correct

Ensure comprehensive tests and that the algorithm completes rankings in ~35-40 comparisons for 12 teams.
```

---

## Step 6: PlayerCard Component

**Context:** We need a reusable component to display individual players. This component will be used in multiple contexts (starters, bench, IR, position view).

**Prompt:**
```
Create a PlayerCard component that displays a single player's information.

Requirements:

1. Create src/components/PlayerCard/PlayerCard.tsx:

   Props interface:
   - player: Player
   - displayFormat: 'starter' | 'bench' | 'position-group'
   - showPosition: boolean (default true)

   Display logic:
   - For 'starter' format: "POSITION | PlayerName (NFL_TEAM)"
     - Position label is visually separated (different styling)
     - Example: "QB | M. Stafford (LAR)"
   
   - For 'bench' or 'position-group' format: "POSITION PlayerName (NFL_TEAM)"
     - Position is integrated with card
     - Example: "RB D. Achane (MIA)"

   Styling (create PlayerCard.module.css):
   - Background: gray (#666 or similar)
   - Text color: white
   - Padding: 8px 12px
   - Border-radius: 4px
   - Margin-bottom: 4px
   - For 'starter' format, use flexbox with position label on left
   - Font size: 14px
   - Font family: sans-serif

2. Create src/components/PlayerCard/PlayerCard.module.css with the styles

3. Create src/components/PlayerCard/PlayerCard.test.tsx with tests for:
   - Rendering player name correctly
   - Rendering NFL team correctly
   - Starter format displays position separated (check for "|")
   - Bench format displays position integrated (no "|")
   - Position visibility can be toggled with showPosition prop
   - Correct styling is applied (check className)

4. Create src/components/PlayerCard/index.ts to export the component

Use React Testing Library and ensure all tests pass. Make component fully typed with TypeScript.
```

---

## Step 7: RosterList Component

**Context:** We need a component that displays a list of players in the starter/bench/IR format with section headers.

**Prompt:**
```
Create a RosterList component that displays players organized by starters, bench, and IR sections.

Requirements:

1. Create src/components/RosterList/RosterList.tsx:

   Props interface:
   - team: Team
   - showStarters: boolean (default true)
   - showBench: boolean (default true)
   - showIR: boolean (default true)

   Component structure:
   - Three sections: STARTERS, BENCH, IR
   - Each section has a header (styled prominently)
   - Uses PlayerCard component for each player
   - For starters: display in this order:
     - QB (roster slot "QB")
     - RB (roster slot "RB") - first one
     - RB (roster slot "RB") - second one
     - WR (roster slot "WR") - first one
     - WR (roster slot "WR") - second one
     - TE (roster slot "TE")
     - FLEX (roster slot "RB/WR/TE") - display as "FLEX"
     - D/ST (roster slot "D/ST")
     - K (roster slot "K")
   - For bench: group by position (QB, RB, WR, TE, D/ST, K)
   - For IR: display all IR players grouped by position

   Styling (create RosterList.module.css):
   - Section headers: white text, bold, uppercase, margin-bottom: 8px, font-size: 16px
   - Sections separated with margin-top: 16px
   - Empty sections display nothing (not even header)

2. Create utility functions in the component:
   - sortStarters(players: Player[]): Player[]
     - Sorts starters by position order
     - Handles duplicate positions (multiple RBs, WRs)
   
   - groupByPosition(players: Player[]): Map<string, Player[]>
     - Groups players by position
     - Returns in order: QB, RB, WR, TE, D/ST, K

3. Create src/components/RosterList/RosterList.module.css

4. Create src/components/RosterList/RosterList.test.tsx with tests for:
   - Renders all three sections with correct headers
   - Starters are in correct order (QB first, K last)
   - Bench players are grouped by position
   - IR players are shown in IR section
   - Empty sections don't render
   - FLEX position displays as "FLEX" not "RB/WR/TE"
   - PlayerCard receives correct displayFormat prop

5. Create src/components/RosterList/index.ts

Create a comprehensive test fixture with a team that has:
- All 9 starter positions filled
- 4 bench players (mixed positions)
- 2 IR players

Ensure all tests pass and component is fully typed.
```

---

## Step 8: PositionGroupedView Component

**Context:** We need an alternate view that shows all players grouped by position (QBs, RBs, WRs, TEs, D/ST, K) regardless of starter/bench status, with IR designation still visible.

**Prompt:**
```
Create a PositionGroupedView component that displays all players organized by position.

Requirements:

1. Create src/components/PositionGroupedView/PositionGroupedView.tsx:

   Props interface:
   - team: Team

   Component structure:
   - Six position sections with headers:
     - QUARTERBACKS
     - RUNNING BACKS
     - WIDE RECEIVERS
     - TIGHT ENDS
     - D/ST (keep as is, don't expand)
     - KICKERS
   - Each section displays all players of that position
   - Use PlayerCard component with displayFormat='position-group'
   - IR players should still be visible but indicated somehow:
     - Add "(IR)" after the player's NFL team
     - Example: "RB D. Harris (NE) (IR)"

   Styling (create PositionGroupedView.module.css):
   - Position headers: white text, bold, uppercase, margin-bottom: 8px, font-size: 16px
   - Sections separated with margin-top: 16px
   - Empty positions don't render a section

2. Create utility functions:
   - getPositionHeader(position: string): string
     - Maps position codes to full names
     - QB -> QUARTERBACKS
     - RB -> RUNNING BACKS
     - WR -> WIDE RECEIVERS
     - TE -> TIGHT ENDS
     - D/ST -> D/ST
     - K -> KICKERS

   - getAllPlayersByPosition(team: Team): Map<string, Player[]>
     - Groups ALL players (starters, bench, IR) by position
     - Returns in order: QB, RB, WR, TE, D/ST, K

3. Update PlayerCard component:
   - Add optional prop: showIRIndicator?: boolean
   - When true and player.isIR is true, append " (IR)" to display

4. Create src/components/PositionGroupedView/PositionGroupedView.module.css

5. Create src/components/PositionGroupedView/PositionGroupedView.test.tsx:
   - All positions are rendered with correct headers
   - Players are grouped correctly by position
   - IR players show (IR) indicator
   - Starters and bench players appear together
   - Empty positions don't render
   - PlayerCard receives showIRIndicator prop

6. Update PlayerCard tests to cover IR indicator functionality

7. Create src/components/PositionGroupedView/index.ts

Create test fixture with:
- Multiple players per position
- Mix of starters and bench
- At least one IR player

Ensure all tests pass and TypeScript types are correct.
```

---

## Step 9: RosterPanel Component

**Context:** We need a container component that shows either the RosterList or PositionGroupedView and provides a toggle to switch between them.

**Prompt:**
```
Create a RosterPanel component that wraps roster views and provides view toggle functionality.

Requirements:

1. Create src/components/RosterPanel/RosterPanel.tsx:

   Props interface:
   - team: Team
   - viewMode: 'starters' | 'position' (controls which view is shown)
   - onViewModeChange: (mode: 'starters' | 'position') => void
   - showViewToggle: boolean (default true)

   Component structure:
   - View toggle buttons at the top (if showViewToggle is true)
     - Two buttons: "Starters/Bench" and "By Position"
     - Active button has different styling (not greyed)
     - Inactive button is greyed out
   - Roster content below:
     - Shows RosterList when viewMode is 'starters'
     - Shows PositionGroupedView when viewMode is 'position'

   Styling (create RosterPanel.module.css):
   - Container: background transparent, padding: 16px
   - Toggle buttons:
     - Display: inline-flex
     - Margin-bottom: 16px
     - Button styling: padding 8px 16px, border-radius 4px, border: none
     - Active button: background #888, color white, cursor: default
     - Inactive button: background #444, color #aaa, cursor: pointer
     - Hover on inactive: background #555

2. Create src/components/RosterPanel/RosterPanel.module.css

3. Create src/components/RosterPanel/RosterPanel.test.tsx with tests for:
   - Renders RosterList when viewMode is 'starters'
   - Renders PositionGroupedView when viewMode is 'position'
   - Toggle buttons render correctly
   - Active button has correct styling
   - Clicking inactive button calls onViewModeChange
   - Active button doesn't call onViewModeChange when clicked
   - View toggle can be hidden with showViewToggle prop
   - Correct props are passed to child components

4. Create src/components/RosterPanel/index.ts

Use React Testing Library's user interactions to test button clicks. Ensure all tests pass.
```

---

## Step 10: Roster Display Testing

**Context:** Now that we have all roster display components, we need comprehensive integration tests to ensure they work together correctly.

**Prompt:**
```
Create comprehensive integration tests for the roster display components.

Requirements:

1. Create src/__tests__/integration/rosterDisplay.test.tsx:

   Test scenarios:
   - Full roster display flow:
     - Create a complete team with all positions filled
     - Render RosterPanel in 'starters' mode
     - Verify all starters are displayed in correct order
     - Verify bench players are grouped by position
     - Verify IR players are in IR section
     - Switch to 'position' mode
     - Verify all players are grouped by position
     - Verify IR indicator shows on IR players

   - Edge cases:
     - Team with no bench players (only starters)
     - Team with no IR players
     - Team with empty position (no backup QB, etc.)
     - Team with maximum bench (simulate 10+ bench players)

   - View toggle functionality:
     - Starting in 'starters' mode
     - Click "By Position" button
     - Verify view changes
     - Verify toggle button states update
     - Click "Starters/Bench" button
     - Verify view changes back
     - Verify button states correct

   - Starter position ordering:
     - Team with multiple RBs and WRs
     - Verify first RB appears before second RB
     - Verify first WR appears before second WR
     - Verify FLEX shows as "FLEX" not "RB/WR/TE"

   - Position grouping:
     - Team with players across all positions
     - Verify position groups appear in correct order
     - Verify headers use full position names (QUARTERBACKS not QB)

2. Create test fixtures in src/__tests__/fixtures/teams.ts:
   - createMockTeam(config): Team
     - Helper to create teams with specific configurations
     - Accepts: { numBench?: number, numIR?: number, positions?: string[] }
   
   - FULL_ROSTER_TEAM: Team (all 9 starters + 5 bench + 2 IR)
   - MINIMAL_TEAM: Team (9 starters only)
   - IR_HEAVY_TEAM: Team (9 starters + 5 IR)

3. Create src/__tests__/fixtures/index.ts to export fixtures

4. Run all tests and ensure:
   - All unit tests for individual components pass
   - All integration tests pass
   - No console errors or warnings
   - TypeScript compiles without errors

This step doesn't add new components but validates everything works together correctly before moving to the comparison interface.
```

---

## Step 11: ComparisonScreen Layout

**Context:** We need the main comparison screen that displays two rosters side-by-side for head-to-head evaluation.

**Prompt:**
```
Create the ComparisonScreen component that displays two rosters side-by-side for comparison.

Requirements:

1. Create src/components/ComparisonScreen/ComparisonScreen.tsx:

   Props interface:
   - teamA: Team
   - teamB: Team
   - onSelectWinner: (winner: Team) => void
   - progress: { completed: number; estimated: number }
   - viewMode: 'starters' | 'position'
   - onViewModeChange: (mode: 'starters' | 'position') => void

   Component structure:
   - View toggle buttons in top-left corner
     - Single set of buttons that control both rosters
   - Two-column layout for rosters:
     - Left panel: teamA roster (RosterPanel)
     - Right panel: teamB roster (RosterPanel)
     - Space between panels: 24px
     - Each panel takes ~47% width
   - Selection area at bottom:
     - Instruction text: "click or use arrow keys to choose the best team"
     - Two arrow buttons (← and →)
   - Progress bar at very bottom

   Layout (create ComparisonScreen.module.css):
   - Container: purple background (#7B2CBF or similar), min-height: 100vh, padding: 24px
   - View toggle: position absolute, top-left, or use flexbox at top
   - Roster container: display flex, justify-content: space-between, align-items: flex-start
   - Selection area: text-align center, margin-top: 32px
   - Instruction text: white color, margin-bottom: 16px, font-size: 18px

2. Create src/components/ComparisonScreen/ComparisonScreen.module.css

3. Important: DO NOT implement button functionality yet (Step 12)
   - Buttons should render but not have onClick handlers yet
   - Just pass empty placeholder: onClick={() => {}}

4. Important: DO NOT implement keyboard controls yet (Step 13)
   - No keyboard event listeners in this step

5. Important: DO NOT implement ProgressBar yet (Step 14)
   - Just render placeholder div with text: "Progress: {completed}/{estimated}"

6. Create src/components/ComparisonScreen/ComparisonScreen.test.tsx:
   - Renders both team rosters
   - View toggle controls both rosters simultaneously
   - Both RosterPanels show same viewMode
   - Changing view mode updates both panels
   - Instruction text is displayed
   - Progress info is displayed
   - Layout uses flexbox for side-by-side display
   - Purple background is applied

7. Create src/components/ComparisonScreen/index.ts

Focus on layout and rendering. Ensure rosters align properly side-by-side. All tests pass.
```

---

## Step 12: Selection Buttons

**Context:** We need to implement the arrow buttons that allow users to select which team is better, including visual design and click handlers.

**Prompt:**
```
Create arrow button components and wire up selection functionality in ComparisonScreen.

Requirements:

1. Create src/components/ArrowButton/ArrowButton.tsx:

   Props interface:
   - direction: 'left' | 'right'
   - onClick: () => void
   - disabled?: boolean

   Component:
   - Renders a large arrow (← or →)
   - Use HTML entity or Unicode: ← is \u2190, → is \u2192
   - Or use SVG for better control
   - Accessible button with proper aria-label

   Styling (create ArrowButton.module.css):
   - Large clickable button: 80px × 80px
   - Border-radius: 8px
   - Background: #5E17EB (purple/violet, developer can adjust)
   - Color: white
   - Font-size: 48px
   - Border: none
   - Cursor: pointer
   - Hover: slightly darker background
   - Active: scale down slightly (transform: scale(0.95))
   - Disabled: opacity 0.5, cursor not-allowed

2. Create src/components/ArrowButton/ArrowButton.module.css

3. Create src/components/ArrowButton/ArrowButton.test.tsx:
   - Renders left arrow correctly
   - Renders right arrow correctly
   - Calls onClick when clicked
   - Doesn't call onClick when disabled
   - Has proper aria-label for accessibility
   - Applies disabled styling when disabled

4. Create src/components/ArrowButton/index.ts

5. Update src/components/ComparisonScreen/ComparisonScreen.tsx:
   - Import ArrowButton component
   - Replace placeholder buttons with ArrowButton components
   - Wire up onClick handlers:
     - Left arrow: calls onSelectWinner(teamA)
     - Right arrow: calls onSelectWinner(teamB)
   - Layout buttons: display flex, gap: 32px, justify-content: center

6. Update ComparisonScreen.module.css:
   - Add styles for button container
   - Center buttons horizontally

7. Update src/components/ComparisonScreen/ComparisonScreen.test.tsx:
   - Test clicking left arrow calls onSelectWinner with teamA
   - Test clicking right arrow calls onSelectWinner with teamB
   - Test onSelectWinner is called with correct Team object

Ensure all tests pass. DO NOT implement keyboard controls yet (that's Step 13).
```

---

## Step 13: Keyboard Controls

**Context:** We need to add keyboard event listeners so users can press left/right arrow keys to make selections.

**Prompt:**
```
Add keyboard controls to ComparisonScreen for selecting teams with arrow keys.

Requirements:

1. Update src/components/ComparisonScreen/ComparisonScreen.tsx:

   - Add useEffect hook to set up keyboard listeners:
     - Listen for 'keydown' events
     - ArrowLeft key → call onSelectWinner(teamA)
     - ArrowRight key → call onSelectWinner(teamB)
     - Use event.key === 'ArrowLeft' and event.key === 'ArrowRight'
   
   - Properly clean up event listener on unmount
   
   - Prevent default behavior for arrow keys (prevents scrolling)

   - Consider focus management:
     - Keyboard should work regardless of focus
     - Add listener to document, not component

2. Update src/components/ComparisonScreen/ComparisonScreen.test.tsx:

   - Test arrow key functionality:
     - Simulate ArrowLeft keydown → verify onSelectWinner called with teamA
     - Simulate ArrowRight keydown → verify onSelectWinner called with teamB
     - Use userEvent.keyboard or fireEvent with proper event object
   
   - Test cleanup:
     - Render component
     - Unmount component
     - Simulate keydown
     - Verify onSelectWinner NOT called (listener removed)

   - Test event.preventDefault is called for arrow keys

3. Consider accessibility:
   - Document that keyboard controls are available
   - Instruction text already mentions arrow keys
   - Ensure buttons are still keyboard accessible (Tab + Enter)

4. Handle edge cases:
   - Multiple rapid keypresses
   - Keys pressed while disabled (if applicable in future)

Use React Testing Library's keyboard simulation utilities. Ensure all existing tests still pass and new tests pass.
```

---

## Step 14: Progress Bar

**Context:** We need a visual progress bar component to show comparison progress.

**Prompt:**
```
Create a ProgressBar component and integrate it into ComparisonScreen.

Requirements:

1. Create src/components/ProgressBar/ProgressBar.tsx:

   Props interface:
   - completed: number (comparisons completed)
   - total: number (estimated total comparisons)

   Component:
   - Visual progress bar (no text labels)
   - Calculate percentage: (completed / total) * 100
   - Display filled bar proportional to percentage

   Styling (create ProgressBar.module.css):
   - Container: width 100%, height 8px, background #444, border-radius 4px
   - Filled bar: height 100%, background #5E17EB (purple), border-radius 4px
   - Smooth transition: transition: width 0.3s ease
   - Bar width set via inline style: width: `${percentage}%`

2. Create src/components/ProgressBar/ProgressBar.module.css

3. Create src/components/ProgressBar/ProgressBar.test.tsx:
   - Renders with correct initial width (0%)
   - Updates width when completed changes
   - Shows 50% when completed=5, total=10
   - Shows 100% when completed=total
   - Handles edge case: completed > total (caps at 100%)
   - Handles edge case: total=0 (shows 0%)
   - Applies correct CSS classes

4. Create src/components/ProgressBar/index.ts

5. Update src/components/ComparisonScreen/ComparisonScreen.tsx:
   - Remove placeholder progress text
   - Import and render ProgressBar component
   - Pass progress.completed and progress.estimated as props
   - Position at bottom of screen:
     - Fixed or absolute position at bottom
     - Full width with padding: 16px on sides
     - Margin-bottom: 16px

6. Update ComparisonScreen.module.css:
   - Add styles for progress bar container positioning

7. Update src/components/ComparisonScreen/ComparisonScreen.test.tsx:
   - ProgressBar renders with correct props
   - Progress updates when prop changes

Ensure all tests pass and progress bar displays correctly at bottom of screen.
```

---

## Step 15: Wire Comparison Logic

**Context:** Now we need to connect the ComparisonScreen to the ComparisonEngine and manage the comparison flow.

**Prompt:**
```
Create a hook to manage comparison state and wire it into ComparisonScreen to enable the full comparison flow.

Requirements:

1. Create src/hooks/useComparison.ts:

   Hook signature:
   - useComparison(teams: Team[])

   Returns:
   - currentComparison: ComparisonPair | null
   - progress: { completed: number; estimated: number }
   - isComplete: boolean
   - selectWinner: (winner: Team) => void
   - finalRanking: Team[] | null

   Implementation:
   - Create ComparisonEngine instance (from Step 5) with teams
   - Store in useState or useRef
   - Track current comparison from engine.getNextComparison()
   - When selectWinner called:
     - Record comparison in engine
     - Check for tie-breaker
     - Get next comparison
     - Update state
   - When isComplete becomes true, get final ranking

2. Create src/hooks/useComparison.test.ts:
   - Hook initializes with first comparison
   - Selecting winner gets next comparison
   - Progress updates after each selection
   - isComplete becomes true after enough comparisons
   - finalRanking is available when complete
   - Handles tie-breaker scenarios
   - Works correctly with different team counts (2, 3, 12 teams)

3. Create a test component that uses the hook:
   - Simulates user making comparisons
   - Verifies state updates correctly
   - Use @testing-library/react-hooks if needed

4. Update src/components/ComparisonScreen/ComparisonScreen.tsx:
   - Component now accepts simpler props:
     - comparison: ComparisonPair
     - progress: { completed: number; estimated: number }
     - onSelectWinner: (winner: Team) => void
   - Remove viewMode from props (manage internally with useState)
   - Display comparison.teamA and comparison.teamB

5. Update ComparisonScreen tests to match new props

6. Create example usage component src/components/ComparisonFlow/ComparisonFlow.tsx:
   - Uses useComparison hook
   - Renders ComparisonScreen when not complete
   - Shows completion message when isComplete (temporary - Step 16 will add rankings)
   - Example:
```tsx
     const { currentComparison, progress, isComplete, selectWinner } = useComparison(teams);
     
     if (isComplete) return <div>Ranking complete!</div>;
     if (!currentComparison) return <div>Loading...</div>;
     
     return (
       <ComparisonScreen
         comparison={currentComparison}
         progress={progress}
         onSelectWinner={selectWinner}
       />
     );
```

7. Create src/components/ComparisonFlow/ComparisonFlow.test.tsx:
   - Full flow test: make comparisons until complete
   - Verify screens transition correctly
   - Verify completion message shows

8. Create src/components/ComparisonFlow/index.ts

Ensure all tests pass and comparison flow works end-to-end (except final rankings display).
```

---

## Step 16: Rankings Screen

**Context:** We need the final screen that displays the power rankings with expandable team cards showing full rosters.

**Prompt:**
```
Create the RankingsScreen component that displays the final power rankings with expandable rosters.

Requirements:

1. Create src/components/TeamRankingCard/TeamRankingCard.tsx:

   Props interface:
   - team: Team
   - rank: number (1-12)
   - isExpanded: boolean
   - onToggle: () => void

   Component structure:
   - Card shows: rank number and team name
     - Example: "1. Matt" or "5. Steven"
   - Clicking anywhere on card toggles expansion
   - When expanded, shows full roster below using RosterList
   - Roster always displays in starter/bench/IR format (no toggle)

   Styling (create TeamRankingCard.module.css):
   - Card container: background #555, padding: 16px, border-radius: 8px, margin-bottom: 8px
   - Card is clickable: cursor pointer, hover: background #666
   - Rank + name: white text, font-size: 20px, font-weight: bold
   - Expanded roster: margin-top: 16px, padding-top: 16px, border-top: 1px solid #777
   - Transition: smooth expand/collapse (max-height or similar)

2. Create src/components/TeamRankingCard/TeamRankingCard.module.css

3. Create src/components/TeamRankingCard/TeamRankingCard.test.tsx:
   - Renders rank and team name
   - Not expanded by default
   - Clicking card calls onToggle
   - When expanded prop is true, roster is visible
   - When expanded prop is false, roster is hidden
   - Roster uses RosterList component
   - Roster shows starters/bench/IR format

4. Create src/components/TeamRankingCard/index.ts

5. Create src/components/RankingsScreen/RankingsScreen.tsx:

   Props interface:
   - rankedTeams: Team[] (ordered from best to worst, rank 1 to N)

   Component structure:
   - Header: "POWER RANKINGS"
   - List of TeamRankingCard components, one per team
   - Track expanded state for each card independently
   - Only one card expanded at a time (optional: allow multiple)

   Styling (create RankingsScreen.module.css):
   - Container: purple background (#7B2CBF), min-height: 100vh, padding: 32px
   - Header: white text, font-size: 32px, font-weight: bold, text-align: center, margin-bottom: 32px
   - Rankings list: max-width: 800px, margin: 0 auto

6. Create src/components/RankingsScreen/RankingsScreen.module.css

7. Create src/components/RankingsScreen/RankingsScreen.test.tsx:
   - Renders all teams in correct order
   - Header displays "POWER RANKINGS"
   - Each card shows correct rank (1, 2, 3...)
   - Clicking card expands it
   - Clicking again collapses it
   - Can expand multiple cards (or only one - test your implementation)
   - Roster displays when expanded

8. Create src/components/RankingsScreen/index.ts

9. Update src/components/ComparisonFlow/ComparisonFlow.tsx:
   - When isComplete, render RankingsScreen instead of completion message
   - Pass finalRanking to RankingsScreen

10. Update ComparisonFlow tests to verify RankingsScreen renders when complete

Ensure all tests pass. Verify smooth expand/collapse animation and correct ranking display.
```

---

## Step 17: App Integration

**Context:** Now we need to create the main App component that loads data, initializes the comparison flow, and manages overall app state.

**Prompt:**
```
Create the main App component that integrates all features and manages application state.

Requirements:

1. Update src/App.tsx:

   Component responsibilities:
   - Load league data on mount (from dataService)
   - Handle loading states
   - Handle error states
   - Render ComparisonFlow when data loaded
   - Purple background throughout

   Implementation:
   - useState for: teams, loading, error
   - useEffect to load data:
     - Call loadLeagueData('dub') on mount
     - Set loading/error states appropriately
     - Validate roster data before setting teams
   - Conditional rendering:
     - Loading: show "Loading league data..."
     - Error: show error message with details
     - Success: render ComparisonFlow with teams

   Styling (create App.module.css):
   - Root container: background purple (#7B2CBF), min-height: 100vh
   - Loading/error messages: white text, centered, padding: 48px
   - Font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

2. Create src/App.module.css

3. Update src/App.test.tsx:
   - Shows loading state initially
   - Shows teams when data loads successfully
   - Shows error message when loading fails
   - Calls loadLeagueData with 'dub'
   - Renders ComparisonFlow with loaded teams
   - Mock loadLeagueData for tests

4. Create src/test-utils.tsx:
   - Helper function: mockLeagueData()
     - Returns mock teams array
     - Creates 12 teams with valid rosters
   - Helper function: setupMockFetch(success: boolean)
     - Mocks global fetch for loadLeagueData
     - Returns success or error response

5. Integration test in src/__tests__/integration/appFlow.test.tsx:
   - Full end-to-end flow:
     - App loads
     - Data loads successfully
     - First comparison appears
     - User makes comparisons (simulate 40 comparisons)
     - Rankings screen appears
     - All 12 teams shown in ranking
   - Use real components (not mocked)
   - Mock only the Excel file fetch

6. Update public/league-data/ folder:
   - Create actual roster_dub.xlsx file with 12 teams
   - Each team has 9 starters, 3-5 bench, 0-2 IR
   - Use realistic player names and NFL teams
   - Ensure data is valid per spec

7. Verify the app runs successfully:
   - npm run dev should start the app
   - Should load league data
   - Should show comparison screen
   - Should complete ranking flow
   - No console errors

Ensure all tests pass and app runs successfully in development mode.
```

---

## Step 18: Styling & Polish

**Context:** Final step to apply the purple/gray theme consistently, refine spacing and alignment, and add final polish.

**Prompt:**
```
Apply final styling, polish, and refinements to complete the application.

Requirements:

1. Create src/styles/theme.css with CSS variables:
   - --color-background: #7B2CBF (purple)
   - --color-card: #666666 (gray)
   - --color-card-dark: #555555 (darker gray)
   - --color-card-hover: #777777 (lighter gray)
   - --color-text: #FFFFFF (white)
   - --color-text-dim: #CCCCCC (dimmed white)
   - --color-accent: #5E17EB (purple accent)
   - --color-accent-hover: #4D12C2 (darker purple)
   - --spacing-xs: 4px
   - --spacing-sm: 8px
   - --spacing-md: 16px
   - --spacing-lg: 24px
   - --spacing-xl: 32px
   - --border-radius: 8px
   - --border-radius-sm: 4px

2. Import theme.css in src/main.tsx or index.tsx

3. Update all component CSS modules to use CSS variables:
   - Replace hardcoded colors with var(--color-name)
   - Replace hardcoded spacing with var(--spacing-size)
   - Replace hardcoded border-radius with var(--border-radius)

4. Refine component spacing and alignment:
   
   ComparisonScreen:
   - Ensure rosters are perfectly aligned (same starting position)
   - Roster slot labels line up horizontally across both panels
   - Consistent padding throughout
   - View toggle buttons: better positioning and spacing

   RosterList & PositionGroupedView:
   - Consistent spacing between sections
   - Section headers: more prominent (consider slight letter-spacing)
   - Player cards: uniform spacing

   RankingsScreen:
   - Better vertical rhythm
   - Card spacing feels balanced
   - Expanded roster: clear visual separation from card

5. Add subtle animations/transitions:
   - Button hover states (already done, verify smooth)
   - Card expansion (smooth max-height or scale transition)
   - Progress bar fill (smooth width transition - already done)
   - Arrow button click (scale down slightly - already done)

6. Accessibility improvements:
   - Verify all buttons have aria-labels
   - Ensure sufficient color contrast (check with tool)
   - Add focus indicators for keyboard navigation
   - Ensure semantic HTML (headings, sections, etc.)

7. Responsive considerations (basic):
   - ComparisonScreen: stack vertically on narrow screens (<768px)
   - Ensure text remains readable
   - Buttons remain clickable
   - Add media query in ComparisonScreen.module.css

8. Polish details:
   - Loading spinner instead of text (optional but nice)
   - Error message styling (red accent, icon)
   - Smooth page transitions
   - Verify no layout shift during renders

9. Create src/__tests__/visual/accessibility.test.tsx:
   - Check color contrast ratios
   - Verify ARIA labels present
   - Check keyboard navigation works
   - Test with tab key navigation

10. Final manual testing checklist in README:
    - [ ] App loads without errors
    - [ ] League data loads correctly
    - [ ] First comparison appears
    - [ ] Arrow buttons work
    - [ ] Keyboard controls work
    - [ ] Progress bar updates
    - [ ] View toggle switches correctly
    - [ ] Both rosters update together
    - [ ] Roster slots align horizontally
    - [ ] Comparisons complete (~40 for 12 teams)
    - [ ] Rankings screen appears
    - [ ] All 12 teams shown in order
    - [ ] Clicking card expands roster
    - [ ] Roster displays correctly
    - [ ] Colors match spec (purple, gray, white)
    - [ ] No console errors
    - [ ] Smooth animations
    - [ ] Responsive on mobile (basic)

11. Update README.md:
    - Add project description
    - Add setup instructions
    - Add development commands
    - Add testing instructions
    - Add specification summary
    - Add known limitations (no progress saving, etc.)

12. Run final verification:
    - npm run test (all tests pass)
    - npm run build (builds successfully)
    - npm run preview (preview works)
    - No TypeScript errors
    - No ESLint warnings

This is the final step. Ensure everything is polished, tested, and ready for use. The application should be fully functional and match the specification exactly.