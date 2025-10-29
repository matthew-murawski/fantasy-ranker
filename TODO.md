Fantasy Football Team Ranker - Implementation Checklist
Project Overview

 Review complete specification document
 Understand all 18 implementation steps
 Set up development environment
 Create project repository


Phase 1: Foundation (Steps 1-5)
Step 1: Project Setup

 Initialize Vite + React + TypeScript project
 Install dependencies:

 xlsx
 @testing-library/react
 @testing-library/jest-dom
 @testing-library/user-event
 vitest


 Create vitest.config.ts
 Configure test environment as 'jsdom'
 Add test scripts to package.json
 Create folder structure:

 src/components/
 src/services/
 src/types/
 src/utils/
 src/tests/


 Create basic App.tsx with heading
 Create App.test.tsx
 Run npm run dev - verify app loads
 Run npm run test - verify tests pass

Step 2: Data Models

 Create src/types/index.ts
 Define Player interface:

 playerName: string
 position: string
 nflTeam: string
 rosterSlot: string
 injuryStatus: string
 isIR: boolean


 Define Team interface:

 teamName: string
 players: Player[]
 starters: Player[]
 bench: Player[]
 ir: Player[]


 Define Roster interface
 Define ComparisonPair interface
 Create utility functions:

 isStarter(player: Player): boolean
 isBench(player: Player): boolean
 isIR(player: Player): boolean


 Create src/tests/types.test.ts
 Write tests for all utility functions
 Verify all types export correctly
 Run tests - all pass

Step 3: Excel Parser

 Create src/services/excelParser.ts
 Implement parseRosterFile function:

 Accept File or ArrayBuffer
 Use xlsx library to read file
 Map columns A-F to data fields
 Group players by team name
 Create Player objects with isIR computed
 Return Team[] array


 Handle edge cases:

 Empty cells
 Missing data
 Invalid roster slots
 Duplicate team names (throw error)


 Create src/tests/excelParser.test.ts
 Create mock Excel buffer using xlsx.utils
 Write tests:

 Parse valid file with 2 teams
 Correctly group players by team
 Correctly identify IR players
 Separate starters, bench, IR
 Handle empty cells
 Throw error for invalid data


 Run tests - all pass

Step 4: Data Service

 Create src/services/dataService.ts
 Implement loadLeagueData function:

 Fetch Excel file from public/league-data/
 Use parseRosterFile
 Return parsed teams
 Throw descriptive error on failure


 Implement getTeamByName function
 Implement validateRosterData function:

 Check each team has ≥1 starter
 Check exactly 9 starters per team
 Check valid roster slots
 Return true or throw error


 Create src/tests/dataService.test.ts
 Mock global fetch
 Write tests:

 Load league data successfully
 Handle file not found
 Find team by name
 Validate correct roster structure
 Catch invalid roster structures


 Run tests - all pass

Step 5: Comparison Algorithm

 Create src/services/comparisonAlgorithm.ts
 Create ComparisonEngine class
 Implement constructor:

 Accept teams: Team[]
 Initialize internal state


 Implement properties:

 teams: Team[]
 comparisons: Map<string, number>
 comparisonQueue: ComparisonPair[]
 isComplete: boolean


 Implement methods:

 getNextComparison(): ComparisonPair | null
 recordComparison(winner, loser): void
 needsTieBreaker(): ComparisonPair | null
 getFinalRanking(): Team[]
 getProgress(): { completed, estimated }


 Implement quicksort comparison logic
 Optimize for O(n log n) comparisons
 Create src/tests/comparisonAlgorithm.test.ts
 Write tests:

 Initialize with teams
 Get first comparison
 Record comparisons and get next
 Complete full ranking (12 teams)
 Detect tie-breaker scenarios
 Calculate progress accurately
 Handle edge cases (2, 3 teams)


 Verify ~35-40 comparisons for 12 teams
 Run tests - all pass

Phase 1 Checkpoint:

 All foundation tests pass
 TypeScript compiles with no errors
 Data layer complete and tested
 Algorithm tested and optimized


Phase 2: Core UI Components (Steps 6-10)
Step 6: PlayerCard Component

 Create src/components/PlayerCard/ folder
 Create PlayerCard.tsx
 Define props interface:

 player: Player
 displayFormat: 'starter' | 'bench' | 'position-group'
 showPosition: boolean


 Implement display logic:

 'starter' format: "POS | Name (NFL)"
 'bench'/'position-group' format: "POS Name (NFL)"


 Create PlayerCard.module.css:

 Gray background
 White text
 Padding, border-radius
 Starter format uses flexbox


 Create PlayerCard.test.tsx
 Write tests:

 Render player name correctly
 Render NFL team correctly
 Starter format shows "|" separator
 Bench format no "|" separator
 Toggle position visibility
 Correct styling applied


 Create index.ts export
 Run tests - all pass

Step 7: RosterList Component

 Create src/components/RosterList/ folder
 Create RosterList.tsx
 Define props interface:

 team: Team
 showStarters: boolean
 showBench: boolean
 showIR: boolean


 Implement sections:

 STARTERS section
 BENCH section
 IR section


 Implement sortStarters utility:

 QB, RB, RB, WR, WR, TE, FLEX, D/ST, K order


 Implement groupByPosition utility:

 Group by QB, RB, WR, TE, D/ST, K


 Display FLEX as "FLEX" not "RB/WR/TE"
 Create RosterList.module.css:

 Section headers styling
 Section spacing
 Empty sections hidden


 Create RosterList.test.tsx
 Create test fixture with complete team
 Write tests:

 All sections render with headers
 Starters in correct order
 Bench grouped by position
 IR players in IR section
 Empty sections don't render
 FLEX displays correctly
 PlayerCard receives correct format


 Create index.ts export
 Run tests - all pass

Step 8: PositionGroupedView Component

 Create src/components/PositionGroupedView/ folder
 Create PositionGroupedView.tsx
 Define props interface:

 team: Team


 Implement position sections:

 QUARTERBACKS
 RUNNING BACKS
 WIDE RECEIVERS
 TIGHT ENDS
 D/ST
 KICKERS


 Implement getPositionHeader utility
 Implement getAllPlayersByPosition utility
 Add IR indicator: "(IR)" after NFL team
 Update PlayerCard component:

 Add showIRIndicator prop
 Append " (IR)" when true and isIR


 Create PositionGroupedView.module.css
 Create PositionGroupedView.test.tsx
 Write tests:

 All positions render with headers
 Players grouped by position
 IR players show (IR) indicator
 Starters and bench together
 Empty positions don't render
 PlayerCard receives showIRIndicator


 Update PlayerCard.test.tsx for IR indicator
 Create index.ts export
 Run tests - all pass

Step 9: RosterPanel Component

 Create src/components/RosterPanel/ folder
 Create RosterPanel.tsx
 Define props interface:

 team: Team
 viewMode: 'starters' | 'position'
 onViewModeChange: function
 showViewToggle: boolean


 Implement view toggle buttons:

 "Starters/Bench" button
 "By Position" button
 Active button different styling
 Inactive button greyed out


 Conditional rendering:

 RosterList when viewMode='starters'
 PositionGroupedView when viewMode='position'


 Create RosterPanel.module.css:

 Toggle button styling
 Active/inactive states
 Hover effects


 Create RosterPanel.test.tsx
 Write tests:

 Renders RosterList in 'starters' mode
 Renders PositionGroupedView in 'position' mode
 Toggle buttons render correctly
 Active button has correct styling
 Clicking inactive calls onViewModeChange
 Active button doesn't call onChange
 Toggle can be hidden
 Correct props passed to children


 Create index.ts export
 Run tests - all pass

Step 10: Roster Display Testing

 Create src/tests/integration/ folder
 Create rosterDisplay.test.tsx
 Write integration tests:

 Full roster display flow
 Switch between view modes
 Verify all sections display correctly
 Verify position grouping works
 Test edge cases (no bench, no IR, etc.)


 Create src/tests/fixtures/ folder
 Create teams.ts with fixtures:

 createMockTeam helper function
 FULL_ROSTER_TEAM fixture
 MINIMAL_TEAM fixture
 IR_HEAVY_TEAM fixture


 Create fixtures/index.ts export
 Test scenarios:

 All starters display in correct order
 Bench grouped by position
 IR section shows correctly
 View toggle functionality
 Position view grouping correct
 FLEX displays as "FLEX"
 Teams with no bench/IR


 Run all tests - all pass
 No console errors or warnings
 TypeScript compiles cleanly

Phase 2 Checkpoint:

 All roster display components complete
 All unit tests pass
 All integration tests pass
 Components properly styled
 No TypeScript errors


Phase 3: Comparison Interface (Steps 11-15)
Step 11: ComparisonScreen Layout

 Create src/components/ComparisonScreen/ folder
 Create ComparisonScreen.tsx
 Define props interface:

 teamA: Team
 teamB: Team
 onSelectWinner: function
 progress: { completed, estimated }
 viewMode: 'starters' | 'position'
 onViewModeChange: function


 Implement layout:

 View toggle buttons (top-left)
 Two-column roster display
 Selection area with instructions
 Arrow button placeholders
 Progress placeholder


 Create ComparisonScreen.module.css:

 Purple background
 Two-column flexbox layout
 24px spacing between panels
 Each panel ~47% width
 Selection area centered
 Instruction text styling


 Add placeholder buttons (no onClick yet)
 Add progress placeholder text
 Create ComparisonScreen.test.tsx
 Write tests:

 Both rosters render
 View toggle controls both rosters
 Both RosterPanels same viewMode
 Changing view updates both
 Instruction text displays
 Progress info displays
 Side-by-side layout
 Purple background applied


 Create index.ts export
 Run tests - all pass

Step 12: Selection Buttons

 Create src/components/ArrowButton/ folder
 Create ArrowButton.tsx
 Define props interface:

 direction: 'left' | 'right'
 onClick: function
 disabled?: boolean


 Implement arrow rendering:

 Left arrow: ← (\u2190)
 Right arrow: → (\u2192)
 Accessible aria-label


 Create ArrowButton.module.css:

 80px × 80px button
 Purple background
 White arrow
 Large font (48px)
 Border-radius: 8px
 Hover effect
 Active scale down
 Disabled opacity


 Create ArrowButton.test.tsx
 Write tests:

 Renders left arrow
 Renders right arrow
 Calls onClick when clicked
 Doesn't call onClick when disabled
 Has proper aria-label
 Disabled styling applied


 Create index.ts export
 Update ComparisonScreen.tsx:

 Import ArrowButton
 Replace placeholder buttons
 Wire up onClick handlers
 Left arrow → onSelectWinner(teamA)
 Right arrow → onSelectWinner(teamB)
 Center buttons with flexbox


 Update ComparisonScreen.module.css:

 Button container styling
 Center alignment
 Gap between buttons


 Update ComparisonScreen.test.tsx:

 Test left arrow calls onSelectWinner(teamA)
 Test right arrow calls onSelectWinner(teamB)
 Verify correct Team object passed


 Run tests - all pass

Step 13: Keyboard Controls

 Update ComparisonScreen.tsx
 Add useEffect for keyboard listeners:

 Listen for 'keydown' events
 ArrowLeft → onSelectWinner(teamA)
 ArrowRight → onSelectWinner(teamB)
 event.key === 'ArrowLeft'
 event.key === 'ArrowRight'


 Prevent default behavior (no scrolling)
 Add listener to document
 Clean up listener on unmount
 Update ComparisonScreen.test.tsx
 Write tests:

 ArrowLeft key calls onSelectWinner(teamA)
 ArrowRight key calls onSelectWinner(teamB)
 Cleanup removes listener on unmount
 preventDefault called for arrow keys


 Test multiple rapid keypresses
 Verify buttons still keyboard accessible (Tab + Enter)
 Run tests - all pass

Step 14: Progress Bar

 Create src/components/ProgressBar/ folder
 Create ProgressBar.tsx
 Define props interface:

 completed: number
 total: number


 Implement progress bar:

 Calculate percentage: (completed / total) * 100
 Visual bar (no text)
 Filled bar proportional to percentage


 Create ProgressBar.module.css:

 Container: 100% width, 8px height
 Background: #444
 Filled bar: purple (#5E17EB)
 Border-radius: 4px
 Smooth transition: 0.3s ease
 Width set via inline style


 Create ProgressBar.test.tsx
 Write tests:

 Renders with 0% initially
 Updates width when completed changes
 Shows 50% when completed=5, total=10
 Shows 100% when completed=total
 Caps at 100% if completed > total
 Handles total=0 (shows 0%)
 Correct CSS classes applied


 Create index.ts export
 Update ComparisonScreen.tsx:

 Remove placeholder progress text
 Import ProgressBar
 Render ProgressBar at bottom
 Pass completed and estimated props
 Position: fixed or absolute at bottom
 Full width with padding


 Update ComparisonScreen.module.css:

 Progress bar container positioning


 Update ComparisonScreen.test.tsx:

 ProgressBar renders with correct props
 Progress updates when prop changes


 Run tests - all pass

Step 15: Wire Comparison Logic

 Create src/hooks/ folder
 Create useComparison.ts
 Define hook signature:

 Input: teams: Team[]
 Returns: { currentComparison, progress, isComplete, selectWinner, finalRanking }


 Implement hook:

 Create ComparisonEngine instance
 Store in useState or useRef
 Track currentComparison
 Implement selectWinner function
 Record comparison in engine
 Check for tie-breaker
 Get next comparison
 Update isComplete when done
 Get finalRanking when complete


 Create useComparison.test.ts
 Write tests:

 Hook initializes with first comparison
 Selecting winner gets next comparison
 Progress updates after selection
 isComplete becomes true after enough comparisons
 finalRanking available when complete
 Handles tie-breaker scenarios
 Works with different team counts (2, 3, 12)


 Update ComparisonScreen.tsx:

 Simplify props
 Accept comparison: ComparisonPair
 Remove teamA/teamB props
 Remove viewMode from props
 Manage viewMode internally with useState
 Display comparison.teamA and comparison.teamB


 Update ComparisonScreen.test.tsx:

 Update tests for new props


 Create src/components/ComparisonFlow/ folder
 Create ComparisonFlow.tsx:

 Use useComparison hook
 Render ComparisonScreen when not complete
 Show completion message when isComplete
 Pass comparison, progress, selectWinner


 Create ComparisonFlow.test.tsx:

 Full flow test with comparisons
 Verify screen transitions
 Verify completion message


 Create index.ts export
 Run tests - all pass

Phase 3 Checkpoint:

 Comparison interface complete
 All interactions work (buttons, keyboard)
 Progress bar updates correctly
 Full comparison flow tested
 No TypeScript errors


Phase 4: Rankings & Integration (Steps 16-18)
Step 16: Rankings Screen

 Create src/components/TeamRankingCard/ folder
 Create TeamRankingCard.tsx
 Define props interface:

 team: Team
 rank: number
 isExpanded: boolean
 onToggle: function


 Implement card:

 Display rank and team name
 Clickable to toggle expansion
 Show roster when expanded
 Use RosterList (starters/bench/IR format)


 Create TeamRankingCard.module.css:

 Gray background (#555)
 White text
 Padding, border-radius
 Hover effect
 Expanded roster styling
 Smooth expand/collapse transition


 Create TeamRankingCard.test.tsx
 Write tests:

 Renders rank and team name
 Not expanded by default
 Clicking calls onToggle
 Roster visible when expanded
 Roster hidden when not expanded
 Uses RosterList component
 Shows starters/bench/IR format


 Create index.ts export
 Create src/components/RankingsScreen/ folder
 Create RankingsScreen.tsx
 Define props interface:

 rankedTeams: Team[]


 Implement screen:

 Header: "POWER RANKINGS"
 List of TeamRankingCard components
 Track expanded state per card
 Manage expansion (single or multiple)


 Create RankingsScreen.module.css:

 Purple background
 Min-height: 100vh
 Header styling (large, bold, centered)
 Rankings list: max-width 800px, centered


 Create RankingsScreen.test.tsx
 Write tests:

 Renders all teams in order
 Header shows "POWER RANKINGS"
 Each card shows correct rank
 Clicking card expands it
 Clicking again collapses it
 Can expand multiple cards
 Roster displays when expanded


 Create index.ts export
 Update ComparisonFlow.tsx:

 When isComplete, render RankingsScreen
 Pass finalRanking to RankingsScreen


 Update ComparisonFlow.test.tsx:

 Verify RankingsScreen renders when complete


 Run tests - all pass

Step 17: App Integration

 Create src/test-utils.tsx:

 mockLeagueData() helper
 Returns 12 mock teams with valid rosters
 setupMockFetch() helper
 Mocks global fetch for tests


 Update src/App.tsx:

 Add useState: teams, loading, error
 Add useEffect to load data on mount
 Call loadLeagueData('dub')
 Handle loading state
 Handle error state
 Validate roster data before setting teams
 Render ComparisonFlow when data loaded


 Create App.module.css:

 Purple background
 Min-height: 100vh
 Loading/error message styling
 Centered, white text
 Font-family: system fonts


 Update App.test.tsx:

 Shows loading state initially
 Shows teams when data loads
 Shows error on loading failure
 Calls loadLeagueData with 'dub'
 Renders ComparisonFlow with teams
 Mock loadLeagueData function


 Create src/tests/integration/appFlow.test.tsx:

 Full end-to-end flow test
 App loads
 Data loads successfully
 First comparison appears
 Simulate 40 comparisons
 Rankings screen appears
 All 12 teams in ranking
 Use real components (not mocked)
 Mock only Excel file fetch


 Create public/league-data/ folder
 Create roster_dub.xlsx file:

 12 teams total
 Each team: 9 starters, 3-5 bench, 0-2 IR
 Realistic player names
 Valid NFL teams
 Valid data per spec
 Columns: Team Name, Player Name, Position, NFL Team, Roster Slot, Injury Status


 Test app manually:

 Run npm run dev
 Verify league data loads
 Verify comparison screen appears
 Make several comparisons
 Verify progress bar updates
 Complete full ranking flow
 Verify rankings screen appears
 Check no console errors


 Run all tests - all pass

Step 18: Styling & Polish

 Create src/styles/theme.css
 Define CSS variables:

 --color-background: #7B2CBF
 --color-card: #666666
 --color-card-dark: #555555
 --color-card-hover: #777777
 --color-text: #FFFFFF
 --color-text-dim: #CCCCCC
 --color-accent: #5E17EB
 --color-accent-hover: #4D12C2
 --spacing-xs: 4px
 --spacing-sm: 8px
 --spacing-md: 16px
 --spacing-lg: 24px
 --spacing-xl: 32px
 --border-radius: 8px
 --border-radius-sm: 4px


 Import theme.css in main.tsx
 Update all component CSS modules:

 Replace hardcoded colors with CSS variables
 Replace hardcoded spacing with CSS variables
 Replace hardcoded border-radius with CSS variables


 Refine ComparisonScreen:

 Ensure rosters perfectly aligned
 Roster slots line up horizontally
 Consistent padding throughout
 View toggle positioning and spacing


 Refine RosterList & PositionGroupedView:

 Consistent spacing between sections
 Prominent section headers
 Uniform player card spacing


 Refine RankingsScreen:

 Balanced vertical rhythm
 Appropriate card spacing
 Clear visual separation when expanded


 Verify animations/transitions:

 Button hover states smooth
 Card expansion smooth
 Progress bar fill smooth
 Arrow button click scale


 Accessibility improvements:

 All buttons have aria-labels
 Check color contrast (use tool)
 Add focus indicators
 Ensure semantic HTML


 Add responsive design (basic):

 ComparisonScreen stacks on <768px
 Text remains readable
 Buttons remain clickable
 Add media query in ComparisonScreen.module.css


 Polish details:

 Loading spinner (optional)
 Error message styling (red, icon)
 Smooth page transitions
 No layout shift during renders


 Create src/tests/visual/accessibility.test.tsx:

 Check color contrast ratios
 Verify ARIA labels present
 Check keyboard navigation
 Test tab key navigation


 Create README.md:

 Project description
 Setup instructions
 Development commands
 Testing instructions
 Specification summary
 Known limitations


 Final manual testing checklist:

 App loads without errors
 League data loads correctly
 First comparison appears
 Arrow buttons work
 Keyboard controls work (left/right arrows)
 Progress bar updates
 View toggle switches correctly
 Both rosters update together
 Roster slots align horizontally
 Comparisons complete (~40 for 12 teams)
 Rankings screen appears
 All 12 teams shown in order
 Clicking card expands roster
 Roster displays correctly (starters/bench/IR)
 Colors match spec (purple, gray, white)
 No console errors
 Smooth animations
 Responsive on mobile (basic)


 Run final verification:

 npm run test (all tests pass)
 npm run build (builds successfully)
 npm run preview (preview works)
 No TypeScript errors
 No ESLint warnings



Phase 4 Checkpoint:

 Rankings screen complete
 Full app integration complete
 All styling and polish applied
 All tests pass
 App builds successfully
 Manual testing complete


Final Deliverables
Code Quality

 All TypeScript types defined correctly
 No any types used
 All components properly typed
 All functions have return types
 ESLint passes with no warnings
 Code formatted consistently
 No console.log statements (except intentional)
 No commented-out code

Testing

 All unit tests pass
 All integration tests pass
 Test coverage >80% (optional goal)
 No failing tests
 No skipped tests (unless documented)

Documentation

 README.md complete
 Setup instructions clear
 Development workflow documented
 Known limitations documented
 Comments in complex code sections
 Type definitions self-documenting

Performance

 App loads quickly (<2 seconds)
 No unnecessary re-renders
 Excel parsing efficient
 Comparison algorithm optimized
 Smooth animations (60fps)
 No memory leaks

User Experience

 Intuitive navigation
 Clear instructions
 Immediate feedback on interactions
 Error messages helpful
 Loading states informative
 Keyboard shortcuts work
 Mobile responsive (basic)

Deployment Ready

 Production build works
 No development warnings
 Environment variables configured (if needed)
 Build size reasonable
 Assets optimized
 Ready for hosting


Notes
Key Dependencies:

React 18+
TypeScript 5+
Vite
xlsx
Vitest
React Testing Library

Browser Support:

Chrome (latest)
Firefox (latest)
Safari (latest)
Edge (latest)

Project Status:

 Not Started
 In Progress
 Complete

Last Updated: [Date]