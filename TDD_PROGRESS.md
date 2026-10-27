# TDD implementation and verification history

This file records test-first development batches, regression checks, and CI evidence. Product capabilities and planned features are tracked separately in [FEATURES.md](FEATURES.md).

## Archived development batches

## Bulk Task lifecycle - TDD 366-370: Bulk restore and delete

- Archived root Tasks can be selected and restored together; each selected root restores its archived subtree.
- Selected active Tasks can be deleted together only after an explicit confirmation step; deleting a selected root deletes its subtree.
- Bulk restore and delete each cross the Workspace command boundary with one dispatch and preserve Task Activity in pre-mutation Workspace order.

## Bulk Task movement - TDD 371-375: Bulk Project/List movement

- Selected Task roots can be moved to one Project in a single command; descendants follow their selected root.
- Cross-Project movement clears incompatible List assignments and rejects moving a subtask away from an unselected parent.
- Bulk List assignment is atomic and only accepts a List compatible with every selected Task.
- Cross-Project selections can explicitly clear List assignments without partial acceptance.
- Both bulk movement commands use one dispatch and preserve Task Activity in pre-mutation Workspace order.

## Bulk Task dates - TDD 376-380: Bulk dates

- Selected active Tasks can receive or clear one due date in a single atomic bulk operation.
- Selected active Tasks can receive or clear one start date in a single atomic bulk operation.
- Bulk date changes reuse the single-Task calendar-date and start/due range rules for every selected Task before acceptance.
- Clearing due dates preserves existing single-Task semantics, including removing recurrence rules that require a due date.
- Bulk start/due commands use one dispatch and append Task Activity in pre-mutation Workspace order without duplicate caller IDs.

## Bulk Tags and People - TDD 381-385: Bulk Tags and People

- Selected active Tasks can receive or remove one existing Tag in a single bulk operation.
- Selected active Tasks can receive or remove one existing Person assignment in a single bulk operation.
- Repeated caller Task IDs are deduplicated before assignment semantics are applied.
- Assigning a deleted or missing Tag/Person is rejected before Task mutation; removing an already-deleted reference remains idempotent.
- Each bulk Tag or Person command crosses the Workspace store boundary with exactly one dispatch.

## Bulk Custom Field values - TDD 386-390: Bulk Custom Field values

- Selected active Tasks can set or clear one editable Custom Field value in a single bulk operation.
- Text, Number, Checkbox, Date, and Select fields reuse the existing Custom Field normalization and validation rules.
- Select values must reference an option that exists on the selected field; Date values retain exact `YYYY-MM-DD` validation.
- Formula fields remain read-only and are excluded from the bulk value editor.
- Type migration keeps its existing behavior: changing a field type clears incompatible Task values, and later bulk writes must match the new type.
- Repeated caller Task IDs are deduplicated by the reducer action boundary, and each bulk command uses one Workspace dispatch.

## Gantt evolution, TDD 391-410

- [x] Schedule movement and keyboard/drag controls (391-395)
- [x] Visible `blocks` relationship lines (396-400)
- [x] Milestone flags and original-schedule baselines (401-405)
- [x] Pure scheduled-Task dependency graph and critical-path duration/slack calculation (406-410)
- [ ] Resource-aware / holiday-aware work calendar
- [x] Logical critical-path duration and per-Task critical/slack labels in Gantt (TDD 411)
- [x] Critical-only Gantt overview and scoped dependency lines (TDD 412)
- [x] Optional early/late logical offset breakdown (TDD 413)
- [x] Select visible critical Gantt Tasks via existing bulk-selection UI (TDD 414)
- [x] Detect Finish-to-Start date conflicts for scheduled blocking edges (TDD 415)
- [x] Display and reactively clear Gantt blocking schedule conflicts (TDD 416)
- [ ] Critical-path selection controls and resource/calendar-aware planning

Critical-path analysis is derived and not persisted. A milestone is a zero-day event; ordinary Task spans use inclusive UTC calendar-day duration. Unscheduled Task endpoints are not auto-filled or inferred. The logical network does not model idle gaps in actual dates, resources, or labor calendars.

## Gantt working calendar — TDD 417–421

- [x] Inclusive UTC Monday–Friday Task durations (417), keeping zero-duration milestones and unscheduled tasks explicit
- [x] Deduplicated, validated date exceptions for non-working holidays (418)
- [x] In-scope `blocks` dependency graph with working-day durations (419)
- [x] Working-day longest path, slack, and critical Task identification (420)
- [x] Optional separate Gantt working-day analysis and per-Task labels (421)

Working-day calculations are derived and not persisted. The optional view uses Monday–Friday without configured holidays; callers of the domain projection may supply validated excluded dates. Existing calendar-day analysis, schedule records, selection and conflict diagnostics are unchanged. This is logical dependency analysis, not a resource-leveling engine or actual start/finish-date forecast.


## Gantt holiday controls — TDD 422–426

- [x] Validate, sort and deduplicate ISO `YYYY-MM-DD` non-working dates without mutation (422)
- [x] Add an excluded Gantt date in the browser without modifying stored Tasks (423)
- [x] Remove an excluded date and recompute the working-day critical path (424)
- [x] Switch between calendar-day and working-day critical-only overviews with matching dependencies (425)
- [x] Select visible working-day critical Tasks using the existing bulk-selection controls (426)

Holiday exceptions are session-only and apply to Gantt working-day analysis across visible Projects; they are not yet persisted or shared. The calendar-day projection remains unchanged. Working-day calculations represent logical dependency durations and do not reschedule Tasks or allocate resources.


## Gantt configurable workweek — TDD 427–431

- [x] Validate and normalize custom UTC workweek days (Sunday=0 through Saturday=6) without mutating input (427).
- [x] Count Task working durations using custom weekdays plus excluded dates, retaining default Monday–Friday (428).
- [x] Project the custom workweek through the scheduled blocking graph (429).
- [x] Recompute working-day critical path/slack under a selected workweek (430).
- [x] Toggle Sunday–Thursday workweek in Gantt while keeping calendar-day analysis and saved Tasks unchanged (431).

Workweek selection is session-only and global to the visible Gantt analysis. Neither excluded dates nor workweek presets persist to Workspace storage. The analysis is still logical and does not model resource availability or actual scheduled date forecasts.


## Persistent Gantt work calendar — TDD 432–436

- [x] Store and validate the Monday–Friday or Sunday–Thursday Gantt workweek preset (432).
- [x] Store validated, sorted, unique excluded calendar dates; malformed preferences are rejected (433).
- [x] Restore the saved Gantt workweek and exclusions on initial render (434).
- [x] Save workweek changes through the existing view-preference persistence boundary (435).
- [x] Save added/removed Gantt non-working dates and restore them after reload (436).

These settings live in view preferences, not Workspace Task data. Legacy view-preference documents without Gantt fields keep Monday–Friday and no exclusions. The logical critical-path implementation remains unchanged.

## Derived Gantt working-date projection — TDD 437–441 (verified in branch CI)

- Map nonnegative logical working-day offsets onto UTC calendar dates, skipping configured non-working days and non-working weekdays.
- Project earliest and latest working-date ranges from the existing dependency/slack analysis using a visible-schedule start anchor.
- Mark zero-duration milestone events distinctly; omit unscheduled Tasks and avoid changing stored Task schedule dates.
- Expose the projected ranges only when the Gantt working-day analysis and optional date-display control are enabled.
- The projection is an explanatory logical schedule, not resource leveling, automatic rescheduling, or a commitment to actual start/finish dates.

## Local task discovery — TDD 447–451

- [x] Announce the count of currently visible Tasks (447).
- [x] Distinguish empty filtered results from an empty Workspace (448, 450).
- [x] Recover from an empty filtered list by clearing Task filters (449).
- [x] Clear focused Task search with Escape without mutating Workspace Task data (451).

Verified on fork branch using GitHub Actions run 40237637414: 8 focused tests, zero-warning lint, production build. Final full-suite regression and broader UI evaluation remain separate.

## Manual Task drag-and-drop — TDD 452–456

- [x] Reorder one Task before a target within the same sibling scope, preserving interleaved other-group positions (452).
- [x] Move after a chosen sibling while respecting missing/self/cross-group no-op behavior in the pure helper (453).
- [x] Atomic Workspace command and persistence for a single Task drop (454).
- [x] Manual List-mode native drag handle and drop-before control, retaining keyboard-accessible up/down buttons (455).
- [x] Reject self-drops, missing endpoints, and different Project/List/parent scopes before persistence (456).

Verified on the fork's GitHub Actions run 40238738296: 6 focused tests in four files, zero-warning lint, production build. This is a first semantic/manual-mode drag interaction; mobile touch drag, keyboard drag lift/drop, visual previews, Project/List reordering, and full accessibility review remain open.

## Accessible manual Task reordering — TDD 457–461

- [x] Touch-friendly buttons move a Task after a sibling in manual List mode (457).
- [x] Touch-friendly move-before selection alongside existing up/down buttons (458).
- [x] Polite status message announces successful Task move actions (459).
- [x] Native HTML drag-and-drop can drop a Task after a sibling (460).
- [x] Responsive wrapping and minimum 44px tap targets for reorder controls (461).

This is not a completed touch-gesture drag system or a full accessibility review. Buttons work without native drag gestures; Task movements are constrained by the existing Workspace validation.

## Project and List direct ordering — TDD 462–466

- [x] Move a Project directly before another Project in its Area (462).
- [x] Move a Project after a peer; reject invalid placement and self drops without persistence (463).
- [x] Move Lists before/after peers within the same Project using one Workspace command (464).
- [x] Accessible in-app Project move-before controls preserve existing up/down buttons (465).
- [x] Accessible in-app List move-before controls preserve existing up/down buttons (466).

This adds target-based buttons and domain commands, not pointer drag handles or cross-container movement for Projects and Lists.

## Native Project/List drag controls — TDD 467–471

- [x] Drag a Project before an in-Area peer, preserving unrelated ordering (467).
- [x] Drag a List before an in-Project peer (468).
- [x] Drag a Project after a peer (469).
- [x] Drag a List after a peer (470).
- [x] Responsive native drag controls with touch-sized fallback buttons (471).

These controls reuse the scoped atomic reorder commands and preserve existing keyboard up/down plus direct-placement controls. Touch gesture support and comprehensive real-device accessibility testing remain outstanding.

## Semantic workspace shell — TDD 472–476

- [x] Product banner separate from the Workspace main landmark (472).
- [x] Named Task filters and sorting region (473).
- [x] Named Projects and Tasks region (474).
- [x] Distinct responsive application heading styles (475).
- [x] Fixed-layout Task table cells wrap long content (476).

The shell is a semantic and responsive foundation, not a final independent navigation design or visual QA sign-off.

## Workspace section navigation — TDD 477–481

- [x] Navigate to Dashboard from named Workspace section index (477).
- [x] Navigate to Knowledge Notes/Docs/Wiki region (478).
- [x] Navigate to Goals region (479).
- [x] Navigate to Automations region (480).
- [x] Responsive wrapping and keyboard-visible focus for section links (481).

Navigation is anchor-based and local-first; existing panel creation/editing and persistence remain unchanged. Complete keyboard/ARIA visual audit remains open.

## Workspace panel disclosures — TDD 482–486

- [x] Hide/reopen Task filters using an explicit expanded-state control (482).
- [x] Hide/reopen Project/Task content without changing data (483).
- [x] Task filters navigation reopens hidden filter region (484).
- [x] Projects navigation reopens hidden content region (485).
- [x] Responsive, touch-sized disclosure controls (486).

Disclosure state is session-only; Workspace and view-preference documents are not modified. Regions are open by default to preserve established workflows and keyboard navigation.

## Board status drag — TDD 487–491

- [x] Drag an in-Project Board Task into Doing (487).
- [x] Drag an in-Project Board Task into Done (488).
- [x] Drag a Board Task back to To do (489).
- [x] Reject and announce cross-Project Board drops (490).
- [x] Responsive Board heading drop-target styling (491).

The status dropdown remains the non-drag alternative. Focused GitHub Actions
run 40243584572 passed 64 tests, zero-warning lint and build. This does not
establish full-suite, real-device drag, or complete accessibility coverage.

## Keyboard Task search — TDD 492–496

- [x] `/` focuses Task search when typing outside editable fields (492).
- [x] Slash remains ordinary input in editable controls (493, regression).
- [x] Shortcut works from the app header (494).
- [x] Shortcut reopens collapsed Task filters before focusing search (495).
- [x] `aria-keyshortcuts` and a visible hint document the shortcut (496).

Focused GitHub Actions run 40245762300 passed targeted tests, zero-warning
lint, and production build. TDD 493 verifies pre-existing input behavior and
is not counted as a newly demonstrated RED-to-GREEN behavior change.

## Board column clarity — TDD 512–516

- [x] Visible task counts for each Board status column (512).
- [x] Empty-column drop guidance (513).
- [x] Named accessible Board column groups (514).
- [x] Column counts continue to update after status changes (515, regression).
- [x] Per-Project filtered-visible versus active Task summary (516).

Focused GitHub Actions run 40299218622 passed tests, lint, and production build. TDD 515 verifies existing reactive behavior and is not a new failing RED-to-GREEN change.

## Board drop feedback — TDD 517–521

- [x] Announce an empty Board drop payload (517).
- [x] Announce unknown Task identifiers (518).
- [x] Announce same-status no-op drops (519).
- [x] Verify unknown drops leave Task status unchanged (520, regression).
- [x] Verify a successful drop replaces stale warning text (521, regression).

Focused CI run 40299681043 passed tests, zero-warning lint and production build. TDD 520 and 521 are regression checks of existing behavior.

## Board quick status actions — TDD 522–526

- [x] To do → Doing button (522).
- [x] Doing → Done button (523).
- [x] Hide advance action for Done (524).
- [x] Doing → To do backward button (525); Done → Doing uses the same control.
- [x] Confirm To do has no backward action (526, regression).

Focused CI run 40300788163 passed tests, lint, and build. TDD 526 is a boundary regression test.

## Direct Board status actions — TDD 527–531

- [x] To do Task → Done direct action (527).
- [x] Done Task → To do direct action (528).
- [x] No redundant direct action for Doing (529, regression).
- [x] Human-readable Done move feedback (530).
- [x] Direct controls do not leak to List view (531, regression).

Targeted GitHub Actions run 40301218449 passed tests, zero-warning lint and production build.

## Board status announcements — TDD 532–536

- [x] Readable direct To do message (532).
- [x] Readable quick Doing message (533).
- [x] Quick Done message stays readable (534, regression).
- [x] Readable backward To do message (535).
- [x] Dismiss transient Board status feedback (536).

Focused CI run 40301814304 passed targeted tests, zero-warning lint, and production build.

## Board status Undo — TDD 537–541

- [x] Undo last quick status action (537).
- [x] Undo last direct status action (538).
- [x] Undo last Board drop status action (539).
- [x] Undo is single-use (540, regression).
- [x] Human-readable restored-status feedback (541).

Undo is session-only and stores one previous-status record, not an operation history. Focused CI run 40302351475 passed tests, lint, and build.

## Board Undo safety — TDD 547–551

- [x] Clear pending Undo after a Task status selector change (547).
- [x] Undo tooltip identifies the Task (548).
- [x] Same-status drop preserves valid Undo (549, regression).
- [x] Unknown-task drop preserves valid Undo (550, regression).
- [x] Dismissing status message does not clear Undo (551, regression).

Focused GitHub Actions run 40303993233 passed tests, lint and build.

## Accessible Board controls — TDD 552–556

- [x] Undo tooltip identifies Task and restored status (552).
- [x] Board guidance describes keyboard and non-drag alternatives (553).
- [x] Atomic Board status live region (554).
- [x] Per-project drop-target reference to keyboard help (555).
- [x] Board-only help visibility (556, regression).

Focused GitHub Actions run 40304503056 passed tests, lint and build. Complete accessibility evaluation remains pending.

## Responsive Board controls — TDD 557–561

- [x] Board drop cursor signals move rather than copy (557, approved existing-test update).
- [x] Long Board card text wraps (558).
- [x] Board card buttons have at least 44px touch height (559).
- [x] Board card buttons fit their parent width (560).
- [x] Board headings wrap long text (561).

CI run 40305468753 passed focused CSS checks, lint and production build. Real-device testing is still needed.

## Board action grouping — TDD 562–566

- [x] Task-specific labelled Board status action groups (562).
- [x] Board status button minimum touch height (563).
- [x] Board action groups wrap on narrow layouts (564).
- [x] Board status buttons respect available width (565).
- [x] Board groups reference keyboard movement guidance (566).

Focused CI 40306310799 passed targeted tests, lint and build. Responsive design still requires real-device QA.

## Board keyboard focus recovery — TDD 567–571

- [x] Keyboard quick advance moves focus to Task status selector (567).
- [x] Keyboard backward move restores selector focus (568).
- [x] Keyboard direct Done restores selector focus (569).
- [x] Keyboard direct To do restores selector focus (570).
- [x] Keyboard Undo restores Task selector focus (571).

Focused CI run 40306821848 passed tests, lint and build. Device keyboard audits remain outstanding.

## Reset Board filters — TDD 572–576

- [x] Clear Board search while retaining Board mode (572).
- [x] Clear status filter (573).
- [x] Clear priority filter (574).
- [x] Clear due-date filter (575).
- [x] Clear custom-field filter (576, approved selector correction).

Run the branch's full `npm run check` workflow before merging. Only the development clone is modified.

## Board reset control accessibility — TDD 577–581

- [x] Descriptive Board reset title (577).
- [x] Stable Board reset test identifier (578).
- [x] No unsupported shortcut advertised (579, regression).
- [x] Native button remains in keyboard tab order (580, regression).
- [x] ARIA description explains current view retention (581).

Focused CI run 40310011714 passed tests, lint and build after the approved unused import removal.

## Board reset feedback — TDD 582–586

- [x] Announce completed Board filter reset (582).
- [x] Return focus to Task search after reset (583).
- [x] Preserve sort order while resetting filters (584, regression).
- [x] Hide reset control with no active filters (585, regression).
- [x] Combined filter reset retains Board and reveals tasks (586, regression).

Focused CI run 40310413163 passed tests, lint and build.

## Logical Gantt resource plan — TDD 587–591

- [x] Sequential logical slots for Tasks sharing an assignee (587).
- [x] Concurrent tasks for independent assignees (588).
- [x] Blocking dependencies delay successor starts (589).
- [x] Unassigned Tasks do not reserve other resources (590).
- [x] Validated holidays and workweek determine occupancy duration (591, user-approved assertion correction).

This is an in-memory derived planning projection. It does not persist allocation or auto-reschedule tasks; full resource leveling and visual integration remain open. Focused CI run 40315381648 passed tests, lint and build.

## Resource-aware Gantt integrity — TDD 592–596

- [x] Zero-duration milestones consume no extra resource slot (592, regression).
- [x] Unscheduled Tasks are excluded from the derived plan (593, regression).
- [x] Duplicate assignee identifiers do not reserve capacity twice (594, regression).
- [x] Dependency cycles are rejected (595, regression).
- [x] No mutation of Task or relationship inputs (596, regression).

All five are defensive regression tests of the existing resource projection. Full `npm run check` is the merge gate.

## Gantt resource projection display — TDD 597–601

- [x] Gantt displays derived logical resource-plan duration (597).
- [x] Scheduled Tasks show derived resource slots (598).
- [x] Unscheduled Tasks receive no resource slots (599, regression).
- [x] Summary is Gantt-only (600, regression).
- [x] Existing critical-path summary remains distinct (601, regression).

Focused CI run 40316400117 passed tests, lint and build. No persisted Task dates are changed.

## Gantt resource wait — TDD 602–606

- [x] Expose per-Task logical resource wait (602).
- [x] Independent assignees have zero wait (603, regression).
- [x] Dependency delays are distinct from resource waits (604, regression).
- [x] Multi-assignee work respects the latest available person (605, regression).
- [x] Zero-duration milestones do not create capacity delay (606, regression).

Focused CI run 40316750025 passed tests, lint and build. Resource waits are logical offsets, not calendar-date forecasts.

## Gantt resource contention summary — TDD 607–611

- [x] Identify Tasks with positive resource wait (607).
- [x] Empty summary without contention (608, regression).
- [x] Stable source-order listing of blocked Tasks (609, regression).
- [x] Dependency-only waiting excluded (610, regression).
- [x] Zero-duration milestone behavior verified (611, regression).

CI run 40317083761 passed focused tests, lint and build. Visual summary integration remains separate.

## Gantt resource wait display — TDD 612–616

- [x] Gantt displays a derived resource-waiting Task count (612).
- [x] Delayed Tasks show their resource-only wait (613).
- [x] Non-waiting Tasks do not show false warnings (614, regression).
- [x] Independently assigned Tasks show no contention (615, regression).
- [x] Resource-wait display is Gantt-only (616, regression).

Focused CI run 40317479184 passed tests, lint and build. These are logical offsets, not automated date changes.

## TDD 617–626 — resource-date forecasting and anchor validation

- Resource-constrained logical working-day slots convert to forecast calendar dates without updating stored Task dates.
- Regressions cover independent/serial assignees, excluded holidays, milestones, invalid and non-working anchors, and empty-plan validation.
- Approved lint-only removal of an unused test helper did not change assertions.
- PR #37: https://github.com/ysoktar/uduzgak/pull/37; squash merge: `1078b57`.
- CI: 15 focused tests, zero-warning lint, production build passed. This is not a full-suite sign-off.

## TDD 627–631 — resource forecast completion date

- Nullable `completionDate` aggregates the latest projected Task finish, remaining null for empty plans.
- Five tests cover empty plans, independent and serialized work, holidays, and milestone-only forecasts.
- PR #38: https://github.com/ysoktar/uduzgak/pull/38; squash merge: `44022c2`.
- Focused tests, zero-warning lint, and production build passed. This is not a full-suite sign-off.

## README implementation history (archived)

### TDD 366-370 bulk lifecycle

uduzgak supports one-dispatch bulk restore for archived Task roots and explicitly confirmed bulk deletion for selected active Tasks. Both operations keep subtree semantics and append deterministic Task Activity entries.

### TDD 371-375 bulk movement

uduzgak supports atomic bulk Project movement for selected Task subtrees and bulk List assignment/clearing. Project moves clear incompatible List references, while List assignment validates the entire selection before accepting any change.

### TDD 376-380 bulk dates

uduzgak supports atomic bulk start-date and due-date changes for selected active Tasks. The reducer validates every selected Task with the existing single-Task schedule rules before accepting the new date, so an invalid range rejects the whole operation. Clearing a due date also clears recurrence exactly as the single-Task command does. Bulk date commands use one persisted dispatch and ordered Task Activity.

### TDD 381-385 bulk Tags and People

uduzgak supports bulk Tag assignment/removal and bulk Person assignment/removal for the current visible Task selection. The reducer deduplicates repeated Task IDs, rejects assignment to missing Tag/Person references, and keeps removal idempotent after a reference has already been deleted. Each bulk operation uses one persisted Workspace dispatch.

### TDD 386-390 bulk Custom Field values

uduzgak supports bulk set/clear for Text, Number, Checkbox, Date, and Select Custom Fields on the current visible Task selection. Bulk writes reuse the same domain normalization as single-Task edits, reject missing fields, invalid Select options, and type-incompatible values before Task mutation, and keep Formula fields read-only. Each bulk value change uses one persisted Workspace dispatch.

### TDD 411 — Gantt critical-path display

Gantt now displays the logical dependency-path duration for each Project and marks scheduled Tasks as critical or non-critical with the computed slack in days. This is a derived, read-only projection over currently visible Tasks and their `blocks` relationships; unscheduled Tasks receive no critical-path label. The calculation represents dependency durations, **not** the actual elapsed calendar schedule, working days, resource contention, or holiday delays. List, Board, Table, and other modes do not calculate or display this summary.

### TDD 412-416 — Gantt critical-path controls and schedule diagnostics

The Gantt overview can hide noncritical rows without hiding Task detail controls, and filters displayed dependency lines to the overview endpoints. An optional logical-offset breakdown displays earliest and latest start/finish offsets rather than actual calendar dates. The critical-Task selection action uses the existing visible Task bulk-selection controls without changing or persisting task state. The schedule conflict analyzer checks in-scope scheduled `blocks` links for a source end date that does not precede its target start date; zero-day milestones can hand off on the same date. Conflicts appear in the Gantt view and disappear after a valid schedule correction. These are derived UI/analysis features, not persisted data changes, and they do not add resource or holiday awareness.

### TDD 417–421 — Gantt working-day analysis

The existing calendar-day logical critical path is preserved. Gantt can optionally show a separate Monday–Friday working-day critical path and per-Task slack using the same visible scheduled Task dependency graph. Domain helpers support validated, unique excluded dates (for holidays), but the UI does not yet configure holiday exceptions. Both projections are logical dependency-duration metrics, not elapsed-date forecasts or resource scheduling. No workspace storage schema changed.


### TDD 422–426 — Gantt holiday controls

In Gantt, enable the separate working-day analysis to add or remove `YYYY-MM-DD` non-working dates. The Monday–Friday working-day critical-path summary updates without editing Workspace Tasks. Choose working-day critical-only overview to hide noncritical Gantt summary rows and unrelated dependency lines; calendar-day critical-only mode remains separate. Select visible working-day critical Tasks through existing bulk controls. Dates are per-session UI state, not persisted, and the calculations remain logical, not resource-allocated schedules.


Gantt work calendars (TDD 427–431): Working-day critical-path analysis supports a custom set of UTC weekdays (Sunday=0, Saturday=6), alongside non-working date exceptions. In the Gantt view, users can switch between Monday–Friday (default) and Sunday–Thursday workweeks. These controls are session-only and never rewrite saved Task schedules. Calendar-day critical-path analysis remains independent.


Gantt work-calendar preferences (TDD 432–436): The Monday–Friday / Sunday–Thursday selection and excluded-date list persist in the existing local view-preference document. Reloading restores both without modifying Task schedules, Workspace data, or calendar-day critical-path calculations. Invalid or noncanonical saved Gantt calendar values fall back to default view preferences.

### TDD 487–491 — native Board status drag targets

Board Tasks can be dragged into the `To do`, `Doing`, and `Done` column
headings to update status without duplicating the Task. Cross-Project Board
drops are rejected with an accessible status message. Responsive Board drop
targets are highlighted; status dropdowns remain available without drag.
The feature-branch GitHub Actions check passed 64 focused/regression tests,
zero-warning lint, and production build (run 40243584572). Full-suite and
real-device interaction audits have not been established by this run.

### TDD 492–496 — keyboard Task search

A `/` shortcut from the Workspace surface focuses Task search. It preserves
ordinary slash input in editable controls and remains usable from the app header.
If Task filters are collapsed, the shortcut opens them before focusing search.
An accessible shortcut annotation and visible hint explain the interaction.
Focused GitHub Actions run 40245762300 passed the keyboard discovery and
disclosure tests, zero-warning lint and production build. TDD 493 is a
regression guard for existing editable-input behavior, not a newly introduced
behavior or an independently observed failing RED test.

### TDD 512–516 — Board column clarity

Board headings now show visible Task counts, including empty-column guidance and named status groups. Column counts update with Task status changes, and each Project Board reports how many of its active Tasks remain visible under the selected filters. These are view-only derived presentations and do not change the Workspace storage schema. TDD 515 is a status-change regression check rather than a new implementation behavior. Focused verification: GitHub Actions run 40299218622 (tests, zero-warning lint, production build).

### TDD 517–521 — Board drop feedback

Board drop targets now announce empty payloads, unknown/stale Task identifiers, and attempts to drop a Task into the column it already occupies. Existing cross-Project rejection and successful-move feedback remain intact. Tests 520–521 are regression coverage for no mutation after an unknown ID and clearing obsolete status on a later valid drop; they do not represent new RED-to-GREEN behavior. Focused verification: GitHub Actions run 40299681043 (tests, zero-warning lint, production build).

### TDD 522–526 — Board quick status actions

Board Task cards expose pointer/keyboard-accessible buttons for advancing a To do Task to Doing, then a Doing Task to Done, or reversing one column. Controls are absent at status boundaries, and the existing status selector and drag/drop path remain. TDD 526 is a boundary regression check. GitHub Actions feature run 40300788163 passed focused tests, lint and production build; real-device usability audits remain separate.

### TDD 527–531 — direct Board status actions

Board Task cards now have direct skip-column status buttons for To do → Done and Done → To do, supplementing the existing single-step buttons, dropdown and drag/drop. Doing Tasks do not show skip buttons; these controls are scoped to Board mode. Successful direct Done action feedback uses the human-readable column name. TDD 529 and 531 are regression checks; focused GitHub Actions run 40301218449 passed tests, lint and build.

### TDD 532–536 — Board status announcements

Direct return to To do and single-step Board actions now announce human-readable status labels; a dismissal button clears an obsolete Board status message without changing Task state. Tests 534 is a regression guard for Done labels. Feature CI run 40301814304 passed focused tests, lint and build after correcting a JSX closing-brace syntax error without changing tests.

### TDD 537–541 — undo last Board status change

The Board offers a one-step, session-only Undo control after the most recent quick button, direct button, or drag/drop status transition. Undo restores the previous Task status, announces the restored human-readable status, and disappears after use. It does not introduce a persisted undo history or change the storage schema. TDD 540 is a single-use regression guard. Focused GitHub Actions run 40302351475 passed tests, zero-warning lint, and production build.

### TDD 547–551 — Board Undo safety

Manual status changes through the Task status selector invalidate a pending Board Undo, preventing accidental reversal of a newer status choice. Undo identifies the affected Task in its tooltip. Regression tests confirm same-status drops, rejected unknown-task drops and dismissing transient feedback do not discard the last valid Undo. Focused GitHub Actions run 40303993233 passed tests, zero-warning lint and production build; no persistence change was made.

### TDD 552–556 — accessible Board controls

Board Undo tooltips identify both the Task and previous status. Board guidance explains button/select alternatives to dragging, drop targets refer to that help through project-scoped `aria-describedby`, and the status live region announces full messages atomically. Help is limited to Board mode. Focused CI run 40304503056 passed tests, lint and production build; this is not a full accessibility audit.

### TDD 557–561 — responsive Board controls

Board drop headings now use a move cursor rather than a copy cursor; the existing test was updated only after explicit approval. Board task cards wrap long text, Board buttons have touch-sized minimum heights and constrained widths, and Board headings safely wrap labels. Focused GitHub Actions run 40305468753 passed the new and existing CSS tests, zero-warning lint and production build. These are style assertions; manual device testing remains outstanding.

### TDD 562–566 — Board action grouping

Board status transition buttons are now grouped by Task with an accessible group label and a reference to the Board keyboard-movement guidance. CSS ensures touch-sized button targets, wrapping control rows and constrained button width. Targeted GitHub Actions run 40306310799 passed relevant tests, zero-warning lint and production build. Manual keyboard and real-device review remains separate.

### TDD 567–571 — Board keyboard focus recovery

When a Board status button is activated through a keyboard-style click, focus moves to that Task's persistent status selector instead of being lost if the action button disappears on rerender. Covers forward, backward and direct status actions plus Undo. Pointer clicks retain their ordinary focus behavior. Focused GitHub Actions run 40306821848 passed tests, zero-warning lint and production build; this remains narrower than full browser/device accessibility testing.

### TDD 572–576 — reset Board filters in place

The Board view offers a single `Show all Board tasks` control when search, status, priority, due-date or custom-field filters are active. It resets those filters without changing the selected Board view. The TDD 576 custom-field option query was scoped to its select after explicit approval; test assertions remain unchanged. Targeted CI checks passed; full `npm run check` must succeed before this feature is merged.

### TDD 577–581 — Board filter reset accessibility

The Board's contextual reset control has descriptive title and ARIA text, a stable test identifier, and remains a native tab-reachable button without an invented keyboard shortcut. The target tests validate these properties alongside the prior filter-reset behavior. Focused GitHub Actions run 40310011714 passed tests, zero-warning lint, and production build after the user-approved removal of an unused test import; assertions remain unchanged.

### TDD 582–586 — Board reset feedback

Clearing active Board filters now announces `Board filters cleared` in the existing live status region and returns focus to Task search when the reset button disappears. Regression coverage confirms the reset retains task sort order, the reset button is absent with no active filters, and combined search/status/priority filtering resets while retaining Board mode. Focused CI run 40310413163 passed tests, zero-warning lint and production build; this is not a full regression-suite result.

### TDD 587–591 — logical Gantt resource plan

A new pure, deterministic Gantt resource projection reserves each assigned person for one scheduled Task at a time, permits independent people to work concurrently, respects blocking dependencies, and uses configured working weekdays and excluded dates to derive durations. Unassigned Tasks do not consume a person. The calculation is non-persistent and not an optimal resource-leveling engine or actual calendar-date forecast. The TDD 591 test expected duration was corrected from four to three working-day slots after explicit approval. GitHub Actions run 40315381648 passed focused/regression tests, lint and build.

### TDD 592–596 — resource Gantt integrity

Regression tests verify that zero-duration milestones do not reserve additional capacity, unscheduled Tasks remain excluded, repeated assignee IDs do not multiply allocation, cyclic blocking dependencies are rejected, and source Tasks and relationships are not mutated. The resource projection remains deterministic, derived, and separate from persisted Task schedules. Full-suite verification is exercised in the TDD 592–596 branch workflow.

### TDD 597–601 — visible Gantt resource projection

The Gantt view now reports a distinct resource-constrained logical working-day duration and per-scheduled-Task logical start/finish slots. Unscheduled Tasks do not receive invented slots, the summary does not appear outside Gantt, and the original dependency-only critical-path report remains separate. This is a derived capacity projection, not an automatic date rescheduler or optimal resource allocator. Focused GitHub Actions run 40316400117 passed tests, zero-warning lint and build.

### TDD 602–606 — distinguish Gantt resource wait

Derived resource Gantt rows now expose `resourceWaitDays` separately from the dependency-ready start. It counts additional logical working-day slots caused by a reserved person, and does not relabel mandatory predecessor waits as resource conflicts. Independent assignees incur no resource wait; multi-person Tasks wait for the latest available assignee. Milestones remain zero-duration. Focused CI run 40316750025 passed tests, lint and build. This remains non-persistent and is not a resource-optimal calendar schedule.

### TDD 607–611 — resource contention summary

The pure Gantt resource projection now exposes ordered `waitingTaskIds` for Tasks whose logical start is delayed by shared-person capacity, not merely by predecessor dependencies. No-wait schedules yield an empty summary; milestone and dependency-only cases remain excluded. This is derived, non-persistent information. Focused CI run 40317083761 passed tests, lint and build.

### TDD 612–616 — Gantt resource wait visibility

The Gantt view now presents an accessible count of Tasks delayed by assignment capacity and a per-Task resource-wait label in logical working-day slots. Tasks not delayed by a shared person have no wait marker, independent people yield zero contention, and List view is unaffected. These derived offsets are not actual rescheduled start dates. Focused GitHub Actions run 40317479184 passed tests, lint and build.
