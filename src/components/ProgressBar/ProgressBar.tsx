/**
 * ProgressBar displays visual progress of comparisons (no text labels).
 * Shows a filled bar proportional to completion percentage.
 */

import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  completed: number;
  total: number;
}

function ProgressBar({ completed, total }: ProgressBarProps) {
  // Calculate percentage, cap at 100%, handle edge cases
  let percentage = 0;
  if (total > 0) {
    percentage = Math.min((completed / total) * 100, 100);
  }

  return (
    <div className={styles.container}>
      <div className={styles.filledBar} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default ProgressBar;
