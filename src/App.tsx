/**
 * Main App integrates routing, data loading, and comparison flow.
 * Routes:
 *   / - League selection page
 *   /:league - League-specific landing page with START button and name entry
 * Loads league data after user enters name, handles loading/error states, renders ComparisonFlow.
 */

import { useState } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import ComparisonFlow from './components/ComparisonFlow';
import LandingPage from './components/LandingPage';
import LeagueSelectionPage from './components/LeagueSelectionPage';
import { Team } from './types';
import { loadLeagueData, validateRosterData } from './services/dataService';
import styles from './App.module.css';

// Valid league names
const VALID_LEAGUES = ['dub', 'pitt', 'men'];

function LeagueRoute() {
  const { league } = useParams<{ league: string }>();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [rankerName, setRankerName] = useState<string | null>(null);

  // Validate league parameter
  if (!league || !VALID_LEAGUES.includes(league)) {
    return <Navigate to="/" replace />;
  }

  const handleLeagueSelect = async (selectedLeague: string, selectedRankerName: string) => {
    try {
      setLoading(true);
      setError(null);
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
    setRankerName(null);
  };

  return (
    <div className={styles.container}>
      {loading && <div className={styles.message}>Loading league data...</div>}
      {!loading && error && (
        <div className={`${styles.message} ${styles.error}`}>Error loading data: {error}</div>
      )}
      {!loading && !error && !started && (
        <LandingPage leagueName={league} onLeagueSelect={handleLeagueSelect} />
      )}
      {!loading && !error && teams && teams.length > 0 && started && rankerName && (
        <ComparisonFlow
          teams={teams}
          leagueName={league}
          rankerName={rankerName}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeagueSelectionPage />} />
      <Route path="/:league" element={<LeagueRoute />} />
    </Routes>
  );
}

export default App;
