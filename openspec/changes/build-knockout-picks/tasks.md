## 1. Database And Environment

- [x] 1.1 Add `KNOCKOUT_PICKS_LOCKED_AT=2026-06-28T19:00:00.000Z` to env examples and deadline helpers.
- [x] 1.2 Create Supabase migration for `knockout_matches`, `knockout_submissions`, `knockout_picks`, `knockout_match_results`, and `knockout_pick_scores`.
- [x] 1.3 Add indexes, uniqueness constraints, foreign keys, and point/round checks for knockout tables.
- [x] 1.4 Add RLS policies so `knockout_matches` are readable and sensitive knockout tables are handled server-side/service-role only.
- [x] 1.5 Convert or integrate `supabase/knockout_2026_bracket.sql` into the migration/seed flow for the 31-match bracket.
- [x] 1.6 Add verification SQL or checks for missing teams, broken match links, and expected 31-match count.

## 2. Server Validation And Submission

- [x] 2.1 Add knockout TypeScript types for matches, rounds, slots, picks, submissions, and bracket state.
- [x] 2.2 Add knockout constants for 31 total picks, round order, point values, and friendly display-code mapping.
- [x] 2.3 Implement reusable client/server bracket helpers to resolve slots from prior picks.
- [x] 2.4 Implement server-side shape validation for `{ matchCode, pickedTeamId }[]` payloads.
- [x] 2.5 Create `submit_knockout_picks` RPC with atomic insert and strict round-by-round bracket coherence validation.
- [x] 2.6 Implement `submitKnockoutPicksAction` using the existing server-side Supabase/service-role pattern.
- [x] 2.7 Return clear errors for incomplete picks, expired deadline, duplicate submission, invalid match/team, and incoherent bracket.

## 3. Knockout Route Data Loading

- [x] 3.1 Create `/mata-mata` route guarded by the current email/profile session flow.
- [x] 3.2 Redirect unauthenticated users to `/login?next=/mata-mata`.
- [x] 3.3 Redirect users without nickname through profile creation while preserving `next=/mata-mata`.
- [x] 3.4 Load knockout matches with team data ordered for bracket rendering.
- [x] 3.5 Load the current user's knockout submission and picks if already submitted.
- [x] 3.6 Show blocked assembly state when deadline has passed and no submission exists.

## 4. Bracket UI

- [x] 4.1 Build reusable knockout match card with two direct team buttons, locked placeholder slots, and accessible labels.
- [x] 4.2 Build desktop bracket layout with left/right halves converging into the final and simple connectors.
- [x] 4.3 Build mobile bracket layout grouped vertically by phase without connector lines.
- [x] 4.4 Implement strict chained selection so future slots populate from prior winners.
- [x] 4.5 Clear affected descendant picks when an earlier winner changes.
- [x] 4.6 Keep save button visible but disabled until progress reaches 31/31.
- [x] 4.7 Add secondary `Limpar chave` action with confirmation before submission.
- [x] 4.8 Apply dark competitive visual style consistent with the existing app.

## 5. Confirmation And Locked Summary

- [x] 5.1 Add confirmation modal with all 31 picks listed by phase and winner.
- [x] 5.2 Require irreversible-submission checkbox before final submit.
- [x] 5.3 Submit through the server action and switch to locked mode on success.
- [x] 5.4 Render submitted knockout picks as a read-only visual bracket.
- [x] 5.5 Ensure no edit, clear, or submit controls appear in locked summary mode.

## 6. Navigation And Auth Intent

- [x] 6.1 Update home page to make `/mata-mata` the primary CTA and show the knockout deadline/locked state.
- [x] 6.2 Update header navigation with separate `Mata-mata` and `Fase de grupos` links.
- [x] 6.3 Update login/profile actions to preserve allowlisted `next` routes, including `/mata-mata`.
- [x] 6.4 Ensure invalid or external `next` values fall back to a safe internal route.

## 7. Verification

- [x] 7.1 Run `npm run lint`.
- [x] 7.2 Run `npm run build`.
- [ ] 7.3 Manually verify new email + nickname flow to `/mata-mata`.
- [ ] 7.4 Manually verify existing email recovers profile and can submit knockout picks.
- [ ] 7.5 Manually verify 31/31 completion, confirmation checkbox, irreversible submit, duplicate prevention, and locked summary.
- [ ] 7.6 Manually verify expired deadline blocks unsubmitted users while submitted users can review their bracket.
- [ ] 7.7 Manually verify mobile and desktop layouts do not overlap and remain usable.
