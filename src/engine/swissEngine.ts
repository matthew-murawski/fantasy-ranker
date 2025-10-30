/**
 * Swiss System tournament engine for managing rounds and state.
 * Calculates number of rounds dynamically based on team count.
 */

import { Team } from '../types';
import { SwissSystemState, TeamRecord, ComparisonResult, Matchup } from '../types/swiss';
import { generateFirstRoundPairings, generateSwissPairings, groupTeamsByRecord } from './swissPairing';
import { resolveTiesForRecordGroup } from './tiebreakers';

/**
 * Initializes the Swiss System state for a set of teams.
 * Calculates the number of rounds as ceil(log2(teamCount)).
 * Creates initial team records (all starting at 0-0).
 * Generates first round matchups.
 *
 * @param teams - Array of teams to rank
 * @returns Initial Swiss System state
 * @throws Error if team count is odd or less than 6
 */
export function initializeSwissSystem(teams: Team[]): SwissSystemState {
  // Validate team count
  if (!teams || teams.length === 0) {
    throw new Error('No teams provided for ranking');
  }
  if (teams.length < 2) {
    throw new Error('Swiss System requires at least 2 teams');
  }

  // Validate team data
  const teamNames = new Set<string>();
  teams.forEach((team, index) => {
    if (!team.teamName || team.teamName.trim() === '') {
      throw new Error(`Team at index ${index} has no name`);
    }
    if (teamNames.has(team.teamName)) {
      throw new Error(`Duplicate team name found: ${team.teamName}`);
    }
    teamNames.add(team.teamName);
  });

  // Note: Odd team counts are handled with byes in the pairing logic

  // Calculate number of rounds: ceil(log2(n))
  const totalRounds = Math.ceil(Math.log2(teams.length));

  // Initialize team records (all start at 0-0)
  const teamRecords = new Map<string, TeamRecord>();
  teams.forEach(team => {
    teamRecords.set(team.teamName, {
      teamId: team.teamName,
      teamName: team.teamName,
      wins: 0,
      losses: 0,
      opponentsPlayed: [],
    });
  });

  // Generate first round pairings
  const matchupsThisRound = generateFirstRoundPairings(teams);

  // Handle bye if odd number of teams
  const completedMatchups: ComparisonResult[] = [];
  if (teams.length % 2 !== 0) {
    // Last team gets a bye (automatic win)
    const byeTeam = teams[teams.length - 1];
    const byeTeamRecord = teamRecords.get(byeTeam.teamName);
    if (byeTeamRecord) {
      byeTeamRecord.wins++;
    }
    console.log(`${byeTeam.teamName} receives a bye in round 1`);
  }

  // Log initialization (dev only)
  console.log(`Swiss System initialized: ${teams.length} teams, ${totalRounds} rounds`);

  return {
    totalTeams: teams.length,
    totalRounds,
    currentRound: 1,
    currentMatchupIndex: 0,
    matchupsThisRound,
    teamRecords,
    completedMatchups,
    tiebreakerQueue: [],
    phase: 'swiss',
  };
}

/**
 * Advances the Swiss System to the next round.
 * Generates pairings for the next round based on current records.
 * Handles byes for odd number of teams.
 *
 * @param currentState - Current Swiss System state
 * @param teams - Array of all teams
 * @returns Updated state with next round's matchups
 */
export function advanceToNextRound(
  currentState: SwissSystemState,
  teams: Team[]
): SwissSystemState {
  const nextRound = currentState.currentRound + 1;

  console.log(`Advancing to round ${nextRound}`);

  // Check if we've completed all Swiss rounds
  if (currentState.currentRound >= currentState.totalRounds) {
    console.log('All Swiss rounds complete, entering tiebreaker phase');
    return {
      ...currentState,
      phase: 'tiebreaker',
      matchupsThisRound: [],
      currentMatchupIndex: 0,
    };
  }

  // Generate pairings for next round based on current records
  const matchupsThisRound = generateSwissPairings(
    teams,
    currentState.teamRecords,
    nextRound,
    currentState.completedMatchups
  );

  // Handle bye if odd number of teams
  // Find team with bye (if any) - it's the team not in any matchup
  const teamsInMatchups = new Set<string>();
  matchupsThisRound.forEach((matchup) => {
    teamsInMatchups.add(matchup.team1Id);
    teamsInMatchups.add(matchup.team2Id);
  });

  const byeTeam = teams.find((team) => !teamsInMatchups.has(team.teamName));
  if (byeTeam) {
    const byeTeamRecord = currentState.teamRecords.get(byeTeam.teamName);
    if (byeTeamRecord) {
      byeTeamRecord.wins++;
    }
  }

  return {
    ...currentState,
    currentRound: nextRound,
    currentMatchupIndex: 0,
    matchupsThisRound,
  };
}

/**
 * Enters the tiebreaker phase after all Swiss rounds are complete.
 * Groups teams by record and resolves ties using head-to-head, SOS, and additional comparisons.
 *
 * @param currentState - Current Swiss System state
 * @param teams - Array of all teams
 * @returns Updated state with tiebreaker queue
 */
export function enterTiebreakerPhase(
  currentState: SwissSystemState,
  teams: Team[]
): SwissSystemState {
  console.log('Entering tiebreaker phase');

  // Group teams by final record
  const recordGroups = groupTeamsByRecord(teams, currentState.teamRecords);

  // Collect all additional comparisons needed
  const tiebreakerQueue: Matchup[] = [];

  // Process each record group
  recordGroups.forEach((groupTeams, recordKey) => {
    if (groupTeams.length > 1) {
      console.log(`Resolving ties for ${groupTeams.length} teams with record ${recordKey}`);

      const result = resolveTiesForRecordGroup(
        groupTeams,
        currentState.teamRecords,
        currentState.completedMatchups
      );

      // Add any additional comparisons needed
      tiebreakerQueue.push(...result.additionalComparisonsNeeded);
    }
  });

  console.log(`${tiebreakerQueue.length} tiebreaker comparisons needed`);

  // If no tiebreakers needed, go straight to complete
  if (tiebreakerQueue.length === 0) {
    return {
      ...currentState,
      phase: 'complete',
      matchupsThisRound: [],
      currentMatchupIndex: 0,
      tiebreakerQueue: [],
    };
  }

  // Set up tiebreaker comparisons
  return {
    ...currentState,
    phase: 'tiebreaker',
    matchupsThisRound: tiebreakerQueue,
    currentMatchupIndex: 0,
    tiebreakerQueue,
  };
}
