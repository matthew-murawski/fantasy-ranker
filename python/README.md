# Fantasy Football Roster Scraper

This directory contains scripts for scraping ESPN Fantasy Football league data and exporting it to Excel files.

## Files

- `scrape_rosters.py` - Main script that scrapes all three leagues
- `requirements.txt` - Python dependencies
- `scraper.ipynb` - Jupyter notebook for manual/interactive scraping

## Automated Updates

The roster data is automatically updated every hour via GitHub Actions. See `.github/workflows/update-rosters.yml` for the workflow configuration.

### How it Works

1. GitHub Actions runs `scrape_rosters.py` on a schedule (every hour)
2. The script connects to ESPN Fantasy Football API using your credentials
3. It exports roster data to Excel files in the `data/` directory
4. If changes are detected, the workflow commits and pushes the updated files
5. GitHub Pages automatically deploys the updated data

### Manual Testing

To run the scraper manually:

```bash
# Install dependencies
pip install -r python/requirements.txt

# Run the scraper
python python/scrape_rosters.py
```

### Manual Triggering

You can also manually trigger the GitHub Actions workflow:
1. Go to the "Actions" tab on GitHub
2. Select "Update Fantasy Rosters" workflow
3. Click "Run workflow"

## Configuration

League credentials and configuration are stored in `scrape_rosters.py`. Update the following if needed:

- `league_id` - Your ESPN league ID
- `year` - Current fantasy football season year
- `espn_s2` - ESPN authentication cookie
- `swid` - ESPN SWID cookie
- `current_week` - Current NFL week number

### Getting ESPN Credentials

To get your `espn_s2` and `swid` cookies:

1. Log into ESPN Fantasy Football in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Cookies → espn.com
4. Copy the values for `espn_s2` and `SWID`

**Note:** These credentials may expire periodically and need to be updated.

## Important Notes

- The Men League currently uses the same `league_id` as Dub League in the scraper. If this is incorrect, update the `league_id` in `scrape_rosters.py`.
- GitHub Actions has usage limits for free accounts. Hourly updates should be well within the free tier limits.
- If the workflow fails, check the Actions tab on GitHub for error logs.
