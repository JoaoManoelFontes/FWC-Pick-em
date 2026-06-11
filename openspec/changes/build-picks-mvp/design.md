# Design: Picks MVP

## Goals

- Make the picks flow feel polished, minimal, competitive, and easy to understand.
- Keep the architecture simple: Next.js App Router, Server Actions, Supabase, and PostgreSQL.
- Keep all important rules enforced server-side.
- Avoid building ranking/admin before the core submission flow is solid.

## User Flow

1. User opens the app.
2. User logs in with Supabase magic link.
3. If the user has no nickname, the user creates a unique nickname.
4. User enters `/picks`.
5. If the user already submitted picks, the user sees a locked summary.
6. If the user has not submitted and the deadline is open, the user enters assembly mode.
7. User selects an active category card.
8. User clicks teams grouped by World Cup group to add them to the active category.
9. User can remove selected teams either from the group card or from the category card.
10. Once 22/22 picks are complete, the save button becomes available.
11. User opens a confirmation modal with all picks grouped by category.
12. User checks an explicit irreversible-submission checkbox.
13. User submits once.
14. Server validates and stores the submission.
15. `/picks` switches to a read-only summary view.

## Pick Model

Use a parent submission table plus child picks:

- `pick_submissions`
  - one row per user
  - `unique(user_id)` enforces one irreversible submission
  - owns the `submitted_at` timestamp
- `picks`
  - 22 rows per submission
  - each row has `team_id` and `pick_type`
  - `unique(submission_id, team_id)` prevents repeated teams

The 6/10/6 counts are validated in server-side TypeScript. Count constraints in PostgreSQL are intentionally deferred to avoid trigger complexity in the MVP.

## Pick Rules

Required counts:

- `GROUP_WINNER`: 6
- `QUALIFIED_NOT_WINNER`: 10
- `ELIMINATED`: 6
- Total: 22

Validation rules:

- User must be authenticated.
- User must have a nickname.
- `PICKS_LOCKED_AT` must not be reached.
- User must not already have a submission.
- Exactly 22 picks must be submitted.
- Category counts must match 6/10/6 exactly.
- No duplicated teams.
- All submitted teams must exist in `teams`.

No MVP validation should prevent logically odd group combinations. For example, two `GROUP_WINNER` picks from the same group are allowed.

## Lock Deadline

Use:

```env
PICKS_LOCKED_AT=2026-06-11T18:00:00.000Z
```

The value is stored as ISO UTC in environment variables. UI should display it in Brasilia time.

## UI Structure

The `/picks` page has two modes:

- Assembly mode: before submission.
- Locked summary mode: after submission.

Assembly mode:

- Three clickable category cards:
  - Lideres de grupo, 0/6
  - Classificados, 0/10
  - Eliminados, 0/6
- The active category is highlighted in blue.
- Complete categories show a subtle green state.
- The total progress is shown as 0/22 through 22/22.
- Teams are grouped by World Cup group, using cards for Group A through Group L.
- Each team card uses flag emoji, short Portuguese name, and FIFA code.
- On mobile, category selector/summary stays sticky at the top in compact form.

Locked summary mode:

- Shows nickname.
- Shows submitted timestamp.
- Shows the three categories and all selected teams.
- Has no edit controls.
- Should be visually clean enough for screenshots/sharing.

## Data Style

Team names should be short and familiar in Portuguese.

Examples:

- EUA
- Coreia do Sul
- Tchequia
- RD Congo
- Costa do Marfim
- Arabia Saudita
- Cabo Verde

Prefer ASCII in code and seed files unless the file already intentionally uses accents. UI copy may display accents when appropriate.

## Future Work

Ranking, admin, results, and scoring should build on this submission model later.

Future scoring logic:

```ts
if (pick_type === "GROUP_WINNER") {
  correct = result.group_position === 1;
}

if (pick_type === "QUALIFIED_NOT_WINNER") {
  correct = result.qualified === true && result.group_position !== 1;
}

if (pick_type === "ELIMINATED") {
  correct = result.qualified === false;
}
```

