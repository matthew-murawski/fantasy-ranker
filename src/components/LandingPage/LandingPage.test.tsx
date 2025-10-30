/**
 * Tests for LandingPage component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('renders title and start button', () => {
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    expect(screen.getByRole('heading', { name: /fantasy ranker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('renders the instructional description text', () => {
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    expect(
      screen.getByText(/compare teams head-to-head in a series of matchups/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you'll get a complete power ranking/i)
    ).toBeInTheDocument();
  });

  it('shows league selection buttons after clicking START', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    // Initially, league buttons should not be visible
    expect(screen.queryByText(/choose league/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dub league/i })).not.toBeInTheDocument();

    // Click START
    await user.click(screen.getByRole('button', { name: /start/i }));

    // Now league selection should be visible
    expect(screen.getByText(/choose league/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dub league/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pitt league/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /men league/i })).toBeInTheDocument();

    // START button should be hidden
    expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument();
  });

  it('invokes onLeagueSelect with "dub" when clicking Dub League button', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /dub league/i }));

    expect(onLeagueSelect).toHaveBeenCalledTimes(1);
    expect(onLeagueSelect).toHaveBeenCalledWith('dub');
  });

  it('invokes onLeagueSelect with "pitt" when clicking Pitt League button', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /pitt league/i }));

    expect(onLeagueSelect).toHaveBeenCalledTimes(1);
    expect(onLeagueSelect).toHaveBeenCalledWith('pitt');
  });

  it('invokes onLeagueSelect with "men" when clicking Men League button', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /men league/i }));

    expect(onLeagueSelect).toHaveBeenCalledTimes(1);
    expect(onLeagueSelect).toHaveBeenCalledWith('men');
  });
});
