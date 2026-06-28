## ADDED Requirements

### Requirement: Knockout bracket route
The system SHALL provide a separate `/mata-mata` route for knockout-stage picks, independent from the group-stage `/picks` route.

#### Scenario: Authenticated user opens knockout picks
- **WHEN** an authenticated user with a profile opens `/mata-mata`
- **THEN** the system shows the knockout bracket experience
- **AND** the user's group-stage submission status does not affect access

#### Scenario: Unauthenticated user opens knockout picks
- **WHEN** an unauthenticated user opens `/mata-mata`
- **THEN** the system redirects the user to `/login` with intent to return to `/mata-mata`

#### Scenario: User without nickname opens knockout picks
- **WHEN** a logged-in email identity without a nickname opens `/mata-mata`
- **THEN** the system sends the user through nickname creation
- **AND** returns the user to `/mata-mata` after the profile is complete

### Requirement: Knockout identity flow
The system SHALL use the current lightweight email and nickname identity model for knockout picks.

#### Scenario: Existing email logs in
- **WHEN** a user enters an email that already belongs to a profile
- **THEN** the system recovers that existing profile
- **AND** the user keeps the existing nickname

#### Scenario: New email logs in
- **WHEN** a user enters a new email
- **THEN** the system requires a unique nickname before allowing knockout submission

### Requirement: Knockout match structure
The system SHALL store the knockout bracket as match records that can be rendered and traversed by the application.

#### Scenario: Initial bracket is loaded
- **WHEN** the system loads knockout matches
- **THEN** it receives 31 matches
- **AND** each match has a stable code, round, display order, point value, and bracket side

#### Scenario: Round of 32 match is loaded
- **WHEN** the system loads a round-of-32 match
- **THEN** the match includes two initial team slots
- **AND** the match points value is 1

#### Scenario: Future match is loaded
- **WHEN** the system loads a match after the round of 32
- **THEN** the match slots reference source match codes
- **AND** the match can be populated from prior user picks

### Requirement: Knockout point values
The system SHALL assign knockout pick point values by phase for future scoring.

#### Scenario: Match point values are available
- **WHEN** knockout matches are loaded
- **THEN** round-of-32 matches are worth 1 point
- **AND** round-of-16 matches are worth 2 points
- **AND** quarterfinal matches are worth 4 points
- **AND** semifinal matches are worth 8 points
- **AND** the final is worth 16 points

### Requirement: Visual bracket picking
The system SHALL allow users to pick winners directly inside a visual knockout bracket.

#### Scenario: User selects round-of-32 winner
- **WHEN** the user clicks a team in a round-of-32 match
- **THEN** the system records that team as the winner for that match
- **AND** the winner fills the matching slot in the next match

#### Scenario: Future match is not ready
- **WHEN** a future match does not have both slots resolved
- **THEN** the system shows placeholder slots
- **AND** the match is not selectable

#### Scenario: Future match is ready
- **WHEN** both slots of a future match are resolved from prior picks
- **THEN** the system allows the user to choose one of those two teams as the winner

#### Scenario: Earlier pick changes
- **WHEN** the user changes a winner in an earlier match
- **THEN** the system clears all descendant picks affected by that changed branch

### Requirement: Knockout responsive layout
The system SHALL render the knockout bracket in layouts suited for desktop and mobile.

#### Scenario: Desktop bracket
- **WHEN** the user views `/mata-mata` on a desktop-size viewport
- **THEN** the system shows two bracket halves converging toward a centered final
- **AND** simple visual connectors may be shown between matches

#### Scenario: Mobile bracket
- **WHEN** the user views `/mata-mata` on a mobile-size viewport
- **THEN** the system shows matches grouped vertically by phase
- **AND** desktop connector lines are not required

### Requirement: Minimal team display
The system SHALL show teams in knockout cards with compact Brazilian-friendly labels.

#### Scenario: Team card renders
- **WHEN** a team appears in a knockout match card
- **THEN** the card shows a friendly display code as the main label
- **AND** the card may show the flag as supporting visual information
- **AND** the full team name is available through accessible labels or tooltip metadata

### Requirement: Complete bracket submission
The system SHALL require exactly one winner pick for every knockout match before allowing submission.

#### Scenario: Incomplete bracket
- **WHEN** the user has fewer than 31 knockout picks
- **THEN** the save button remains visible but disabled
- **AND** the UI shows progress as `x/31`

#### Scenario: Complete bracket
- **WHEN** the user has selected winners for all 31 matches
- **THEN** the save button becomes enabled

### Requirement: Knockout confirmation
The system SHALL require explicit confirmation before final knockout submission.

#### Scenario: User opens confirmation
- **WHEN** the user clicks the enabled save button
- **THEN** the system shows a confirmation modal
- **AND** the modal lists all 31 match winners grouped by phase

#### Scenario: User has not checked irreversible confirmation
- **WHEN** the confirmation checkbox is not checked
- **THEN** the system prevents final submission

#### Scenario: User confirms submission
- **WHEN** the user checks the irreversible confirmation box and confirms
- **THEN** the system submits the knockout picks to the server

### Requirement: Knockout server-side validation
The system SHALL validate all sensitive knockout submission rules on the server.

#### Scenario: Server validates complete payload
- **WHEN** the server receives a knockout submission
- **THEN** it validates that the user has a profile
- **AND** the lock deadline has not passed
- **AND** the user has not already submitted knockout picks
- **AND** exactly 31 unique match picks were submitted
- **AND** all match codes and picked teams exist

#### Scenario: Server validates strict bracket coherence
- **WHEN** the server receives a knockout submission
- **THEN** it reconstructs the bracket phase by phase from the submitted picks
- **AND** rejects any pick where the selected team is not one of the two resolved teams for that match

#### Scenario: Invalid submission rejected
- **WHEN** the submitted bracket is incomplete, duplicated, expired, already submitted, or incoherent
- **THEN** the system returns a clear error message
- **AND** no partial knockout picks are saved

### Requirement: Knockout irreversible persistence
The system SHALL save knockout picks atomically as one irreversible submission per user.

#### Scenario: Successful submission
- **WHEN** a valid knockout bracket is submitted before the deadline
- **THEN** the system creates one knockout submission for the user
- **AND** stores 31 knockout picks linked to that submission

#### Scenario: Duplicate submission
- **WHEN** a user who already submitted knockout picks attempts another submission
- **THEN** the system rejects the submission
- **AND** preserves the original picks

### Requirement: Knockout lock deadline
The system SHALL lock knockout pick submission at `KNOCKOUT_PICKS_LOCKED_AT`.

#### Scenario: Deadline is displayed
- **WHEN** the user views `/mata-mata`
- **THEN** the UI displays the lock deadline in Brasilia time as static text

#### Scenario: Deadline has passed before submission
- **WHEN** the deadline has passed and the user has not submitted knockout picks
- **THEN** the system shows the bracket in a blocked state
- **AND** the user cannot submit picks

#### Scenario: Submitted user after deadline
- **WHEN** the deadline has passed and the user already submitted knockout picks
- **THEN** the system allows the user to view their locked knockout summary

### Requirement: Knockout locked summary
The system SHALL show submitted knockout picks as a read-only visual bracket.

#### Scenario: Submitted user opens route
- **WHEN** a user with a knockout submission opens `/mata-mata`
- **THEN** the system shows the user's completed bracket
- **AND** no edit controls are available

### Requirement: Knockout privacy
The system SHALL keep knockout picks private until a future ranking or public-viewing change is implemented.

#### Scenario: User views knockout picks
- **WHEN** a user opens knockout picks or a submitted summary
- **THEN** the system only shows that user's own knockout picks

#### Scenario: Public user attempts access
- **WHEN** another user attempts to view someone else's knockout picks
- **THEN** the system does not expose those picks

### Requirement: Knockout home and navigation
The system SHALL make the knockout picks route the primary current action while preserving group-stage review.

#### Scenario: Home page is viewed
- **WHEN** a user opens the home page
- **THEN** the primary call to action points to `/mata-mata`
- **AND** the page communicates the knockout lock deadline or locked state

#### Scenario: Header navigation is viewed
- **WHEN** a user views the app navigation
- **THEN** the navigation includes separate links for `Mata-mata` and `Fase de grupos`

### Requirement: Knockout reset action
The system SHALL allow users to clear an unsubmitted knockout bracket.

#### Scenario: User clears bracket
- **WHEN** the user clicks the secondary clear-bracket action before submitting
- **THEN** the system asks for confirmation
- **AND** clears all selected knockout picks if confirmed

#### Scenario: Submitted user views summary
- **WHEN** the user has already submitted knockout picks
- **THEN** the clear-bracket action is not available
