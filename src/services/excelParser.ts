/**
 * Excel parser service for reading fantasy football roster data.
 * Parses roster_*.xlsx files and converts them into typed Team objects.
 */

import * as XLSX from 'xlsx';
import { Player, Team } from '../types';

/**
 * Parses a roster Excel file and returns an array of Team objects.
 *
 * Expected Excel structure:
 * - Row 1: Headers (Team Name, Player Name, Position, NFL Team, Roster Slot, Injury Status)
 * - Row 2+: Data rows
 * - Column A: Team Name
 * - Column B: Player Name
 * - Column C: Position
 * - Column D: NFL Team
 * - Column E: Roster Slot
 * - Column F: Injury Status
 *
 * @param file - File object or ArrayBuffer containing Excel data
 * @returns Promise resolving to array of Team objects
 * @throws Error if file cannot be parsed or contains invalid data
 */
export async function parseRosterFile(file: File | ArrayBuffer): Promise<Team[]> {
  try {
    // Read the workbook
    let workbook: XLSX.WorkBook;

    if (file instanceof ArrayBuffer) {
      workbook = XLSX.read(file, { type: 'array' });
    } else {
      const arrayBuffer = await file.arrayBuffer();
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    }

    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON (array of arrays)
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row (row 0) and process data rows
    const dataRows = data.slice(1);

    // Group players by team
    const teamMap = new Map<string, Player[]>();

    for (const row of dataRows) {
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      const teamName = String(row[0] || '').trim();
      const playerName = String(row[1] || '').trim();
      const position = String(row[2] || '').trim();
      const nflTeam = String(row[3] || '').trim();
      const rosterSlot = String(row[4] || '').trim();
      const injuryStatus = String(row[5] || '').trim();
      const percentStartedRaw = row.length > 6 ? row[6] : undefined;
      const percentStartedParsed =
        percentStartedRaw !== undefined && percentStartedRaw !== null && percentStartedRaw !== ''
          ? Number(percentStartedRaw)
          : undefined;

      // Skip rows with missing critical data
      if (!teamName || !playerName) {
        continue;
      }

      // Create player object
      const isIR = injuryStatus === 'INJURY_RESERVE' || injuryStatus === 'IR' || rosterSlot === 'IR';

      const player: Player = {
        playerName,
        position,
        nflTeam,
        rosterSlot,
        injuryStatus,
        isIR,
        percentStarted: typeof percentStartedParsed === 'number' && !Number.isNaN(percentStartedParsed)
          ? percentStartedParsed
          : undefined,
      };

      // Add to team map
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, []);
      }
      teamMap.get(teamName)!.push(player);
    }

    // Check for duplicate team names
    const teamNames = Array.from(teamMap.keys());
    if (teamNames.length !== new Set(teamNames).size) {
      throw new Error('Duplicate team names found in roster data');
    }

    // Convert map to Team objects
    const teams: Team[] = [];
    for (const [teamName, players] of teamMap.entries()) {
      let starters = players.filter(p => p.rosterSlot !== 'BE' && !p.isIR);
      let bench = players.filter(p => p.rosterSlot === 'BE' && !p.isIR);
      const ir = players.filter(p => p.isIR);

      // Attempt to auto-fill missing starters using bench players with highest percentStarted,
      // only if the new Percent Started column is present for this team.
      const hasPercentStarted = bench.some(b => typeof b.percentStarted === 'number');
      if (hasPercentStarted) {
        const filled = fillMissingStartersWithBench(starters, bench);
        starters = filled.starters;
        bench = filled.bench;
      }

      teams.push({
        teamName,
        players,
        starters,
        bench,
        ir,
      });
    }

    return teams;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse roster file: ${error.message}`);
    }
    throw new Error('Failed to parse roster file: Unknown error');
  }
}

/**
 * Fills missing starter slots using bench players with the highest percentStarted values.
 * Does not modify the original player objects within players[]; returns new arrays for starters and bench.
 */
function fillMissingStartersWithBench(
  starters: Player[],
  bench: Player[]
): { starters: Player[]; bench: Player[] } {
  const expectedCounts: Record<string, number> = {
    'QB': 1,
    'RB': 2,
    'WR': 2,
    'TE': 1,
    'RB/WR/TE': 1,
    'K': 1,
    'D/ST': 1,
  };

  // Helper to count starters by slot
  const countBySlot = (arr: Player[]) => {
    const counts: Record<string, number> = {};
    for (const p of arr) {
      counts[p.rosterSlot] = (counts[p.rosterSlot] || 0) + 1;
    }
    return counts;
  };

  const currentCounts = countBySlot(starters);

  // Helper: pick best bench candidate by predicate
  const pickBench = (predicate: (p: Player) => boolean): Player | null => {
    let bestIdx = -1;
    let bestVal = -1;
    for (let i = 0; i < bench.length; i++) {
      const b = bench[i];
      if (predicate(b)) {
        const val = typeof b.percentStarted === 'number' ? b.percentStarted : 0;
        if (val > bestVal) {
          bestVal = val;
          bestIdx = i;
        }
      }
    }
    if (bestIdx >= 0) {
      const [chosen] = bench.splice(bestIdx, 1);
      return chosen;
    }
    return null;
  };

  // Attempt to fill each slot up to expected count
  const newStarters: Player[] = [...starters];

  const tryFill = (slot: string, predicate: (p: Player) => boolean) => {
    const have = currentCounts[slot] || 0;
    const need = (expectedCounts[slot] || 0) - have;
    for (let k = 0; k < need; k++) {
      const candidate = pickBench(predicate);
      if (!candidate) break;
      const promoted: Player = { ...candidate, rosterSlot: slot };
      newStarters.push(promoted);
      currentCounts[slot] = (currentCounts[slot] || 0) + 1;
    }
  };

  tryFill('QB', p => p.position === 'QB');
  tryFill('RB', p => p.position === 'RB');
  tryFill('WR', p => p.position === 'WR');
  tryFill('TE', p => p.position === 'TE');
  tryFill('K', p => p.position === 'K');
  tryFill('D/ST', p => p.position === 'D/ST');
  tryFill('RB/WR/TE', p => p.position === 'RB' || p.position === 'WR' || p.position === 'TE');

  return { starters: newStarters, bench };
}
