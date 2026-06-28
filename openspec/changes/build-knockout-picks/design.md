# Design: Knockout Picks

## Context

The current app already supports a casual group-stage Pick'em with lightweight email/nickname identity, profile recovery by email, server-side validation, one irreversible submission, and locked summary viewing.

The knockout stage needs to be a separate contest because users may join now even if they did not submit group-stage picks. The first round-of-32 match starts at `2026-06-28T19:00:00.000Z`, so the implementation should prioritize safely capturing complete brackets before that deadline.

The initial knockout bracket is manually seeded from `supabase/knockout_2026_bracket.sql`, which encodes match structure with stable match codes, round, side, display order, source matches, next match, and next slot.

## Goals / Non-Goals

**Goals:**

- Let logged-in users with a nickname submit one complete knockout bracket.
- Keep knockout picks independent from group-stage picks.
- Render a visual bracket that feels like a tournament simulator.
- Enforce all important rules server-side with an atomic RPC.
- Preserve the current simple operational model: Next.js App Router, Server Actions, Supabase, PostgreSQL, and no separate backend.
- Prepare minimal tables for future knockout results and scoring.
- Update home, navigation, and next redirects so the current main action is `/mata-mata`.

**Non-Goals:**

- Ranking for knockout picks.
- Admin UI.
- Match result entry UI.
- Score recalculation UI.
- Public pick viewing.
- Local draft persistence.
- Drag-and-drop interactions.

## Decisions

### Separate knockout data model

Use separate tables for knockout submissions and picks:

- `knockout_matches`
- `knockout_submissions`
- `knockout_picks`
- `knockout_match_results`
- `knockout_pick_scores`

Rationale: group-stage picks and knockout picks are different contests with different deadlines, scoring, and validation. Separate tables avoid overloading `pick_submissions` and keep one-submission uniqueness scoped correctly.

Alternative considered: reuse `pick_submissions` with a phase column. This would require changing existing assumptions and views for group-stage ranking, so it is riskier for an urgent feature.

### Encoded bracket structure

Each match has a stable `code`, `round`, `display_order`, `bracket_side`, optional initial teams, optional source match codes, and optional `next_match_code` plus `next_slot`.

Rationale: the UI can render a complete bracket and propagate winners without hardcoded pairings. The server can reconstruct each user's bracket path from the same structure.

Alternative considered: hardcode bracket progression in TypeScript. That would be faster for the first screen but brittle for validation and future scoring.

### Strict progression validation

The client only allows selecting a winner when both slots are resolved. Changing an earlier winner clears descendant picks affected by that branch.

The server action performs shape checks and calls `submit_knockout_picks(submitted_picks, locked_at, profile_id)`. The RPC validates:

- profile id exists.
- current time is before lock deadline.
- user has no knockout submission.
- exactly 31 unique match picks were submitted.
- all match codes exist.
- all picked teams exist.
- each pick is one of the two teams available for that match after reconstructing the user's bracket phase by phase.

Rationale: a forged payload must not be able to submit an impossible bracket.

Alternative considered: validate only that each picked team could theoretically reach a match. That misses contradictions inside the user's own path.

### Irreversible submission

`knockout_submissions` has `unique(user_id)`. No update/delete UI is implemented. The confirmation modal requires an explicit checkbox and shows all 31 picks grouped by phase.

Rationale: this matches the group-stage mental model and avoids complex edit windows near the deadline.

Alternative considered: allow edits until lock. This would require update/delete flows and more edge cases under deadline pressure.

### UI shape

Desktop uses two bracket halves converging into a centered final. Mobile uses vertical sections by phase. Future locked slots are visible as placeholders like `Vencedor R32-73` and become clickable only when their source picks resolve.

Cards are minimal. Team display uses a Brazilian-friendly TypeScript mapper for labels, with code as the primary visual element and flag as support. Full team names are available through `title` and `aria-label`.

Rationale: this keeps the page usable on phones while preserving the bracket feel on desktop.

Alternative considered: horizontal bracket with mobile scroll only. It is simpler but more frustrating on small screens.

### Deadline and redirects

Use `KNOCKOUT_PICKS_LOCKED_AT=2026-06-28T19:00:00.000Z`. Show the deadline in Brasilia time as static text, not a countdown.

Home and nav prioritize `/mata-mata`. Login/profile flow should preserve `next=/mata-mata` for users who started there. Unknown `next` values should fall back to `/mata-mata` or another allowlisted internal route.

Rationale: the deadline is immediate, and users should not land on the old group-stage flow after logging in.

## Risks / Trade-offs

- [Risk] The manually seeded bracket could contain a wrong pairing or broken link. -> Mitigation: include verification queries for missing teams and broken match links, and keep match codes visible in developer data.
- [Risk] Strict RPC validation in PL/pgSQL can be more complex than TypeScript. -> Mitigation: keep payload simple and validate round-by-round using `knockout_matches` as source of truth.
- [Risk] Minimal team labels may be ambiguous. -> Mitigation: use friendly display codes plus flags, and full names in accessibility labels/tooltips.
- [Risk] No draft persistence means a refresh loses unsent picks. -> Mitigation: accepted product trade-off for the urgent release; the UI should clearly show progress and finality.
- [Risk] Login by email without proof of possession lets someone who knows an email recover that profile. -> Mitigation: accepted casual-bolao risk; keep submissions irreversible and show current identity clearly.

## Migration Plan

1. Add/update environment example for `KNOCKOUT_PICKS_LOCKED_AT`.
2. Create a migration for knockout tables, RLS policies, and the submit RPC.
3. Execute or convert `supabase/knockout_2026_bracket.sql` so `knockout_matches` is populated.
4. Build `/mata-mata` with server-side loading of profile, submission, matches, and teams.
5. Update home, header navigation, login, and profile next redirects.
6. Run lint/build and manually submit a bracket in a test database.

Rollback: remove the `/mata-mata` route and nav/home links, then drop or ignore the knockout tables. Existing group-stage data remains untouched.

## Open Questions

None for the initial capture-only release.
