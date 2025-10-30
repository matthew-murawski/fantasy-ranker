/**
 * RosterList displays players organized by starters, bench, and IR sections.
 * Shows players in their roster slots with proper ordering.
 */

import { Team, Player } from '../../types';
import PlayerCard from '../PlayerCard';
import styles from './RosterList.module.css';

export interface RosterListProps {
  team: Team;
  showStarters?: boolean;
  showBench?: boolean;
  showIR?: boolean;
}

/**
 * Sorts starters by position order.
 * Expected order: QB, RB, RB, WR, WR, TE, FLEX, D/ST, K
 */
function sortStarters(players: Player[]): Player[] {
  const positionOrder: Record<string, number> = {
    'QB': 1,
    'RB': 2,
    'WR': 3,
    'TE': 4,
    'RB/WR/TE': 5, // FLEX
    'D/ST': 6,
    'K': 7,
  };

  return [...players].sort((a, b) => {
    const orderA = positionOrder[a.rosterSlot] || 99;
    const orderB = positionOrder[b.rosterSlot] || 99;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // For same position, maintain original order
    return 0;
  });
}

/**
 * Groups players by position.
 * Returns in order: QB, RB, WR, TE, D/ST, K
 */
function groupByPosition(players: Player[]): Map<string, Player[]> {
  const groups = new Map<string, Player[]>();
  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'D/ST', 'K'];

  // Initialize groups
  positionOrder.forEach(pos => groups.set(pos, []));

  // Group players
  players.forEach(player => {
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

function RosterList({
  team,
  showStarters = true,
  showBench = true,
  showIR = true,
}: RosterListProps) {
  const sortedStarters = sortStarters(team.starters);
  const groupedBench = groupByPosition(team.bench);
  const groupedIR = groupByPosition(team.ir);

  return (
    <div className={styles.container}>
      {/* STARTERS SECTION */}
      {showStarters && sortedStarters.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>STARTERS</h3>
          {sortedStarters.map((player, index) => {
            // Display FLEX as "FLEX" instead of "RB/WR/TE"
            const displayPlayer = player.rosterSlot === 'RB/WR/TE'
              ? { ...player, position: 'FLEX' }
              : player;

            // Add spacing after QB, last RB, and last WR for visual grouping
            const nextPlayer = sortedStarters[index + 1];
            const needsSpacing = nextPlayer && (
              (player.rosterSlot === 'QB') ||
              (player.rosterSlot === 'RB' && nextPlayer.rosterSlot !== 'RB') ||
              (player.rosterSlot === 'WR' && nextPlayer.rosterSlot !== 'WR')
            );

            return (
              <div key={`starter-${index}`} className={needsSpacing ? styles.positionGroup : undefined}>
                <PlayerCard
                  player={displayPlayer}
                  displayFormat="starter"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* BENCH SECTION */}
      {showBench && team.bench.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>BENCH</h3>
          {Array.from(groupedBench.entries()).map(([position, players]) => (
            <div key={`bench-${position}`}>
              {players.map((player, index) => (
                <PlayerCard
                  key={`bench-${position}-${index}`}
                  player={player}
                  displayFormat="bench"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* IR SECTION */}
      {showIR && team.ir.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>IR</h3>
          {Array.from(groupedIR.entries()).map(([position, players]) => (
            <div key={`ir-${position}`}>
              {players.map((player, index) => (
                <PlayerCard
                  key={`ir-${position}-${index}`}
                  player={player}
                  displayFormat="bench"
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RosterList;
