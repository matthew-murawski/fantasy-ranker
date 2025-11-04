/**
 * Google Forms configuration for submitting ranking data.
 *
 * Data is submitted via Google Forms, which automatically writes to a Google Sheet.
 * This approach avoids OAuth2 authentication requirements.
 *
 * Form URL: https://docs.google.com/forms/d/e/1FAIpQLSeLbcLAfgKEtTDUf2uIBGzvkeGgRXVVg50rwhJ99mhVZ7gtIw/viewform
 */

export const GOOGLE_FORM_ID = '1FAIpQLSeLbcLAfgKEtTDUf2uIBGzvkeGgRXVVg50rwhJ99mhVZ7gtIw';
export const GOOGLE_FORM_ACTION_URL = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

// Form field entry IDs (from form HTML)
export const FORM_FIELDS = {
  timestamp: 'entry.1253922075',
  rankerName: 'entry.1564583599',
  league: 'entry.1098130764',
  teamName: 'entry.1363246279',
  rankPosition: 'entry.459585244',
  wins: 'entry.290575181',
  losses: 'entry.384289170',
};
