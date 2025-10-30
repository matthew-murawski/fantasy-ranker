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
}

function ComparisonFlow({ teams }: ComparisonFlowProps) {
  const { currentComparison, progress, isComplete, selectWinner, finalRanking } = useComparison(teams);

  if (isComplete) {
    if (finalRanking && finalRanking.length > 0) {
      return <RankingsScreen rankedTeams={finalRanking} />;
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
