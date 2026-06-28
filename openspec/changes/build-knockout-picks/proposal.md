# Change: Build Knockout Picks

## Why

The group-stage Pick'em is already closed, and users now need a separate way to submit knockout-stage predictions before the first round-of-32 match starts.

This change captures a complete visual bracket for the knockout stage as a separate casual contest, so users who skipped the group stage can still join and existing users can submit one irreversible knockout bracket.

## What Changes

- Add a separate `/mata-mata` picks experience for the World Cup 2026 knockout stage.
- Use a complete visual bracket with two desktop halves converging into the final, plus a mobile vertical-by-round layout.
- Require users to pick the winner of every bracket match before submitting:
  - 16 round-of-32 picks.
  - 8 round-of-16 picks.
  - 4 quarterfinal picks.
  - 2 semifinal picks.
  - 1 champion pick.
- Enforce strict bracket progression: future matches are populated from prior picks, and changing an earlier pick clears affected descendant picks.
- Save only one winner per match, using payload items shaped like `{ matchCode, pickedTeamId }`.
- Keep knockout submissions independent from group-stage submissions.
- Require the same lightweight identity rules as the current app: email identifies the profile, nickname is required and unique, and email reuse recovers the same profile.
- Add `KNOCKOUT_PICKS_LOCKED_AT=2026-06-28T19:00:00.000Z` as the knockout lock deadline, displayed as Brasilia time.
- Submit picks through a server action backed by an atomic SQL RPC, with server-side validation of authentication/profile, deadline, uniqueness, 31 picks, valid matches, valid teams, and strict bracket coherence.
- Show a confirmation modal with a textual summary of all 31 picks grouped by phase and an irreversible-submission checkbox.
- After submission, show a locked visual bracket summary of the user's picks.
- If the deadline passes before submission, keep the bracket visible but blocked.
- Update home, navigation, and login/profile next-redirect flow so `/mata-mata` is the primary current action.
- Add minimal future-ready tables for knockout match results and knockout pick scores, without implementing ranking or scoring UI in this change.

Out of scope for this change:

- Knockout ranking UI.
- Admin tools.
- Result entry UI.
- Score recalculation UI or scheduled scoring.
- Public viewing of other users' knockout picks.
- Local draft persistence.

## Capabilities

### New Capabilities

- `knockout-picks`: Complete visual knockout bracket picking, irreversible submission, locked summary, and persistence model for future scoring.

### Modified Capabilities

None.

## Impact

- Adds Supabase schema for `knockout_matches`, `knockout_submissions`, `knockout_picks`, `knockout_match_results`, and `knockout_pick_scores`.
- Uses the existing `teams` table and the already-created manual knockout bracket SQL as the source for initial match structure.
- Adds a new server action and SQL RPC for knockout submission.
- Adds shared knockout constants, validation utilities, types, and display-code mapping for Brazilian-friendly team labels.
- Adds `/mata-mata` route and bracket UI components.
- Updates `/`, layout navigation, login, and profile flow to support `next=/mata-mata`.
