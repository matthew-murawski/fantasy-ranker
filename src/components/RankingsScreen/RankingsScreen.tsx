/**
 * RankingsScreen displays the final power rankings with expandable team cards.
 */

import { useState } from 'react';
import { Team } from '../../types';
import TeamRankingCard from '../TeamRankingCard';
import styles from './RankingsScreen.module.css';

export interface RankingsScreenProps {
  rankedTeams: Team[]; // ordered best to worst
  onRestart?: () => void;
}

function RankingsScreen({ rankedTeams, onRestart }: RankingsScreenProps) {
  // Track expanded cards. Allow multiple expansions.
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>POWER RANKINGS</h1>
      <div className={styles.list}>
        {rankedTeams.map((team, i) => (
          <TeamRankingCard
            key={`${team.teamName}-${i}`}
            team={team}
            rank={i + 1}
            isExpanded={expanded.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.restartButton}
          onClick={onRestart}
          aria-label="Rank again"
        >
          Rank Again
        </button>
      </div>
    </div>
  );
}

export default RankingsScreen;
