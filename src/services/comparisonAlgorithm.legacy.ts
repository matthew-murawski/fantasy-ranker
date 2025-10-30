/**
 * LEGACY - Quicksort-based comparison algorithm.
 * This file is no longer used in the application.
 * The app now uses the Swiss System algorithm (see src/engine/swissComparisonEngine.ts).
 * Kept for reference only.
 *
 * Original description:
 * Comparison algorithm based on quicksort for ranking fantasy football teams.
 * Uses user comparisons to determine team rankings with minimal comparisons needed.
 */

import { Team, ComparisonPair } from '../types';

interface ComparisonState {
  left: number;
  right: number;
  pivotIndex: number;
  phase: 'partition' | 'recurse-left' | 'recurse-right' | 'complete';
  partitionIndex?: number;
}

export class ComparisonEngine {
  private teams: Team[];
  private comparisons: Map<string, number>;
  private sortedIndices: number[];
  private callStack: ComparisonState[];
  private pendingComparison: ComparisonPair | null;
  public isComplete: boolean;

  constructor(teams: Team[]) {
    this.teams = [...teams];
    this.comparisons = new Map();
    this.sortedIndices = teams.map((_, i) => i);
    this.callStack = [];
    this.pendingComparison = null;
    this.isComplete = false;

    // Initialize quicksort if we have teams to sort
    if (teams.length > 1) {
      this.callStack.push({
        left: 0,
        right: teams.length - 1,
        pivotIndex: teams.length - 1,
        phase: 'partition',
      });
      this.advanceToNextComparison();
    } else {
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

    // Store the comparison result
    const key = this.getComparisonKey(winnerTeam, loserTeam);
    this.comparisons.set(key, 1); // Winner gets 1
    const reverseKey = this.getComparisonKey(loserTeam, winnerTeam);
    this.comparisons.set(reverseKey, -1); // Loser gets -1

    // Advance to the next comparison
    this.advanceToNextComparison();
  }

  /**
   * Checks if a tie-breaker comparison is needed.
   * Returns null in this implementation as quicksort doesn't require explicit tie-breaking.
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

    return this.sortedIndices.map(i => this.teams[i]);
  }

  /**
   * Returns progress information about comparisons.
   */
  public getProgress(): { completed: number; estimated: number } {
    const n = this.teams.length;
    // Average case for quicksort: n * log2(n)
    const estimated = Math.ceil(n * Math.log2(n));
    const completed = this.comparisons.size / 2; // Divide by 2 because we store both directions

    return { completed, estimated };
  }

  /**
   * Advances the algorithm to the next comparison that needs to be made.
   */
  private advanceToNextComparison(): void {
    this.pendingComparison = null;

    while (this.callStack.length > 0 && !this.pendingComparison) {
      const state = this.callStack[this.callStack.length - 1];

      if (state.phase === 'partition') {
        this.processPartitionPhase(state);
      } else if (state.phase === 'recurse-left') {
        this.processRecurseLeftPhase(state);
      } else if (state.phase === 'recurse-right') {
        this.processRecurseRightPhase(state);
      } else if (state.phase === 'complete') {
        this.callStack.pop();
      }
    }

    if (!this.pendingComparison) {
      this.isComplete = true;
    }
  }

  /**
   * Processes the partition phase of quicksort.
   */
  private processPartitionPhase(state: ComparisonState): void {
    if (state.left >= state.right) {
      state.phase = 'complete';
      return;
    }

    // Perform partition
    const partitionResult = this.partition(state.left, state.right, state.pivotIndex);

    if (partitionResult.needsComparison) {
      // We need a comparison - set it as pending
      this.pendingComparison = partitionResult.comparison!;
      // Don't change state yet - we'll continue after comparison is recorded
    } else {
      // Partition complete, move to recursion
      state.partitionIndex = partitionResult.partitionIndex!;
      state.phase = 'recurse-left';
    }
  }

  /**
   * Processes the left recursion phase.
   */
  private processRecurseLeftPhase(state: ComparisonState): void {
    const partitionIndex = state.partitionIndex!;

    // Push left subarray onto stack
    if (partitionIndex - 1 > state.left) {
      this.callStack.push({
        left: state.left,
        right: partitionIndex - 1,
        pivotIndex: partitionIndex - 1,
        phase: 'partition',
      });
    }

    state.phase = 'recurse-right';
  }

  /**
   * Processes the right recursion phase.
   */
  private processRecurseRightPhase(state: ComparisonState): void {
    const partitionIndex = state.partitionIndex!;

    // Push right subarray onto stack
    if (partitionIndex + 1 < state.right) {
      this.callStack.push({
        left: partitionIndex + 1,
        right: state.right,
        pivotIndex: state.right,
        phase: 'partition',
      });
    }

    state.phase = 'complete';
  }

  /**
   * Partitions the array around a pivot.
   * Returns either a comparison that's needed or the partition index.
   */
  private partition(
    left: number,
    right: number,
    pivotIndex: number
  ): { needsComparison: true; comparison: ComparisonPair } | { needsComparison: false; partitionIndex: number } {
    const pivot = this.sortedIndices[pivotIndex];
    const pivotTeam = this.teams[pivot];

    // Move pivot to end temporarily
    this.swap(pivotIndex, right);

    let storeIndex = left;

    // Partition process
    for (let i = left; i < right; i++) {
      const currentIndex = this.sortedIndices[i];
      const currentTeam = this.teams[currentIndex];

      const comparison = this.getStoredComparison(currentTeam, pivotTeam);

      if (comparison === null) {
        // We need to ask the user for this comparison
        // Restore pivot first
        this.swap(storeIndex, right);
        return {
          needsComparison: true,
          comparison: { teamA: currentTeam, teamB: pivotTeam },
        };
      }

      // If current is better than pivot (comparison > 0), it goes to the left
      if (comparison > 0) {
        this.swap(i, storeIndex);
        storeIndex++;
      }
    }

    // Move pivot to its final position
    this.swap(storeIndex, right);

    return {
      needsComparison: false,
      partitionIndex: storeIndex,
    };
  }

  /**
   * Swaps two elements in the sorted indices array.
   */
  private swap(i: number, j: number): void {
    const temp = this.sortedIndices[i];
    this.sortedIndices[i] = this.sortedIndices[j];
    this.sortedIndices[j] = temp;
  }

  /**
   * Gets a stored comparison result, or null if not yet compared.
   * Returns > 0 if teamA is better, < 0 if teamB is better.
   */
  private getStoredComparison(teamA: Team, teamB: Team): number | null {
    const key = this.getComparisonKey(teamA, teamB);
    const result = this.comparisons.get(key);
    return result !== undefined ? result : null;
  }

  /**
   * Generates a unique key for a comparison between two teams.
   */
  private getComparisonKey(teamA: Team, teamB: Team): string {
    return `${teamA.teamName}_vs_${teamB.teamName}`;
  }
}
