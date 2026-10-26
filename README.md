# uduzgak

uduzgak is a local-first project and task manager built with React, TypeScript,
Vite, and browser `localStorage`. It is a **ROGOYATO** project. The original
organizational repository is [ROGOYATO/uduzgak](https://github.com/ROGOYATO/uduzgak);
active development in this workflow uses the [ysoktar/uduzgak](https://github.com/ysoktar/uduzgak)
working clone. Development changes and pull requests target `ysoktar/uduzgak`
only, not the ROGOYATO organizational repository.

The project is still in its feature-first phase. Core data rules and workflows
are being added before a final visual design system or backend is introduced.

## Current local-first status (October 2026)

Local-first Workspace records and view preferences remain in browser storage.
The working clone's `main` includes verified test-first accessibility,
navigation, Task discovery, scoped manual reordering, native Project/List drag
controls, and Workspace panel disclosures through TDD 486. TDD 487–491 adds
native Board Task status drops (To do, Doing, Done), rejects cross-Project
Board drops, and provides visible drop targets. On the feature branch,
[GitHub Actions run 40243584572](https://github.com/ysoktar/uduzgak/actions/runs/40243584572)
passed 64 focused/regression tests across three files, zero-warning lint,
and the production build. These are focused checks, not a full-suite,
real-device, or accessibility sign-off. Backend identity, synchronization,
and collaboration remain separate future phases.

The older verification checkpoints below are historical milestones rather than the latest repository commit.

## Historical verified behavior checkpoint (legacy Yönlek checkout)

The confirmed starting checkpoint for TDD 261–265 was TDD 260. The old
`yonlek` working path and remote recorded below are historical; they are not
the current development target.

- branch: `main`
- behavior commit: `f24f767` (`TDD 256-260: add Task time tracking`)
- local repository: `C:\Users\yavuz\git\yonlek`
- remote: `https://github.com/ROGOYATO/yonlek.git`
- tests: 482 passed across 140 files
- lint: 0 warnings, 0 errors with `oxlint . --deny-warnings`
- production build: passed
- working tree after the feature commit: clean
- push: `origin/main` updated successfully

This checkpoint includes the core Project/Task model, archive/restore, templates,
all current Task layouts, per-view filters/sorts, saved filter sets/views, bulk
actions, current Custom Fields, recurring Tasks, time estimates, and Task time
tracking.

## Current product model

uduzgak currently uses this hierarchy:

```text
Workspace
→ Area
→ Project
→ List
→ Task
→ Subtask
```

A Checklist item is Task-local data, not another hierarchy level.

The model is intentionally independent. `Area`, `Project`, `List`, and `Task`
are uduzgak domain concepts with their own validation and persistence rules.

### Areas

Areas are optional workspace-level groupings for Projects.

Current behavior:

- create, rename, move, and delete Areas;
- assign and unassign Projects;
- keep Projects when an Area is deleted;
- clear affected Project `areaId` values when an Area is removed;
- preserve version-1 workspaces that never had an `areas` field.

### Projects

Projects own Lists and Tasks.

Current behavior:

- create, rename, describe, move, archive, restore, and delete Projects;
- focus the UI on one Project by immutable Project ID;
- show Project Task counts and completion summaries;
- move Tasks between Projects;
- delete a Project together with its Lists and Tasks;
- preserve unrelated workspace metadata when a Project is deleted;
- hide archived Projects and their Tasks from normal counts, selectors, Area
  summaries, and Task move targets without deleting their data.

### Lists

Lists are optional Task containers inside one Project.

Current behavior:

- create, rename, move, and delete Lists;
- assign a Task only to a List from the same Project;
- create a Task directly in a List;
- clear a Task's List when that Task moves to an incompatible Project;
- keep Tasks when their List is deleted.

### Tasks and subtasks

A Subtask is a normal Task with `parentTaskId`.

Current Task behavior includes:

- create, rename, delete, duplicate, archive, and restore;
- `todo`, `doing`, and `done` status;
- `low`, `normal`, and `high` priority;
- optional start date, due date, and description;
- search by title and description;
- status, priority, due-date, and type-aware Custom Field filters;
- created, title, due-date, priority, manual, and type-aware Custom Field sort modes;
- view-only grouping by status, priority, or List after filtering and sorting;
- named saved filter sets for search, status, priority, due-date, and one optional Custom Field filter;
- named saved views for Project focus, filters, built-in/Custom Field sort, and grouping;
- persisted List, Board, Calendar, Table, Timeline, and Gantt Task layouts;
- move between compatible Project and List containers;
- nested Subtasks with cycle and parent integrity checks;
- manual ordering among valid siblings.

Subtask deletion cascades through descendants. Moving a parent across Projects
moves its descendants with it. A Subtask cannot be moved away from its parent
Project on its own.

### Saved filter sets

Saved filter sets are view-preference data, not workspace data. A named set keeps
the Task search query, status filter, priority filter, due-date presence filter,
and one optional type-aware Custom Field filter. Saving the same normalized name
updates that preset. Applying a preset changes only those filters and preserves
Project focus, built-in/Custom Field sort, and grouping.

### Saved views

Saved views are also view-preference data. A named view keeps Project focus, Task
search, status, priority, due-date filter, optional Custom Field filter, built-in
sort, optional Custom Field sort, and grouping. Applying a saved view restores
that view state without copying workspace data or the saved-filter-set collection.

### Board view

Task layout is optional view-preference state. An older version-1 preference document
with no layout field opens in List mode. Board mode renders fixed `To do`,
`Doing`, and `Done` status columns after the existing Project focus, Task
filters, and Task sort have been applied. The Board reuses the same Task rows,
so existing Task actions remain available. Grouping is a List-layout concern:
Board hides grouping headings without rewriting the saved grouping preference.
Switching back to List restores that grouping. Saved views currently preserve
the active layout instead of storing a List/Board choice.

### Calendar view

Calendar is another optional Task view mode in the same version-1 preference
document. It groups the already focused, filtered, and sorted active Tasks by
`YYYY-MM-DD` due date, orders dated sections chronologically, and places undated
Tasks in a final `No due date` section. The incoming Task order is preserved
inside each date section, so the selected Task sort still controls Tasks that
share a day. Calendar reuses the existing Task rows and actions. List grouping
headings are hidden while Calendar is active, but the grouping preference is
not rewritten and returns when the user switches back to List. Saved views
continue to preserve the current layout instead of capturing List, Board, or
Calendar mode.

### Table view

Table is an optional Task view mode in the same version-1 preference document.
It shows the already focused, filtered, and sorted active Tasks in fixed `Title`,
`Status`, `Priority`, `Due date`, and `List` columns. `No due date` and `No list`
are explicit fallbacks. The compact table is a scan surface; the existing Task
detail rows remain below it so editing, Checklist, relationship, template,
archive, duplicate, and delete behavior stay on the same tested Task path. List
grouping headings are hidden while Table is active, but the grouping preference
is preserved and returns when the user switches back to List. Saved views keep
preserving the current layout instead of capturing it.

### Timeline view

Timeline is another optional Task view mode in the version-1 preference document.
It consumes the same focused, filtered, and sorted active Task sequence as the
other views. Dated Tasks are ordered by exact `YYYY-MM-DD` due date, Tasks that
share a date keep the incoming Task sort, and Tasks without a due date appear
last as `No due date`. The existing Task detail rows and actions remain the edit
path. List grouping headings are hidden while Timeline is active, but the saved
grouping returns when the user switches back to List. Timeline itself still does
not render durations, drag scheduling, or dependency lines.

### Gantt foundation

The confirmed TDD 203-207 foundation added optional exact `YYYY-MM-DD` start
dates, the `startDate <= dueDate` invariant, version-1 storage validation, and the
pure `createTaskGanttItems` projection. The projection preserves incoming Task
order and marks a Task scheduled only when both boundaries exist. It does not
infer duration or schedule geometry.

### Gantt view

Gantt is an optional Task view mode in the same version-1 preference document.
It consumes the same focused, filtered, and sorted active Task sequence as the
other views. Every Task remains represented in the semantic Gantt summary; only
Tasks with both start and due dates are marked scheduled and expose the exact
`YYYY-MM-DD` boundaries. The existing Task detail/action rows remain the edit
path. List grouping headings are hidden while Gantt is active, but the grouping
preference is preserved and returns when the user switches back to List. Saved
views continue to preserve the current layout instead of capturing Gantt. No
pixel time-scale, drag scheduling, duration editing, dependency-line rendering,
milestone, baseline, work-calendar, or critical-path behavior is added here.

### Per-view filters and sorts

Task search, status, priority, due-date presence, optional Custom Field filter,
built-in sort, and optional Custom Field sort can be remembered per Task layout
without moving them into workspace data. The optional snapshot map is
created only on the first real layout switch, so List-only version-1 preferences
keep their existing persisted shape. An unseen target layout inherits the active
filter/sort state on first entry; later switches restore that layout's own state.
Project focus and grouping remain global view preferences. Saved Filter Sets and
Saved Views update only the active layout snapshot when snapshots exist, and
Saved Views still do not capture layout mode.

### Bulk actions

Bulk selection is UI-local. It contains only active Tasks from the current
Project focus and active filters. `Select all visible tasks` uses that same
visible Task set.

Bulk status and priority changes each use one workspace action and therefore one
workspace persistence write. Bulk archive also uses one action. It expands every
selected root through the existing Subtask archive rule and applies one runtime
timestamp to the full operation. Successful bulk actions clear the UI selection.

Bulk delete, restore, Project/List moves, dates, Tags, People, and Custom Fields
remain separate behavior.

### Task templates

Task templates snapshot one active Task subtree for reuse. The template keeps
Task/Subtask titles, status, priority, description, and Checklist
text/completion. It does not keep source Project/List IDs, due dates, Tags,
People, Custom Field values, archive flags, relationship edges, or original
identities. Creating from a template generates fresh IDs and attaches the whole
subtree to one selected active Project and optional compatible List.

### Task-local data

Tasks can also contain or reference:

- Checklist items;
- reusable Tags;
- multiple local People as assignees;
- text, number, checkbox, single-select, and date Custom Field values.

Checklist arrays and Custom Field value records belong to the Task. Tags,
People, and Custom Field definitions belong to the Workspace and Tasks refer to
them by ID. Select Custom Fields own ordered options with stable IDs; Tasks store
the selected option ID rather than its display label.
Date Custom Fields store exact `YYYY-MM-DD` values and remain independent from
the Task's start and due dates. Formula Custom Fields are read-only numeric
definitions that reference stable Number/Formula field IDs. Their results are
computed from current Task values and are never stored in
`Task.customFieldValues`. One Custom Field filter and one Custom Field sort may
be active at a time. Text filtering is case-insensitive substring matching;
Number, Checkbox, Select, and Date filtering is exact and type-aware. Custom
Field sorting is ascending, places missing values last, uses Task creation time
for ties, and follows option order for Select fields. Stale field references are
inactive rather than destructive. Field type migration preserves field identity
but deliberately clears that field's stored Task values instead of guessing a
conversion. Select targets start with no options and Formula targets start
unconfigured.

### Task relationships

Task relationships are workspace-level edges, not Task fields.

Supported relationship types:

- `blocks`, which is directional;
- `related`, which is symmetric.

The reducer and persistence loader reject missing endpoints, self-links,
semantic duplicates, and dependency cycles. Deleting a Task or Project removes
relationship edges that point to deleted Tasks.

The UI shows `Blocks`, `Blocked by`, and `Related` summaries separately from the
Task title. Relationship target option values remain Task IDs. Their visible
text uses `Target: <task title>` so selector options do not create duplicate bare
Task-title nodes.

## Task duplication contract

TDD 145-147 added Task duplication through the domain, application-command, and
UI boundaries.

Duplicating one Task:

- creates a new Task ID;
- records a new `createdAt` timestamp;
- keeps the source Project, List, parent, status, priority, due date, and
  description;
- copies Checklist data;
- copies Tag and assignee ID arrays;
- copies Custom Field values;
- creates separate nested arrays and records so editing the duplicate cannot
  mutate the source through a shared JavaScript reference.

It deliberately does not copy:

- child Tasks;
- workspace-level `blocks` edges;
- workspace-level `related` edges.

Those records do not belong to the Task object being copied. Copying them would
change the workspace graph instead of copying only one Task.

## Project archive and restore contract

TDD 153-157 adds reversible Project archive behavior.

Archiving a Project records optional `archivedAt` on the Project itself. It does
not rewrite the `archivedAt` field of every Task in that Project. The Project,
its Lists, Tasks, Area assignment, description, and relationship edges remain in
workspace state and browser persistence.

Normal workspace surfaces operate on active Projects. Tasks under an archived
Project are therefore excluded from workspace and Project counts, search,
filters, sorting, Project selectors, Area Project counts, and Task move targets.
The archived Project surface exposes `Restore project <name>` controls.

Restoring a Project removes only the Project's `archivedAt`. Tasks that were
independently archived before or during the Project archive remain archived and
return only through the Task archive flow.

The storage document remains version 1 because Project `archivedAt` is an
optional additive field. Persisted values are validated as ISO instants.

## Project template contract

TDD 158-162 adds reusable workspace-local Project templates.

Saving a Project as a template snapshots reusable structure rather than live
workspace identity. A template keeps the Project name and description, List
structure, active Task and Subtask titles, status, priority, description, and
Checklist text/completion. Template-local keys preserve List and parent Task
relationships.

Templates deliberately omit Area assignment, due dates, Tags, People, Custom
Field values, Project/Task archive flags, and workspace-level relationship edges.
Those values are workspace-specific, time-specific, or reference identities that
can disappear independently from the template.

Creating a Project from a template generates fresh IDs for the Project, Lists,
Tasks, and Checklist items and uses one fresh creation timestamp. The saved
template remains independent from its source Project and can still be used after
the source Project is deleted.

## Task archive and restore contract

TDD 148-152 adds reversible Task archive behavior.

Archiving a Task:

- keeps the Task in `WorkspaceState.tasks` instead of deleting it;
- records `archivedAt` using the injected runtime clock;
- applies the same archive timestamp to every descendant Subtask;
- retains Checklists, Tags, assignees, Custom Field values, and relationship
  edges;
- removes the archived subtree from normal workspace and Project Task counts,
  search/filter/sort results, and active Task controls.

Restoring an archived root removes `archivedAt` from that Task and its archived
Subtask subtree. The archive UI lists archived roots rather than every cascaded
descendant, which prevents a child from being restored through the UI while its
parent remains archived.

Archive is intentionally different from delete. Delete removes the Task subtree
and relationship edges that point to it. Archive preserves the graph so the
same Task identities can return on restore.

The storage document remains version 1 because `archivedAt` is an optional Task
field. Older version-1 workspaces remain valid. The loader validates any stored
`archivedAt` value as an ISO instant before exposing it to the application.

## Persistence and recovery

There are two browser persistence documents.

### Durable workspace data

Key:

```text
workspace-app.workspace
```

Current storage version:

```text
1
```

The loader validates entity records, duplicate IDs, cross-entity references,
timestamps, hierarchy constraints, relationship semantics, and dependency
cycles before exposing saved data to the application.

The `workspace-app` prefix is intentionally retained. It is an established data
identifier from before the product was renamed to uduzgak. Renaming that key
without a migration would make existing browser data appear to disappear.

### View preferences

Key:

```text
workspace-app.view-preferences
```

Current storage version:

```text
1
```

View preferences include selected Project, Task search text, built-in and Custom
Field filters/sorts, grouping, Task layout, saved filter sets, and saved views.

Preferences are deliberately less strict than workspace data. Invalid,
unsupported, or unreadable preferences fall back to defaults instead of
blocking application startup. If saved Project focus points to a deleted
Project, uduzgak repairs it to `All projects`.

Workspace data and view preferences stay separate because a Task is durable
domain data while a filter selection is disposable UI state.

## Application architecture

The main runtime flow is:

```text
BrowserApp
  |
  +-- workspace persistence
  |     +-- loadWorkspace
  |     +-- saveWorkspace
  |
  +-- WorkspaceStore
  |     +-- workspaceReducer
  |     +-- transactional persistence
  |     +-- subscriptions
  |
  +-- WorkspaceCommands
  |     +-- ID generation
  |     +-- timestamp generation
  |     +-- domain object creation
  |     +-- reducer actions
  |
  +-- WorkspaceRoot
        +-- useSyncExternalStore subscription
        +-- view-preference coordination
        +-- App UI
```

The domain layer does not read browser APIs. IDs and timestamps enter through
the application-command boundary so tests can inject deterministic values.

`WorkspaceStore` computes the next state, persists it, and only then publishes
it to memory and subscribers. If persistence fails, the old in-memory state
remains current.

## Backup export

uduzgak can export and import the current workspace and view preferences as a
versioned JSON backup. The backup contains structured application state only;
it does not include attachment file bytes. Import validates the complete backup
before replacing persisted state and keeps the current state on invalid input.

## Storage migrations

Workspace storage and View Preferences now route versioned documents through a
shared stepwise migration engine. The current persisted format remains version
1, so existing data is read without rewriting it. Future versions must register
one migration for each version step; gaps, newer unknown versions, and invalid
migration output are rejected rather than guessed. Backup-file versioning stays
a separate compatibility boundary.

## Repository map

The most important paths are:

```text
src/domain/
  Core entities, pure helpers, validation rules, reducer behavior

src/application/
  WorkspaceStore and WorkspaceCommands

src/persistence/
  Versioned workspace and view-preference storage

src/BrowserApp.tsx
  Browser composition and recovery

src/WorkspaceRoot.tsx
  React store subscription and view-state coordination

src/App.tsx
  Current feature-first UI

scripts/run-tdd-bundle.ps1
  Shared fail-fast bundle runner

FEATURES.md
  Implemented and planned product capabilities

CONTRIBUTING.md
  Engineering rules and regression lessons

TDD_LOG.md
  Completed RED/GREEN history

CLICKUP_REFERENCE.md
  Competitor capability research with independence constraints

BRAND_NAME_RESEARCH.md
  Canonical working-name research
```

## Development

Install dependencies:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

Run the complete local gate:

```powershell
npm run check
git diff --check
```

`npm run check` runs, in order:

```text
lint
tests
production build
```

The lint script uses `--deny-warnings`, so a warning fails the gate.

## Test-first workflow

Behavioral production code is written only after a focused test has failed for
the expected reason.

For one behavior:

1. write the test at a stable domain, application, persistence, or UI boundary;
2. run the focused test and confirm the expected RED;
3. add only the implementation needed for that behavior;
4. rerun the focused test and require GREEN;
5. refactor while the focused and relevant regression tests stay green;
6. run the final lint, full test, production build, and diff gates before
   commit.

Existing tests are not weakened to rescue an implementation. If an established
test appears wrong, changing it requires an explicit review of the requirement
first.

Multi-cycle work uses fail-fast PowerShell bundles. A stopped bundle leaves the
repository at the exact failing stage. Do not reset or clean it. Resume bundles
pin the expected branch, HEAD, and dirty paths before continuing. For new RED
coverage, prefer focused test files when that avoids depending on unrelated
historical formatting in a large existing test file. Existing production files
still require guarded live-HEAD context before modification.

See `CONTRIBUTING.md` for the full workflow.

## Current scope limits

uduzgak is still browser-local.

Not implemented yet:

- authentication;
- accounts or remote workspace members;
- roles and permissions;
- backend database or sync;
- realtime collaboration;
- comments and mentions;
- notifications;
- public API or webhooks;
- file attachment storage;
- final responsive design and keyboard-navigation pass.

`FEATURES.md` is the maintained checklist for these gaps.

## Hosting

The frontend can be built as a static Vite application. GitHub Pages deployment
and custom-domain automation are not part of the repository yet.

## Product independence

uduzgak may study established work-management products for generic capability
coverage. That research does not authorize copying source code, assets, icons,
screenshots, marketing text, branded feature names, or distinctive UI
composition.

`CLICKUP_REFERENCE.md` records the current research boundary.

## Naming status

`uduzgak` is the active product name, npm package slug, and repository name.
**ROGOYATO** remains the project organization and original repository owner.
The working development clone is `ysoktar/uduzgak`. Earlier `yonlek` paths
in historical checkpoints do not designate the current development target.

That implementation decision is not trademark clearance.

Formal name clearance remains pending. See `BRAND_NAME_RESEARCH.md`, the repository's canonical naming and brand-research record.

## Licensing

The repository's own source-code license has not been selected yet.

Dependency licenses do not license this project's source. See
`THIRD_PARTY_NOTICES.md` for the current direct-dependency summary.

## Recurring Tasks

Recurring Tasks support completion-driven daily, weekly, and monthly recurrence with a positive interval. A recurrence requires a due date. Completing a recurring Task keeps the completed Task as history and creates exactly one new `todo` occurrence with calendar-advanced due/start dates, reset Checklist completion, and the same recurrence rule. This first version does not run a background scheduler or clone child Tasks/relationship edges.

## Time estimates

Tasks may carry an optional positive integer `estimateMinutes`. Estimates are copied by Task duplication, recurring occurrences, Task Templates, and Project Templates. They are planning metadata and stay separate from tracked work.

## Time tracking

Tasks can record manual time in positive whole minutes or run one timer at a time. Completed entries store exact elapsed milliseconds and an ISO recording timestamp. A running timer survives browser reload because its start instant is workspace data. Duplicates, recurring occurrences, and templates do not inherit completed entries or a running timer.

## Attachments

Tasks can keep local attachment metadata with a stable ID, file name, byte size, optional media type, and ISO added timestamp. The browser file input reads only that metadata. File bytes, local paths, previews, uploads, downloads, and remote file storage are not implemented. Attachment metadata stays with the source Task and is not copied into duplicates, recurring occurrences, Task Templates, or Project Templates.


## Automations

Automations are local Workspace rules with a stable ID, name, enabled state, one typed trigger, zero or more conditions, and zero or more actions. The current trigger set covers Task creation, status changes, priority changes, due-date changes, archive, and restore. Conditions cover Project, status, priority, due-date presence, and Tag assignment. Actions can set status or priority, move a Task to a Project or compatible List, or archive its Task subtree.

Execution uses the existing Task Activity boundary. An initiating tracked command is evaluated together with matching enabled Automations inside one controlled command transaction. Conditions for each Activity event are evaluated against one Workspace snapshot; matching actions run in order and their generated Activity can feed the bounded trigger queue. The explicit `AutomationExecutionContext` carries one canonical timestamp and a caller-owned action budget, so recursive Automation chains cannot rely on hidden global state. If execution fails, the command is rejected before the Workspace store accepts or persists partial state.

Workspace storage remains version 1 and now validates persisted Automation records and duplicate Automation IDs. The browser includes a local Automation editor for creation, enable/disable, trigger changes, conditions, actions, rename, and deletion. Configuration persists through reload. Command failures are surfaced in the Workspace UI while the previously accepted Workspace remains intact.

## Goals model

Goals are workspace-level planning records. The model has a stable ID and name, an optional description, a measurable target type (`manual` or `linkedTasks`), and explicit non-negative target/current numeric values.

TDD 311-315 adds the Goal domain model and optional Workspace collection. TDD 316-320 adds explicit Goal-to-Task links with deterministic insertion order, duplicate prevention, missing-reference rejection, unlink cleanup, and automatic removal when linked Tasks are deleted. Task duplication and template instantiation do not copy Goal links.

TDD 321-325 adds pure Goal progress derivation. `manual` Goals use their stored current/target values. `linkedTasks` Goals derive target from the number of linked Task IDs and current from linked Tasks whose status is `done`; unrelated Tasks are ignored and a missing linked Task counts as incomplete. Percentage output is clamped to 0-100. For a zero target, zero current is 0% and positive current is 100%. The summary helper does not mutate Goal or Task inputs. Storage validation and Goals UI remain TDD 326-330.

## Goals persistence and UI

Goals remain part of Workspace storage version 1. Loading validates each Goal, duplicate Goal IDs, and linked Task references before accepting persisted state. The browser Goals panel supports local creation, rename, description, target type, manual values, deletion, and linked-Task assignment. Linked-Task Goals show completed/linked counts; all Goals render the pure derived progress summary. Goal configuration and links persist through BrowserApp reload.

## Reporting primitives

TDD 331-335 adds a pure reporting layer over the current Workspace snapshot. Active Task reporting excludes archived Tasks and Tasks hidden by archived Projects, then derives status counts, priority counts, and deterministic open-task due-date buckets from an explicit report date. Project reporting preserves active Project order and derives total/done counts plus completion percentage, including zero-task Projects. Goal reporting reuses the existing pure Goal progress summary rather than persisting new derived fields.

`deriveWorkspaceReportingSnapshot` composes those primitives without mutating Workspace state or changing storage version 1. Dashboard composition and browser rendering remain TDD 336-345.


## Dashboard composition

TDD 336-340 turns a `WorkspaceReportingSnapshot` into a browser-ready but still pure dashboard view model. Headline KPIs expose active, completed, open, overdue, and completion-percentage values. Task status and priority distributions use fixed display order and derive percentages from their report totals. The attention summary preserves overdue, due-today, upcoming, unscheduled, and total-open counts and defines immediate attention as overdue plus due-today work.

`deriveDashboardViewModel` composes those sections and returns copied Project and Goal rows so dashboard consumers cannot mutate the underlying reporting snapshot by alias. It does not read the clock, storage, or Workspace commands, and it does not persist derived dashboard state. Browser Dashboard rendering and report-date integration remain TDD 341-345. Storage remains version 1.

## Browser Dashboard

TDD 341-345 renders the derived Dashboard in `WorkspaceRoot`. `DashboardPanel` shows headline KPIs, Task status and priority distributions, due-date attention, active Project completion, and Goal progress without dispatching commands or writing storage. `WorkspaceRoot` derives one reporting snapshot from the current Store state and an explicit report date, then composes the Dashboard view model. Tests can inject that date; production falls back to the local calendar date.

Because the Dashboard is derived from the subscribed Workspace state, accepted Task changes update the visible metrics immediately. No Dashboard values are persisted and Workspace storage remains version 1. The reporting/dashboard roadmap block TDD 331-345 is complete; Notes/Docs/Wiki begin at TDD 346.

## Knowledge document model

TDD 346-350 introduces the browser-local Knowledge document domain model without adding persistence or UI yet. A Knowledge document has a stable trimmed ID and title, an explicit `note` or `doc` kind, and editable string content that is preserved exactly rather than trimmed. Documents may optionally link to one Project and may carry a sparse source-of-truth marker.

The Workspace owns an optional ordered `knowledgeDocuments` collection. Duplicate document IDs are rejected, new Project links must reference an existing Project, and document edits reuse immutable domain helpers. Deleting a linked Project preserves the document and removes only its Project link so knowledge is not lost with Project lifecycle cleanup. Deleting the final document removes the optional collection. Storage validation, commands, browser persistence, and the Notes/Docs/Wiki UI remain TDD 351-360. Workspace storage remains version 1.


## Knowledge persistence and commands

TDD 351-355 makes Knowledge documents persistence-safe while keeping Workspace storage at version 1. Loading validates every persisted Knowledge document, duplicate document IDs, and optional Project references before accepting the Workspace. Older version-1 documents with no `knowledgeDocuments` field remain valid.

`WorkspaceCommands` now creates, renames, edits, retypes, links/unlinks, marks/unmarks source-of-truth, and deletes Knowledge documents through the same persisted Store path used by the rest of the browser-local product. Document content continues to preserve exact string bytes at the domain boundary. Browser Notes/Docs/Wiki rendering and reload interaction are completed by TDD 356-360.


## Browser Notes / Docs / Wiki

TDD 356-360 adds the browser Knowledge workspace. Users can create Notes or Docs with exact editable content, optionally link them to a Project, mark or unmark them as source-of-truth, rename or retype them, and delete them through the persisted `WorkspaceCommands` path. The browser groups ordinary `note` records under Notes, ordinary `doc` records under Docs, and any source-of-truth record under Wiki so one document appears in exactly one primary Knowledge section.

Knowledge documents reload from Workspace storage version 1 with Project linkage, content, kind, and source-of-truth state intact. UI-only grouping is derived and is not persisted. Project deletion still preserves Knowledge content and clears only the optional Project link. The Notes/Docs/Wiki roadmap block TDD 346-360 is complete; additional Task relationships begin at TDD 361.
## Additional Task relationships

TDD 361-365 extends the Workspace-level Task relationship graph without changing
the existing `blocks` or `related` contracts. The supported runtime relationship
types are now:

| Type | Direction | Browser inverse |
| --- | --- | --- |
| `blocks` | directional | `Blocked by` |
| `related` | symmetric | same relationship from either Task |
| `duplicates` | directional | `Duplicated by` |
| `references` | directional | `Referenced by` |

Only `blocks` edges participate in dependency-cycle rejection. `related` edges
continue to canonicalize endpoint order because they are symmetric.
`duplicates` and `references` preserve the supplied source/target orientation.

The browser exposes all four types through the existing relationship controls and
renders directional labels plus counts. New edges use the same
`WorkspaceCommands` -> Store -> storage-version-1 path as existing relationship
records and survive a normal reload. Relationship summaries are derived and are
not persisted separately.

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
