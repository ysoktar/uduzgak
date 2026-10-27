# Feature checklist

This file tracks implemented and planned product capabilities. TDD cycle history, commit checkpoints, and CI results belong in [TDD_PROGRESS.md](TDD_PROGRESS.md).

## Product identity

- [x] Product-facing uduzgak name
- [x] npm package name `uduzgak`
- [x] Active working repository `ysoktar/uduzgak` and original organization repository `ROGOYATO/uduzgak`
- [x] Development checkout uses the `uduzgak` project name; older Yönlek paths are historical
- [x] Existing `workspace-app.*` storage keys preserved for data compatibility
- [ ] Formal uduzgak trademark clearance

The old storage-key prefix is not a branding mistake. It is a compatibility
identifier. Changing it requires a tested migration that can find and move
existing browser data.

## Product hierarchy

Current hierarchy:

```text
Workspace
→ Area
→ Project
→ List
→ Task
→ Subtask
```

A Checklist item belongs to one Task and is not another hierarchy level.

- [x] Workspace domain and persistence boundary
- [x] Areas
- [x] Projects
- [x] Lists inside Projects
- [x] Tasks
- [x] Subtasks represented as Tasks with `parentTaskId`
- [x] Checklists
- [x] Manual Area ordering
- [x] Manual Project ordering within Area scope
- [x] Manual List ordering within Project scope
- [x] Manual Task and Subtask ordering within sibling scope
- [x] Manual Checklist item ordering

## Projects

- [x] Create
- [x] Rename
- [x] Description
- [x] Delete with List, Task, Subtask, and relationship cleanup
- [x] Preserve unrelated workspace metadata during deletion
- [x] Project focus by immutable ID
- [x] Project Task counts
- [x] Completion summaries
- [x] Move Tasks between Projects
- [x] Assign Projects to Areas
- [x] Clear Area assignment when an Area is deleted
- [x] Manual ordering
- [x] Archive and restore
- [x] Project templates

Project archive is reversible and uses optional `archivedAt` state on the
Project. Archiving a Project hides the Project and all of its Tasks from normal
workspace surfaces without rewriting each Task's own archive state. Lists, Area
assignment, Project description, Tasks, and relationship edges remain in
workspace state and persistence. Restoring the Project makes independently
active Tasks visible again while Tasks that were archived separately remain
archived.


Project templates snapshot reusable Project structure. They keep the Project
name and description, List names, active Task/Subtask structure, status, priority,
description, and Checklist text/completion. They omit Area assignment, due
dates, Tags, People, Custom Field values, archive flags, and workspace-level
relationships. Instantiation generates fresh IDs and timestamps.

Project deletion is a selective cleanup operation. It must remove only data
owned by the deleted Project or data that points to one of its deleted Tasks.

## Tasks

### Core lifecycle

- [x] Create
- [x] Rename
- [x] Delete
- [x] Duplicate
- [x] Archive and restore

Task duplication creates one new Task identity. It copies Task-owned values and
nested containers, but it does not copy child Tasks or workspace-level
relationship edges.

Task archive is reversible and uses optional `archivedAt` state on the Task.
Archiving a parent archives its full Subtask subtree with the same timestamp.
Restoring that parent restores the subtree. Archived Tasks remain in workspace
state and persistence, keep their relationships and Task-local data, and are
excluded from normal Task counts, filters, sorting, and Project Task lists. The
archive surface shows archived roots so a cascaded child is not independently
restored under an archived parent through the UI.

### Core fields

- [x] Status
- [x] Priority
- [x] Start date
- [x] Due date
- [x] Description
- [x] Project assignment
- [x] List assignment

### Search, filter, and sort

- [x] Search title
- [x] Search description
- [x] Status filter
- [x] Priority filter
- [x] Due-date presence filter
- [x] Type-aware Custom Field filter
- [x] Sort by created time
- [x] Sort by title
- [x] Sort by due date
- [x] Sort by priority
- [x] Manual sort mode
- [x] Type-aware Custom Field sort
- [x] Clear active Task filters together
- [x] Per-view grouping
- [x] Saved filter sets

Saved filter sets persist with view preferences and keep the Task search query,
status, priority, due-date presence, and optional active Custom Field filter.
Reusing a normalized name updates the existing preset. Applying a preset
preserves Project focus, Task sort, Custom Field sort, and grouping.

### Structure

- [x] Create Tasks directly in Lists
- [x] Move between Project and List containers
- [x] Nested Subtasks
- [x] Parent-cycle rejection
- [x] Cascading Subtask deletion
- [x] Parent-chain Project integrity
- [x] Manual sibling ordering

### Checklists

- [x] Create item
- [x] Rename item
- [x] Complete and reopen item
- [x] Delete item
- [x] Completion progress
- [x] Manual item ordering
- [x] Persist and validate Task-local Checklist data

### Tags and assignees

- [x] Workspace Tags
- [x] Assign and remove multiple Tags from Tasks
- [x] Workspace-local People
- [x] Assign and remove multiple People from Tasks
- [x] Cleanup Task references when a Tag or Person is deleted
- [ ] Authenticated accounts
- [ ] Invitations
- [ ] Remote membership

Local People are labels for assignment inside one browser workspace. They do
not imply authentication, email identity, permissions, or notifications.

### Custom fields

- [x] Workspace-level field definitions
- [x] Text fields
- [x] Number fields
- [x] Checkbox fields
- [x] Set and clear Task values
- [x] Persistence type validation
- [x] Cleanup Task values when a definition is deleted
- [x] Select fields
- [x] Date fields
- [x] Formula fields
- [x] Field type migration
- [x] Custom Field filtering and sorting

Select fields keep ordered workspace-level options with stable option IDs. Task
values store the option ID, so renaming an option changes its label without
rewriting Task values. Deleting an option clears only Task values that reference
that option.

Date fields store exact `YYYY-MM-DD` calendar dates as independent Task Custom
Field values. They do not change or inherit Task start/due dates.

Formula fields are read-only numeric computed fields. A Formula definition
references two stable Number/Formula field IDs with `+`, `-`, `*`, or `/`.
Formula results are evaluated from current Task values and are never stored as
Task Custom Field values. Missing inputs, invalid dependencies, division by
zero, and non-finite results are unavailable rather than persisted.

Field type migration preserves the definition ID, name, and creation time while
clearing every stored Task value for that field. Migration does not coerce old
values. Select targets start with an empty option list and Formula targets start
unconfigured. If a Number/Formula operand moves to a non-numeric field type,
direct Formula configurations that reference it are cleared.

One Custom Field filter and one Custom Field sort can be active at a time. Text
filters use case-insensitive substring matching; Number, Checkbox, Select, and
Date filters use type-aware exact matching. Custom Field sorting is ascending,
keeps missing values last, and uses Task creation time as the deterministic
tie-breaker. Select sorting follows the field's option order. Deleted or stale
field references are treated as inactive view state rather than hiding Tasks.

### Relationships

- [x] Directional `blocks` dependency
- [x] Symmetric `related` link
- [x] `Blocked by` derived summary
- [x] Self-link rejection
- [x] Duplicate relationship rejection
- [x] Dependency-cycle rejection
- [x] Relationship cleanup after Task and Project deletion
- [x] Persistence validation and browser reload
- [ ] Additional relationship types

Relationship records live at Workspace level. They refer to Tasks by ID and are
not copied when one Task is duplicated.

### Later task capabilities

- [x] Recurring Tasks
- [x] Time estimates
- [x] Time tracking
- [x] Attachments, metadata only
- [x] Activity history

Recurring Tasks use completion-driven daily, weekly, or monthly rules with a positive interval and required due date. Completing a recurring Task preserves the completed occurrence and creates one fresh `todo` occurrence with calendar-advanced dates; monthly rules clamp safely at month end. Clearing a recurring Task's due date also clears its recurrence rule so persisted Task state cannot violate the due-date requirement.

Time tracking stores completed Task-local entries as positive millisecond durations with stable entry IDs and ISO timestamps. A Task may also keep one running timer start instant. Manual entry accepts positive integer minutes; stopping a timer records the exact elapsed milliseconds. Actual tracked work and running timers stay with the source Task and are not copied into duplicates, recurring occurrences, Task Templates, or Project Templates.

Task attachments currently store metadata only. Each record has a stable ID, file name, byte size, optional media type, and ISO added timestamp. Browser selection records those fields through the normal workspace command and persistence path. File bytes and local paths are never stored. Attachment metadata is source-Task state and is excluded from duplicates, recurring occurrences, Task Templates, and Project Templates. Actual file storage remains out of scope.

Activity history is Workspace-level append-only metadata for core Task lifecycle changes. Tracked workspace commands persist the Task mutation and its Activity entries atomically through one reducer/store dispatch. Entries capture the Task title and relevant Project/List context at event time so deletion or later renaming does not make old history unreadable. The first UI is a lazy Workspace panel and does not add accounts, actors, comments, notifications, rollback, filtering, or retention rules.

## Views

Current UI is a semantic list-oriented interface used to prove behavior. The
final navigation and visual system are still deferred.

- [x] All-Project list view
- [x] Focused-Project list view
- [x] Persist selected Project separately from workspace data
- [x] Persist Task search, filters, and sort separately from workspace data
- [x] Board view
- [x] Calendar view
- [x] Table view
- [x] Timeline
- [x] Gantt foundation
- [x] Gantt view
- [x] Saved views
- [x] Per-view grouping
- [x] Per-view filters and sorts

Grouping is a view preference, not workspace data. The current list view can
group the already filtered and sorted active Tasks by status, priority, or List.
The `none` setting preserves the flat list, empty groups are omitted, and Task
order inside each group stays equal to the incoming sorted order.

Saved views persist the complete current list-view configuration: Project focus,
Task search, status, priority, due-date filter, sort, and grouping. Saved views do
not copy workspace data or the saved-filter-set collection. Saving the same
normalized name updates that view in place.

Task view mode is separate optional view-preference state. Missing mode means List.
Board mode uses fixed To do, Doing, and Done columns after the same active-Task,
filter, and sort pipeline. Calendar mode groups that same incoming Task sequence
by `YYYY-MM-DD` due date, orders dated sections chronologically, and keeps
undated Tasks in a final `No due date` section while preserving incoming order
inside each section. Table mode exposes the same incoming Task sequence in fixed
Title, Status, Priority, Due date, and List columns, then keeps the existing Task
detail rows available below the scan table. Timeline mode orders the same Task
sequence by `YYYY-MM-DD` due date, preserves incoming order on shared dates, and
puts undated Tasks last. List grouping headings are hidden while Board, Calendar,
Table, Timeline, or Gantt is active, but the grouping preference is preserved
and returns when the user switches back to List. Saved views do not capture
layout mode, so applying one preserves the current List, Board, Calendar, Table,
Timeline, or Gantt choice.

Gantt builds on the confirmed schedule foundation. A Task can carry an optional
exact `YYYY-MM-DD` start date; when both dates exist, start must be on or before
due date. The Gantt view consumes `createTaskGanttItems` after the same active,
focused, filtered, and sorted Task pipeline as the other layouts. Every Task is
represented, complete ranges show their exact boundaries, and incomplete ranges
are explicit `Unscheduled` rows. Existing Task actions remain available below
the summary. Drag scheduling, inferred duration, dependency lines, milestones,
baselines, work calendars, and critical-path behavior remain deferred.

Per-view filters and sorts remain view-preference data. Search, status, priority,
due-date presence, optional Custom Field filter, built-in sort, and optional
Custom Field sort gain snapshots keyed by Task layout after the first layout
switch. A layout without a snapshot inherits the outgoing layout's active values
once; later visits restore its own snapshot. Project focus and grouping remain
global. Saved Filter Sets and Saved Views synchronize only
the active layout snapshot and do not switch layouts.

## Productivity

- [x] Duplicate Task
- [x] Bulk actions
- [x] Project templates
- [x] Task templates

Bulk actions operate on the current focused and filtered visible active Task
selection. Status, priority, and archive each use one workspace dispatch. Bulk
archive keeps existing Subtask cascade behavior and applies one runtime timestamp
to the whole operation. Selection stays in UI state and is not persisted. A
successful bulk action clears the selection.

Task templates keep reusable active Task/Subtask structure, title, status,
priority, description, and Checklist text/completion. They omit Project/List
placement, due dates, Tags, People, Custom Field values, archive flags,
relationship edges, and original IDs. Instantiation generates fresh Task and
Checklist IDs and attaches the new subtree to the selected active Project and
optional compatible List.

- [x] Automation core model with typed trigger, condition, and action records
- [x] Activity-bound local Automation trigger matching
- [x] Workspace-snapshot Automation condition matching
- [x] Pure bounded Automation action application
- [x] Automation storage validation
- [x] Controlled Activity-driven Automation execution
- [x] Local Automation editor with reload persistence and command error surface

Automations have stable IDs, names, enabled state, typed trigger/condition/action
records, immutable domain updates, a Workspace collection, and Workspace commands.
Task Activity drives deterministic trigger matching; conditions use one Workspace
snapshot per Activity event; actions reuse existing Workspace invariants. Matching
actions execute inside one bounded command transaction and action-produced Activity
can feed the same explicit queue. Errors are rejected before partial Workspace state
is accepted or persisted. The browser editor persists Automation configuration across
reload. Workspace storage remains version 1.
- [x] Goals or measurable targets
- [x] Reporting primitives for Task status, priority, due dates, Project completion, and Goal progress
- [x] Dashboards and reporting UI

## Knowledge

- [x] Notes or Docs — browser creation, editing, persistence, reload, and exact-content preservation
- [x] Project-linked documents — browser Project assignment with safe unlink-on-Project-delete semantics
- [x] Wiki or source-of-truth markers — browser toggle and dedicated Wiki section

## Persistence and recovery

### Implemented

- [x] Versioned workspace document
- [x] Transactional store writes
- [x] Strict workspace validation
- [x] Invalid-workspace recovery screen
- [x] Reset invalid workspace data
- [x] Separate versioned view-preference document
- [x] Best-effort preference storage
- [x] Stale Project focus repair
- [x] Backward-compatible optional collections in storage version 1

### Planned

- [x] Export backup
- [x] Import backup
- [x] Explicit migration framework for a future storage version

## Integration and platform

- [ ] Public API
- [ ] OAuth or application authorization
- [ ] Webhooks
- [ ] Integration framework

## Multi-user and backend phase

- [ ] Accounts
- [ ] Workspace members
- [ ] Roles
- [ ] Permissions
- [ ] Sharing
- [ ] Comments and mentions
- [ ] Notifications
- [ ] Backend persistence
- [ ] Sync
- [ ] Realtime collaboration

These items need a server-side identity and data model. They should not be
attached to the current local Person model.

## Visual and interaction work

Feature behavior currently takes priority over a final design system.

Verified keyboard navigation and local-first shell foundations (TDD 442–446):
- [x] Skip link to the named workspace main landmark (442).
- [x] Named navigation and stable filter/project section targets (443).
- [x] First-project empty workspace guidance (444).
- [x] Visible `:focus-visible` outline and keyboard-reachable skip link (445).
- [x] Narrow-screen overflow controls and reduced-motion CSS rules (446).

These are foundations, not sign-off for the final application shell, cross-device responsive QA, full keyboard audit, full accessibility review, original visual design, or touch/drag interactions. They do not require a backend.


- [ ] Independent app shell and navigation design
- [ ] Responsive layout
- [ ] Typography and spacing system
- [ ] Original icon system or properly licensed icon library
- [ ] Empty-state design
- [x] Scoped native Task, Project, and List drag controls over existing manual-order commands
- [ ] Touch-gesture drag interactions on real mobile devices (button alternatives exist)
- [ ] Motion and transitions
- [ ] Final keyboard-navigation pass
- [ ] Final accessibility review

## Product independence

- [x] Independent source code
- [x] No ClickUp source code
- [x] No ClickUp proprietary assets, screenshots, or icons
- [x] uduzgak product identity used in the application
- [ ] Maintain original terminology where a generic alternative is practical
- [ ] Maintain independent visual composition during the design phase
- [ ] Review third-party asset and library licenses before final UI work

See `CLICKUP_REFERENCE.md` for the competitor-research boundary.

## Naming

Working product name: **uduzgak**

Implemented naming state:

- product UI: uduzgak
- npm package: `uduzgak`
- original organization repository: `https://github.com/ROGOYATO/uduzgak`
- development working clone: `https://github.com/ysoktar/uduzgak`
- earlier `yonlek` paths are historical; the active development target is `ysoktar/uduzgak`
- browser storage keys: intentionally still `workspace-app.*`

Formal clearance remains open:

- [ ] TÜRKPATENT
- [ ] WIPO Global Brand Database
- [ ] EUIPO or TMview
- [ ] USPTO if the United States becomes a launch market
- [ ] Turkish company and trade-name review
- [ ] domain-name review
- [ ] major app-store and software-directory review
- [ ] phonetic, visual, and semantic near-match review

See `BRAND_NAME_RESEARCH.md` for the canonical naming and brand-research record.

## Goals — model foundation

- stable Goal ID and name
- optional description
- measurable target type: manual or linked Tasks
- explicit target and current numeric values
- validation and immutable updates
- optional Workspace Goal collection

- explicit Goal-to-Task link/unlink operations
- deterministic linked-Task ID order with duplicate prevention
- automatic Goal-link cleanup when linked Tasks are deleted
- Task duplication and template instantiation do not copy Goal links
- pure manual numeric progress derivation
- linked-Task completion progress derivation
- 0-100 percentage clamp with explicit zero-target behavior
- pure Goal progress summary helper

Storage validation, browser reload, linked-Task summary rendering, and Goals UI remain TDD 326-330.

## Goals — persistence and UI

- [x] storage version 1 validation for optional Goals
- [x] duplicate Goal ID and missing linked-Task rejection on load
- [x] Goal command surface for create/update/delete and Task link/unlink
- [x] local Goals CRUD panel
- [x] linked-Task assignment controls and completed/linked summary
- [x] derived progress rendering
- [x] BrowserApp reload persistence

The Goals block TDD 311-330 is complete. TDD 331-335 adds pure reporting primitives; dashboard composition and browser UI remain for TDD 336-345.


## Dashboard composition

- [x] headline active/completed/open/overdue Task KPIs
- [x] stable Task status distribution rows with percentages
- [x] stable Task priority distribution rows with percentages
- [x] due-date attention summary with overdue + due-today attention count
- [x] immutable composition of KPI/distribution/attention/Project/Goal rows
- [x] browser Dashboard KPI rendering
- [x] browser Task status and priority distribution rendering
- [x] due-date attention rendering
- [x] active Project and Goal progress rendering
- [x] explicit report-date integration with local-date production fallback
- [x] reactive Dashboard updates from accepted Workspace Store changes

Dashboard output remains derived and is not persisted. Storage version remains 1. The reporting/dashboard block TDD 331-345 is complete; Notes/Docs/Wiki begin at TDD 346.

TDD 346-350 adds the pure Knowledge document model and optional Workspace collection. Documents support `note`/`doc` kind, exact string content, optional Project linkage, and a source-of-truth marker. Project deletion unlinks documents instead of deleting them. Persistence validation, Workspace commands, reload behavior, and browser editing remain TDD 351-360. Storage version remains 1.


## Knowledge documents — persistence and command surface

- [x] validate optional Knowledge document collections in Workspace storage version 1
- [x] reject duplicate Knowledge document IDs and missing persisted Project references
- [x] create Knowledge documents through the persisted Workspace command path
- [x] edit title, content, kind, and source-of-truth through commands
- [x] link/unlink Project context and delete documents through commands
- [x] render and edit Notes/Docs/Wiki in the browser (TDD 356-360)


## Knowledge documents — browser UI

- [x] create Notes and Docs through `WorkspaceCommands`
- [x] edit title, exact content, and kind
- [x] assign or clear optional Project context
- [x] mark or unmark source-of-truth
- [x] group ordinary Notes, ordinary Docs, and source-of-truth Wiki records without duplicate rendering
- [x] delete Knowledge documents through the persisted command path
- [x] reload Project-linked Wiki documents from storage version 1

Knowledge section membership is derived UI state and is not persisted separately. The Knowledge roadmap block TDD 346-360 is complete.
## Additional Task relationships

- [x] runtime registry for supported relationship types
- [x] directional `duplicates` relationship
- [x] directional `references` relationship
- [x] inverse `Duplicated by` and `Referenced by` summaries
- [x] Workspace storage version-1 validation and reload
- [x] persisted command path for both additional relationship types
- [x] browser create/render/reload behavior
- [x] existing `blocks` dependency-cycle semantics preserved
- [x] existing symmetric `related` canonicalization preserved

The Task relationship roadmap block TDD 361-365 is complete. Relationship
summaries remain derived UI state; only Workspace relationship edge records are
persisted. Storage version remains 1.

## Recent implemented capabilities

- [x] Bulk Task restore, delete, movement, date editing, Tags, assignees, and Custom Field changes
- [x] Gantt working calendars, holiday exclusions, custom working weekdays, and non-persistent working-date projections
- [x] Task discovery and scoped manual ordering, including accessible controls and drag/drop alternatives
- [x] Semantic Workspace navigation and collapsible panels
- [x] Board status movement, feedback, one-step Undo, keyboard focus restoration, and filter-reset controls
- [x] Derived resource-aware Gantt scheduling offsets, contention summaries, working-date projections, and forecast completion date

Detailed test cases and verification references are in [TDD_PROGRESS.md](TDD_PROGRESS.md).
