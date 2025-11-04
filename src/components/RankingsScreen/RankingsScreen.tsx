/**
 * RankingsScreen displays the final power rankings with expandable team cards.
 * Automatically submits ranking data to Google Sheets on mount.
 */

import { useState, useEffect } from 'react';
import { Team } from '../../types';
import TeamRankingCard from '../TeamRankingCard';
import { submitRankingToSheets, generateTimestamp } from '../../services/sheetsService';
import { RankingSubmission } from '../../types/sheets';
import styles from './RankingsScreen.module.css';

export interface RankingsScreenProps {
  rankedTeams: Team[]; // ordered best to worst
  leagueName: string;
  rankerName: string;
  getTeamRecord: (teamName: string) => { wins: number; losses: number } | null;
  onRestart?: () => void;
}

function RankingsScreen({ rankedTeams, leagueName, rankerName, getTeamRecord, onRestart }: RankingsScreenProps) {
  // Track expanded cards. Allow multiple expansions.
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Track submission status
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Submit ranking data to Google Sheets on mount
  useEffect(() => {
    const submitRankings = async () => {
      try {
        // Prepare submission data
        const timestamp = generateTimestamp();
        const teams = rankedTeams.map((team, index) => {
          const record = getTeamRecord(team.teamName);
          return {
            team,
            rank: index + 1,
            wins: record?.wins ?? 0,
            losses: record?.losses ?? 0,
          };
        });

        const submission: RankingSubmission = {
          rankerName,
          league: leagueName,
          timestamp,
          teams,
        };

        // Submit to Google Sheets
        const result = await submitRankingToSheets(submission);

        if (result.success) {
          setSubmissionStatus('success');
          setSubmissionError(null);
        } else {
          setSubmissionStatus('error');
          const errorMsg = result.error || 'Unknown error';
          setSubmissionError(errorMsg);
          console.error('Submission failed:', errorMsg);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error submitting rankings:', error);
        setSubmissionStatus('error');
        setSubmissionError(errorMsg);
      }
    };

    submitRankings();
  }, [rankedTeams, leagueName, rankerName, getTeamRecord]);

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

      {/* Submission status message */}
      {submissionStatus === 'success' && (
        <div className={styles.successMessage}>
          ✓ Your rankings have been saved
        </div>
      )}
      {submissionStatus === 'error' && (
        <div className={styles.errorMessage}>
          <div>There was an issue saving your rankings. You can still see your results below.</div>
          {submissionError && (
            <div className={styles.errorDetail}>Error details: {submissionError}</div>
          )}
        </div>
      )}

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
