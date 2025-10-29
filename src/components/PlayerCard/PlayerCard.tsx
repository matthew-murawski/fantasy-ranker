/**
 * PlayerCard displays a single player's information in various formats.
 * Supports starter, bench, and position-grouped display modes.
 */

import { Player } from '../../types';
import styles from './PlayerCard.module.css';

export interface PlayerCardProps {
  player: Player;
  displayFormat: 'starter' | 'bench' | 'position-group';
  showPosition?: boolean;
  showIRIndicator?: boolean;
}

function PlayerCard({
  player,
  displayFormat,
  showPosition = true,
  showIRIndicator = false
}: PlayerCardProps) {
  const { playerName, position, nflTeam, isIR } = player;

  // Format the display based on the format prop
  const renderContent = () => {
    if (displayFormat === 'starter') {
      // Starter format: "POSITION | PlayerName (NFL_TEAM)"
      return (
        <>
          {showPosition && <span className={styles.positionLabel}>{position}</span>}
          {showPosition && <span className={styles.separator}>|</span>}
          <span className={styles.playerInfo}>
            {playerName} ({nflTeam})
            {showIRIndicator && isIR && ' (IR)'}
          </span>
        </>
      );
    } else {
      // Bench or position-group format: "POSITION PlayerName (NFL_TEAM)"
      return (
        <span className={styles.playerInfo}>
          {showPosition && `${position} `}
          {playerName} ({nflTeam})
          {showIRIndicator && isIR && ' (IR)'}
        </span>
      );
    }
  };

  return (
    <div className={styles.card}>
      {renderContent()}
    </div>
  );
}

export default PlayerCard;
