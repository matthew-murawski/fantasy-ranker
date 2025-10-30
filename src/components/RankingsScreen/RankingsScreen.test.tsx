/**
 * Tests for RankingsScreen component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RankingsScreen from './RankingsScreen';
import { createMockTeam } from '../../__tests__/fixtures/teams';

describe('RankingsScreen', () => {
  const teams = [
    createMockTeam('Team 1'),
    createMockTeam('Team 2'),
    createMockTeam('Team 3'),
  ];

  it('renders header and all teams in order', () => {
    render(<RankingsScreen rankedTeams={teams} />);

    expect(screen.getByText('POWER RANKINGS')).toBeInTheDocument();

    // Ranks should be 1., 2., 3.
    expect(screen.getByText(/^1\./)).toBeInTheDocument();
    expect(screen.getByText(/^2\./)).toBeInTheDocument();
    expect(screen.getByText(/^3\./)).toBeInTheDocument();

    // Names should appear
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Team 3')).toBeInTheDocument();
  });

  it('clicking a card expands it, clicking again collapses', async () => {
    const user = userEvent.setup();
    render(<RankingsScreen rankedTeams={teams} />);

    // Click first card
    const firstCard = screen.getAllByRole('button')[0];
    await user.click(firstCard);

    // Expanded should show roster headers
    expect(screen.getByText('STARTERS')).toBeInTheDocument();

    // Click again to collapse
    await user.click(firstCard);
    expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
  });

  it('can expand multiple cards', async () => {
    const user = userEvent.setup();
    render(<RankingsScreen rankedTeams={teams} />);

    const cards = screen.getAllByRole('button');

    await user.click(cards[0]);
    await user.click(cards[1]);

    // Both rosters visible
    const starters = screen.getAllByText('STARTERS');
    expect(starters.length).toBeGreaterThanOrEqual(2);
  });
});

