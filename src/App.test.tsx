import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { mockLeagueData } from './test-utils';

// Mock the data service
vi.mock('./services/dataService', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    loadLeagueData: vi.fn(),
  };
});

import { loadLeagueData } from './services/dataService';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows landing page initially without loading data', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /fantasy ranker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(loadLeagueData).not.toHaveBeenCalled();
  });

  it('shows league selection after clicking START, then loads data after league selection', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(<App />);

    // Click START button
    await user.click(screen.getByRole('button', { name: /start/i }));

    // League selection should appear
    expect(screen.getByText(/choose league/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dub league/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pitt league/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /men league/i })).toBeInTheDocument();

    // Data should not be loaded yet
    expect(loadLeagueData).not.toHaveBeenCalled();

    // Click Dub League button
    await user.click(screen.getByRole('button', { name: /dub league/i }));

    // Should render comparison instruction after data loads
    expect(
      await screen.findByText(/click or use arrow keys to choose the best team/i)
    ).toBeInTheDocument();

    // Verify loadLeagueData called with 'dub'
    expect(loadLeagueData).toHaveBeenCalledWith('dub');
  });

  it('loads Pitt League data when Pitt League is selected', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(<App />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /pitt league/i }));

    await waitFor(() => {
      expect(loadLeagueData).toHaveBeenCalledWith('pitt');
    });
  });

  it('loads Men League data when Men League is selected', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(<App />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /men league/i }));

    await waitFor(() => {
      expect(loadLeagueData).toHaveBeenCalledWith('men');
    });
  });

  it('shows error message when loading fails', async () => {
    const user = userEvent.setup();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network fail')
    );

    render(<App />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(screen.getByRole('button', { name: /dub league/i }));

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      expect(screen.getByText(/network fail/i)).toBeInTheDocument();
    });
  });
});
