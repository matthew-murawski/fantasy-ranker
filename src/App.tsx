/**
 * Main App integrates data loading and comparison flow.
 * Loads league data, handles loading/error states, renders ComparisonFlow.
 */

import { useEffect, useState } from 'react';
import ComparisonFlow from './components/ComparisonFlow';
import LandingPage from './components/LandingPage';
import { Team } from './types';
import { loadLeagueData, validateRosterData } from './services/dataService';
import styles from './App.module.css';

function App() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const loaded = await loadLeagueData('dub');
        // Validate before setting
        validateRosterData(loaded);
        if (!isMounted) return;
        setTeams(loaded);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      {loading && <div className={styles.message}>Loading league data...</div>}
      {!loading && error && (
        <div className={`${styles.message} ${styles.error}`}>Error loading data: {error}</div>
      )}
      {!loading && !error && teams && teams.length > 0 && !started && (
        <LandingPage onStart={() => setStarted(true)} />
      )}
      {!loading && !error && teams && teams.length > 0 && started && (
        <ComparisonFlow teams={teams} onRestart={() => setStarted(false)} />
      )}
    </div>
  );
}

export default App;
