/**
 * LeagueSelectionPage displays buttons to navigate to each of the three fantasy leagues.
 * This is the root landing page shown at /fantasy-ranker/
 */

import { Link } from 'react-router-dom';
import styles from './LeagueSelectionPage.module.css';

export default function LeagueSelectionPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fantasy Ranker</h1>
      <p className={styles.description}>
        You'll compare teams head-to-head, choosing which roster you'd rather have.
        Your choices train a ranking algorithm that reveals the true power rankings!
      </p>

      <div className={styles.leagueSelection}>
        <h2 className={styles.leagueTitle}>Choose Your League</h2>
        <div className={styles.leagueButtons}>
          <Link to="/dub" className={styles.leagueButton}>
            Go to Dub League
          </Link>
          <Link to="/pitt" className={styles.leagueButton}>
            Go to Pitt League
          </Link>
          <Link to="/men" className={styles.leagueButton}>
            Go to Men League
          </Link>
        </div>
      </div>
    </div>
  );
}
