/**
 * Tests for dynamic team count support (6-16+ teams)
 */

import { describe, it, expect } from 'vitest';
import { SwissComparisonEngine } from '../engine/swissComparisonEngine';
import { Team } from '../types';
import { createMockTeam } from './fixtures/teams';

describe('Dynamic Team Count Support', () => {
  const createTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, i) => createMockTeam(`Team ${i + 1}`));
  };

  const completeAllComparisons = (engine: SwissComparisonEngine): number => {
    let count = 0;
    while (engine.getNextComparison()) {
      const comparison = engine.getNextComparison();
      if (!comparison) break;
      engine.recordComparison(comparison.teamA, comparison.teamB);
      count++;
    }
    return count;
  };

  describe('Minimum team counts', () => {
    it('handles 2 teams', () => {
      const teams = createTeams(2);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBe(1); // Single round, one comparison
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(2);
    });

    it('handles 4 teams', () => {
      const teams = createTeams(4);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(4);
    });

    it('handles 6 teams', () => {
      const teams = createTeams(6);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(6);
    });
  });

  describe('Standard league sizes', () => {
    it('handles 8 teams', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBeGreaterThanOrEqual(12);
      expect(total).toBeLessThanOrEqual(15);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(8);
    });

    it('handles 10 teams', () => {
      const teams = createTeams(10);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBeGreaterThanOrEqual(20);
      expect(total).toBeLessThanOrEqual(25);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(10);
    });

    it('handles 12 teams', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBeGreaterThanOrEqual(24);
      expect(total).toBeLessThanOrEqual(30);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(12);
    });

    it('handles 14 teams', () => {
      const teams = createTeams(14);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBeGreaterThanOrEqual(28);
      expect(total).toBeLessThanOrEqual(35);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(14);
    });
  });

  describe('Larger leagues', () => {
    it('handles 16 teams', () => {
      const teams = createTeams(16);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      expect(total).toBeGreaterThanOrEqual(32);
      expect(total).toBeLessThanOrEqual(40);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(16);
    });

    it('handles 20 teams', () => {
      const teams = createTeams(20);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(20);
    });
  });

  describe('Comparison count efficiency', () => {
    it('uses fewer comparisons than quicksort for 12 teams', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      const total = completeAllComparisons(engine);

      // Quicksort for 12 teams: ~40 comparisons
      // Swiss System: ~24-28 comparisons
      expect(total).toBeLessThan(40);
    });

    it('comparison count scales logarithmically', () => {
      // Test that comparison count grows reasonably with team count
      const sizes = [4, 8, 12, 16];
      const counts: number[] = [];

      sizes.forEach(size => {
        const teams = createTeams(size);
        const engine = new SwissComparisonEngine(teams);
        const count = completeAllComparisons(engine);
        counts.push(count);
      });

      // Each doubling should roughly add n comparisons
      // 4→8: should add ~8-10
      // 8→12: should add ~12-14
      // 12→16: should add ~8-10
      expect(counts[1] - counts[0]).toBeLessThan(15);
      expect(counts[2] - counts[1]).toBeLessThan(20);
      expect(counts[3] - counts[2]).toBeLessThan(15);
    });
  });

  describe('Validation', () => {
    it('handles 0 teams gracefully', () => {
      const engine = new SwissComparisonEngine([]);
      expect(engine.isComplete).toBe(true);
      expect(engine.getNextComparison()).toBeNull();
    });

    it('handles 1 team gracefully', () => {
      const engine = new SwissComparisonEngine(createTeams(1));
      expect(engine.isComplete).toBe(true);
      expect(engine.getNextComparison()).toBeNull();
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(1);
    });

    it('throws error for duplicate team names', () => {
      const teams = [
        createMockTeam('Team A'),
        createMockTeam('Team A'), // Duplicate
        createMockTeam('Team B'),
      ];
      expect(() => new SwissComparisonEngine(teams)).toThrow('Duplicate team name');
    });

    it('throws error for empty team name', () => {
      const teams = [
        createMockTeam('Team A'),
        createMockTeam(''), // Empty name
      ];
      expect(() => new SwissComparisonEngine(teams)).toThrow('has no name');
    });
  });
});
