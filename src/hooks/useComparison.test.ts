/**
 * Tests for useComparison hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComparison } from './useComparison';
import { Team } from '../types';
import { createMockTeam } from '../__tests__/fixtures/teams';

describe('useComparison', () => {
  const createTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, i) => createMockTeam(`Team ${i + 1}`));
  };

  it('hook initializes with first comparison', () => {
    const teams = createTeams(3);
    const { result } = renderHook(() => useComparison(teams));

    expect(result.current.currentComparison).not.toBeNull();
    expect(result.current.isComplete).toBe(false);
    expect(result.current.finalRanking).toBeNull();
  });

  it('selecting winner gets next comparison', () => {
    const teams = createTeams(3);
    const { result } = renderHook(() => useComparison(teams));

    const firstComparison = result.current.currentComparison;
    expect(firstComparison).not.toBeNull();

    act(() => {
      result.current.selectWinner(firstComparison!.teamA);
    });

    // Should have a new comparison (or be complete)
    expect(
      result.current.currentComparison !== firstComparison || result.current.isComplete
    ).toBe(true);
  });

  it('progress updates after each selection', () => {
    const teams = createTeams(3);
    const { result } = renderHook(() => useComparison(teams));

    const initialProgress = result.current.progress.completed;

    const comparison = result.current.currentComparison;
    if (comparison) {
      act(() => {
        result.current.selectWinner(comparison.teamA);
      });
    }

    // Progress should have increased
    expect(result.current.progress.completed).toBeGreaterThan(initialProgress);
  });

  it('isComplete becomes true after enough comparisons', () => {
    const teams = createTeams(3);
    const { result } = renderHook(() => useComparison(teams));

    // Make comparisons until complete
    let iterations = 0;
    const maxIterations = 20; // Safety limit

    while (!result.current.isComplete && iterations < maxIterations) {
      const comparison = result.current.currentComparison;
      if (comparison) {
        act(() => {
          result.current.selectWinner(comparison.teamA);
        });
      }
      iterations++;
    }

    expect(result.current.isComplete).toBe(true);
  });

  it('finalRanking is available when complete', () => {
    const teams = createTeams(3);
    const { result } = renderHook(() => useComparison(teams));

    // Complete all comparisons
    let iterations = 0;
    const maxIterations = 20;

    while (!result.current.isComplete && iterations < maxIterations) {
      const comparison = result.current.currentComparison;
      if (comparison) {
        act(() => {
          result.current.selectWinner(comparison.teamA);
        });
      }
      iterations++;
    }

    expect(result.current.finalRanking).not.toBeNull();
    expect(result.current.finalRanking?.length).toBe(3);
  });

  it('works correctly with different team counts', () => {
    // Test with 2 teams
    const twoTeams = createTeams(2);
    const { result: result2 } = renderHook(() => useComparison(twoTeams));

    let iterations = 0;
    while (!result2.current.isComplete && iterations < 10) {
      const comparison = result2.current.currentComparison;
      if (comparison) {
        act(() => {
          result2.current.selectWinner(comparison.teamA);
        });
      }
      iterations++;
    }

    expect(result2.current.isComplete).toBe(true);
    expect(result2.current.finalRanking?.length).toBe(2);

    // Test with 12 teams
    const twelveTeams = createTeams(12);
    const { result: result12 } = renderHook(() => useComparison(twelveTeams));

    iterations = 0;
    while (!result12.current.isComplete && iterations < 100) {
      const comparison = result12.current.currentComparison;
      if (comparison) {
        act(() => {
          result12.current.selectWinner(comparison.teamA);
        });
      }
      iterations++;
    }

    expect(result12.current.isComplete).toBe(true);
    expect(result12.current.finalRanking?.length).toBe(12);
    expect(iterations).toBeLessThan(80); // Should complete in reasonable number of comparisons
  });

  it('currentComparison is null when complete', () => {
    const teams = createTeams(2);
    const { result } = renderHook(() => useComparison(teams));

    // Complete all comparisons
    while (!result.current.isComplete) {
      const comparison = result.current.currentComparison;
      if (comparison) {
        act(() => {
          result.current.selectWinner(comparison.teamA);
        });
      }
    }

    expect(result.current.currentComparison).toBeNull();
  });
});
