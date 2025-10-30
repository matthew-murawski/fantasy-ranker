Implementation Prompts for Claude Code
Context for All Prompts
Before starting, Claude Code should know:

The project uses React 18 + TypeScript with Vite
CSS Modules are already in place for component styling
There's a central theme file at src/styles/theme.css
The app has working logic; we're only changing visuals
We're aiming for a dark, minimalist aesthetic similar to Sleeper app


Step 1: Install Inter Font
Install the Fontsource Inter package to replace the current font with Inter. Use npm to install @fontsource/inter with all weights from 400-700. After installation, import Inter in the main entry point (src/main.tsx) at the very top of the file, before any other imports. Import the base Inter font and weights 400, 500, 600, and 700. Make sure the imports are added but don't modify any other code in main.tsx.
```

---

## Step 2: Update Theme Variables
```
Update src/styles/theme.css with the new color palette, typography system, and spacing scale. Replace all existing color variables with the new dark theme colors. Add typography variables for the Inter font family with fallbacks, and create font size and weight variables for the hierarchy. Add spacing scale variables using multiples of 4px. Here are the specific values to use:

Colors:
- --color-bg-primary: #0f1419
- --color-bg-secondary: #1e2128
- --color-bg-tertiary: #2a2e37
- --color-bg-hover: #252930
- --color-text-primary: #e8eaed
- --color-text-secondary: #9ca3af
- --color-text-tertiary: #6b7280
- --color-accent: #00d4aa
- --color-accent-hover: #00e6bd
- --color-border: #2a2e37

Position badge colors:
- --color-qb: #fb7185
- --color-rb: #34d399
- --color-wr: #60a5fa
- --color-te: #fbbf24
- --color-k: #a78bfa
- --color-dst: #fb923c
- --color-flex: #94a3b8
- --color-bench: #6b7280
- --color-ir: #ef4444

Typography:
- --font-family: 'Inter', system-ui, -apple-system, sans-serif
- --font-size-xs: 12px
- --font-size-sm: 13px
- --font-size-base: 14px
- --font-size-md: 15px
- --font-size-lg: 16px
- --font-size-xl: 18px
- --font-size-2xl: 32px
- --font-weight-normal: 400
- --font-weight-medium: 500
- --font-weight-semibold: 600
- --font-weight-bold: 700
- --line-height-tight: 1.2
- --line-height-snug: 1.3
- --line-height-normal: 1.5

Spacing:
- --spacing-xs: 4px
- --spacing-sm: 8px
- --spacing-md: 16px
- --spacing-lg: 24px
- --spacing-xl: 32px
- --spacing-2xl: 48px

Also update the body styles in theme.css to use the new background color and Inter font. Set background-color to var(--color-bg-primary), color to var(--color-text-primary), and font-family to var(--font-family).
```

---

## Step 3: Restyle Player Cards
```
Update the player card styling to use the new theme variables. Find the CSS Module file for player cards (likely PlayerCard.module.css or similar in the components directory) and update it with the following specifications:

Card container:
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: 8px
- Padding: var(--spacing-md) for horizontal, 12px for vertical
- Add subtle box shadow: 0 4px 6px rgba(0, 0, 0, 0.3)
- Display: flex with proper alignment for badge, info, and stats

Player name:
- Font size: var(--font-size-lg)
- Font weight: var(--font-weight-semibold)
- Color: var(--color-text-primary)
- Line height: var(--line-height-normal)

Team and position info (secondary text):
- Font size: var(--font-size-base)
- Font weight: var(--font-weight-normal)
- Color: var(--color-text-secondary)

Stats and percentages (tertiary text):
- Font size: var(--font-size-xs)
- Font weight: var(--font-weight-normal)
- Color: var(--color-text-tertiary)

Add spacing between player cards in their parent container (likely 12px margin-bottom).

Don't add hover states yet; we'll do that in a later step.
```

---

## Step 4: Create New Position Badge Styling
```
Update the position badge component styling to create color-coded badges for each position. Find the PositionBadge CSS Module file and update it with these specifications:

Badge container:
- Width: 40px
- Height: 32px
- Border radius: 6px
- Display: flex with centered content
- Font size: var(--font-size-xs)
- Font weight: var(--font-weight-semibold)
- Text transform: uppercase
- Line height: var(--line-height-snug)

For each position, create a CSS class that uses the position color at 20% opacity for background and full opacity for the border (1px solid). The text should match the border color. Create classes for:
- .qb: uses --color-qb
- .rb: uses --color-rb
- .wr: uses --color-wr
- .te: uses --color-te
- .k: uses --color-k
- .dst: uses --color-dst
- .flex: uses --color-flex
- .bench: uses --color-bench
- .ir: uses --color-ir

The badge text should display the position abbreviation (QB, RB, WR, etc.).

Update the component's TypeScript/JSX to apply the correct class based on the position prop. Make sure the badge appears next to the player name with var(--spacing-sm) margin-right.
```

---

## Step 5: Update Comparison Panel Layout and Styling
```
Update the comparison panel styling to use the new dark theme. Find the CSS Module for the comparison view/panels (likely ComparisonView.module.css or similar) and update it with these specifications:

Panel container:
- Background: var(--color-bg-secondary)
- Border radius: 12px
- Padding: var(--spacing-lg)
- Optional box shadow: 0 4px 6px rgba(0, 0, 0, 0.3)

Two-column layout:
- Display: flex or grid with two equal columns
- Gap between panels: var(--spacing-lg)
- Max width: 1400px centered

Overall page background should use var(--color-bg-primary).

Make sure the roster lists inside each panel have proper spacing (12px between player cards as specified earlier).

Update any container or wrapper elements to ensure they're using the new background colors and spacing system.
```

---

## Step 6: Restyle Section Headers and View Toggles
```
Update the styling for section headers (STARTERS, BENCH, IR) and the view toggle buttons (Starters/Bench vs By Position).

Section headers:
- Font size: var(--font-size-base)
- Font weight: var(--font-weight-semibold)
- Text transform: uppercase
- Letter spacing: 0.05em
- Color: var(--color-text-secondary)
- Margin bottom: 12px
- Optional: add a thin border-bottom (1px solid var(--color-border)) with 8px padding-bottom

View toggle buttons:
Create two states (active and inactive):

Inactive state:
- Background: transparent
- Text color: var(--color-text-tertiary)
- Border: 1px solid var(--color-border)
- Font size: var(--font-size-base)
- Font weight: var(--font-weight-medium)
- Padding: var(--spacing-sm) var(--spacing-md)
- Border radius: 6px

Active state:
- Background: var(--color-bg-tertiary)
- Text color: var(--color-text-primary)
- Border: 1px solid var(--color-border)
- Same sizing as inactive

The toggles should be grouped together (likely in a button group container). Make sure the component logic properly applies the active class based on the current view state.
```

---

## Step 7: Update Button Styles (Choice/Arrow Buttons)
```
Update the styling for the main action buttons (the arrow buttons or choice buttons used to select between teams in the comparison view).

Button specifications:
- Background: var(--color-accent)
- Text color: var(--color-bg-primary) for contrast
- Font size: var(--font-size-md)
- Font weight: var(--font-weight-semibold)
- Padding: var(--spacing-md) horizontal, 12px vertical
- Border radius: 8px
- Border: none
- Min-width: 120px
- Cursor: pointer

Find the CSS Module for these buttons (likely in a ComparisonView or Button component) and apply these styles. Make sure the buttons have proper aria-labels for accessibility.

Don't add hover states yet; we'll handle all interactive states in a later step.
```

---

## Step 8: Restyle Progress Bar
```
Update the progress bar component styling to match the new theme.

Progress bar container:
- Background: var(--color-bg-secondary)
- Height: 8px
- Border radius: 4px
- Width: 100%
- Overflow: hidden

Progress bar fill:
- Background: var(--color-accent)
- Height: 100%
- Border radius: 4px
- Width: calculated based on progress percentage

Progress text/label (if exists):
- Font size: var(--font-size-base)
- Font weight: var(--font-weight-medium)
- Color: var(--color-text-secondary)
- Display above or below the bar with var(--spacing-md) margin

Find the progress bar CSS Module and apply these styles. Make sure the fill element has a smooth width transition (we'll refine this in the transitions step, but you can add transition: width 0.3s ease now).
```

---

## Step 9: Update Rankings Screen Styling
```
Update the rankings screen where final power rankings are displayed with expandable team cards.

Rankings container:
- Max width: 800px centered
- Padding: var(--spacing-lg)
- Background: var(--color-bg-primary)

Screen title ("POWER RANKINGS"):
- Font size: var(--font-size-2xl)
- Font weight: var(--font-weight-bold)
- Color: var(--color-text-primary)
- Margin bottom: var(--spacing-xl)
- Text align: center

Team cards:
- Background: var(--color-bg-secondary)
- Border: 1px solid var(--color-border)
- Border radius: 12px
- Padding: var(--spacing-md)
- Margin bottom: var(--spacing-md)
- Cursor: pointer for expandable cards

Team name:
- Font size: var(--font-size-xl)
- Font weight: var(--font-weight-semibold)
- Color: var(--color-text-primary)

Rank number (if displayed):
- Font size: var(--font-size-lg)
- Font weight: var(--font-weight-bold)
- Color: var(--color-text-secondary)

When expanded, the card should show the full roster using the same player card styling we updated in Step 3.

Find the Rankings component CSS Module and apply these styles.
```

---

## Step 10: Add Interactive States and Transitions
```
Add hover states, focus indicators, and smooth transitions to all interactive elements throughout the app.

Player cards:
- Hover: background changes to var(--color-bg-hover)
- Transition: background-color 0.2s ease

Buttons (choice/arrow buttons):
- Hover: background changes to var(--color-accent-hover)
- Transition: background-color 0.2s ease

View toggle buttons:
- Hover on inactive buttons: opacity 0.8
- Transition: all 0.2s ease

Team cards on rankings screen:
- Hover: background changes to var(--color-bg-hover)
- Transition: background-color 0.2s ease

Focus indicators (for keyboard accessibility):
- All interactive elements should have a focus state
- Outline: 2px solid var(--color-accent)
- Outline offset: 2px
- Apply to buttons, clickable cards, and toggle buttons

Card expand/collapse animation:
- Transition: max-height 0.25s ease, opacity 0.25s ease

Update all relevant CSS Module files to add these hover, focus, and transition properties. Make sure focus states work properly for keyboard navigation (test with Tab key).
```

---

## Step 11: Update Responsive Styles for Mobile
```
Add or update responsive styles to ensure the app looks good on mobile devices (screens below 768px width).

Comparison panels:
- Change from side-by-side to stacked vertically
- Gap between stacked panels: var(--spacing-lg)
- Each panel takes full width

Panel padding:
- Reduce from var(--spacing-lg) to var(--spacing-md) on mobile

Font sizes:
- Keep the same (they're already readable on mobile)

Player cards:
- Maintain current layout but ensure they don't overflow
- Consider reducing horizontal padding slightly if needed

Buttons:
- Ensure touch targets are at least 44px tall for accessibility
- Stack buttons vertically if they're side-by-side on desktop

Rankings screen:
- Reduce max-width to 100% with appropriate side padding
- Reduce heading size slightly if needed (maybe var(--font-size-xl) instead of var(--font-size-2xl))

Add media queries in the relevant CSS Module files with breakpoint at max-width: 768px. Make sure to test that touch interactions work well and nothing feels cramped.
```

---

## Step 12: Final Integration Check and Cleanup
```
Do a final review of the entire app to ensure everything is properly integrated and polished.

Checklist:
1. Verify all components are using theme variables instead of hardcoded colors
2. Check that Inter font is loading properly across all text
3. Confirm spacing is consistent throughout (all using the spacing scale)
4. Test all interactive states: hover, focus, and active states work correctly
5. Verify the app works smoothly on both desktop and mobile viewports
6. Check that position badges show correct colors for each position type
7. Ensure keyboard navigation works (Tab, Enter, Arrow keys)
8. Confirm no console errors or warnings
9. Test the full user flow: comparison -> rankings, expand cards, etc.
10. Remove any unused CSS classes or commented-out code

Look through all the CSS Module files we've modified and clean up any redundant or conflicting styles. Make sure there are no orphaned styles that aren't being used by components.

If there are any theme variables that were defined but not used, consider whether they should be applied somewhere or removed.

Test the app in both light and dark mode if applicable, or ensure the dark theme works consistently across all screens.

Report back with a summary of what was checked and any issues found that need addressing.