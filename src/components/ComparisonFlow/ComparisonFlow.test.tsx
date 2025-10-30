/**
 * Tests for ComparisonFlow component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparisonFlow from './ComparisonFlow';
import { createMockTeam } from '../../__tests__/fixtures/teams';

describe('ComparisonFlow', () => {
  it('renders ComparisonScreen when not complete', () => {
    const teams = [
      createMockTeam('Team 1'),
      createMockTeam('Team 2'),
      createMockTeam('Team 3'),
    ];

    render(<ComparisonFlow teams={teams} leagueName="test" rankerName="TestUser" />);

    // Should show instruction text from ComparisonScreen
    const instruction = screen.getByText(/click or use arrow keys to choose the best team/i);
    expect(instruction).toBeTruthy();
  });

  it('renders loading message when no comparison available', () => {
    const teams = [] as any[];

    render(<ComparisonFlow teams={teams} leagueName="test" rankerName="TestUser" />);

    const loading = screen.getByText(/loading/i);
    expect(loading).toBeTruthy();
  });

  it('full flow test: make comparisons until complete', async () => {
    const user = userEvent.setup();
    const teams = [createMockTeam('Team 1'), createMockTeam('Team 2')];

    render(<ComparisonFlow teams={teams} leagueName="test" rankerName="TestUser" />);

    // Initially should show comparison screen
    expect(screen.getByText(/click or use arrow keys/i)).toBeTruthy();

    // Click left arrow to make comparison
    const leftButton = screen.getByRole('button', { name: /select left team/i });
    await user.click(leftButton);

    // Should now show rankings screen
    expect(screen.getByText('POWER RANKINGS')).toBeInTheDocument();
  });

  it('verify screens transition correctly', async () => {
    const user = userEvent.setup();
    const teams = [createMockTeam('Team 1'), createMockTeam('Team 2')];

    const { container } = render(<ComparisonFlow teams={teams} leagueName="test" rankerName="TestUser" />);

    // Initially should have comparison screen with progress bar
    let progressBar = container.querySelector('[class*="progressContainer"]');
    expect(progressBar).toBeTruthy();

    // Make comparison
    const leftButton = screen.getByRole('button', { name: /select left team/i });
    await user.click(leftButton);

    // Should transition to rankings screen
    expect(screen.getByText('POWER RANKINGS')).toBeInTheDocument();

    // Progress bar should be gone
    progressBar = container.querySelector('[class*="progressContainer"]');
    expect(progressBar).toBeFalsy();
  });

  it('renders RankingsScreen when complete', async () => {
    const user = userEvent.setup();
    const teams = [createMockTeam('Team 1'), createMockTeam('Team 2')];

    render(<ComparisonFlow teams={teams} leagueName="test" rankerName="TestUser" />);

    const leftButton = screen.getByRole('button', { name: /select left team/i });
    await user.click(leftButton);

    const header = screen.getByText('POWER RANKINGS');
    expect(header).toBeInTheDocument();
  });
});
