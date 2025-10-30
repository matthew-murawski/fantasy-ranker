/**
 * LandingPage displays the app title and a start button.
 * After clicking START, shows league selection buttons.
 * After selecting a league, prompts for the ranker's name.
 * Uses theme variables and global font to match the app style.
 */

import { useState } from 'react';
import styles from './LandingPage.module.css';

export interface LandingPageProps {
  onLeagueSelect: (leagueName: string, rankerName: string) => void;
}

function LandingPage({ onLeagueSelect }: LandingPageProps) {
  const [showLeagueSelect, setShowLeagueSelect] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [rankerName, setRankerName] = useState('');

  const handleStart = () => {
    setShowLeagueSelect(true);
  };

  const handleLeagueClick = (leagueName: string) => {
    setSelectedLeague(leagueName);
  };

  const handleNameSubmit = () => {
    if (selectedLeague && rankerName.trim().length >= 2) {
      onLeagueSelect(selectedLeague, rankerName.trim());
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fantasy Ranker</h1>
      <p className={styles.description}>
        You'll compare teams head-to-head in a series of matchups. Use the arrow keys (or click the arrows) to choose which roster is stronger. After all comparisons, you'll get a complete power ranking of your league.
      </p>

      {!showLeagueSelect && (
        <button
          type="button"
          className={styles.startButton}
          onClick={handleStart}
          aria-label="Start ranking"
        >
          START
        </button>
      )}

      {showLeagueSelect && !selectedLeague && (
        <div className={styles.leagueSelection}>
          <h2 className={styles.leagueTitle}>Choose League</h2>
          <div className={styles.leagueButtons}>
            <button
              type="button"
              className={styles.leagueButton}
              onClick={() => handleLeagueClick('dub')}
              aria-label="Select Dub League"
            >
              Dub League
            </button>
            <button
              type="button"
              className={styles.leagueButton}
              onClick={() => handleLeagueClick('pitt')}
              aria-label="Select Pitt League"
            >
              Pitt League
            </button>
            <button
              type="button"
              className={styles.leagueButton}
              onClick={() => handleLeagueClick('men')}
              aria-label="Select Men League"
            >
              Men League
            </button>
          </div>
        </div>
      )}

      {selectedLeague && (
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
