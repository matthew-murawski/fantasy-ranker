Spacing System
We'll use a consistent scale based on multiples of 4px. This creates visual rhythm and makes everything feel cohesive.
Spacing Scale:

xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px

Application:

Space between player cards: 12px (3 × 4px)
Padding inside player cards: 16px horizontal, 12px vertical
Space between the two comparison panels: 24px
Margin around section headers: 8px bottom
Panel padding (overall container): 24px
Space between position badge and player name: 8px

Component Specifications
Player Cards:

Background: #1e2128
Border: 1px solid #2a2e37 (very subtle)
Border radius: 8px
Padding: 16px horizontal, 12px vertical
Hover state: Background lightens slightly to #252930, transition 0.2s ease
Layout: Flexbox with position badge on left, player info in middle, stats on right

Position Badges:

Size: 40px × 32px (compact rounded rectangle)
Border radius: 6px
Background: Use the position colors we defined, but at 20% opacity
Border: 1px solid of the same position color at full opacity
Text: Position abbreviation (QB, RB, etc.), 12px, weight 600, uppercase, color matching the border
Alignment: Centered both vertically and horizontally

Comparison Panels:

Background: #1e2128
Border radius: 12px
Padding: 24px
Width: Each panel takes 50% of available space minus gap
Gap between panels: 24px
Shadow: Optional subtle shadow 0 4px 6px rgba(0, 0, 0, 0.3) for depth

Buttons (Arrow buttons for choosing teams):

Background: #00d4aa (teal accent)
Padding: 16px horizontal, 12px vertical
Border radius: 8px
Text: 15px, weight 600, color #0f1419 (dark, for contrast against teal)
Hover state: Background lightens to #00e6bd, transition 0.2s ease
Border: none
Min-width: 120px

Progress Bar:

Container background: #1e2128
Fill color: #00d4aa (teal accent)
Height: 8px
Border radius: 4px
Transition: width 0.3s ease

Section Headers (STARTERS, BENCH, IR):

Text: 14px, weight 600, uppercase, letter-spacing 0.05em
Color: #9ca3af
Margin bottom: 12px
Optional: thin border-bottom 1px solid #2a2e37 with 8px padding-bottom

View Toggle Buttons (Starters/Bench vs By Position):

Background inactive: transparent
Background active: #2a2e37
Text: 14px, weight 500
Color inactive: #6b7280
Color active: #e8eaed
Padding: 8px 16px
Border radius: 6px
Border: 1px solid #2a2e37
Transition: all 0.2s ease

Team Name Headers (on rankings screen):

Text: 18px, weight 600
Color: #e8eaed
Expandable cards should have a subtle hover state (background #252930)

Injury Status Indicators:

IR badge: Small pill shape, background #ef4444 at 20% opacity, border 1px solid #ef4444, text "IR" in #ef4444
Size: Auto-width with 6px horizontal padding, 4px vertical padding, 4px border radius
Position: Next to player name

Layout Structure
Comparison Screen:

Max width: 1400px centered
Two columns (panels) with 24px gap
Progress bar at top with 32px margin-bottom
Instructions/header text centered above panels

Rankings Screen:

Max width: 800px centered (narrower, single column)
Team cards stack vertically with 16px gap
Each card expands on click to show full roster

Responsive Behavior:

On screens below 768px width, comparison panels stack vertically
Gap between stacked panels: 24px
Font sizes remain the same (readable on mobile)
Padding reduces slightly: panels go to 16px instead of 24px

Interactive States & Accessibility
Focus Indicators:

All interactive elements get a 2px solid outline in #00d4aa when focused
Outline offset: 2px
Applied to buttons, clickable cards, toggle buttons

Keyboard Navigation:

Left/Right arrow keys already work for team selection
Tab order should flow logically through interactive elements
Enter key should work on focused buttons

Animations:

Keep transitions subtle: 0.2s ease for most state changes
Progress bar fills smoothly: 0.3s ease
Card expansions: 0.25s ease
No animations that could cause motion sickness (no spinning, excessive movement)