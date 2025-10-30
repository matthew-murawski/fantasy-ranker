import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('shows loading state initially', () => {
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {})
    );
    render(<App />);
    expect(screen.getByText(/loading league data/i)).toBeInTheDocument();
  });

  it('shows landing page after data loads, then starts comparison on click', async () => {
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(<App />);

    // Landing page should appear after data load
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /dub fantasy ranker/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    // Start the flow
    await (await import('@testing-library/user-event')).default.setup().click(
      screen.getByRole('button', { name: /start/i })
    );

    // Should render comparison instruction after starting
    expect(
      await screen.findByText(/click or use arrow keys to choose the best team/i)
    ).toBeInTheDocument();

    // Verify loadLeagueData called with 'dub'
    expect(loadLeagueData).toHaveBeenCalledWith('dub');
  });

  it('shows error message when loading fails', async () => {
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network fail')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      expect(screen.getByText(/network fail/i)).toBeInTheDocument();
    });
  });
});
