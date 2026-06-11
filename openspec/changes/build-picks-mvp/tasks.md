## 1. Project Setup

- [x] 1.1 Create or verify Next.js App Router project with TypeScript and Tailwind CSS.
- [x] 1.2 Configure Supabase client and server helpers.
- [x] 1.3 Add required environment variables, including `PICKS_LOCKED_AT`.
- [x] 1.4 Add shared pick constants for 6/10/6 and total 22.

## 2. Database

- [x] 2.1 Create `profiles` migration with unique `nickname`.
- [x] 2.2 Create `teams` migration with `name`, `code`, `group_name`, and `flag_emoji`.
- [x] 2.3 Create `pick_submissions` migration with `unique(user_id)`.
- [x] 2.4 Create `picks` migration with `unique(submission_id, team_id)` and `pick_type` check.
- [x] 2.5 Enable RLS for sensitive tables.
- [x] 2.6 Add RLS policies for profiles, teams, submissions, and picks.
- [x] 2.7 Add seed data for all 48 World Cup 2026 teams grouped A-L.

## 3. Authentication And Profile

- [x] 3.1 Implement `/login` with Supabase magic link.
- [x] 3.2 Implement auth callback/session handling if required by the Supabase setup.
- [x] 3.3 Implement nickname creation page or gate after login.
- [x] 3.4 Validate nickname is required and unique.
- [x] 3.5 Redirect users without nickname away from `/picks`.

## 4. Picks Validation

- [x] 4.1 Implement reusable pick validation utilities.
- [x] 4.2 Validate authenticated user.
- [x] 4.3 Validate user has nickname.
- [x] 4.4 Validate current time is before `PICKS_LOCKED_AT`.
- [x] 4.5 Validate user has no existing submission.
- [x] 4.6 Validate exactly 22 picks.
- [x] 4.7 Validate exactly 6 `GROUP_WINNER`, 10 `QUALIFIED_NOT_WINNER`, and 6 `ELIMINATED`.
- [x] 4.8 Validate no duplicated teams.
- [x] 4.9 Validate all teams exist.

## 5. Picks Submission

- [x] 5.1 Implement Server Action to submit picks.
- [x] 5.2 Insert one `pick_submissions` row and 22 `picks` rows atomically.
- [x] 5.3 Return clear error messages for validation failures.
- [x] 5.4 Handle duplicate-submission database errors gracefully.
- [x] 5.5 Do not support updating or deleting submitted picks in the MVP.

## 6. Picks UI

- [x] 6.1 Implement `/picks` assembly mode.
- [x] 6.2 Render teams grouped by Group A through Group L.
- [x] 6.3 Implement clickable category cards as active-category selector and summary.
- [x] 6.4 Implement mobile sticky compact category selector.
- [x] 6.5 Add team selection and removal from group cards.
- [x] 6.6 Add removal from category cards.
- [x] 6.7 Block adding a team already selected in another category.
- [x] 6.8 Block adding more teams after a category reaches its limit.
- [x] 6.9 Disable save until all 22 picks are complete.
- [x] 6.10 Implement confirmation modal with summary and irreversible-submission checkbox.
- [x] 6.11 Implement locked summary mode after submission.
- [x] 6.12 Show locked-state messaging after `PICKS_LOCKED_AT`.

## 7. Visual Polish

- [x] 7.1 Apply dark competitive minimal theme.
- [x] 7.2 Use clean team cards with flag emoji, short Portuguese name, and FIFA code.
- [x] 7.3 Ensure mobile layout does not overlap or hide controls.
- [x] 7.4 Make submitted summary suitable for screenshots/sharing.

## 8. Verification

- [x] 8.1 Run `npm run lint`.
- [x] 8.2 Run `npm run build`.
- [ ] 8.3 Manually verify login, nickname, pick assembly, final confirmation, submission, duplicate prevention, and locked summary.
