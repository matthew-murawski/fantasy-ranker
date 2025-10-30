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

  it('invokes onLeagueSelect with league and ranker name when completing flow', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    // Click START
    await user.click(screen.getByRole('button', { name: /start/i }));

    // Select league
    await user.click(screen.getByRole('button', { name: /dub league/i }));

    // Should now see name input
    expect(screen.getByText(/enter your name/i)).toBeInTheDocument();
    const nameInput = screen.getByRole('textbox', { name: /enter your name/i });
    expect(nameInput).toBeInTheDocument();

    // Type name
    await user.type(nameInput, 'TestUser');

    // Click Continue
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Should call onLeagueSelect with league and name
    expect(onLeagueSelect).toHaveBeenCalledTimes(1);
    expect(onLeagueSelect).toHaveBeenCalledWith('dub', 'TestUser');
  });

  it('disables continue button when name is less than 2 characters', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /dub league/i }));

    const nameInput = screen.getByRole('textbox', { name: /enter your name/i });
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Initially disabled (empty)
    expect(continueButton).toBeDisabled();

    // Type 1 character
    await user.type(nameInput, 'A');
    expect(continueButton).toBeDisabled();

    // Type 2nd character
    await user.type(nameInput, 'B');
    expect(continueButton).not.toBeDisabled();
  });

  it('allows submission via Enter key', async () => {
    const user = userEvent.setup();
    const onLeagueSelect = vi.fn();
    render(<LandingPage onLeagueSelect={onLeagueSelect} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /pitt league/i }));

    const nameInput = screen.getByRole('textbox', { name: /enter your name/i });
    await user.type(nameInput, 'TestUser{Enter}');

    expect(onLeagueSelect).toHaveBeenCalledTimes(1);
    expect(onLeagueSelect).toHaveBeenCalledWith('pitt', 'TestUser');
  });
});
