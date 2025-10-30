/**
 * Type definitions for Google Sheets API integration and ranking data submission.
 */

import { Team } from './index';

/**
 * Represents a single row of ranking data to be submitted to Google Sheets.
 */
export interface RankingDataRow {
  timestamp: string;
  rankerName: string;
  league: string;
  teamName: string;
  rankPosition: number;
  wins: number;
  losses: number;
}

/**
 * Complete ranking submission data including metadata and all team rankings.
 */
export interface RankingSubmission {
  rankerName: string;
  league: string;
  timestamp: string;
  teams: Array<{
    team: Team;
    rank: number;
    wins: number;
    losses: number;
  }>;
}

/**
 * Google Sheets API append request body.
 */
export interface SheetsAppendRequest {
  values: Array<Array<string | number>>;
}

/**
 * Google Sheets API append response.
 */
export interface SheetsAppendResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: {
    spreadsheetId: string;
    updatedRange: string;
    updatedRows: number;
    updatedColumns: number;
    updatedCells: number;
  };
}

/**
 * Result of a ranking submission attempt.
 */
export interface SubmissionResult {
  success: boolean;
  error?: string;
  rowsAdded?: number;
}
