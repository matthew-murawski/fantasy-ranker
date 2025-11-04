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

  // Get the position class for the badge
  const getPositionClass = (pos: string): string => {
    const posLower = pos.toLowerCase().replace('/', '');
    // Map positions to CSS classes
    if (posLower === 'qb') return styles.qb;
    if (posLower === 'rb') return styles.rb;
    if (posLower === 'wr') return styles.wr;
    if (posLower === 'te') return styles.te;
    if (posLower === 'k') return styles.k;
    if (posLower === 'dst' || posLower === 'def') return styles.dst;
    if (posLower === 'flex') return styles.flex;
    if (posLower === 'bench' || posLower === 'be') return styles.bench;
    return ''; // default, no color
  };

  const positionClass = `${styles.positionLabel} ${getPositionClass(position)}`;

  // Check if this is an empty placeholder
  const isEmpty = playerName === 'EMPTY';

  // Format the display based on the format prop
  const renderContent = () => {
    if (displayFormat === 'starter') {
      // Starter format: "POSITION PlayerName (NFL_TEAM)"
      return (
        <>
          {showPosition && <span className={positionClass}>{position}</span>}
          <span className={styles.playerName}>{playerName}</span>
          {!isEmpty && nflTeam && <span className={styles.teamInfo}>({nflTeam})</span>}
          {showIRIndicator && isIR && <span className={styles.irIndicator}> (IR)</span>}
        </>
      );
    } else {
      // Bench or position-group format: "POSITION PlayerName (NFL_TEAM)"
      return (
        <>
          {showPosition && <span className={positionClass}>{position} </span>}
          <span className={styles.playerName}>{playerName}</span>
          {!isEmpty && nflTeam && <span className={styles.teamInfo}>({nflTeam})</span>}
          {showIRIndicator && isIR && <span className={styles.irIndicator}> (IR)</span>}
        </>
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
