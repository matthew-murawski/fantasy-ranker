/**
 * PositionGroupedView displays all players organized by position.
 * Shows all players (starters, bench, IR) grouped together by position.
 */

import { Team, Player } from '../../types';
import PlayerCard from '../PlayerCard';
import styles from './PositionGroupedView.module.css';

export interface PositionGroupedViewProps {
  team: Team;
}

/**
 * Maps position codes to full position names.
 */
function getPositionHeader(position: string): string {
  const headers: Record<string, string> = {
    'QB': 'QUARTERBACKS',
    'RB': 'RUNNING BACKS',
    'WR': 'WIDE RECEIVERS',
    'TE': 'TIGHT ENDS',
    'D/ST': 'D/ST',
    'K': 'KICKERS',
  };

  return headers[position] || position;
}

/**
 * Groups ALL players (starters, bench, IR) by position.
 * Returns in order: QB, RB, WR, TE, D/ST, K
 */
function getAllPlayersByPosition(team: Team): Map<string, Player[]> {
  const groups = new Map<string, Player[]>();
  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'D/ST', 'K'];

  // Initialize groups
  positionOrder.forEach(pos => groups.set(pos, []));

  // Group all players
  team.players.forEach(player => {
    const pos = player.position;
    if (!groups.has(pos)) {
      groups.set(pos, []);
    }
    groups.get(pos)!.push(player);
  });

  // Return only non-empty groups in order
  const result = new Map<string, Player[]>();
  positionOrder.forEach(pos => {
    const playersInPos = groups.get(pos) || [];
    if (playersInPos.length > 0) {
      result.set(pos, playersInPos);
    }
  });

  return result;
}

function PositionGroupedView({ team }: PositionGroupedViewProps) {
  const groupedPlayers = getAllPlayersByPosition(team);

  return (
    <div className={styles.container}>
      {Array.from(groupedPlayers.entries()).map(([position, players]) => (
        <div key={position} className={styles.section}>
          <h3 className={styles.sectionHeader}>{getPositionHeader(position)}</h3>
          {players.map((player, index) => (
            <PlayerCard
              key={`${position}-${index}`}
              player={player}
              displayFormat="position-group"
              showIRIndicator={true}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default PositionGroupedView;
