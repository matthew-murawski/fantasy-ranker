#!/usr/bin/env python3
"""
Simple local runner for the roster scraper.
Usage: python3 run_scraper.py [week_number]
Example: python3 run_scraper.py 10
"""

import sys
import os

# Add the python directory to the path so we can import scrape_rosters
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

from scrape_rosters import scrape_league


def main():
    """
    Run the scraper for all three leagues locally.
    """
    # Determine the current week (default to 9, or use command line argument)
    current_week = 9
    if len(sys.argv) > 1:
        try:
            current_week = int(sys.argv[1])
            print(f"Using week {current_week} from command line argument")
        except ValueError:
            print(f"Invalid week number: {sys.argv[1]}. Using default week 9.")
    else:
        print(f"Using default week {current_week} (pass week number as argument to change)")

    print("\n" + "="*60)
    print("ESPN Fantasy Football Roster Scraper - Local Runner")
    print("="*60)

    # Define league configurations (same as in scrape_rosters.py)
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
                'espn_s2': 'AEAbleP7xjl6Yf1a8Uc9f26UwUywOuAVmzT4ASkjcx88%2F0QI4Dh7v6d03QUpLYvUA76BqZGGuUsNd%2B9WKmnR1QH9HqwS0F8xvYEe8feXfCCGJdEWtknjnoC55Xryr1YZYdN%2BAD0cIwc%2FyCipibnhJSNIg0g3HHZ3mRk6kN0FWEJEj3o7BCtuHYqqrpHqN0vVG4a9NYeusRjO3hFHT31atOFGIERjfWlrkPzN3IKEJgMI0JKtqsKPn20oVy5TYBMjepp22swMU4dJaQaCPEkaFrcTeFzBd3YFAGTb0Upl%2FpgP%2FA%3D%3D',
                'swid': '{BE4FFB5F-9056-4FD9-BF01-F311BD7548BC}'
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
            current_week=current_week
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
        print("\n⚠️  Some leagues failed to scrape.")
        print("After you commit and push the successful ones, the failed ones may need credential updates.")
        exit(1)
    else:
        print("\n✓ All leagues scraped successfully!")
        print("\nNext steps:")
        print("  1. Review the updated files in data/")
        print("  2. git add data/*.xlsx")
        print("  3. git commit -m 'chore: update roster data for week " + str(current_week) + "'")
        print("  4. git push")
        exit(0)


if __name__ == "__main__":
    main()
