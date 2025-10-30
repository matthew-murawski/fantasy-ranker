/**
 * ArrowButton renders a large, clickable arrow button for team selection.
 * Supports left and right directions with proper accessibility.
 */

import styles from './ArrowButton.module.css';

export interface ArrowButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

function ArrowButton({ direction, onClick, disabled = false }: ArrowButtonProps) {
  const arrow = direction === 'left' ? '\u2190' : '\u2192';
  const ariaLabel = direction === 'left' ? 'Select left team' : 'Select right team';

  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {arrow}
    </button>
  );
}

export default ArrowButton;
