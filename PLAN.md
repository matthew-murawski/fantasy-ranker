I need to replace the quicksort comparison algorithm in my fantasy football ranker with a Swiss System tournament approach that operates entirely in the backend. The user experience should remain unchanged—they just see two teams and pick one.

CONTEXT:
- Current app uses React + TypeScript with a quicksort-based comparison engine
- Existing comparison screen shows two teams side-by-side and lets users pick a winner
- We're keeping the UI exactly as is—no round indicators, no record displays
- Goal: reduce comparisons while keeping UX identical

CRITICAL CONSTRAINTS:
- Do NOT display rounds, matchup numbers, or records anywhere in the UI
- Do NOT hardcode team counts—support variable league sizes (8, 10, 12, 14 teams)
- Progress bar should only show "Comparison X of ~Y" (no round information)
- User should not know Swiss System is happening—it's purely backend

WHAT TO BUILD:

1. Create new TypeScript interfaces in a new file `src/types/swiss.ts`:
```typescript
export interface TeamRecord {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  opponentsPlayed: string[]; // teamIds of opponents faced
}

export interface Matchup {
  round: number; // internal only, never displayed
  team1Id: string;
  team2Id: string;
}

export interface ComparisonResult {
  winnerId: string;
  loserId: string;
  round: number; // internal tracking only
}

export interface SwissSystemState {
  totalTeams: number;
  totalRounds: number; // calculated: ceil(log2(totalTeams))
  currentRound: number; // internal only
  currentMatchupIndex: number; // internal only
  matchupsThisRound: Matchup[];
  teamRecords: Map<string, TeamRecord>;
  completedMatchups: ComparisonResult[];
  tiebreakerQueue: Matchup[];
  phase: 'swiss' | 'tiebreaker' | 'complete';
}
```

2. Create a new file `src/engine/swissPairing.ts` with a function to generate first round pairings:
```typescript
export function generateFirstRoundPairings(teams: Team[]): Matchup[] {
  // Pair teams sequentially: 1v2, 3v4, 5v6, etc.
  // Number of matchups = teams.length / 2
  // All matchups have round=1
  // Return array of Matchup objects
}
```

3. Create a new file `src/engine/swissEngine.ts` that:
   - Calculates number of Swiss rounds: `Math.ceil(Math.log2(teams.length))`
     * 8 teams → 3 rounds
     * 10 teams → 4 rounds (since ceil(log2(10)) = 4)
     * 12 teams → 4 rounds (since ceil(log2(12)) = 4)
     * 14 teams → 4 rounds
   - Initializes SwissSystemState when comparison phase starts
   - Creates initial TeamRecord entries for all teams (all starting at 0-0)
   - Generates first round matchups using generateFirstRoundPairings
   - Exports a function `initializeSwissSystem(teams: Team[]): SwissSystemState`

4. Update the existing comparison engine/state file to:
   - Import and use SwissSystemState
   - Replace quicksort initialization with initializeSwissSystem
   - Update the comparison handler to:
     * Record wins/losses in teamRecords when a comparison is made
     * Add opponent IDs to opponentsPlayed arrays
     * Store ComparisonResult in completedMatchups
     * Advance to next matchup in matchupsThisRound
   - For now, just handle first round (we'll add subsequent rounds in next prompt)

5. Update progress calculation:
   - Calculate estimated total comparisons:
     * Swiss rounds: `(teams.length / 2) * totalRounds`
     * Estimated tiebreakers: `Math.floor(teams.length * 0.15)` (rough estimate)
     * Total estimate: swiss + tiebreakers
   - Display only: "Comparison X of ~Y" (use ~ to indicate estimate)
   - Do NOT display round numbers or matchup numbers to user

6. Internal state tracking (not displayed):
   - Track currentRound and currentMatchupIndex internally
   - When all matchups in current round complete, prepare next round
   - Never expose this information to the UI

REQUIREMENTS:
- Support any even number of teams (8, 10, 12, 14, etc.)
- Calculate rounds dynamically based on team count
- Preserve all existing UI components exactly as they are
- No changes to comparison screen visual layout
- After first round completes, app should prepare next round (we'll implement that next)
- Add validation: ensure even number of teams (if odd, show error)

TESTING:
- Test with 8 teams: verify 3 rounds calculated, first round has 4 matchups
- Test with 10 teams: verify 4 rounds calculated, first round has 5 matchups
- Test with 12 teams: verify 4 rounds calculated, first round has 6 matchups
- Verify progress shows "Comparison 1 of ~X" where X is appropriate estimate
- Verify teamRecords update correctly after comparisons
- Verify UI looks identical to old quicksort version

DO NOT implement subsequent round pairing yet—just get first round working with dynamic team counts.
```

---

## Prompt 2: Dynamic Round Pairing and Seamless Transitions
```
Building on the Swiss System foundation, now implement the pairing logic for all subsequent rounds with seamless transitions that are invisible to the user.

CONTEXT:
- First round pairing is working (sequential pairing)
- TeamRecords are being updated correctly
- SwissSystemState tracks rounds internally
- System dynamically calculates round count based on team count
- User sees no round information—just continuous comparisons

CRITICAL CONSTRAINTS:
- Do NOT show round transitions to user
- Do NOT display "Round X complete" or similar messages
- Simply continue to next comparison seamlessly
- User should experience one continuous flow of comparisons
- Support variable team counts (8, 10, 12, 14, etc.)

WHAT TO BUILD:

1. In `src/engine/swissPairing.ts`, add a function to generate subsequent round pairings:
```typescript
export function generateSwissPairings(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  round: number,
  completedMatchups: ComparisonResult[]
): Matchup[] {
  // Algorithm:
  // 1. Group teams by current record (e.g., "1-0", "0-1", "2-1", etc.)
  // 2. Sort groups by record (better records first)
  // 3. Within each group, pair teams that haven't faced each other yet
  // 4. If odd number in a group, carry one team to next group
  // 5. Avoid rematches—check completedMatchups
  // 6. Return array of matchups (count = teams.length / 2)
  // 7. Handle any team count (not hardcoded to 12)
}
```

Helper functions:
```typescript
function groupTeamsByRecord(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>
): Map<string, Team[]> {
  // Group teams by "W-L" record string
  // Works for any number of rounds/records
}

function haveTeamsPlayed(
  team1Id: string,
  team2Id: string,
  completedMatchups: ComparisonResult[]
): boolean {
  // Check if these two teams have already faced each other
}

function pairWithinGroup(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): { paired: Matchup[], unpaired: Team | null } {
  // Pair teams within a record group, avoiding rematches
  // Handle any group size dynamically
}
```

2. In `src/engine/swissEngine.ts`, add a function to advance to the next round:
```typescript
export function advanceToNextRound(
  currentState: SwissSystemState,
  teams: Team[]
): SwissSystemState {
  // Called when all matchups in current round are complete
  // If currentRound < totalRounds:
  //   - Generate matchups for next round using generateSwissPairings
  //   - Increment currentRound
  //   - Reset currentMatchupIndex to 0
  //   - Return updated state with new matchupsThisRound
  // If currentRound === totalRounds:
  //   - Move to tiebreaker phase (we'll implement next)
  //   - Return state indicating Swiss rounds complete
}
```

3. Update the comparison handler in the comparison engine:
   - After each comparison, check if currentMatchupIndex has reached end of matchupsThisRound
   - If so, and currentRound < totalRounds:
     * Call advanceToNextRound
     * IMMEDIATELY load the first matchup of the new round
     * NO transition message, NO delay, NO user notification
   - User should see next comparison appear instantly
   - Progress bar simply updates: "Comparison X of ~Y"

4. Internal logging (development only, not shown to user):
   - Log to console when rounds transition: "Round 2 starting" (dev mode only)
   - Log any pairing conflicts or rematch situations
   - This helps with debugging but is never visible in production UI

5. Handle completion of Swiss rounds:
   - When currentRound reaches totalRounds and all matchups complete:
     * Do NOT show "Swiss complete" message
     * Internally transition to tiebreaker phase
     * We'll implement tiebreakers in next prompt
     * For now, just set phase = 'tiebreaker' and pause

REQUIREMENTS:
- All round transitions are seamless and invisible to user
- No messages, overlays, or delays between rounds
- Support any number of teams (calculate matchups per round dynamically)
- Never create rematches unless absolutely unavoidable
- Preserve continuous comparison flow
- Progress bar is the only thing that changes (shows completion progress)

TESTING:
- Test with 8 teams (3 rounds, 12 total Swiss comparisons):
  * Verify all 12 comparisons flow continuously
  * Check that round 2 and 3 pair teams by record
  * Verify no rematches occur
  * User sees no indication of rounds changing
  
- Test with 10 teams (4 rounds, 20 total Swiss comparisons):
  * Verify all 20 comparisons flow continuously
  * Check proper record-based pairing in rounds 2-4
  * Verify no rematches occur

- Test with 12 teams (4 rounds, 24 total Swiss comparisons):
  * Same verifications as above

- Verify progress bar updates smoothly throughout
- Check console logs (dev mode) confirm round transitions happening correctly
- Ensure no UI changes visible to user during round transitions

EDGE CASES:
- If pairing algorithm cannot avoid a rematch (rare): allow it and log warning
- Handle odd-sized record groups by carrying team to next group
- If only one team in a record group, pair with closest record available
```

---

## Prompt 3: Tiebreaker System (Invisible to User)
```
Implement the complete tiebreaker system that runs seamlessly after Swiss rounds complete. Tiebreakers should be invisible to the user—they just see more comparisons until ranking is complete.

CONTEXT:
- All Swiss rounds complete automatically with seamless transitions
- TeamRecords contain final win-loss records and opponents played
- After Swiss rounds, we need to resolve ties among teams with identical records
- User should not know they've entered "tiebreaker phase"—just more comparisons
- Support any number of teams dynamically

CRITICAL CONSTRAINTS:
- Do NOT display "tiebreaker phase" or "resolving ties" to user
- Do NOT show team records during tiebreaker comparisons
- User just sees continuous comparisons until completion
- Progress bar continues showing "Comparison X of ~Y"
- Tiebreakers use same UI as Swiss comparisons

WHAT TO BUILD:

1. In `src/engine/tiebreakers.ts`, create the tiebreaker system:
```typescript
export interface TiebreakerResult {
  sortedTeams: Team[]; // Teams within a record group, sorted by tiebreakers
  additionalComparisonsNeeded: Matchup[]; // Comparisons user needs to make
}

export function resolveTiesForRecordGroup(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): TiebreakerResult {
  // If only 1 team in group, no tiebreaking needed
  // Otherwise, apply tiebreakers in order:
  // 1. Head-to-head results (if teams played each other during Swiss)
  // 2. Strength of schedule (opponent win percentage)
  // 3. Queue additional comparison if still tied (within 0.01 SOS difference)
  // Works for any number of teams in the group
}
```

Helper functions:
```typescript
function getHeadToHeadWinner(
  team1: Team,
  team2: Team,
  completedMatchups: ComparisonResult[]
): string | null {
  // Check if these teams played each other in Swiss rounds
  // Return winnerId if they did, null if they didn't
}

function calculateStrengthOfSchedule(
  team: Team,
  teamRecord: TeamRecord,
  allTeamRecords: Map<string, TeamRecord>
): number {
  // Calculate opponent win percentage
  // Sum all opponents' wins / sum all opponents' total games
  // Return decimal value (e.g., 0.667 for 66.7% opponent win rate)
}

function sortByTiebreakers(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): { sorted: Team[], needingComparison: Team[][] } {
  // Try to sort teams using head-to-head and SOS
  // Return teams we can definitively rank and pairs still needing comparison
  // Handle any number of teams dynamically
}
```

2. In `src/engine/swissEngine.ts`, add a function to enter tiebreaker phase:
```typescript
export function enterTiebreakerPhase(
  currentState: SwissSystemState,
  teams: Team[]
): SwissSystemState {
  // Called after all Swiss rounds complete
  // 1. Group teams by final record dynamically (works for any record distribution)
  // 2. For each record group with 2+ teams, call resolveTiesForRecordGroup
  // 3. Collect all additionalComparisonsNeeded into tiebreakerQueue
  // 4. Update state:
  //    - phase = 'tiebreaker'
  //    - matchupsThisRound = tiebreakerQueue
  //    - currentMatchupIndex = 0
  // 5. If tiebreakerQueue is empty, phase = 'complete'
  // 6. Update total comparison estimate (now exact)
}
```

3. Update the comparison handler:
   - After Swiss rounds complete, call enterTiebreakerPhase
   - If tiebreakerQueue is empty:
     * Immediately move to rankings screen (phase = 'complete')
     * No message to user
   - If tiebreakerQueue has matchups:
     * Present them one at a time using same comparison UI
     * User sees no indication this is different from Swiss rounds
     * Progress bar shows: "Comparison X of Y" (exact count now known)
   - After all tiebreaker comparisons complete:
     * Immediately move to rankings screen
     * No "complete" message

4. Create `src/engine/finalRankings.ts`:
```typescript
export function generateFinalRankings(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): Team[] {
  // 1. Group teams by final record (dynamic for any record distribution)
  // 2. Sort groups by record (best to worst)
  // 3. Within each group, apply tiebreakers using resolveTiesForRecordGroup
  // 4. Concatenate all sorted groups into final ranking
  // 5. Return ordered array of teams (length = teams.length)
  // 6. Works for any number of teams (8, 10, 12, 14, etc.)
}
```

5. Update progress tracking:
   - During Swiss rounds: show estimate based on calculation
   - During tiebreaker phase: show exact count (no estimate needed)
   - Progress bar updates smoothly throughout
   - User never sees phase change

6. Wire to rankings screen:
   - When phase = 'complete', call generateFinalRankings
   - Pass ranked teams to existing rankings display component
   - Rankings screen shows teams in order (no record display unless you want it)
   - User experience: comparisons end, rankings appear

REQUIREMENTS:
- Head-to-head tiebreaker takes priority over strength of schedule
- Strength of schedule only compares teams that didn't play each other
- Additional comparisons queued only when necessary (SOS within 0.01)
- Tiebreaker comparisons use identical UI to Swiss comparisons
- No user-facing indication that tiebreaker phase is different
- Final ranking is complete ordered list (no ties)
- Support any number of teams dynamically

TESTING:
- Test with 8 teams: verify tiebreakers work correctly
  * Scenario: all unique records (no tiebreakers needed)
  * Scenario: multiple teams tied (tiebreakers applied)
  
- Test with 10 teams: same scenarios
- Test with 12 teams: same scenarios

- Verify head-to-head checked before SOS
- Verify SOS calculated correctly (opponent win percentages)
- Verify additional comparisons only queued when needed
- Check that user sees continuous comparison flow (no phase indication)
- Verify final rankings are correct and complete
- Check progress bar shows smooth progression throughout

EDGE CASES:
- Three or more teams tied: break pairwise systematically
- Equal SOS within 0.01: queue comparison
- All teams in a record group have equal SOS: queue comparisons to sort them
- Handle any record distribution dynamically (not hardcoded)
```

---

## Prompt 4: Integration, Cleanup, and Dynamic Validation
```
Final step: complete integration, remove old quicksort code, ensure dynamic team count support, and test thoroughly.

CONTEXT:
- Swiss pairing logic (all rounds) is implemented dynamically
- Tiebreaker system is implemented
- Final rankings generation is implemented
- Everything operates seamlessly in the background
- User sees continuous comparison flow with no round/phase indicators

CRITICAL CONSTRAINTS:
- Do NOT add any UX elements related to Swiss System
- UI must remain identical to original quicksort version
- Support any even number of teams (8, 10, 12, 14, 16, etc.)
- No hardcoded values for team counts or comparison counts
- All Swiss logic is internal/invisible

WHAT TO BUILD:

1. Remove old quicksort code:
   - Delete or comment out the old quicksort comparison engine
   - Remove partition logic, pivot selection, and recursive sorting functions
   - Keep comparison result caching (used for rematch detection and head-to-head)
   - Ensure no references to old quicksort functions remain

2. Complete integration in the comparison screen component:
   - Ensure comparison screen calls Swiss engine initialization on mount
   - Wire all comparison button clicks to Swiss engine's comparison handler
   - Ensure keyboard controls (left/right arrows) work with Swiss engine
   - Verify UI looks identical to before (no new UI elements)
   - Progress bar only shows: "Comparison X of ~Y" or "Comparison X of Y"

3. Dynamic team count support:
   - Verify system works with 8 teams (3 rounds, ~12-15 comparisons)
   - Verify system works with 10 teams (4 rounds, ~20-24 comparisons)
   - Verify system works with 12 teams (4 rounds, ~24-28 comparisons)
   - Verify system works with 14 teams (4 rounds, ~28-32 comparisons)
   - All calculations based on team count, no hardcoded values

4. Progress estimation accuracy:
   - Swiss comparisons: `(teamCount / 2) * rounds`
   - Tiebreaker estimate: `Math.floor(teamCount * 0.15)` initially
   - Once tiebreakers determined, show exact total
   - Progress bar shows "~" during estimate phase, removes "~" once exact

5. Add comprehensive error handling:
   - Validate even number of teams before starting (if odd, show error)
   - Handle edge case: fewer than 6 teams (show error, Swiss needs minimum teams)
   - Handle pairing failures gracefully (log detailed error)
   - Catch tiebreaker calculation errors and show user-friendly message

6. Add data validation:
   - Verify all teams have valid data before starting
   - Check team IDs are unique
   - Verify team rosters meet minimum requirements

7. Internal logging (development mode only):
   - Log round transitions to console
   - Log pairing decisions and record groups
   - Log tiebreaker calculations and decisions
   - Log any rematches or pairing conflicts
   - This is for debugging—never shown to user in production

8. Update the README:
   - Replace quicksort algorithm description with Swiss System description
   - Explain comparison count reduction: "~50% fewer comparisons"
   - Dynamic comparison counts based on league size:
     * 8 teams: ~12-15 comparisons
     * 10 teams: ~20-24 comparisons
     * 12 teams: ~24-28 comparisons
     * 14 teams: ~28-32 comparisons
   - Explain that Swiss System operates transparently in the background
   - Note: user experience unchanged—just fewer comparisons

9. Code organization:
   - Ensure all Swiss logic is in separate engine files
   - Keep clear separation between engine logic and UI components
   - Document internal functions clearly (especially dynamic calculations)
   - Add comments explaining non-obvious logic (pairing algorithm, tiebreakers)

10. Performance optimization:
    - Ensure pairing algorithm completes quickly for any team count
    - Optimize teamRecords lookups using Map
    - Lazy-calculate strength of schedule (only when needed)
    - Verify no performance degradation with larger leagues (14-16 teams)

COMPREHENSIVE TESTING CHECKLIST:

**Basic Flow (any team count):**
- [ ] App loads without errors
- [ ] Swiss system initializes correctly
- [ ] First matchup appears
- [ ] Arrow buttons and keyboard controls work
- [ ] Progress bar updates after each comparison
- [ ] TeamRecords track correctly internally

**Different Team Counts:**
- [ ] 8 teams: ~12-15 comparisons total, rankings correct
- [ ] 10 teams: ~20-24 comparisons total, rankings correct
- [ ] 12 teams: ~24-28 comparisons total, rankings correct
- [ ] 14 teams: ~28-32 comparisons total, rankings correct

**Comparison Flow:**
- [ ] All comparisons flow continuously with no interruptions
- [ ] No round indicators or phase messages shown to user
- [ ] Progress bar only element that updates
- [ ] Swiss rounds transition seamlessly (invisible to user)
- [ ] Tiebreaker phase transitions seamlessly (invisible to user)
- [ ] User experience identical to old quicksort version

**Swiss Rounds (internal verification):**
- [ ] First round: sequential pairing
- [ ] Subsequent rounds: record-based pairing
- [ ] No rematches occur (check completedMatchups)
- [ ] Correct number of rounds for team count (ceil(log2(n)))
- [ ] All matchups generated correctly for any team count

**Tiebreakers:**
- [ ] Head-to-head applied correctly
- [ ] Strength of schedule calculated correctly
- [ ] Additional comparisons queued only when necessary
- [ ] Final rankings have no ties
- [ ] Works correctly for any team count

**Final Rankings:**
- [ ] Rankings screen appears after all comparisons
- [ ] Teams ranked correctly by record, then tiebreakers
- [ ] Complete ordered list (1 through n)
- [ ] Rankings UI unchanged from before
- [ ] Team cards expand to show rosters

**Edge Cases:**
- [ ] Handles odd pairing situations gracefully
- [ ] Handles multi-way ties correctly
- [ ] Handles equal strength of schedule (queues comparison)
- [ ] Works with minimum viable team count (6 teams)
- [ ] Shows error for odd number of teams
- [ ] Shows error for fewer than 6 teams

**UI/UX Verification:**
- [ ] UI looks identical to quicksort version
- [ ] No new UI elements added
- [ ] Progress bar is only visible change
- [ ] All existing features still work (view toggles, keyboard controls)
- [ ] Mobile responsive
- [ ] No console errors (production mode)

**Performance:**
- [ ] Pairing algorithm fast for all team counts
- [ ] No lag during comparisons
- [ ] Tiebreaker calculations fast
- [ ] Final rankings generation instant

REQUIREMENTS FOR COMPLETION:
- All quicksort code removed
- Swiss system fully integrated and invisible to user
- Support for any even number of teams (6-16+)
- No hardcoded team counts or comparison counts
- User experience unchanged from original
- Comprehensive testing completed
- README updated with dynamic comparison counts
- Code clean, commented, follows project structure

DELIVERABLES:
- Fully functional Swiss System (invisible backend)
- ~50% reduction in comparisons (varies by team count)
- Dynamic support for any league size
- Identical user experience to before
- Clean, maintainable code
- Updated documentation