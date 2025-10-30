/**
 * LandingPage displays the app title and a start button.
 * Uses theme variables and global font to match the app style.
 */

import styles from './LandingPage.module.css';

export interface LandingPageProps {
  onStart: () => void;
}

function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dub Fantasy Ranker</h1>
      <p className={styles.description}>
        You'll compare teams head-to-head in a series of matchups. Use the arrow keys (or click the arrows) to choose which roster is stronger. After all comparisons, you'll get a complete power ranking of your league.
      </p>
      <button
        type="button"
        className={styles.startButton}
        onClick={onStart}
        aria-label="Start ranking"
      >
        START
      </button>
    </div>
  );
}

export default LandingPage;
