/**
 * ComparisonFlow manages the full comparison workflow.
 * Uses useComparison hook to track state and renders ComparisonScreen or completion message.
 */

import { Team } from '../../types';
import { useComparison } from '../../hooks/useComparison';
import ComparisonScreen from '../ComparisonScreen';
import RankingsScreen from '../RankingsScreen';

export interface ComparisonFlowProps {
  teams: Team[];
  leagueName: string;
  rankerName: string;
  onRestart?: () => void;
}

function ComparisonFlow({ teams, leagueName, rankerName, onRestart }: ComparisonFlowProps) {
  const { currentComparison, progress, isComplete, selectWinner, finalRanking, getTeamRecord } = useComparison(teams);

  if (isComplete) {
    if (finalRanking && finalRanking.length > 0) {
      return (
        <RankingsScreen
          rankedTeams={finalRanking}
          leagueName={leagueName}
          rankerName={rankerName}
          getTeamRecord={getTeamRecord}
          onRestart={onRestart}
        />
      );
    }
    return <div>Loading final rankings...</div>;
  }

  if (!currentComparison) {
    return <div>Loading...</div>;
  }

  return (
    <ComparisonScreen
      comparison={currentComparison}
      progress={progress}
      onSelectWinner={selectWinner}
    />
  );
}

export default ComparisonFlow;
