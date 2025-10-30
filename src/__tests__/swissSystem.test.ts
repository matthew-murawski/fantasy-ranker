/**
 * Tests for Swiss System implementation
 */

import { describe, it, expect } from 'vitest';
import { SwissComparisonEngine } from '../engine/swissComparisonEngine';
import { Team } from '../types';
import { createMockTeam } from './fixtures/teams';

describe('Swiss System', () => {
  const createTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, i) => createMockTeam(`Team ${i + 1}`));
  };

  describe('Team count validation', () => {
    it('works with 8 teams', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      const progress = engine.getProgress();
      expect(engine.getNextComparison()).not.toBeNull();

      // 8 teams: ceil(log2(8)) = 3 rounds
      // Comparisons: (8/2) * 3 = 12 Swiss rounds
      // Estimate: 12 + floor(8 * 0.15) = 12 + 1 = 13
      expect(progress.estimated).toBe(13);
    });

    it('works with 10 teams', () => {
      const teams = createTeams(10);
      const engine = new SwissComparisonEngine(teams);

      const progress = engine.getProgress();
      expect(engine.getNextComparison()).not.toBeNull();

      // 10 teams: ceil(log2(10)) = 4 rounds
      // Comparisons: (10/2) * 4 = 20 Swiss rounds
      // Estimate: 20 + floor(10 * 0.15) = 20 + 1 = 21
      expect(progress.estimated).toBe(21);
    });

    it('works with 12 teams', () => {
      const teams = createTeams(12);
      const engine = new SwissComparisonEngine(teams);

      const progress = engine.getProgress();
      expect(engine.getNextComparison()).not.toBeNull();

      // 12 teams: ceil(log2(12)) = 4 rounds
      // Comparisons: (12/2) * 4 = 24 Swiss rounds
      // Estimate: 24 + floor(12 * 0.15) = 24 + 1 = 25
      expect(progress.estimated).toBe(25);
    });

    it('works with odd number of teams (handles byes)', () => {
      const teams = createTeams(9);
      const engine = new SwissComparisonEngine(teams);

      expect(engine.getNextComparison()).not.toBeNull();
      expect(engine.isComplete).toBe(false);
    });
  });

  describe('First round pairing', () => {
    it('creates correct number of matchups for even teams', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      // Should have 4 matchups in first round (8/2)
      let comparisonCount = 0;
      while (engine.getNextComparison() && comparisonCount < 4) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;
        engine.recordComparison(comparison.teamA, comparison.teamB);
        comparisonCount++;
      }

      expect(comparisonCount).toBe(4);
    });

    it('creates correct number of matchups for odd teams', () => {
      const teams = createTeams(9);
      const engine = new SwissComparisonEngine(teams);

      // Should have 4 matchups in first round (9/2 = 4, with one bye)
      // Complete only first round (4 comparisons)
      let comparisonCount = 0;
      for (let i = 0; i < 4; i++) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;
        engine.recordComparison(comparison.teamA, comparison.teamB);
        comparisonCount++;
      }

      // First round complete with 4 comparisons (9th team got bye)
      expect(comparisonCount).toBe(4);
      // Should still have more rounds to go
      expect(engine.getNextComparison()).not.toBeNull();
    });
  });

  describe('Progress tracking', () => {
    it('tracks completed comparisons correctly', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      let progress = engine.getProgress();
      expect(progress.completed).toBe(0);

      // Make one comparison
      const comparison = engine.getNextComparison();
      if (comparison) {
        engine.recordComparison(comparison.teamA, comparison.teamB);
        progress = engine.getProgress();
        expect(progress.completed).toBe(1);
      }
    });
  });

  describe('Final ranking', () => {
    it('produces ranking after first round completion', () => {
      const teams = createTeams(4);
      const engine = new SwissComparisonEngine(teams);

      // Complete all comparisons in first round
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;
        engine.recordComparison(comparison.teamA, comparison.teamB);
      }

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(4);
    });
  });
});
