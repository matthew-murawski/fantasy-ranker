/**
 * LandingPage displays the league-specific app title and a start button.
 * After clicking START, prompts for the ranker's name.
 * League is determined by the URL route (/:league parameter).
 * Uses theme variables and global font to match the app style.
 */

import { useState } from 'react';
import styles from './LandingPage.module.css';

export interface LandingPageProps {
  leagueName: string; // e.g., 'dub', 'pitt', 'men'
  onLeagueSelect: (leagueName: string, rankerName: string) => void;
}

// Helper function to get display name for league
function getLeagueDisplayName(leagueName: string): string {
  const displayNames: Record<string, string> = {
    dub: 'Dub',
    pitt: 'Pitt',
    men: 'Men',
  };
  return displayNames[leagueName] || leagueName;
}

function LandingPage({ leagueName, onLeagueSelect }: LandingPageProps) {
  const [showNameInput, setShowNameInput] = useState(false);
  const [rankerName, setRankerName] = useState('');

  const handleStart = () => {
    setShowNameInput(true);
  };

  const handleNameSubmit = () => {
    if (rankerName.trim().length >= 2) {
      onLeagueSelect(leagueName, rankerName.trim());
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  const leagueDisplayName = getLeagueDisplayName(leagueName);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{leagueDisplayName} Fantasy Ranker</h1>
      <p className={styles.description}>
        You'll compare teams head-to-head in a series of matchups. Use the arrow keys (or click the arrows) to choose which roster is stronger. After all comparisons, you'll get a complete power ranking of your league.
      </p>

      {!showNameInput && (
        <button
          type="button"
          className={styles.startButton}
          onClick={handleStart}
          aria-label="Start ranking"
        >
          START
        </button>
      )}

      {showNameInput && (
        <div className={styles.nameInput}>
          <h2 className={styles.nameTitle}>Enter your name:</h2>
          <input
            type="text"
            className={styles.nameField}
            value={rankerName}
            onChange={(e) => setRankerName(e.target.value)}
            onKeyPress={handleNameKeyPress}
            placeholder="Your name"
            aria-label="Enter your name"
            autoFocus
          />
          <button
            type="button"
            className={styles.continueButton}
            onClick={handleNameSubmit}
            disabled={rankerName.trim().length < 2}
            aria-label="Continue to comparisons"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
