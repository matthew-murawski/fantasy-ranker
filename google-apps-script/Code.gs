/**
 * Google Apps Script to receive fantasy football ranking data
 * and write it to a Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Update SHEET_ID below with your Google Sheet ID
 * 5. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL and use it in your React app
 */

// Replace with your Google Sheet ID
const SHEET_ID = '1Wezb5TMTtkhu0ErMQcLt9DufphLliheroI2Qa1Vo63E';
const SHEET_NAME = 'Sheet1';

/**
 * Handle POST requests from the React app
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Log for debugging (visible in Apps Script logs)
    Logger.log('Received data: ' + JSON.stringify(data));

    // Validate required fields
    if (!data.rankerName || !data.league || !data.teams) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields: rankerName, league, or teams'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + SHEET_NAME
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Prepare rows to insert
    const rows = [];
    data.teams.forEach(teamData => {
      rows.push([
        data.timestamp,
        data.rankerName,
        data.league,
        teamData.team.teamName,
        teamData.rank,
        teamData.wins,
        teamData.losses
      ]);
    });

    // Append all rows at once (more efficient)
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    }

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rowsAdded: rows.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Fantasy Ranker Apps Script is running',
    message: 'Use POST to submit ranking data'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify the script works
 * Run this from the Apps Script editor to test
 */
function testSubmission() {
  const testData = {
    timestamp: new Date().toISOString(),
    rankerName: 'Test User',
    league: 'test',
    teams: [
      { team: { teamName: 'Team A' }, rank: 1, wins: 5, losses: 2 },
      { team: { teamName: 'Team B' }, rank: 2, wins: 4, losses: 3 }
    ]
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
