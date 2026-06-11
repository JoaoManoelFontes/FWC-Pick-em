# Picks MVP Specification

## ADDED Requirements

### Requirement: Magic Link Authentication

The system SHALL allow users to authenticate with Supabase Auth magic links.

#### Scenario: User requests a login link

- **WHEN** an unauthenticated user enters a valid email on `/login`
- **THEN** the system sends a Supabase magic link to that email
- **AND** displays a clear confirmation message

#### Scenario: Authenticated user opens picks

- **WHEN** an authenticated user with a profile opens `/picks`
- **THEN** the system allows the user to view the picks experience

### Requirement: Unique Nickname Gate

The system SHALL require every authenticated user to create a unique nickname before submitting picks.

#### Scenario: User has no nickname

- **WHEN** an authenticated user without a nickname tries to access `/picks`
- **THEN** the system redirects or gates the user to create a nickname

#### Scenario: User creates unique nickname

- **WHEN** the user submits an unused nickname
- **THEN** the system creates or updates the user's profile
- **AND** allows the user to continue to picks

#### Scenario: User submits duplicate nickname

- **WHEN** the user submits a nickname already used by another profile
- **THEN** the system rejects it with a clear error message

### Requirement: Team List By Group

The system SHALL display all 48 World Cup 2026 teams grouped by Group A through Group L.

#### Scenario: User opens picks assembly mode

- **WHEN** the user opens `/picks` before submitting
- **THEN** the system displays teams grouped in cards by group
- **AND** each team card shows flag emoji, short Portuguese name, and FIFA code

### Requirement: Active Category Pick Selection

The system SHALL allow users to select picks by choosing an active category and clicking teams.

#### Scenario: User adds a team to active category

- **GIVEN** the user has selected an active category
- **AND** the category has remaining capacity
- **AND** the team is not already selected
- **WHEN** the user clicks the team
- **THEN** the system adds the team to the active category

#### Scenario: Category is full

- **GIVEN** the active category has reached its limit
- **WHEN** the user clicks another unselected team
- **THEN** the system does not add the team
- **AND** gives clear visual feedback

#### Scenario: Team is already selected

- **GIVEN** a team is already selected in any category
- **WHEN** the user tries to add that team to another category
- **THEN** the system prevents the duplicate selection

#### Scenario: User removes selected team

- **GIVEN** a team is selected
- **WHEN** the user clicks the selected team in the group list or uses the remove control in its category
- **THEN** the system removes the team from the current picks

### Requirement: Pick Count Rules

The system SHALL require exactly 22 picks in a 6/10/6 distribution.

#### Scenario: Complete pick set

- **WHEN** the user has selected 6 `GROUP_WINNER`, 10 `QUALIFIED_NOT_WINNER`, and 6 `ELIMINATED` picks
- **THEN** the system considers the picks complete
- **AND** enables the save flow

#### Scenario: Incomplete pick set

- **WHEN** the user has fewer than 22 picks
- **THEN** the system keeps the save flow disabled
- **AND** shows category progress

### Requirement: Server-Side Pick Validation

The system SHALL validate all submission rules on the server before inserting picks.

#### Scenario: Valid submission

- **GIVEN** the user is authenticated
- **AND** the user has a nickname
- **AND** the lock deadline has not passed
- **AND** the user has not submitted before
- **AND** the submitted picks contain exactly 6 `GROUP_WINNER`, 10 `QUALIFIED_NOT_WINNER`, and 6 `ELIMINATED`
- **AND** no team is duplicated
- **AND** all teams exist
- **WHEN** the user confirms submission
- **THEN** the system creates one submission and 22 picks

#### Scenario: Invalid submission

- **WHEN** any required validation fails
- **THEN** the system rejects the submission
- **AND** returns a clear error message

### Requirement: Irreversible Single Submission

The system SHALL allow each user to submit picks only once.

#### Scenario: User submits once

- **WHEN** a user successfully submits picks
- **THEN** the database stores one `pick_submissions` row for that user
- **AND** the system prevents future submissions from that user

#### Scenario: User double-clicks submit

- **WHEN** duplicate submission requests are received
- **THEN** the database `unique(user_id)` constraint prevents a second submission
- **AND** the application handles the duplicate gracefully

### Requirement: Confirmation Before Submission

The system SHALL require explicit confirmation before final submission.

#### Scenario: User opens confirmation

- **WHEN** the user clicks save with a complete pick set
- **THEN** the system shows a modal summarizing all picks by category
- **AND** explains that submission is definitive

#### Scenario: Checkbox is unchecked

- **WHEN** the confirmation checkbox is unchecked
- **THEN** the final submit button remains disabled

#### Scenario: Checkbox is checked

- **WHEN** the user checks the irreversible-submission checkbox
- **THEN** the final submit button becomes available

### Requirement: Locked Summary View

The system SHALL show a read-only summary after a user submits picks.

#### Scenario: Submitted user opens picks

- **WHEN** a user with an existing submission opens `/picks`
- **THEN** the system shows the submitted picks grouped by category
- **AND** shows no editing controls
- **AND** includes nickname and submitted timestamp

### Requirement: Deadline Lock

The system SHALL block new submissions after `PICKS_LOCKED_AT`.

#### Scenario: Deadline has not passed

- **WHEN** the current time is before `PICKS_LOCKED_AT`
- **THEN** unsubmitted users can assemble and submit picks

#### Scenario: Deadline has passed

- **WHEN** the current time is at or after `PICKS_LOCKED_AT`
- **THEN** unsubmitted users cannot submit picks
- **AND** the UI shows a locked message

#### Scenario: Submitted user after deadline

- **WHEN** a submitted user opens `/picks` after the deadline
- **THEN** the user can still view the locked summary

