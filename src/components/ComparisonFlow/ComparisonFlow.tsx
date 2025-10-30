/**
 * ComparisonFlow manages the full comparison workflow.
 * Uses useComparison hook to track state and renders ComparisonScreen or completion message.
 */

import { Team } from '../../types';
import { useComparison } from '../../hooks/useComparison';
import ComparisonScreen from '../ComparisonScreen';

export interface ComparisonFlowProps {
  teams: Team[];
}

function ComparisonFlow({ teams }: ComparisonFlowProps) {
  const { currentComparison, progress, isComplete, selectWinner } = useComparison(teams);

  if (isComplete) {
    return <div>Ranking complete!</div>;
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
