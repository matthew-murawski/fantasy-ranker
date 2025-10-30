/**
 * Tests for Swiss System round advancement and pairing
 */

import { describe, it, expect } from 'vitest';
import { SwissComparisonEngine } from '../engine/swissComparisonEngine';
import { Team } from '../types';
import { createMockTeam } from './fixtures/teams';

describe('Swiss System Round Advancement', () => {
  const createTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, i) => createMockTeam(`Team ${i + 1}`));
  };

  const completeAllComparisons = (engine: SwissComparisonEngine): number => {
    let count = 0;
    while (engine.getNextComparison()) {
      const comparison = engine.getNextComparison();
      if (!comparison) break;
      // Always pick teamA as winner for consistency
      engine.recordComparison(comparison.teamA, comparison.teamB);
      count++;
    }
    return count;
  };

  describe('8 teams (3 rounds)', () => {
    it('completes all 3 rounds seamlessly', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      // 8 teams: 3 rounds, 4 comparisons per round = 12 total
      const totalComparisons = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(totalComparisons).toBe(12);
    });

    it('produces final ranking after all rounds', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      completeAllComparisons(engine);

      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(8);
      expect(ranking[0].teamName).toBe('Team 1'); // Team 1 won all comparisons
    });

    it('tracks progress correctly through all rounds', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      let lastProgress = 0;
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        const progressBefore = engine.getProgress();
        engine.recordComparison(comparison.teamA, comparison.teamB);
        const progressAfter = engine.getProgress();

        expect(progressAfter.completed).toBe(progressBefore.completed + 1);
        expect(progressAfter.completed).toBeGreaterThan(lastProgress);
        lastProgress = progressAfter.completed;
      }

      expect(lastProgress).toBe(12);
    });
  });

  describe('10 teams (4 rounds)', () => {
    it('completes all 4 rounds seamlessly', () => {
      const teams = createTeams(10);
      const engine = new SwissComparisonEngine(teams);

      // 10 teams: 4 rounds, 5 comparisons per round = 20 Swiss rounds
      // Plus possible tiebreaker comparisons
      const totalComparisons = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      // Should have at least 20 Swiss comparisons, possibly more with tiebreakers
      expect(totalComparisons).toBeGreaterThanOrEqual(20);
      expect(totalComparisons).toBeLessThanOrEqual(25); // Reasonable upper bound
    });

    it('produces final ranking after all rounds', () => {
      const teams = createTeams(10);
      const engine = new SwissComparisonEngine(teams);

      completeAllComparisons(engine);

      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(10);
    });
  });

  describe('12 teams (4 rounds)', () => {
    it('completes all 4 rounds seamlessly', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      // 12 teams: 4 rounds, 6 comparisons per round = 24 total
      const totalComparisons = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(totalComparisons).toBe(24);
    });

    it('produces final ranking after all rounds', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      completeAllComparisons(engine);

      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(12);
    });

    it('no team faces the same opponent twice', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      const matchupPairs = new Set<string>();

      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        // Create a sorted pair key to detect rematches
        const pairKey = [comparison.teamA.teamName, comparison.teamB.teamName]
          .sort()
          .join(' vs ');

        // Check for rematch
        expect(matchupPairs.has(pairKey)).toBe(false);
        matchupPairs.add(pairKey);

        engine.recordComparison(comparison.teamA, comparison.teamB);
      }
    });
  });

  describe('Odd team counts with byes', () => {
    it('handles 9 teams correctly', () => {
      const teams = createTeams(9);
      const engine = new SwissComparisonEngine(teams);

      // 9 teams: 4 rounds, 4 comparisons per round (1 bye each round) = 16 total
      const totalComparisons = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(totalComparisons).toBe(16);

      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(9);
    });

    it('handles 7 teams correctly', () => {
      const teams = createTeams(7);
      const engine = new SwissComparisonEngine(teams);

      // 7 teams: 3 rounds, 3 comparisons per round (1 bye each round) = 9 Swiss rounds
      // Plus possible tiebreaker comparisons
      const totalComparisons = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      // Should have at least 9 Swiss comparisons, possibly more with tiebreakers
      expect(totalComparisons).toBeGreaterThanOrEqual(9);
      expect(totalComparisons).toBeLessThanOrEqual(12); // Reasonable upper bound

      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(7);
    });
  });

  describe('Round transitions', () => {
    it('transitions seamlessly without user intervention', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      // Complete first round (4 comparisons)
      for (let i = 0; i < 4; i++) {
        const comparison = engine.getNextComparison();
        expect(comparison).not.toBeNull();
        if (comparison) {
          engine.recordComparison(comparison.teamA, comparison.teamB);
        }
      }

      // Next comparison should be from round 2 (seamless transition)
      const nextComparison = engine.getNextComparison();
      expect(nextComparison).not.toBeNull();
      expect(engine.isComplete).toBe(false);
    });

    it('user sees continuous flow of comparisons', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      const comparisons: string[] = [];

      // Collect all comparisons
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        comparisons.push(`${comparison.teamA.teamName} vs ${comparison.teamB.teamName}`);
        engine.recordComparison(comparison.teamA, comparison.teamB);
      }

      // Should have 12 comparisons with no gaps
      expect(comparisons.length).toBe(12);

      // Verify continuous flow (no indication of rounds to user)
      expect(engine.isComplete).toBe(true);
    });
  });
});
