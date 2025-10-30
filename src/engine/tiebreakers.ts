/**
 * Tiebreaker system for Swiss System tournaments.
 * Resolves ties among teams with identical records using head-to-head results,
 * strength of schedule, and additional comparisons when necessary.
 */

import { Team } from '../types';
import { TeamRecord, ComparisonResult, Matchup } from '../types/swiss';

export interface TiebreakerResult {
  sortedTeams: Team[]; // Teams within a record group, sorted by tiebreakers
  additionalComparisonsNeeded: Matchup[]; // Comparisons user needs to make
}

/**
 * Gets the winner of a head-to-head matchup between two teams.
 * Returns the winner's team ID if they played, null otherwise.
 *
 * @param team1 - First team
 * @param team2 - Second team
 * @param completedMatchups - All completed matchups
 * @returns Winner's team ID or null if teams didn't play
 */
export function getHeadToHeadWinner(
  team1: Team,
  team2: Team,
  completedMatchups: ComparisonResult[]
): string | null {
  const matchup = completedMatchups.find(
    (m) =>
      (m.winnerId === team1.teamName && m.loserId === team2.teamName) ||
      (m.winnerId === team2.teamName && m.loserId === team1.teamName)
  );

  return matchup ? matchup.winnerId : null;
}

/**
 * Calculates strength of schedule for a team.
 * SOS is the combined win percentage of all opponents faced.
 *
 * @param team - Team to calculate SOS for
 * @param teamRecord - The team's record
 * @param allTeamRecords - Map of all team records
 * @returns Strength of schedule as decimal (0.0 to 1.0)
 */
export function calculateStrengthOfSchedule(
  _team: Team, // Team object not needed, using teamRecord instead
  teamRecord: TeamRecord,
  allTeamRecords: Map<string, TeamRecord>
): number {
  let totalOpponentWins = 0;
  let totalOpponentGames = 0;

  teamRecord.opponentsPlayed.forEach((opponentId) => {
    const opponent = allTeamRecords.get(opponentId);
    if (opponent) {
      totalOpponentWins += opponent.wins;
      totalOpponentGames += opponent.wins + opponent.losses;
    }
  });

  return totalOpponentGames > 0 ? totalOpponentWins / totalOpponentGames : 0;
}

/**
 * Sorts teams using tiebreakers and identifies pairs that need additional comparison.
 *
 * @param teams - Teams to sort
 * @param teamRecords - Map of team records
 * @param completedMatchups - All completed matchups
 * @returns Object with sorted teams and pairs needing comparison
 */
export function sortByTiebreakers(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): { sorted: Team[]; needingComparison: Team[][] } {
  if (teams.length <= 1) {
    return { sorted: teams, needingComparison: [] };
  }

  // Calculate SOS for each team
  const teamSOS = new Map<string, number>();
  teams.forEach((team) => {
    const record = teamRecords.get(team.teamName);
    if (record) {
      const sos = calculateStrengthOfSchedule(team, record, teamRecords);
      teamSOS.set(team.teamName, sos);
    }
  });

  // Try to sort teams using head-to-head and SOS
  const sorted = [...teams];
  const needingComparison: Team[][] = [];

  // Bubble sort with tiebreaker logic
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - i - 1; j++) {
      const team1 = sorted[j];
      const team2 = sorted[j + 1];

      // Check head-to-head first
      const h2hWinner = getHeadToHeadWinner(team1, team2, completedMatchups);

      if (h2hWinner === team2.teamName) {
        // team2 beat team1, so team2 should be ranked higher (earlier in array)
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      } else if (h2hWinner === null) {
        // They didn't play each other, use SOS
        const sos1 = teamSOS.get(team1.teamName) || 0;
        const sos2 = teamSOS.get(team2.teamName) || 0;

        if (Math.abs(sos1 - sos2) > 0.01) {
          // SOS difference is significant
          if (sos2 > sos1) {
            [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
          }
        } else {
          // SOS is too close, need additional comparison
          // Check if we've already queued this pair
          const alreadyQueued = needingComparison.some(
            (pair) =>
              (pair[0] === team1 && pair[1] === team2) ||
              (pair[0] === team2 && pair[1] === team1)
          );
          if (!alreadyQueued) {
            needingComparison.push([team1, team2]);
          }
        }
      }
      // If h2hWinner === team1.teamName, order is already correct
    }
  }

  return { sorted, needingComparison };
}

/**
 * Resolves ties for a record group using tiebreakers.
 * Applies head-to-head, then strength of schedule, then queues additional comparisons.
 *
 * @param teams - Teams in this record group
 * @param teamRecords - Map of all team records
 * @param completedMatchups - All completed matchups
 * @returns TiebreakerResult with sorted teams and additional comparisons needed
 */
export function resolveTiesForRecordGroup(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): TiebreakerResult {
  // If only 1 team, no tiebreaking needed
  if (teams.length <= 1) {
    return {
      sortedTeams: teams,
      additionalComparisonsNeeded: [],
    };
  }

  // Sort teams using tiebreakers
  const { sorted, needingComparison } = sortByTiebreakers(teams, teamRecords, completedMatchups);

  // Convert pairs needing comparison into Matchup objects
  const additionalComparisonsNeeded: Matchup[] = needingComparison.map(([team1, team2]) => ({
    round: 0, // Tiebreaker round (not part of Swiss rounds)
    team1Id: team1.teamName,
    team2Id: team2.teamName,
  }));

  return {
    sortedTeams: sorted,
    additionalComparisonsNeeded,
  };
}
