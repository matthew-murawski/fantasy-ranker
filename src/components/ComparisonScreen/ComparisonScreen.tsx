/**
 * ComparisonScreen displays two rosters side-by-side for head-to-head evaluation.
 * Supports view toggling (starters vs position) and selection via buttons or keyboard.
 */

import { useState, useEffect } from 'react';
import { ComparisonPair, Team } from '../../types';
import RosterPanel from '../RosterPanel';
import ArrowButton from '../ArrowButton';
import ProgressBar from '../ProgressBar';
import styles from './ComparisonScreen.module.css';

export interface ComparisonScreenProps {
  comparison: ComparisonPair;
  onSelectWinner: (winner: Team) => void;
  progress: { completed: number; estimated: number };
}

function ComparisonScreen({
  comparison,
  onSelectWinner,
  progress,
}: ComparisonScreenProps) {
  // Manage view mode internally
  const [viewMode, setViewMode] = useState<'starters' | 'position'>('starters');

  const { teamA, teamB } = comparison;

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onSelectWinner(teamA);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onSelectWinner(teamB);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [teamA, teamB, onSelectWinner]);

  return (
    <div className={styles.container}>
      {/* Progress bar at top - sticky */}
      <div className={styles.progressContainer}>
        <ProgressBar completed={progress.completed} total={progress.estimated} />
      </div>

      {/* View toggle buttons - top left */}
      <div className={styles.viewToggle}>
        <button
          aria-label="Show starters and bench"
          className={viewMode === 'starters' ? styles.toggleActive : styles.toggleInactive}
          onClick={() => setViewMode('starters')}
        >
          Starters/Bench
        </button>
        <button
          aria-label="Show roster by position"
          className={viewMode === 'position' ? styles.toggleActive : styles.toggleInactive}
          onClick={() => setViewMode('position')}
        >
          By Position
        </button>
      </div>

      {/* Instruction text */}
      <p className={styles.instructionText}>
        click or use arrow keys to choose the best team
      </p>

      {/* Arrow buttons at top, aligned with roster panels */}
      <div className={styles.buttonContainer}>
        <ArrowButton direction="left" onClick={() => onSelectWinner(teamA)} />
        <ArrowButton direction="right" onClick={() => onSelectWinner(teamB)} />
      </div>

      {/* Two-column roster layout */}
      <div className={styles.rosterContainer}>
        <div className={styles.rosterPanel}>
          <RosterPanel
            team={teamA}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggle={false}
          />
        </div>
        <div className={styles.rosterPanel}>
          <RosterPanel
            team={teamB}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggle={false}
          />
        </div>
      </div>
    </div>
  );
}

export default ComparisonScreen;
