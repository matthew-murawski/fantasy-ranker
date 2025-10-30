/**
 * Type definitions for Fantasy Football roster data structures.
 * Defines Player, Team, Roster, and ComparisonPair interfaces along with helper functions.
 */

export interface Player {
  playerName: string;
  position: string;
  nflTeam: string;
  rosterSlot: string;
  injuryStatus: string;
  isIR: boolean;
  percentStarted?: number; // Optional: bench-fill heuristic
}

export interface Team {
  teamName: string;
  ownerName?: string;
  players: Player[];
  starters: Player[];
  bench: Player[];
  ir: Player[];
}

export interface Roster {
  teams: Team[];
}

export interface ComparisonPair {
  teamA: Team;
  teamB: Team;
}

/**
 * Type guard to check if a player is a starter.
 * A player is a starter if their roster slot is not 'BE' (bench).
 */
export function isStarter(player: Player): boolean {
  return player.rosterSlot !== 'BE' && !player.isIR;
}

/**
 * Type guard to check if a player is on the bench.
 * A player is on the bench if their roster slot is 'BE' and they're not on IR.
 */
export function isBench(player: Player): boolean {
  return player.rosterSlot === 'BE' && !player.isIR;
}

/**
 * Type guard to check if a player is on injured reserve.
 */
export function isIR(player: Player): boolean {
  return player.isIR;
}
