/**
 * useComparison hook manages the comparison state and flow.
 * Uses ComparisonEngine to track comparisons and generate rankings.
 */

import { useState, useRef, useCallback } from 'react';
import { Team, ComparisonPair } from '../types';
import { SwissComparisonEngine } from '../engine/swissComparisonEngine';

export interface UseComparisonReturn {
  currentComparison: ComparisonPair | null;
  progress: { completed: number; estimated: number };
  isComplete: boolean;
  selectWinner: (winner: Team) => void;
  finalRanking: Team[] | null;
}

export function useComparison(teams: Team[]): UseComparisonReturn {
  // Create SwissComparisonEngine instance once
  const engineRef = useRef<SwissComparisonEngine>(new SwissComparisonEngine(teams));

  // Track current comparison
  const [currentComparison, setCurrentComparison] = useState<ComparisonPair | null>(
    engineRef.current.getNextComparison()
  );

  // Track completion state
  const [isComplete, setIsComplete] = useState(false);

  // Track final ranking
  const [finalRanking, setFinalRanking] = useState<Team[] | null>(null);

  // Get progress
  const progress = engineRef.current.getProgress();

  // Handle winner selection
  const selectWinner = useCallback(
    (winner: Team) => {
      const engine = engineRef.current;

      // Find the loser (the other team in current comparison)
      if (!currentComparison) return;

      const loser =
        currentComparison.teamA === winner ? currentComparison.teamB : currentComparison.teamA;

      // Record the comparison
      engine.recordComparison(winner, loser);

      // Check for tie-breaker
      const tieBreaker = engine.needsTieBreaker();
      if (tieBreaker) {
        setCurrentComparison(tieBreaker);
        return;
      }

      // Get next comparison
      const nextComparison = engine.getNextComparison();

      if (nextComparison) {
        setCurrentComparison(nextComparison);
      } else {
        // Ranking is complete
        setIsComplete(true);
        setCurrentComparison(null);
        setFinalRanking(engine.getFinalRanking());
      }
    },
    [currentComparison]
  );

  return {
    currentComparison,
    progress,
    isComplete,
    selectWinner,
    finalRanking,
  };
}
