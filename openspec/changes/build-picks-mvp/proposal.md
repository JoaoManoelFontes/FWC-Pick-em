# Change: Build Picks MVP

## Why

The project needs a first playable MVP centered on the core user experience: authenticated users creating a public nickname, selecting World Cup Pick'em predictions, and submitting them once.

The previous broad scope included ranking, admin tools, results management, and scoring. Those are valuable future features, but the first delivery should focus on the picks flow so users can reliably submit their predictions before the lock deadline.

## What Changes

Build the MVP around:

- Supabase Auth magic-link login.
- A required unique nickname before the user can access or submit picks.
- A `/picks` experience showing the 48 World Cup 2026 teams grouped by Group A through Group L.
- Active-category picking: users choose a category, then click teams to add them.
- Pick limits changed to 6/10/6:
  - 6 `GROUP_WINNER`
  - 10 `QUALIFIED_NOT_WINNER`
  - 6 `ELIMINATED`
- A total of 22 picks per submission.
- No repeated team across categories.
- No group-level coherence validation in the MVP.
- A confirmation modal showing a summary of all picks plus an explicit checkbox before final submission.
- One irreversible submission per user.
- A locked read-only summary view after submission.
- Pick lock deadline from `PICKS_LOCKED_AT` in ISO UTC, displayed in Brasilia time.

Out of scope for this change:

- Ranking.
- Admin panel.
- Results entry.
- Score calculation UI or scheduled scoring.
- Multiple competitions.

## Impact

- Adds/updates Supabase migrations for profiles, teams, pick submissions, and picks.
- Adds seed data for all 48 World Cup 2026 teams with short Portuguese names, FIFA code, group, and flag emoji.
- Adds server-side validation for all pick submission rules.
- Adds client UI for login, nickname, picks, final confirmation, and read-only summary.
- Updates project constants and copy from 4/6/4 and 14 total picks to 6/10/6 and 22 total picks.

