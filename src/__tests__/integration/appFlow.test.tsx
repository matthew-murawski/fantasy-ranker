/**
 * Integration test for full App flow using real components.
 * Mocks only the Excel file fetch.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { setupMockFetch } from '../../test-utils';

describe('App Integration Flow', () => {
  it('loads data, shows comparisons, completes to rankings with 12 teams', async () => {
    const user = userEvent.setup();

    // Mock only fetch to return a valid roster Excel buffer
    setupMockFetch(true);

    const { container } = render(<App />);

    // Wait for landing page, then start
    await screen.findByRole('heading', { name: /dub fantasy ranker/i });
    const startButton = await screen.findByRole('button', { name: /start/i });
    await user.click(startButton);

    // Wait for the comparison screen instruction to appear
    await screen.findByText(/click or use arrow keys to choose the best team/i);

    // Simulate up to 40 selections (may complete earlier)
    const maxSelections = 40;
    let selections = 0;
    while (selections < maxSelections && !screen.queryByText('POWER RANKINGS')) {
      const leftButton = screen.getByRole('button', { name: /select left team/i });
      await user.click(leftButton);
      selections++;
    }

    // If not complete yet, keep going up to a reasonable cap
    let safety = 100;
    while (!screen.queryByText('POWER RANKINGS') && safety > 0) {
      const leftButton = screen.getByRole('button', { name: /select left team/i });
      await user.click(leftButton);
      safety--;
    }

    // Rankings screen should appear
    expect(screen.getByText('POWER RANKINGS')).toBeInTheDocument();

    // Should show 12 ranked entries (1. .. 12.)
    for (let i = 1; i <= 12; i++) {
      expect(screen.getByText(new RegExp(`^${i}\\.`))).toBeInTheDocument();
    }

    // Ensure no residual progress bar in DOM
    const progressBar = container.querySelector('[class*="progressContainer"]');
    expect(progressBar).toBeFalsy();
  }, 15000);
});
