/**
 * Swiss System pairing logic for generating matchups.
 * Handles first round sequential pairing and subsequent round record-based pairing.
 */

import { Team } from '../types';
import { Matchup, TeamRecord, ComparisonResult } from '../types/swiss';

/**
 * Generates first round pairings by pairing teams sequentially.
 * Teams are paired 1v2, 3v4, 5v6, etc. based on their order in the input array.
 * If there's an odd number of teams, the last team receives a bye (no matchup, automatic win).
 *
 * @param teams - Array of teams to pair
 * @returns Array of matchups for round 1
 */
export function generateFirstRoundPairings(teams: Team[]): Matchup[] {
  const matchups: Matchup[] = [];
  const matchupCount = Math.floor(teams.length / 2);

  for (let i = 0; i < matchupCount; i++) {
    matchups.push({
      round: 1,
      team1Id: teams[i * 2].teamName,
      team2Id: teams[i * 2 + 1].teamName,
    });
  }

  // Note: If teams.length is odd, the last team gets a bye (handled in the engine)

  return matchups;
}

/**
 * Checks if two teams have already played each other in previous rounds.
 *
 * @param team1Id - First team's ID
 * @param team2Id - Second team's ID
 * @param completedMatchups - Array of all completed matchups
 * @returns true if teams have played each other, false otherwise
 */
export function haveTeamsPlayed(
  team1Id: string,
  team2Id: string,
  completedMatchups: ComparisonResult[]
): boolean {
  return completedMatchups.some(
    (matchup) =>
      (matchup.winnerId === team1Id && matchup.loserId === team2Id) ||
      (matchup.winnerId === team2Id && matchup.loserId === team1Id)
  );
}

/**
 * Groups teams by their current win-loss record.
 *
 * @param teams - Array of teams to group
 * @param teamRecords - Map of team records
 * @returns Map of record strings to arrays of teams
 */
export function groupTeamsByRecord(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>
): Map<string, Team[]> {
  const groups = new Map<string, Team[]>();

  teams.forEach((team) => {
    const record = teamRecords.get(team.teamName);
    if (!record) return;

    const recordKey = `${record.wins}-${record.losses}`;
    if (!groups.has(recordKey)) {
      groups.set(recordKey, []);
    }
    groups.get(recordKey)!.push(team);
  });

  return groups;
}

/**
 * Pairs teams within a record group, avoiding rematches when possible.
 *
 * @param teams - Teams to pair within this group
 * @param teamRecords - Map of team records
 * @param completedMatchups - All completed matchups
 * @returns Object with paired matchups and any unpaired team
 */
export function pairWithinGroup(
  teams: Team[],
  _teamRecords: Map<string, TeamRecord>, // Unused but kept for API consistency
  completedMatchups: ComparisonResult[]
): { paired: Matchup[]; unpaired: Team | null } {
  const matchups: Matchup[] = [];
  const available = [...teams];
  let unpaired: Team | null = null;

  while (available.length >= 2) {
    const team1 = available.shift()!;
    let pairedIndex = -1;

    // Try to find a team that hasn't played team1
    for (let i = 0; i < available.length; i++) {
      if (!haveTeamsPlayed(team1.teamName, available[i].teamName, completedMatchups)) {
        pairedIndex = i;
        break;
      }
    }

    // If no unpaired opponent found, pair with first available (rematch)
    if (pairedIndex === -1 && available.length > 0) {
      pairedIndex = 0;
      console.warn(`Rematch unavoidable: ${team1.teamName} vs ${available[0].teamName}`);
    }

    if (pairedIndex !== -1) {
      const team2 = available.splice(pairedIndex, 1)[0];
      matchups.push({
        round: 0, // Will be set by caller
        team1Id: team1.teamName,
        team2Id: team2.teamName,
      });
    } else {
      // No opponent available, this team is unpaired
      unpaired = team1;
    }
  }

  // If one team left over, it's unpaired
  if (available.length === 1) {
    unpaired = available[0];
  }

  return { paired: matchups, unpaired };
}

/**
 * Generates Swiss pairings for subsequent rounds (after round 1).
 * Groups teams by record and pairs within groups, avoiding rematches.
 *
 * @param teams - Array of all teams
 * @param teamRecords - Map of current team records
 * @param round - Current round number
 * @param completedMatchups - Array of all completed matchups
 * @returns Array of matchups for this round
 */
export function generateSwissPairings(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  round: number,
  completedMatchups: ComparisonResult[]
): Matchup[] {
  const matchups: Matchup[] = [];
  let carryoverTeam: Team | null = null;

  // Group teams by record
  const recordGroups = groupTeamsByRecord(teams, teamRecords);

  // Sort record groups by record (better records first)
  const sortedRecordKeys = Array.from(recordGroups.keys()).sort((a, b) => {
    const [winsA, lossesA] = a.split('-').map(Number);
    const [winsB, lossesB] = b.split('-').map(Number);

    // Sort by wins descending, then losses ascending
    if (winsB !== winsA) return winsB - winsA;
    return lossesA - lossesB;
  });

  // Process each record group
  for (const recordKey of sortedRecordKeys) {
    const groupTeams = recordGroups.get(recordKey)!;
    const teamsToPair = carryoverTeam ? [carryoverTeam, ...groupTeams] : groupTeams;
    carryoverTeam = null;

    // Pair within group
    const result = pairWithinGroup(teamsToPair, teamRecords, completedMatchups);

    // Add matchups and set round number
    result.paired.forEach((matchup) => {
      matchup.round = round;
      matchups.push(matchup);
    });

    // Save unpaired team for next group
    if (result.unpaired) {
      carryoverTeam = result.unpaired;
    }
  }

  // Handle final unpaired team (if odd number of teams total)
  // This team gets a bye for this round (handled by caller)
  if (carryoverTeam) {
    console.log(`${carryoverTeam.teamName} receives a bye in round ${round}`);
  }

  return matchups;
}
