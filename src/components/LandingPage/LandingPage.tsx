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

