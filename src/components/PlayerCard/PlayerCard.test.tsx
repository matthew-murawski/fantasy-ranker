import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerCard from './PlayerCard';
import { Player } from '../../types';

describe('PlayerCard', () => {
  const mockPlayer: Player = {
    playerName: 'M. Stafford',
    position: 'QB',
    nflTeam: 'LAR',
    rosterSlot: 'QB',
    injuryStatus: 'ACTIVE',
    isIR: false,
  };

  describe('rendering player information', () => {
    it('renders player name correctly', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" />);
      expect(screen.getByText(/M. Stafford/)).toBeInTheDocument();
    });

    it('renders NFL team correctly', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" />);
      expect(screen.getByText(/LAR/)).toBeInTheDocument();
    });
  });

  describe('starter format', () => {
    it('displays position separated with pipe', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" />);
      const card = screen.getByText(/QB/);
      expect(card).toBeInTheDocument();

      // Check for pipe separator
      const container = card.closest('div');
      expect(container?.textContent).toContain('|');
    });

    it('shows position label when showPosition is true', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" showPosition={true} />);
      expect(screen.getByText('QB')).toBeInTheDocument();
    });

    it('hides position when showPosition is false', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" showPosition={false} />);
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('QB');
      expect(container?.textContent).not.toContain('|');
    });
  });

  describe('bench format', () => {
    it('displays position integrated (no pipe)', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="bench" />);
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('|');
      expect(container?.textContent).toContain('QB');
    });

    it('shows position before player name', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="bench" />);
      const container = screen.getByText(/M. Stafford/).closest('div');
      // Check that QB comes before the player name in the text content
      const text = container?.textContent || '';
      const qbIndex = text.indexOf('QB');
      const nameIndex = text.indexOf('M. Stafford');
      expect(qbIndex).toBeLessThan(nameIndex);
    });
  });

  describe('position-group format', () => {
    it('displays position integrated (no pipe)', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="position-group" />);
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('|');
    });
  });

  describe('showPosition prop', () => {
    it('toggles position visibility in bench format', () => {
      const { rerender } = render(
        <PlayerCard player={mockPlayer} displayFormat="bench" showPosition={true} />
      );
      expect(screen.getByText(/QB/)).toBeInTheDocument();

      rerender(
        <PlayerCard player={mockPlayer} displayFormat="bench" showPosition={false} />
      );
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('QB ');
    });
  });

  describe('styling', () => {
    it('applies card styling', () => {
      render(<PlayerCard player={mockPlayer} displayFormat="starter" />);
      const container = screen.getByText(/M. Stafford/).closest('div');
      // CSS Modules hash the class name, so just check it has a class
      expect(container?.className).toBeTruthy();
    });
  });

  describe('IR indicator', () => {
    it('shows IR indicator when showIRIndicator is true and player is IR', () => {
      const irPlayer: Player = {
        ...mockPlayer,
        isIR: true,
        injuryStatus: 'INJURY_RESERVE',
      };

      render(
        <PlayerCard player={irPlayer} displayFormat="bench" showIRIndicator={true} />
      );
      expect(screen.getByText(/\(IR\)/)).toBeInTheDocument();
    });

    it('does not show IR indicator when player is not IR', () => {
      render(
        <PlayerCard player={mockPlayer} displayFormat="bench" showIRIndicator={true} />
      );
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('(IR)');
    });

    it('does not show IR indicator when showIRIndicator is false', () => {
      const irPlayer: Player = {
        ...mockPlayer,
        isIR: true,
        injuryStatus: 'INJURY_RESERVE',
      };

      render(
        <PlayerCard player={irPlayer} displayFormat="bench" showIRIndicator={false} />
      );
      const container = screen.getByText(/M. Stafford/).closest('div');
      expect(container?.textContent).not.toContain('(IR)');
    });
  });
});
