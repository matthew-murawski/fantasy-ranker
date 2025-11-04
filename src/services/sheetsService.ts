/**
 * Google Forms service for submitting ranking data.
 * Submits data via Google Forms POST, which automatically writes to a Google Sheet.
 * This avoids OAuth2 authentication requirements.
 */

import { GOOGLE_FORM_ACTION_URL, FORM_FIELDS } from '../config/sheets';
import { RankingSubmission, SubmissionResult } from '../types/sheets';

/**
 * Submits a single team's ranking data to Google Form.
 * Google Forms requires one submission per row.
 */
async function submitSingleTeamToForm(
  timestamp: string,
  rankerName: string,
  league: string,
  teamName: string,
  rank: number,
  wins: number,
  losses: number
): Promise<boolean> {
  try {
    // Create form data
    const formData = new URLSearchParams();
    formData.append(FORM_FIELDS.timestamp, timestamp);
    formData.append(FORM_FIELDS.rankerName, rankerName);
    formData.append(FORM_FIELDS.league, league);
    formData.append(FORM_FIELDS.teamName, teamName);
    formData.append(FORM_FIELDS.rankPosition, rank.toString());
    formData.append(FORM_FIELDS.wins, wins.toString());
    formData.append(FORM_FIELDS.losses, losses.toString());

    // Submit to Google Form
    // Using 'no-cors' mode because Google Forms doesn't support CORS for form submissions
    // This means we won't get a response, but the submission will still work
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // With no-cors, we can't read the response, but if no error was thrown, it likely worked
    return true;
  } catch (error) {
    console.error('Error submitting to Google Form:', error);
    return false;
  }
}

/**
 * Submits all ranking data to Google Forms.
 * Each team gets submitted as a separate form response.
 *
 * @param submission - Complete ranking submission data
 * @returns Result indicating success or failure
 */
export async function submitRankingToSheets(
  submission: RankingSubmission
): Promise<SubmissionResult> {
  try {
    console.log('Submitting ranking data to Google Form:', {
      rankerName: submission.rankerName,
      league: submission.league,
      teamCount: submission.teams.length,
      timestamp: submission.timestamp,
    });

    // Submit each team as a separate form response
    const submissions = submission.teams.map(({ team, rank, wins, losses }) =>
      submitSingleTeamToForm(
        submission.timestamp,
        submission.rankerName,
        submission.league,
        team.teamName,
        rank,
        wins,
        losses
      )
    );

    // Wait for all submissions to complete
    const results = await Promise.all(submissions);

    // Check if any submissions failed
    const successCount = results.filter(r => r).length;
    const failCount = results.filter(r => !r).length;

    if (failCount > 0) {
      console.warn(`${failCount} submissions failed, ${successCount} succeeded`);
      return {
        success: false,
        error: `${failCount} of ${results.length} submissions failed`,
        rowsAdded: successCount,
      };
    }

    console.log(`Successfully submitted ${successCount} team rankings`);
    return {
      success: true,
      rowsAdded: successCount,
    };
  } catch (error) {
    console.error('Error submitting rankings:', error);
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
