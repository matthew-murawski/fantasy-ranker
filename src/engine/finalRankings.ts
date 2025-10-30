/**
 * Final rankings generation for Swiss System tournaments.
 * Combines record-based grouping with tiebreakers to produce complete ordered ranking.
 */

import { Team } from '../types';
import { TeamRecord, ComparisonResult } from '../types/swiss';
import { groupTeamsByRecord } from './swissPairing';
import { resolveTiesForRecordGroup } from './tiebreakers';

/**
 * Generates the final ranking of teams after all Swiss rounds and tiebreakers are complete.
 * Teams are first grouped by record (best to worst), then sorted within groups by tiebreakers.
 *
 * @param teams - Array of all teams
 * @param teamRecords - Map of final team records
 * @param completedMatchups - All completed matchups (including tiebreakers)
 * @returns Ordered array of teams from best (rank 1) to worst (rank n)
 */
export function generateFinalRankings(
  teams: Team[],
  teamRecords: Map<string, TeamRecord>,
  completedMatchups: ComparisonResult[]
): Team[] {
  // Group teams by final record
  const recordGroups = groupTeamsByRecord(teams, teamRecords);

  // Sort record groups by record (better records first)
  const sortedRecordKeys = Array.from(recordGroups.keys()).sort((a, b) => {
    const [winsA, lossesA] = a.split('-').map(Number);
    const [winsB, lossesB] = b.split('-').map(Number);

    // Sort by wins descending, then losses ascending
    if (winsB !== winsA) return winsB - winsA;
    return lossesA - lossesB;
  });

  const finalRanking: Team[] = [];

  // Process each record group and apply tiebreakers
  sortedRecordKeys.forEach((recordKey) => {
    const groupTeams = recordGroups.get(recordKey)!;

    if (groupTeams.length === 1) {
      // No tiebreaking needed
      finalRanking.push(groupTeams[0]);
    } else {
      // Apply tiebreakers to sort within group
      const result = resolveTiesForRecordGroup(groupTeams, teamRecords, completedMatchups);

      // Note: If additionalComparisonsNeeded has items, they should have been
      // completed before calling generateFinalRankings
      finalRanking.push(...result.sortedTeams);
    }
  });

  return finalRanking;
}
