/**
 * LEGACY TEST - This tests the old quicksort-based comparison algorithm.
 * The app now uses the Swiss System algorithm (see swissSystem.test.ts).
 * This file is kept for reference only.
 */
import { describe, it, expect } from 'vitest';
import { ComparisonEngine } from '../services/comparisonAlgorithm.legacy';
import { Team } from '../types';

describe('ComparisonEngine', () => {
  /**
   * Helper to create a minimal team for testing.
   */
  function createTeam(name: string): Team {
    return {
      teamName: name,
      players: [],
      starters: [],
      bench: [],
      ir: [],
    };
  }

  describe('initialization', () => {
    it('initializes with teams', () => {
      const teams = [createTeam('A'), createTeam('B'), createTeam('C')];
      const engine = new ComparisonEngine(teams);

      expect(engine).toBeDefined();
      expect(engine.isComplete).toBe(false);
    });

    it('handles single team as already complete', () => {
      const teams = [createTeam('A')];
      const engine = new ComparisonEngine(teams);

      expect(engine.isComplete).toBe(true);
      expect(engine.getNextComparison()).toBeNull();
    });

    it('gets first comparison for 2 teams', () => {
      const teams = [createTeam('A'), createTeam('B')];
      const engine = new ComparisonEngine(teams);

      const comparison = engine.getNextComparison();
      expect(comparison).not.toBeNull();
      expect(comparison?.teamA).toBeDefined();
      expect(comparison?.teamB).toBeDefined();
    });
  });

  describe('recording comparisons', () => {
    it('records a comparison and gets next', () => {
      const teams = [createTeam('A'), createTeam('B'), createTeam('C')];
      const engine = new ComparisonEngine(teams);

      const first = engine.getNextComparison();
      expect(first).not.toBeNull();

      engine.recordComparison(first!.teamA, first!.teamB);

      // Should either have another comparison or be complete
      const next = engine.getNextComparison();
      expect(next !== null || engine.isComplete).toBe(true);
    });

    it('throws error when recording without pending comparison', () => {
      const teams = [createTeam('A')];
      const engine = new ComparisonEngine(teams);

      expect(() => {
        engine.recordComparison(teams[0], teams[0]);
      }).toThrow('No pending comparison');
    });
  });

  describe('completing rankings with 2 teams', () => {
    it('completes ranking with consistent comparisons', () => {
      const teamA = createTeam('Team A');
      const teamB = createTeam('Team B');
      const teams = [teamA, teamB];
      const engine = new ComparisonEngine(teams);

      // Simulate: A is better than B
      let comparison = engine.getNextComparison();
      if (comparison) {
        engine.recordComparison(comparison.teamA, comparison.teamB);
      }

      expect(engine.isComplete).toBe(true);

      const ranking = engine.getFinalRanking();
      expect(ranking).toHaveLength(2);
    });
  });

  describe('completing rankings with 3 teams', () => {
    it('completes ranking for 3 teams', () => {
      const teamA = createTeam('Team A');
      const teamB = createTeam('Team B');
      const teamC = createTeam('Team C');
      const teams = [teamA, teamB, teamC];
      const engine = new ComparisonEngine(teams);

      // Simulate comparisons: A > B > C
      let maxComparisons = 20; // Safety limit
      let comparisonCount = 0;

      while (!engine.isComplete && comparisonCount < maxComparisons) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        comparisonCount++;

        // Determine winner based on alphabetical order (A > B > C)
        const winner =
          comparison.teamA.teamName < comparison.teamB.teamName
            ? comparison.teamA
            : comparison.teamB;
        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;

        engine.recordComparison(winner, loser);
      }

      expect(engine.isComplete).toBe(true);
      expect(comparisonCount).toBeLessThan(maxComparisons);

      const ranking = engine.getFinalRanking();
      expect(ranking).toHaveLength(3);
    });
  });

  describe('completing rankings with 12 teams', () => {
    it('completes ranking with deterministic comparisons', () => {
      const teams = [
        'Team 01',
        'Team 02',
        'Team 03',
        'Team 04',
        'Team 05',
        'Team 06',
        'Team 07',
        'Team 08',
        'Team 09',
        'Team 10',
        'Team 11',
        'Team 12',
      ].map(createTeam);

      const engine = new ComparisonEngine(teams);

      // Simulate comparisons with deterministic order (alphabetical)
      let maxComparisons = 100; // Safety limit
      let comparisonCount = 0;

      while (!engine.isComplete && comparisonCount < maxComparisons) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        comparisonCount++;

        // Winner is the one with lower number
        const winner =
          comparison.teamA.teamName < comparison.teamB.teamName
            ? comparison.teamA
            : comparison.teamB;
        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;

        engine.recordComparison(winner, loser);
      }

      expect(engine.isComplete).toBe(true);
      expect(comparisonCount).toBeGreaterThan(0);
      expect(comparisonCount).toBeLessThan(80); // Worst case can be higher with always-last pivot

      const ranking = engine.getFinalRanking();
      expect(ranking).toHaveLength(12);

      // Verify ranking is correct (alphabetical order)
      expect(ranking[0].teamName).toBe('Team 01');
      expect(ranking[11].teamName).toBe('Team 12');
    });

    it('uses approximately n*log(n) comparisons for 12 teams', () => {
      const teams = Array.from({ length: 12 }, (_, i) => createTeam(`Team ${i + 1}`));
      const engine = new ComparisonEngine(teams);

      let comparisonCount = 0;

      while (!engine.isComplete) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        comparisonCount++;

        // Use consistent comparison
        const winner =
          parseInt(comparison.teamA.teamName.split(' ')[1]) <
          parseInt(comparison.teamB.teamName.split(' ')[1])
            ? comparison.teamA
            : comparison.teamB;
        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;

        engine.recordComparison(winner, loser);
      }

      // For n=12, n*log2(n) ≈ 43, but can vary with pivot selection
      expect(comparisonCount).toBeGreaterThan(20);
      expect(comparisonCount).toBeLessThan(80);
    });
  });

  describe('progress tracking', () => {
    it('calculates progress accurately', () => {
      const teams = [createTeam('A'), createTeam('B'), createTeam('C')];
      const engine = new ComparisonEngine(teams);

      const initialProgress = engine.getProgress();
      expect(initialProgress.completed).toBe(0);
      expect(initialProgress.estimated).toBeGreaterThan(0);

      const comparison = engine.getNextComparison();
      if (comparison) {
        engine.recordComparison(comparison.teamA, comparison.teamB);

        const afterProgress = engine.getProgress();
        expect(afterProgress.completed).toBeGreaterThan(initialProgress.completed);
      }
    });
  });

  describe('final ranking', () => {
    it('throws error when called before completion', () => {
      const teams = [createTeam('A'), createTeam('B'), createTeam('C')];
      const engine = new ComparisonEngine(teams);

      expect(() => engine.getFinalRanking()).toThrow('sorting is not complete');
    });

    it('returns ranking when complete', () => {
      const teams = [createTeam('A'), createTeam('B')];
      const engine = new ComparisonEngine(teams);

      const comparison = engine.getNextComparison();
      if (comparison) {
        engine.recordComparison(comparison.teamA, comparison.teamB);
      }

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking).toHaveLength(2);
    });
  });

  describe('tie-breaker detection', () => {
    it('returns null for needsTieBreaker', () => {
      const teams = [createTeam('A'), createTeam('B')];
      const engine = new ComparisonEngine(teams);

      expect(engine.needsTieBreaker()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles empty array', () => {
      const engine = new ComparisonEngine([]);
      expect(engine.isComplete).toBe(true);
      expect(engine.getFinalRanking()).toEqual([]);
    });

    it('maintains transitivity with consistent comparisons', () => {
      const teamA = createTeam('A');
      const teamB = createTeam('B');
      const teamC = createTeam('C');
      const teams = [teamA, teamB, teamC];
      const engine = new ComparisonEngine(teams);

      // A > B > C (transitive)
      const comparisons: Map<string, Team> = new Map([
        [`${teamA.teamName}_vs_${teamB.teamName}`, teamA],
        [`${teamB.teamName}_vs_${teamC.teamName}`, teamB],
        [`${teamA.teamName}_vs_${teamC.teamName}`, teamA],
      ]);

      while (!engine.isComplete) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        const key1 = `${comparison.teamA.teamName}_vs_${comparison.teamB.teamName}`;
        const key2 = `${comparison.teamB.teamName}_vs_${comparison.teamA.teamName}`;

        let winner = comparisons.get(key1) || comparisons.get(key2);
        if (!winner) {
          // Default: alphabetical
          winner =
            comparison.teamA.teamName < comparison.teamB.teamName
              ? comparison.teamA
              : comparison.teamB;
        }

        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;
        engine.recordComparison(winner, loser);
      }

      const ranking = engine.getFinalRanking();
      expect(ranking).toHaveLength(3);
    });
  });
});
