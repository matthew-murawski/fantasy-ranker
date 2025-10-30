/**
 * Tests for ProgressBar component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct initial width (0%)', () => {
    const { container } = render(<ProgressBar completed={0} total={10} />);

    const filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar).toBeTruthy();
    expect(filledBar.style.width).toBe('0%');
  });

  it('updates width when completed changes', () => {
    const { container, rerender } = render(<ProgressBar completed={0} total={10} />);

    let filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('0%');

    rerender(<ProgressBar completed={5} total={10} />);

    filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('50%');
  });

  it('shows 50% when completed=5, total=10', () => {
    const { container } = render(<ProgressBar completed={5} total={10} />);

    const filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('50%');
  });

  it('shows 100% when completed=total', () => {
    const { container } = render(<ProgressBar completed={10} total={10} />);

    const filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('100%');
  });

  it('caps at 100% if completed > total', () => {
    const { container } = render(<ProgressBar completed={15} total={10} />);

    const filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('100%');
  });

  it('handles total=0 (shows 0%)', () => {
    const { container } = render(<ProgressBar completed={5} total={0} />);

    const filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('0%');
  });

  it('correct CSS classes applied', () => {
    const { container } = render(<ProgressBar completed={5} total={10} />);

    const progressContainer = container.querySelector('[class*="container"]');
    const filledBar = container.querySelector('[class*="filledBar"]');

    expect(progressContainer).toBeTruthy();
    expect(filledBar).toBeTruthy();
  });
});
