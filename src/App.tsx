/**
 * Main App integrates data loading and comparison flow.
 * Loads league data after user selects a league, handles loading/error states, renders ComparisonFlow.
 */

import { useState } from 'react';
import ComparisonFlow from './components/ComparisonFlow';
import LandingPage from './components/LandingPage';
import { Team } from './types';
import { loadLeagueData, validateRosterData } from './services/dataService';
import styles from './App.module.css';

function App() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [rankerName, setRankerName] = useState<string | null>(null);

  const handleLeagueSelect = async (selectedLeague: string, selectedRankerName: string) => {
    try {
      setLoading(true);
      setError(null);
      setLeagueName(selectedLeague);
      setRankerName(selectedRankerName);
      const loaded = await loadLeagueData(selectedLeague);
      // Validate before setting
      validateRosterData(loaded);
      setTeams(loaded);
      setStarted(true);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setTeams(null);
    setError(null);
    setLeagueName(null);
    setRankerName(null);
  };

  return (
    <div className={styles.container}>
      {loading && <div className={styles.message}>Loading league data...</div>}
      {!loading && error && (
        <div className={`${styles.message} ${styles.error}`}>Error loading data: {error}</div>
      )}
      {!loading && !error && !started && (
        <LandingPage onLeagueSelect={handleLeagueSelect} />
      )}
      {!loading && !error && teams && teams.length > 0 && started && leagueName && rankerName && (
        <ComparisonFlow
          teams={teams}
          leagueName={leagueName}
          rankerName={rankerName}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
