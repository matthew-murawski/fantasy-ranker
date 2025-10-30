/**
 * TeamRankingCard displays a ranked team entry and can expand to show its roster.
 * Clicking the card toggles expansion (controlled by parent).
 */

import { Team } from '../../types';
import RosterList from '../RosterList';
import styles from './TeamRankingCard.module.css';

export interface TeamRankingCardProps {
  team: Team;
  rank: number; // 1-based rank
  isExpanded: boolean;
  onToggle: () => void;
}

function TeamRankingCard({ team, rank, isExpanded, onToggle }: TeamRankingCardProps) {
  return (
    <div className={styles.card} onClick={onToggle} role="button" aria-expanded={isExpanded}>
      <div className={styles.header}>
        <span className={styles.rank}>{rank}.</span>{' '}
        <span className={styles.name}>{team.teamName}</span>
      </div>
      <div className={`${styles.expandable} ${isExpanded ? styles.expanded : ''}`}>
        {isExpanded && (
          <div className={styles.roster}>
            <RosterList team={team} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamRankingCard;

