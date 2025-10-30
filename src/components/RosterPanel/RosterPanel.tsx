/**
 * RosterPanel wraps roster views and provides view toggle functionality.
 * Allows switching between starters/bench view and position-grouped view.
 */

import { Team } from '../../types';
import RosterList from '../RosterList';
import PositionGroupedView from '../PositionGroupedView';
import styles from './RosterPanel.module.css';

export interface RosterPanelProps {
  team: Team;
  viewMode: 'starters' | 'position';
  onViewModeChange: (mode: 'starters' | 'position') => void;
  showViewToggle?: boolean;
}

function RosterPanel({
  team,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: RosterPanelProps) {
  return (
    <div className={styles.container}>
      {/* View Toggle Buttons */}
      {showViewToggle && (
        <div className={styles.toggleContainer}>
          <button
            aria-label="Show starters and bench"
            className={viewMode === 'starters' ? styles.buttonActive : styles.buttonInactive}
            onClick={() => viewMode !== 'starters' && onViewModeChange('starters')}
            disabled={viewMode === 'starters'}
          >
            Starters/Bench
          </button>
          <button
            aria-label="Show roster by position"
            className={viewMode === 'position' ? styles.buttonActive : styles.buttonInactive}
            onClick={() => viewMode !== 'position' && onViewModeChange('position')}
            disabled={viewMode === 'position'}
          >
            By Position
          </button>
        </div>
      )}

      {/* Roster Content */}
      <div className={styles.content}>
        {viewMode === 'starters' ? (
          <RosterList team={team} />
        ) : (
          <PositionGroupedView team={team} />
        )}
      </div>
    </div>
  );
}

export default RosterPanel;
