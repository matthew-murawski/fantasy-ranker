Swiss System Ranking Algorithm Specification
Overview
Replace the current quicksort-based comparison algorithm with a Swiss System tournament approach to reduce comparisons from ~40 to ~20-25 for 12 teams while maintaining reasonable ranking accuracy.
Algorithm Structure
Phase 1: Swiss Rounds (3 rounds)
The algorithm runs exactly 3 rounds of Swiss-style pairings. Each round consists of 6 head-to-head matchups (for 12 teams), resulting in 18 total comparisons.
Round 1 pairings:

All teams start with a 0-0 record
Pair teams randomly or by their order in the input file
Create 6 matchups (teams 1v2, 3v4, 5v6, 7v8, 9v10, 11v12)

Round 2 pairings:

Group teams by their current record (1-0 or 0-1)
Within each record group, pair teams that haven't faced each other yet
If odd number in a group, pair the remaining team with someone from an adjacent record group
Avoid rematches whenever possible

Round 3 pairings:

Group teams by current record (2-0, 1-1, 0-2)
Pair teams within their record groups
Continue avoiding rematches
Handle odd-sized groups by pairing with adjacent records

Data tracking during Swiss rounds:

Store each team's win-loss record (W-L)
Store which teams have faced each other (to avoid rematches)
Store the identity of each opponent faced (for tiebreaker calculations)

Phase 2: Tiebreaker Pass
After 3 Swiss rounds, teams are grouped by their final records. Within each record group that contains multiple teams, apply tiebreakers to establish final ranking order.
Tiebreaker priority (in order):

Head-to-head result: If two tied teams faced each other during Swiss rounds, the winner of that matchup ranks higher
Strength of schedule: Calculate each team's opponents' combined win percentages. Team with tougher schedule ranks higher
Additional comparison: If teams are still tied and strength of schedule is equal (or very close), ask the user for one direct comparison between the two teams

Tiebreaker process:

Sort teams into record groups (e.g., all 2-1 teams together, all 1-2 teams together)
For each group with 2+ teams:

Apply head-to-head tiebreaker if applicable
Apply strength of schedule for remaining ties
If still tied, queue a comparison between those specific teams


Present any queued tiebreaker comparisons to the user (estimated 3-6 additional comparisons for 12 teams)

User Experience Flow
Comparison Screen Updates
Progress tracking:

Total estimated comparisons: 18 (Swiss rounds) + estimated tiebreakers (3-6)
Display current round: "Round 1 of 3", "Round 2 of 3", "Round 3 of 3", "Tiebreakers"
Show current matchup number within round: "Matchup 4 of 6"
Progress bar shows: (comparisons completed / total estimated comparisons)

Round transition:

After completing all 6 matchups in a round, show a brief transition message:

"Round 1 complete! Starting Round 2..."
Display for 1-2 seconds, then proceed to next round
No user action required



Tiebreaker phase:

After Round 3 completes, show message: "Swiss rounds complete! Resolving ties..."
If tiebreaker comparisons are needed, present them with context:

"These teams have identical records. Which roster is stronger?"
Show both teams' records beneath their rosters


If no tiebreaker comparisons needed (all ties resolved by head-to-head or strength of schedule), proceed directly to rankings

Visual Indicators

Keep the existing side-by-side roster comparison layout
Add round/matchup indicators above or below the progress bar
Maintain all existing UI elements (arrow buttons, keyboard controls, view toggles)

Technical Implementation Notes
Data Structures
typescriptinterface TeamRecord {
  teamId: string;
  wins: number;
  losses: number;
  opponentsPlayed: string[]; // teamIds of opponents faced
}

interface Matchup {
  round: number;
  matchupNumber: number;
  team1Id: string;
  team2Id: string;
}

interface ComparisonResult {
  winnerId: string;
  loserId: string;
  round: number;
}
```

### Swiss Pairing Algorithm
```
function pairRound(teams: TeamRecord[], round: number, pastMatchups: ComparisonResult[]): Matchup[] {
  // Group teams by current record
  const recordGroups = groupByRecord(teams);
  
  // Sort groups by record (best records first)
  const sortedGroups = sortGroupsByRecord(recordGroups);
  
  const matchups: Matchup[] = [];
  let unpaired: TeamRecord[] = [];
  
  for (const group of sortedGroups) {
    // Add any unpaired team from previous group
    const teamsTopair = [...unpaired, ...group];
    unpaired = [];
    
    // If odd number, save one for next group
    if (teamsTopair.length % 2 === 1) {
      unpaired.push(teamsToair.pop());
    }
    
    // Pair remaining teams, avoiding rematches
    const groupMatchups = pairWithinGroup(teamsToair, pastMatchups);
    matchups.push(...groupMatchups);
  }
  
  // Handle any final unpaired team (pair with closest record available)
  if (unpaired.length > 0) {
    // Pair with any team that hasn't faced them yet
  }
  
  return matchups;
}
```

### Tiebreaker Calculation
```
function calculateStrengthOfSchedule(team: TeamRecord, allRecords: TeamRecord[]): number {
  let totalOpponentWins = 0;
  let totalOpponentGames = 0;
  
  for (const opponentId of team.opponentsPlayed) {
    const opponent = allRecords.find(t => t.teamId === opponentId);
    totalOpponentWins += opponent.wins;
    totalOpponentGames += (opponent.wins + opponent.losses);
  }
  
  return totalOpponentGames > 0 ? totalOpponentWins / totalOpponentGames : 0;
}

function resolveTies(recordGroup: TeamRecord[], pastMatchups: ComparisonResult[]): {
  sorted: TeamRecord[],
  additionalComparisonsNeeded: Matchup[]
} {
  // Apply tiebreakers in order:
  // 1. Head-to-head results
  // 2. Strength of schedule
  // 3. Queue additional comparison if still tied
  
  // Return sorted teams within this record group
  // and any additional matchups that need user input
}
State Management Updates
The existing comparison engine state should be extended:
typescriptinterface SwissSystemState {
  currentRound: number; // 1, 2, 3, or 4 (4 = tiebreaker phase)
  currentMatchupInRound: number;
  matchupsThisRound: Matchup[];
  teamRecords: TeamRecord[];
  completedMatchups: ComparisonResult[];
  tiebreakerQueue: Matchup[];
  phase: 'swiss' | 'tiebreaker' | 'complete';
}
Validation and Edge Cases
Bye handling:

If pairing algorithm cannot find a valid pairing without a rematch and only one team is unpaired, that team receives a "bye" (automatic win) for that round
Byes should be rare with 12 teams and 3 rounds, but the algorithm should handle them gracefully

Equal strength of schedule:

If two teams have identical records and strength of schedule differs by less than 0.01 (essentially equal), queue an additional comparison rather than making an arbitrary decision

Final ranking output:

Teams are ranked first by record (3-0 > 2-1 > 1-2 > 0-3)
Within each record group, teams are ordered by tiebreaker results
The final ranking should be a complete 1-12 ordered list with no ties

Testing Considerations

Test with 12 teams across all three rounds
Verify pairing logic avoids rematches in rounds 2 and 3
Test tiebreaker logic with various record distributions:

All teams finish with different records (best case, no tiebreakers needed)
Multiple teams tied at 2-1 (typical case, some tiebreakers needed)
Extreme case: many teams tied at 1-2 (most tiebreakers needed)


Verify progress bar accurately reflects total comparisons
Test edge case: team receives bye (though unlikely with 12 teams)

Migration from Quicksort
Code to replace:

Remove quicksort-based comparison engine
Remove partition logic and recursive sorting
Keep comparison result caching (still useful for detecting rematches and head-to-head tiebreakers)

Code to keep:

Comparison UI components (side-by-side roster display, arrow buttons, keyboard controls)
Progress tracking UI framework (update calculation logic only)
Rankings display screen (no changes needed)
Data loading and validation (no changes needed)

New code to add:

Swiss pairing algorithm
Round management state
Tiebreaker calculation logic
Updated progress estimation (18 + estimated tiebreakers)

Expected Outcomes
Comparison count:

Minimum: 18 (if all teams finish with unique records via tiebreakers that don't require comparisons)
Typical: 21-24 (18 Swiss + 3-6 tiebreaker comparisons)
Maximum: ~27 (18 Swiss + up to 9 tiebreaker comparisons if many teams tied and head-to-head doesn't resolve)

Accuracy trade-offs:

Rankings will be less precise than full quicksort for middle-tier teams
Top-tier and bottom-tier teams will still be clearly identified (teams going 3-0 or 0-3)
Middle of the pack (1-2 and 2-1 teams) may have some ranking variance compared to a full sort
This is acceptable for fantasy football power rankings where "approximately correct" is sufficient

User experience improvements:

Roughly 50% fewer comparisons (40 → 21-24)
Clearer sense of progress with round structure
Faster completion time encourages more frequent rankings throughout the season