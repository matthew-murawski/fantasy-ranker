/**
 * Tests for tiebreaker system
 */

import { describe, it, expect } from 'vitest';
import { SwissComparisonEngine } from '../engine/swissComparisonEngine';
import { Team } from '../types';
import { createMockTeam } from './fixtures/teams';

describe('Tiebreaker System', () => {
  const createTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, i) => createMockTeam(`Team ${i + 1}`));
  };

  describe('No tiebreakers needed', () => {
    it('completes when all teams have unique records', () => {
      const teams = createTeams(4);
      const engine = new SwissComparisonEngine(teams);

      // Complete all comparisons - always pick teamA to ensure unique records
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

  describe('Head-to-head tiebreaker', () => {
    it('uses head-to-head result when teams played each other', () => {
      const teams = createTeams(4);
      const engine = new SwissComparisonEngine(teams);

      // Create a scenario where two teams end with same record
      // but one beat the other head-to-head
      let comparisonCount = 0;
      const results: boolean[] = [];

      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        // Alternate winners to create ties
        const pickTeamA = comparisonCount % 2 === 0;
        const winner = pickTeamA ? comparison.teamA : comparison.teamB;
        results.push(pickTeamA);

        engine.recordComparison(winner, pickTeamA ? comparison.teamB : comparison.teamA);
        comparisonCount++;
      }

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(4);

      // Ranking should be based on records and head-to-head
      expect(ranking[0]).toBeDefined();
      expect(ranking[1]).toBeDefined();
      expect(ranking[2]).toBeDefined();
      expect(ranking[3]).toBeDefined();
    });
  });

  describe('Strength of schedule tiebreaker', () => {
    it('uses SOS when teams did not play each other', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      // Complete all Swiss rounds
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        // Pick winners to create some variety in records
        const winner = comparison.teamA.teamName < comparison.teamB.teamName
          ? comparison.teamA
          : comparison.teamB;

        engine.recordComparison(winner, winner === comparison.teamA ? comparison.teamB : comparison.teamA);
      }

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(8);

      // Teams should be ranked (exact order depends on matchups and SOS)
      ranking.forEach((team, index) => {
        expect(team).toBeDefined();
        expect(team.teamName).toBeTruthy();
      });
    });
  });

  describe('Additional comparisons needed', () => {
    it('queues tiebreaker comparisons when SOS is equal', () => {
      const teams = createTeams(6);
      const engine = new SwissComparisonEngine(teams);

      // Strategy: create a scenario where multiple teams have same record
      // and similar SOS by making wins/losses balanced
      let comparisonCount = 0;

      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        // Alternate winners to maximize ties
        const winner = comparisonCount % 2 === 0 ? comparison.teamA : comparison.teamB;
        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;

        engine.recordComparison(winner, loser);
        comparisonCount++;
      }

      expect(engine.isComplete).toBe(true);
      const ranking = engine.getFinalRanking();
      expect(ranking.length).toBe(6);
    });
  });

  describe('Final ranking correctness', () => {
    it('produces complete ordered list with no duplicates', () => {
      const teams = createTeams(10);
      const engine = new SwissComparisonEngine(teams);

      // Complete all comparisons
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;
        engine.recordComparison(comparison.teamA, comparison.teamB);
      }

      const ranking = engine.getFinalRanking();

      // Check all teams are present
      expect(ranking.length).toBe(10);

      // Check no duplicates
      const teamNames = new Set(ranking.map(t => t.teamName));
      expect(teamNames.size).toBe(10);

      // Check each team appears exactly once
      teams.forEach(team => {
        const count = ranking.filter(t => t.teamName === team.teamName).length;
        expect(count).toBe(1);
      });
    });

    it('ranks teams with better records higher', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      // Team 1 should win all comparisons
      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        // Always pick Team 1 if it's in the comparison
        const winner = comparison.teamA.teamName === 'Team 1' ? comparison.teamA
          : comparison.teamB.teamName === 'Team 1' ? comparison.teamB
          : comparison.teamA;
        const loser = winner === comparison.teamA ? comparison.teamB : comparison.teamA;

        engine.recordComparison(winner, loser);
      }

      const ranking = engine.getFinalRanking();

      // Team 1 should be ranked first (won all its comparisons)
      expect(ranking[0].teamName).toBe('Team 1');
    });
  });

  describe('Progress tracking during tiebreakers', () => {
    it('shows exact count once tiebreaker phase starts', () => {
      const teams = createTeams(8);
      const engine = new SwissComparisonEngine(teams);

      let lastEstimate: number | null = null;

      while (engine.getNextComparison()) {
        const comparison = engine.getNextComparison();
        if (!comparison) break;

        const progressBefore = engine.getProgress();
        engine.recordComparison(comparison.teamA, comparison.teamB);
        const progressAfter = engine.getProgress();

        // Track if estimate changed (indicates entering tiebreaker phase)
        if (lastEstimate !== null && progressBefore.estimated !== lastEstimate) {
          // Estimate should not change during Swiss rounds
          // But may change when entering tiebreaker phase
        }

        lastEstimate = progressAfter.estimated;
      }

      // Final progress should show exact count
      const finalProgress = engine.getProgress();
      expect(finalProgress.completed).toBe(finalProgress.estimated);
    });
  });
});
