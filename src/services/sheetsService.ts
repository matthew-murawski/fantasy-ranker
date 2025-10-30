/**
 * Google Sheets API service for submitting ranking data.
 * Handles formatting and sending ranking results to a Google Sheet.
 */

import {
  GOOGLE_SHEETS_API_KEY,
  GOOGLE_SHEET_ID,
  SHEET_RANGE,
} from '../config/sheets';
import {
  RankingSubmission,
  RankingDataRow,
  SheetsAppendRequest,
  SheetsAppendResponse,
  SubmissionResult,
} from '../types/sheets';

/**
 * Formats a RankingSubmission into rows for Google Sheets.
 * Each team becomes one row with: timestamp, ranker name, league, team name, rank, wins, losses.
 */
export function formatRankingDataForSheets(submission: RankingSubmission): RankingDataRow[] {
  return submission.teams.map(({ team, rank, wins, losses }) => ({
    timestamp: submission.timestamp,
    rankerName: submission.rankerName,
    league: submission.league,
    teamName: team.teamName,
    rankPosition: rank,
    wins,
    losses,
  }));
}

/**
 * Converts RankingDataRow objects into 2D array format for Sheets API.
 */
function convertToSheetValues(rows: RankingDataRow[]): Array<Array<string | number>> {
  return rows.map(row => [
    row.timestamp,
    row.rankerName,
    row.league,
    row.teamName,
    row.rankPosition,
    row.wins,
    row.losses,
  ]);
}

/**
 * Submits ranking data to Google Sheets using the Sheets API v4.
 * @param submission - Complete ranking submission data
 * @returns Result indicating success or failure
 */
export async function submitRankingToSheets(
  submission: RankingSubmission
): Promise<SubmissionResult> {
  try {
    // Format data for submission
    const rows = formatRankingDataForSheets(submission);
    const values = convertToSheetValues(rows);

    // Prepare request body
    const requestBody: SheetsAppendRequest = {
      values,
    };

    // Build API URL
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${SHEET_RANGE}:append`
    );
    url.searchParams.append('valueInputOption', 'USER_ENTERED');
    url.searchParams.append('key', GOOGLE_SHEETS_API_KEY);

    // Make API request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      return {
        success: false,
        error: `Failed to submit rankings: ${response.status} ${response.statusText}`,
      };
    }

    const result: SheetsAppendResponse = await response.json();

    return {
      success: true,
      rowsAdded: result.updates.updatedRows,
    };
  } catch (error) {
    console.error('Error submitting rankings to Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates an ISO timestamp string for the current moment.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}
