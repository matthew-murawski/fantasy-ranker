/**
 * Type definitions for Swiss System tournament algorithm.
 * These types are used internally and never exposed to the UI.
 */

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
