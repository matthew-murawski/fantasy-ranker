/**
 * Tests for RankingsScreen component
 */

import { describe, it, expect, vi } from 'vitest';
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

  const mockGetTeamRecord = vi.fn((teamName: string) => ({
    wins: 2,
    losses: 1,
  }));

  it('renders header and all teams in order', () => {
    render(
      <RankingsScreen
        rankedTeams={teams}
        leagueName="test"
        rankerName="TestUser"
        getTeamRecord={mockGetTeamRecord}
      />
    );

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
    render(
      <RankingsScreen
        rankedTeams={teams}
        leagueName="test"
        rankerName="TestUser"
        getTeamRecord={mockGetTeamRecord}
      />
    );

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
    render(
      <RankingsScreen
        rankedTeams={teams}
        leagueName="test"
        rankerName="TestUser"
        getTeamRecord={mockGetTeamRecord}
      />
    );

    const cards = screen.getAllByRole('button');

    await user.click(cards[0]);
    await user.click(cards[1]);

    // Both rosters visible
    const starters = screen.getAllByText('STARTERS');
    expect(starters.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Rank Again button and calls onRestart when clicked', async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    render(
      <RankingsScreen
        rankedTeams={teams}
        leagueName="test"
        rankerName="TestUser"
        getTeamRecord={mockGetTeamRecord}
        onRestart={onRestart}
      />
    );

    const btn = screen.getByRole('button', { name: /rank again/i });
    await user.click(btn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('displays owner name when available', () => {
    const teamsWithOwners = [
      { ...createMockTeam('MuzzyCompany'), ownerName: 'Matt McIsaac' },
      { ...createMockTeam('Team 2'), ownerName: 'John Doe' },
      createMockTeam('Team 3'), // No owner name
    ];
    render(
      <RankingsScreen
        rankedTeams={teamsWithOwners}
        leagueName="test"
        rankerName="TestUser"
        getTeamRecord={mockGetTeamRecord}
      />
    );

    // Owner names should be displayed
    expect(screen.getByText('Matt McIsaac')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Team names should still be displayed next to owner names
    expect(screen.getByText('MuzzyCompany')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();

    // Team without owner should still show team name
    expect(screen.getByText('Team 3')).toBeInTheDocument();
  });
});
