/**
 * Tests for ArrowButton component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArrowButton from './ArrowButton';

describe('ArrowButton', () => {
  it('renders left arrow correctly', () => {
    render(<ArrowButton direction="left" onClick={() => {}} />);

    const button = screen.getByRole('button', { name: /select left team/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('←');
  });

  it('renders right arrow correctly', () => {
    render(<ArrowButton direction="right" onClick={() => {}} />);

    const button = screen.getByRole('button', { name: /select right team/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('→');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    render(<ArrowButton direction="left" onClick={mockClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("doesn't call onClick when disabled", async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    render(<ArrowButton direction="left" onClick={mockClick} disabled={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockClick).not.toHaveBeenCalled();
  });

  it('has proper aria-label for accessibility', () => {
    const { rerender } = render(<ArrowButton direction="left" onClick={() => {}} />);

    let button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Select left team');

    rerender(<ArrowButton direction="right" onClick={() => {}} />);

    button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Select right team');
  });

  it('applies disabled styling when disabled', () => {
    render(<ArrowButton direction="left" onClick={() => {}} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
