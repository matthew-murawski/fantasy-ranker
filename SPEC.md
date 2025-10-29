Fantasy Football Team Ranker - Complete Specification
Overview:
A web app that ranks fantasy football teams through head-to-head comparisons using a quicksort algorithm to minimize the number of comparisons needed.
Data Source:

Excel file: rosters.xlsx located in a "league data" folder
File naming convention: roster_dub.xlsx (currently only Dub League)
Columns: Team Name (A), Player Name (B), Position (C), NFL Team (D), Roster Slot (E), Injury Status (F)
Data starts in row 2
Roster Slot values: QB, WR, RB, RB/WR/TE, TE, D/ST, K, BE (bench)
Injury Status: Flag only when value is "INJURY_RESERVE"

User Flow:

App loads directly into Dub League (no league selection screen)
Shows first head-to-head comparison of two anonymous rosters
User selects better team via arrow buttons or keyboard arrow keys
Continues comparisons using quicksort algorithm (roughly 35-40 comparisons for 12 teams)
If rankings are extremely similar AND comparison hasn't been made, app requests direct tie-breaker comparison
Displays final power rankings with expandable team rosters

Comparison Screen:

Two rosters displayed side-by-side, each taking ~50% of screen width
Small space between rosters with roster slots aligned
Team names hidden (anonymous)
View toggle buttons in top left (two buttons, inactive one greyed out)
Two large arrow buttons at bottom (left arrow, right arrow)
Text above arrows: "click or use arrow keys to choose the best team"
Keyboard shortcuts: left/right arrow keys to select
Progress bar at bottom (visual only, no text/percentage)
Purple background, gray player cards, white text

Roster Views:
View 1: Starter/Bench/IR (Default)

Starters section with header "STARTERS"

Order: QB, RB, RB, WR, WR, TE, FLEX, D/ST, K
Format: Position label separated from player info
Example: QB | M. Stafford (LAR)
FLEX displayed instead of RB/WR/TE


Bench section with header "BENCH"

Organized by position (QBs, RBs, WRs, TEs, D/ST, K)
Format: Position integrated with player card
Example: RB R. White (TB)


IR section with header "IR"

Same format as bench
Only shows players with "INJURY_RESERVE" status



View 2: Position-Grouped

Position headers: QUARTERBACKS, RUNNING BACKS, WIDE RECEIVERS, TIGHT ENDS, D/ST, KICKERS
Players listed under each header
Format: M. Stafford (LAR)
IR status still flagged/visible

Final Power Rankings Page:

Header: "POWER RANKINGS"
Vertical stack of team name cards (numbered 1-12)
Team names now revealed
Click team card to expand roster inline below the card
No visual change to card when expanded
Roster always displays in Starter/Bench/IR format
End of session (no navigation buttons)

Visual Design:

Purple background
Gray player cards/roster spots
White text for contrast
Modern, sleek aesthetic
Developer discretion on interactive element colors (buttons, etc.)
Rosters separated by space only (no borders/backgrounds between panels)

Technical Requirements:

Web app
Quicksort algorithm for head-to-head comparisons
Optimize for minimum number of comparisons to establish 1-12 ranking
No progress saving (session-based only)
Excel file parsing for roster data