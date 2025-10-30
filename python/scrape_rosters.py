#!/usr/bin/env python3
"""
ESPN Fantasy Football Roster Scraper

This script scrapes roster data from ESPN Fantasy Football leagues
and exports them to Excel files in the data/ directory.

Designed to run automatically via GitHub Actions on an hourly schedule.
"""

import os
from espn_api.football import League
from openpyxl import Workbook


def scrape_league(league_config, output_filename, current_week=9):
    """
    Scrape a single ESPN Fantasy Football league and export to Excel.

    Args:
        league_config (dict): Configuration containing league_id, year, espn_s2, swid
        output_filename (str): Name of the output Excel file (e.g., 'roster_dub.xlsx')
        current_week (int): The current NFL week to load roster data for

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print(f"\n{'='*60}")
        print(f"Scraping {output_filename}...")
        print(f"{'='*60}")

        # Initialize league connection
        league = League(
            league_id=league_config['league_id'],
            year=league_config['year'],
            espn_s2=league_config['espn_s2'],
            swid=league_config['swid']
        )

        # Load roster data for the current week
        league.load_roster_week(current_week)

        # Create a new Excel workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Rosters"

        # Add headers to the first row
        ws.append([
            "Team Name",
            "Player Name",
            "Position",
            "NFL Team",
            "Roster Slot",
            "Injury Status",
            "Percent Started",
            "Pos",
            "Owner Name"
        ])

        # Loop through each team in the league
        for team in league.teams:
            print(f"  Processing {team.team_name}...")

            # Get the owner's full name for this team
            owner = team.owners[0]
            owner_name = f"{owner['firstName']} {owner['lastName']}"

            # Loop through each player on this team's roster
            for player in team.roster:
                ws.append([
                    team.team_name,
                    player.name,
                    player.position,
                    player.proTeam,
                    player.lineupSlot,
                    player.injuryStatus,
                    player.percent_started,
                    player.posRank,
                    owner_name
                ])

        # Determine output path (save to data/ directory)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        output_path = os.path.join(project_root, 'data', output_filename)

        # Save the Excel file
        wb.save(output_path)
        print(f"✓ Saved to {output_path}")
        return True

    except Exception as e:
        print(f"✗ Error scraping {output_filename}: {str(e)}")
        return False


def main():
    """
    Main function to scrape all three leagues.
    """
    print("\n" + "="*60)
    print("ESPN Fantasy Football Roster Scraper")
    print("="*60)

    # Define league configurations
    # Note: You may need to update these credentials if they expire
    leagues = [
        {
            'name': 'Dub League',
            'config': {
                'league_id': 96479385,
                'year': 2025,
                'espn_s2': 'AEBLTkLnfHujJ41yA7WpKNE7%2Fs1MzmaX4XuHY0L7e%2FcE9%2FOi33VZjDsjqMvEFQjblyLkMOk7Q%2F5Fu36u1vnKD%2B2tFbgnz%2FqHPDXri0Fb6sweFe4y9qPi16YSqjzrJvqLOUAhSiWhsgkrBkdbwtQZZrRUZChXSQrezVsqFSmYzuDZ9abyiXSwN86xA2OX%2BFuPqVCjxoNabbGhhTb%2FMKEuXEd6ByhZmSqaSRfocst5Gpku%2BgonBpesFR6qJJjHm%2BJSyQZfs1uoWR9TnsjrZxrw3IUv%2FLd6zi1s%2FbGunsNHBkF2Pg%3D%3D',
                'swid': '{273A56A8-8D06-486D-8085-A3D29F8DA5D2}'
            },
            'output_file': 'roster_dub.xlsx'
        },
        {
            'name': 'Pitt League',
            'config': {
                'league_id': 1380786104,
                'year': 2025,
                'espn_s2': 'AEA9yNQ1es19aXwjLxGHsO7YZVFGwukA4ku7y6tV0m1%2F2uWeUZFcEkjbW7ie3eGiby2eRp5jV6htEMImvAdhPDDV6oeLR26Q0IL%2FsbTpcb0fnOs%2B4hH7Ffg%2FHCn%2FOW1dHF2l7WVASbHkN5O8Xnu%2BIWIHIiFKxluHbQsZauprX8weM4amU1xNlz14YByqmSZoAwLvPG8FEcqql3JQGMhFiPnBVBWOsUbalKkMcHkSZQP0LI2Uqaeo8r%2F467LlHLP5Dt0jv%2F5No1v0FakDV5jg6EhwRAkdb8l7J0HGQHbdH6QKQA%3D%3D',
                'swid': '{273A56A8-8D06-486D-8085-A3D29F8DA5D2}'
            },
            'output_file': 'roster_pitt.xlsx'
        },
        {
            'name': 'Men League',
            'config': {
                'league_id': 1117367117,
                'year': 2025,
                'espn_s2': 'AEBLTkLnfHujJ41yA7WpKNE7%2Fs1MzmaX4XuHY0L7e%2FcE9%2FOi33VZjDsjqMvEFQjblyLkMOk7Q%2F5Fu36u1vnKD%2B2tFbgnz%2FqHPDXri0Fb6sweFe4y9qPi16YSqjzrJvqLOUAhSiWhsgkrBkdbwtQZZrRUZChXSQrezVsqFSmYzuDZ9abyiXSwN86xA2OX%2BFuPqVCjxoNabbGhhTb%2FMKEuXEd6ByhZmSqaSRfocst5Gpku%2BgonBpesFR6qJJjHm%2BJSyQZfs1uoWR9TnsjrZxrw3IUv%2FLd6zi1s%2FbGunsNHBkF2Pg%3D%3D',
                'swid': '{273A56A8-8D06-486D-8085-A3D29F8DA5D2}'
            },
            'output_file': 'roster_men.xlsx'
        }
    ]

    # Scrape each league
    results = []
    for league in leagues:
        success = scrape_league(
            league_config=league['config'],
            output_filename=league['output_file'],
            current_week=9  # Update this as the season progresses
        )
        results.append((league['name'], success))

    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for name, success in results:
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{status}: {name}")

    # Exit with error code if any failed
    if not all(success for _, success in results):
        print("\nSome leagues failed to scrape.")
        exit(1)
    else:
        print("\nAll leagues scraped successfully!")
        exit(0)


if __name__ == "__main__":
    main()
