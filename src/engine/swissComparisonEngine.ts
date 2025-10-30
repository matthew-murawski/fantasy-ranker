/**
 * Swiss System comparison engine for ranking fantasy football teams.
 * Implements the same interface as the quicksort ComparisonEngine but uses Swiss System algorithm.
 */

import { Team, ComparisonPair } from '../types';
import { SwissSystemState, ComparisonResult } from '../types/swiss';
import { initializeSwissSystem, advanceToNextRound, enterTiebreakerPhase } from './swissEngine';
import { generateFinalRankings } from './finalRankings';

export class SwissComparisonEngine {
  private teams: Team[];
  private state: SwissSystemState;
  private pendingComparison: ComparisonPair | null;
  public isComplete: boolean;

  constructor(teams: Team[]) {
    this.teams = [...teams];
    this.isComplete = false;

    // Initialize Swiss System
    if (teams.length > 1) {
      this.state = initializeSwissSystem(teams);
      this.pendingComparison = this.loadNextComparison();
    } else {
      // Edge case: 0 or 1 team - no comparisons needed
      const teamRecords = new Map();
      if (teams.length === 1) {
        teamRecords.set(teams[0].teamName, {
          teamId: teams[0].teamName,
          teamName: teams[0].teamName,
          wins: 0,
          losses: 0,
          opponentsPlayed: [],
        });
      }

      this.state = {
        totalTeams: teams.length,
        totalRounds: 0,
        currentRound: 1,
        currentMatchupIndex: 0,
        matchupsThisRound: [],
        teamRecords,
        completedMatchups: [],
        tiebreakerQueue: [],
        phase: 'complete',
      };
      this.pendingComparison = null;
      this.isComplete = true;
    }
  }

  /**
   * Returns the next pair of teams that need to be compared.
   * Returns null if ranking is complete.
   */
  public getNextComparison(): ComparisonPair | null {
    return this.pendingComparison;
  }

  /**
   * Records the result of a comparison and advances the algorithm.
   * @param winnerTeam - The team that won the comparison
   * @param loserTeam - The team that lost the comparison
   */
  public recordComparison(winnerTeam: Team, loserTeam: Team): void {
    if (!this.pendingComparison) {
      throw new Error('No pending comparison to record');
    }

    // Validate that winner and loser are actually in the current comparison
    const { teamA, teamB } = this.pendingComparison;
    const validWinner = winnerTeam === teamA || winnerTeam === teamB;
    const validLoser = loserTeam === teamA || loserTeam === teamB;

    if (!validWinner || !validLoser) {
      throw new Error('Winner or loser does not match current comparison teams');
    }

    if (winnerTeam === loserTeam) {
      throw new Error('Winner and loser cannot be the same team');
    }

    // Update team records
    const winnerRecord = this.state.teamRecords.get(winnerTeam.teamName);
    const loserRecord = this.state.teamRecords.get(loserTeam.teamName);

    if (!winnerRecord || !loserRecord) {
      throw new Error(`Team record not found: ${!winnerRecord ? winnerTeam.teamName : loserTeam.teamName}`);
    }

    // Increment wins/losses
    winnerRecord.wins++;
    loserRecord.losses++;

    // Track opponents played
    winnerRecord.opponentsPlayed.push(loserTeam.teamName);
    loserRecord.opponentsPlayed.push(winnerTeam.teamName);

    // Store the comparison result
    const result: ComparisonResult = {
      winnerId: winnerTeam.teamName,
      loserId: loserTeam.teamName,
      round: this.state.currentRound,
    };
    this.state.completedMatchups.push(result);

    // Advance to next matchup
    this.state.currentMatchupIndex++;

    // Load next comparison
    this.pendingComparison = this.loadNextComparison();

    // Check if we're done
    if (!this.pendingComparison) {
      this.isComplete = true;
      this.state.phase = 'complete';
    }
  }

  /**
   * Checks if a tie-breaker comparison is needed.
   * Returns null for now (tiebreakers will be implemented in later prompts).
   */
  public needsTieBreaker(): ComparisonPair | null {
    return null;
  }

  /**
   * Returns the final ranking of teams from best to worst.
   * Only callable when isComplete is true.
   */
  public getFinalRanking(): Team[] {
    if (!this.isComplete) {
      throw new Error('Cannot get final ranking: sorting is not complete');
    }

    // Use generateFinalRankings with full tiebreaker logic
    return generateFinalRankings(this.teams, this.state.teamRecords, this.state.completedMatchups);
  }

  /**
   * Returns progress information about comparisons.
   */
  public getProgress(): { completed: number; estimated: number } {
    const n = this.state.totalTeams;
    const completed = this.state.completedMatchups.length;

    // If we're in tiebreaker phase or complete, we know the exact total
    if (this.state.phase === 'tiebreaker' || this.state.phase === 'complete') {
      const swissComparisons = (n / 2) * this.state.totalRounds;
      const actualTiebreakers = this.state.tiebreakerQueue.length;
      const exact = swissComparisons + actualTiebreakers;

      return { completed, estimated: exact };
    }

    // During Swiss rounds, estimate tiebreakers
    const swissComparisons = (n / 2) * this.state.totalRounds;
    const estimatedTiebreakers = Math.floor(n * 0.15);
    const estimated = swissComparisons + estimatedTiebreakers;

    return { completed, estimated };
  }

  /**
   * Loads the next comparison from the current state.
   * Returns null if no more comparisons are needed.
   * Automatically advances to next round when current round is complete.
   */
  private loadNextComparison(): ComparisonPair | null {
    // Check if we have more matchups in current round
    if (this.state.currentMatchupIndex < this.state.matchupsThisRound.length) {
      const matchup = this.state.matchupsThisRound[this.state.currentMatchupIndex];
      const team1 = this.teams.find(t => t.teamName === matchup.team1Id);
      const team2 = this.teams.find(t => t.teamName === matchup.team2Id);

      if (!team1 || !team2) {
        throw new Error('Team not found in matchup');
      }

      return { teamA: team1, teamB: team2 };
    }

    // Current round is complete - advance to next round seamlessly
    console.log(`Round ${this.state.currentRound} complete`);

    // Check if we should advance to next round or finish
    if (this.state.currentRound < this.state.totalRounds) {
      // Advance to next round
      this.state = advanceToNextRound(this.state, this.teams);

      // Recursively load next comparison from new round
      return this.loadNextComparison();
    }

    // All Swiss rounds complete, move to tiebreaker phase
    console.log('All Swiss rounds complete');

    // Enter tiebreaker phase
    this.state = enterTiebreakerPhase(this.state, this.teams);

    // Check if we're in tiebreaker phase or complete
    if (this.state.phase === 'complete') {
      // No tiebreakers needed, we're done
      return null;
    }

    // Tiebreaker comparisons needed - recursively load first tiebreaker
    return this.loadNextComparison();
  }
}
