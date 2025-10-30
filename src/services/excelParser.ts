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
      const starters = players.filter(p => p.rosterSlot !== 'BE' && !p.isIR);
      const bench = players.filter(p => p.rosterSlot === 'BE' && !p.isIR);
      const ir = players.filter(p => p.isIR);

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
