# TDD log

## Current verified behavior checkpoint

The latest user-confirmed behavior commit before TDD 261-265 is:

```text
f24f767  TDD 256-260: add Task time tracking
```

Verified on Windows from `C:\Users\yavuz\git\yonlek`:

```text
Tests: 482 passed across 140 files
Lint: 0 warnings, 0 errors
Build: passed
Working tree: clean after commit
Push: origin/main updated from 864ef2f to f24f767
```

The live commit tree is `4ab0b5c1c6bfdfbe1b2b9bbdcdbc62f36c6193ed`.

This log records completed behavior cycles. RED was observed before the
corresponding production implementation unless a row is explicitly marked as
workflow or configuration work.

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 001 | Create a project; normalize name; reject blank name | GREEN |
| 002 | Create a task with default status/priority; reject blank title | GREEN |
| 003 | Workspace reducer: project/task membership, status change, cascading project deletion | GREEN |
| 004 | Initial React workspace shell | GREEN |
| 005 | Browser entry contract and Vite entrypoint | GREEN |
| 005b | Production TypeScript build excludes test-only files | configuration fix |
| 006 | Rename a task without mutating the original task | GREEN |
| 007 | Workspace task title, priority, and deletion actions | GREEN |
| 008 | Render supplied workspace projects and tasks | GREEN |
| 009 | Versioned workspace persistence boundary | GREEN |
| 010 | Workspace store loads and persists reducer state | GREEN |
| 011 | Workspace-store subscriptions and unsubscribe | GREEN |
| 012 | Application commands with injected IDs and timestamps | GREEN |
| 013 | Create a project through the React interaction boundary | GREEN |
| 014 | Add a task through the React interaction boundary | GREEN |
| 014b | Testing Library DOM cleanup between Vitest tests | test-harness fix |
| 015 | Browser app loads persisted workspace state | GREEN |
| 016 | Application mutation commands for rename/status/priority/delete | GREEN |
| 017 | Change task status and priority through the UI | GREEN |
| 018 | Rename a task through the UI | GREEN |
| 019 | Delete a task through the UI without deleting its project | GREEN |
| 020 | Delete a project and its tasks through the UI | GREEN |
| 021 | Show project/task validation errors without mutating state | GREEN |

## Checkpoint after cycle 021

Live commit:

```text
470ee43  TDD 015-021: add persisted task management interactions
```

Verified on Windows:

```text
Tests: 34 passed
Build: passed
Lint: 0 warnings, 0 errors
Working tree: clean after commit
```

## Workflow after cycle 021

Beginning with the next batch, multi-cycle TDD work uses the fail-fast bundle runner documented in `CONTRIBUTING.md`.

The runner enforces the same RED/GREEN order. It automates patch application and
verification, but it does not weaken the test-first requirement.

## Cycles 022-030

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 022 | Rename a project with normalization and blank-name validation | GREEN |
| 023 | Workspace reducer project-name change without mutation | GREEN |
| 024 | Project rename application command | GREEN |
| 025 | Project rename UI and blank-rename feedback | GREEN |
| 026 | Pure task filtering by query, status, and priority | GREEN |
| 027 | Task-title search UI | GREEN |
| 028 | Task status filter UI | GREEN |
| 029 | Task priority filter UI | GREEN |
| 030 | Clear task search/status/priority filters together | GREEN |

Expected successful checkpoint:

```text
Tests: 46 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Workflow maintenance 003 adds exact partial-state validation for safe resume
bundles. Cycle 022 was moved to a new test file so the historical BOM in
`src/domain/project.test.ts` remains untouched.

## Cycles 031-038

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 031 | Optional task due date domain behavior and calendar-date validation | GREEN |
| 032 | Workspace reducer task due-date change | GREEN |
| 033 | Task due-date application command | GREEN |
| 034 | Set and clear task due date through the UI | GREEN |
| 035 | Pure due-date-presence filtering | GREEN |
| 036 | Due-date filter UI | GREEN |
| 037 | Pure immutable task sorting | GREEN |
| 038 | Task sort UI | GREEN |

User-confirmed behavior checkpoint before the build-boundary correction:

```text
Tests: 59 passed
TDD 031-038 focused GREENs: passed
Lint: passed
Build: stopped with TS2882 on the new ./styles.css side-effect import
Commit: not created
```

Configuration correction after cycle 038:

- add `src/vite-env.d.ts` with the Vite client type reference;
- do not change a behavior test;
- rerun the production build, full `npm run check`, and `git diff --check`;
- commit only after those gates pass.

The post-step adds presentation-only CSS and imports it from the browser entrypoint. No dependency is added.

## Bundle workflow corrections recorded through cycle 038

| Maintenance | Correction |
| --- | --- |
| runner v2 | UTF-8 console output and post-cycle maintenance support |
| runner v3 | exact dirty-state and checksum validation for resume bundles |
| runner v4 | expected RED stderr/non-zero exits no longer abort PowerShell before RED validation |
| runner v5 | guarded content transforms replace BOM/CRLF-sensitive source patches |
| runner v6 | normalized-content resume hashes and canonical LF guarded writes |
| runner v7 | optional manifest collections are null-safe; clean bundles use explicit empty checksum arrays |
| build fix after 038 | Vite client type declaration added for the CSS side-effect import |

Operational rule: an expected RED failure is part of the cycle. An unexpected
RED, failed GREEN, failed diff check, lint failure, test failure, or build
failure stops the batch. Preserve that stopped state and resume from the exact
Git state instead of resetting it.

## Cycles 039-045

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 039 | Optional task description normalization and clearing | GREEN |
| 040 | Workspace reducer task-description change without mutation | GREEN |
| 041 | Task-description application command | GREEN |
| 042 | Set and clear task descriptions through the UI | GREEN |
| 043 | Search task titles and descriptions at domain and UI seams | GREEN |
| 044 | Immutable priority sorting: high, normal, low | GREEN |
| 045 | Priority sort UI | GREEN |

Expected successful checkpoint:

```text
Tests: 69 passed
Build: passed
Lint: 0 warnings, 0 errors
```

TDD 043 intentionally places the domain and browser description-search
expectations in one RED cycle because one filter implementation satisfies both.
A separate later browser RED would already have been GREEN and would violate the
test-first sequencing rule.

## Cycles 046-053

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 046 | Failed persistence writes leave store state and subscribers unchanged | GREEN |
| 047 | Malformed JSON produces a stable invalid-storage error | GREEN |
| 048 | Versioned workspace document requires project/task arrays | GREEN |
| 049 | Persisted project records are validated | GREEN |
| 050 | Persisted task core fields, status, and priority are validated | GREEN |
| 051 | Optional task metadata and project relationships are validated | GREEN |
| 052 | BrowserApp renders a readable invalid-storage recovery state | GREEN |
| 053 | User can reset invalid saved data and re-enter an empty workspace | GREEN |

Expected successful checkpoint:

```text
Tests: 82 passed
Build: passed
Lint: 0 warnings, 0 errors
```

The persistence parser deliberately distinguishes an unsupported version from
invalid data. BrowserApp does not parse storage independently; it catches the
storage boundary's stable error and owns the user-facing recovery action.

## Confirmed checkpoint after cycle 053

User-confirmed at commit `ab244c6`:

```text
Tests: 82 passed
Build: passed
Lint: 0 warnings, 0 errors
git diff --check: passed
Working tree: clean after commit
```

## Cycles 054-060

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 054 | Task summary counts total/todo/doing/done | GREEN |
| 055 | Per-project completed-task summary updates with task status | GREEN |
| 056 | Focus one project by ID; rename preserves focus | GREEN |
| 057 | Deleting the focused project falls back to all projects | GREEN |
| 058 | Project selector includes task counts | GREEN |
| 059 | Project view reports visible vs total tasks after filters | GREEN |
| 060 | Workspace aggregate project/task/done summary | GREEN |

Expected successful checkpoint:

```text
Tests: 90 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Project focus remains UI state only. It stores project IDs rather than names and
uses a derived fallback when the selected project disappears.

Documentation/handoff maintenance is a living-project rule from the confirmed
TDD 053 checkpoint onward.

## TDD 056 test synchronization correction

The first TDD 056 GREEN verification exposed a React test synchronization issue,
not a product-behavior defect. The project selector retained the selected
project ID, but the test called `commands.renameProject(...)` directly after
render and asserted the renamed heading before React flushed the
`useSyncExternalStore` update.

With user approval, only that mutation was wrapped in `act(...)`. Behavioral
assertions were left unchanged. The corrected focused GREEN must pass before
TDD 057 begins.

## Cycles 061-068

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 061 | View-preference defaults and immutable updates | GREEN |
| 062 | Separate versioned view-preference storage round-trip | GREEN |
| 063 | Invalid/unsupported preferences fall back to defaults | GREEN |
| 064 | Workspace UI initializes from supplied preferences | GREEN |
| 065 | Workspace UI reports preference changes without changing domain state | GREEN |
| 066 | BrowserApp restores saved preferences | GREEN |
| 067 | BrowserApp persists preference changes separately from workspace data | GREEN |
| 068 | Deleting focused project repairs saved focus to All projects | GREEN |

Expected successful checkpoint:

```text
Tests: 102 passed
Build: passed
Lint: 0 warnings, 0 errors
```

The preference document is intentionally separate from `workspace-app.workspace`.
Invalid workspace data remains a recovery/error condition; invalid view
preferences are disposable and fall back to defaults.

## TDD 068 production-build correction

All TDD 061-068 focused GREENs completed and the final test suite reached
102/102 with clean lint. The production TypeScript build then stopped with
TS2724 because `BrowserApp.tsx` imported the `ViewPreferences` type from
`persistence/view-preferences-storage.ts`, which consumes but does not export
that type.

No behavior test was changed. The build-boundary correction imports
`ViewPreferences` from its defining module, `domain/view-preferences.ts`, then
reruns the production build, full `npm run check`, and diff gates before commit.

Durable rule: type ownership follows the defining module unless another
boundary intentionally re-exports the type as public API.

## Cycles 069-075

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 069 | Preference storage read failure falls back to defaults | GREEN |
| 070 | Preference write failure does not block UI view changes | GREEN |
| 071 | Missing saved project focus is repaired to All projects at startup | GREEN |
| 072 | Resetting invalid workspace data also resets view preferences | GREEN |
| 073 | Duplicate persisted project IDs are rejected | GREEN |
| 074 | Duplicate persisted task IDs are rejected | GREEN |
| 075 | Persisted project/task creation timestamps must be canonical ISO instants | GREEN |

Expected successful checkpoint:

```text
Tests: 110 passed
Build: passed
Lint: 0 warnings, 0 errors
```

The persistence policy is intentionally asymmetric: view preferences degrade to
defaults or best-effort saves, while durable workspace data fails closed when
identity or timestamp invariants are invalid.

## Cycles 076-084

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 076 | Task project reassignment domain mutation | GREEN |
| 077 | Reducer moves tasks only to existing projects | GREEN |
| 078 | Application command moves a task between projects | GREEN |
| 079 | Task-move UI, focused-project behavior, and browser persistence | GREEN |
| 080 | Optional project-description domain behavior | GREEN |
| 081 | Reducer project-description action | GREEN |
| 082 | Project-description application command | GREEN |
| 083 | Set and clear project descriptions through the UI | GREEN |
| 084 | Persisted project descriptions are validated | GREEN |

Expected successful checkpoint:

```text
Tests: 126 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Product sequencing decision: continue building bare-bone features before a
dedicated styling/UI-polish phase. `FEATURES.md` is the checklist for that
sequence and must remain aligned with confirmed implementation state.

## Product-direction research after TDD 075

Public ClickUp documentation was reviewed for feature breadth and architecture.

Durable decisions:

- pursue broad functional capability, not visual cloning;
- keep an independent hierarchy: Workspace → Area → Project → List → Task →
  Subtask;
- prioritize hierarchy, richer task entities, multiple views, relationships,
  automation, and knowledge features before final styling;
- defer multi-user permissions/backend collaboration until the local domain
  model is broader and stable;
- keep `FEATURES.md` as the roadmap;
- use `CLICKUP_REFERENCE.md` as a legal-safe capability reference;
- keep `Yönlek` as a preliminary working name only until trademark clearance.

## Cycles 085-092

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 085 | Product-facing Yönlek identity while preserving storage keys | GREEN |
| 086 | Area create/rename domain behavior | GREEN |
| 087 | Workspace Area add/rename/delete actions | GREEN |
| 088 | Project-to-Area assignment and Area-delete cleanup | GREEN |
| 089 | Area and Project-Area application commands | GREEN |
| 090 | Area management and Project-Area UI | GREEN |
| 091 | Area persistence validation and browser reload composition | GREEN |
| 092 | Per-Area Project summaries | GREEN |

Expected successful checkpoint:

```text
Tests: 148 passed
Build: passed
Lint: 0 warnings, 0 errors
```

No styling-system or visual redesign is part of this batch.

## TDD 085 test-harness correction

The first TDD 085 GREEN verification stopped after the product-facing Yönlek
changes were applied. `App.test.tsx` and the recovery-screen identity assertion
passed, but the repository-file identity test crashed before checking
`index.html` or `package.json`.

Cause:

```text
TypeError: The URL must be of scheme file
```

The test used `readFileSync(new URL(..., import.meta.url))` under a jsdom
environment. With user approval, only the file-location mechanism was changed
to `resolve(process.cwd(), ...)`. No product assertion was weakened or removed.

The corrected TDD 085 focused GREEN must pass before TDD 086 begins.

## TDD 086 RED-marker correction

The first TDD 086 run stopped even though the new Area test failed for the
intended reason: `./area` did not exist yet. Vitest failed while collecting the
suite, so no individual test names were emitted. The runner had incorrectly
required those test-name strings.

The test was not changed. The exact stopped RED state was preserved, TDD 086 was
resumed with `redAlreadyApplied`, and RED validation was corrected to require
stable file/module markers:

```text
src/domain/area.test.ts
Cannot find module './area'
```

Durable rule: collection-time REDs use collection/file/module evidence rather
than assertions that cannot run before import succeeds.

## Cycles 093-100

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 093 | List create/rename domain behavior | GREEN |
| 094 | Workspace List lifecycle and Project-delete cleanup | GREEN |
| 095 | Task-to-List invariants and Project-move cleanup | GREEN |
| 096 | List application commands | GREEN |
| 097 | List management and Task-List UI | GREEN |
| 098 | List persistence validation and browser reload | GREEN |
| 099 | Per-List Task counts | GREEN |
| 100 | Create Tasks directly in a selected List | GREEN |

Expected successful checkpoint:

```text
Tests: 171 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Lists remain optional in storage version 1 so existing saved workspaces continue
to load without migration.

## TDD 096 GREEN compatibility correction

TDD 096's new List command behavior passed, but GREEN verification also exposed
an older exact-state assertion after deleting the final Project.

Observed state:

```text
{ areas: [], lists: [], projects: [], tasks: [] }
```

Existing expected state:

```text
{ projects: [], tasks: [] }
```

The test was not changed or weakened.

Cause: TDD 094's Project-delete implementation spread the entire state to
preserve Areas and Lists, which also introduced empty optional collections into
the historical state shape.

Implementation correction:

- preserve non-empty Areas;
- filter and preserve Lists when Lists existed;
- avoid introducing empty optional collections when there is no unrelated data
  to preserve.

The corrected reducer must satisfy both the existing command test and the new
Project-delete hierarchy test before TDD 097 begins.

## Cycles 101-107

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 101 | Subtask creation domain behavior | GREEN |
| 102 | Parent validation and descendant deletion | GREEN |
| 103 | Subtask application command | GREEN |
| 104 | Bare-bone Subtask creation/relationship UI | GREEN |
| 105 | Parent persistence validation, cycle rejection, browser reload | GREEN |
| 106 | Parent/descendant Project-move integrity | GREEN |
| 107 | Immediate Subtask counts | GREEN |

Expected successful checkpoint:

```text
Tests: 189 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Subtasks reuse Task behavior and remain backward-compatible through optional
`parentTaskId`.

## TDD 107 GREEN title/count correction

The first TDD 107 GREEN implementation rendered Task titles and immediate
Subtask counts as one text string, for example:

```text
Draft experiment plan (1 subtask)
```

The new TDD 107 count test passed, but 10 established WorkspaceRoot tests
failed because exact Task titles are stable semantic locators.

No existing test was changed.

With explicit user approval, the new TDD 107 test was corrected to preserve the
established title contract and assert the count through a separate labeled
element:

```text
Draft experiment plan
1 subtask
```

The implementation was changed accordingly. The full WorkspaceRoot suite must
pass before post-107 documentation and final checks run.

## Cycles 108-113

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 108 | Checklist item domain behavior | GREEN |
| 109 | Task-local Checklist reducer lifecycle | GREEN |
| 110 | Checklist application commands | GREEN |
| 111 | Bare-bone Checklist interaction UI | GREEN |
| 112 | Checklist persistence validation and browser reload | GREEN |
| 113 | Checklist completed/total progress summary | GREEN |

Expected successful checkpoint:

```text
Tests: 206 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Checklist data is optional and nested under Task, so existing stored Tasks remain
backward-compatible without a storage-version migration.

## Cycles 114-118

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 114 | Generic immutable sibling-order helper | GREEN |
| 115 | Area/Project/List/Task/Checklist sibling-order reducer behavior | GREEN |
| 116 | Manual-order application commands | GREEN |
| 117 | Manual Task sort and view-preference persistence | GREEN |
| 118 | Bare-bone Move up/down UI controls | GREEN |

Expected successful checkpoint:

```text
Tests: 220 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Manual ordering reuses persisted array order and does not change workspace
storage version 1.

## Cycles 119-124

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 119 | Tag create/rename domain behavior | GREEN |
| 120 | Workspace Tag lifecycle and delete cleanup | GREEN |
| 121 | Task-to-Tag assignment integrity | GREEN |
| 122 | Tag application commands | GREEN |
| 123 | Bare-bone Tag management and Task assignment UI | GREEN |
| 124 | Tag persistence validation and browser reload | GREEN |

Expected successful checkpoint:

```text
Tests: 238 passed
Build: passed
Lint: 0 warnings, 0 errors
```

Tags are additive optional data in workspace storage version 1, so existing
saved workspaces remain valid without migration.

## Cycles 125-130

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 125 | Person create/rename domain behavior | GREEN |
| 126 | Workspace Person lifecycle and delete cleanup | GREEN |
| 127 | Task-to-Person assignee integrity | GREEN |
| 128 | Person / assignee application commands | GREEN |
| 129 | Bare-bone People management and Task assignment UI | GREEN |
| 130 | Person persistence validation and browser reload | GREEN |

Expected successful checkpoint:

```text
Tests: 253 passed
Build: passed
Lint: 0 warnings, 0 errors
```

People and assignee references are additive optional data in workspace storage
version 1, so existing saved workspaces remain valid without migration.

## Cycles 131-136

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 131 | Typed Custom Field definition/value domain | GREEN |
| 132 | Workspace definition lifecycle and delete cleanup | GREEN |
| 133 | Task typed Custom Field value integrity | GREEN |
| 134 | Custom Field application commands | GREEN |
| 135 | Bare-bone definition/value UI | GREEN |
| 136 | Custom Field persistence validation and browser reload | GREEN |

Prepared successful checkpoint:

```text
Expected tests: 280
Build: passed
Lint: 0 warnings, 0 errors
Push: origin/main after local commit
```

The test count is an estimate; the actual runner count is authoritative.

Workflow change beginning with this bundle: after a successful local commit and
clean-tree check, the runner verifies `origin` and performs a non-force push to
`main`. Push failure leaves the local commit intact.

### TDD 135 controlled text-input draft correction

The first GREEN implementation normalized a Text Custom Field on every
`onChange`. Because normalization trims leading/trailing whitespace, a
controlled input could erase the space while the user was still typing
`Inspect mount`, producing `Inspectmount`.

The behavior test was correct and unchanged. The implementation now keeps a
local text draft while the input is focused and commits the normalized value on
blur. Number and Checkbox values remain typed at their existing boundaries.

## Post-TDD 136 lint and push maintenance

TDD 131-136 completed locally at commit `8fc915a` with 280/280 tests and a
passing production build. The final lint invocation still emitted two warnings:

- unnecessary empty fallback in a Custom Field value object spread;
- an unused local variable in the new Custom Field UI test.

The previous `oxlint .` command returned success despite warnings, so the runner
continued to commit. Remote delivery then failed because the HTTPS remote helper
aborted.

Maintenance:

- remove both lint warnings without changing behavior assertions;
- change the lint script to `oxlint . --deny-warnings`;
- rerun the complete check and diff gates;
- create a small maintenance commit;
- retry non-force push only after a clean local commit.

## Cycles 137-144

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 137 | Project deletion preserves newer workspace metadata | GREEN |
| 138 | Task relationship domain and Related canonicalization | GREEN |
| 139 | Relationship lifecycle, duplicates, and deletion cleanup | GREEN |
| 140 | Dependency cycle and self-link rejection | GREEN |
| 141 | Relationship application commands | GREEN |
| 142 | Bare-bone relationship UI | GREEN |
| 143 | Persistence validation and browser reload | GREEN |
| 144 | Blocks / Blocked-by / Related summaries | GREEN |

Confirmed checkpoint:

```text
44a1087  TDD 137-144: add task relationships
Tests: 302 passed
Lint: 0 warnings, 0 errors
Build: passed
Working tree: clean after commit
Push: origin/main updated
```

Runner workflow from this batch forward pins Git for Windows at
`C:\Program Files\Git\cmd\git.exe` for every Git operation.

### TDD 141 GREEN compatibility correction

The new relationship command passed, but the full command suite found an older
Project-deletion shape regression:

```text
expected: { projects: [], tasks: [] }
received: { areas: [], lists: [], projects: [], tasks: [] }
```

Cause: the TDD 137 metadata-preservation implementation spread the entire
workspace state and therefore preserved already-empty optional `areas` and
`lists`.

No test changed. The reducer now preserves newer workspace metadata while
retaining the established optional-shape behavior for Areas and Lists.

### TDD 142 GREEN title-semantic correction

The first relationship UI GREEN implementation rendered every candidate Task
title as bare `<option>` text. Filtered-out Task titles therefore remained in
the DOM, and exact-title queries became ambiguous.

Relationship behavior itself was working: the Related relationship test passed,
and the Blocks test reached its correct relationship summaries. No test changed.

Relationship target option text is now `Target: <task title>` while the option
value remains the Task ID.

## Cycles 145-147

| Cycle | Behavior / boundary | Result |
| --- | --- | --- |
| 145 | Task duplication domain copy semantics | GREEN |
| 146 | Persisted Task duplication command through existing `task/added` path | GREEN |
| 147 | Bare-bone Duplicate Task UI control | GREEN |

Confirmed checkpoint:

```text
d976d0d  TDD 145-147: add task duplication
Tests: 305 passed
Lint: 0 warnings, 0 errors
Build: passed
Working tree: clean after commit
Push: origin/main updated
```

### TDD 145

The domain RED failed because `duplicateTask` did not exist. GREEN added a pure
Task copy operation that accepts the new ID and timestamp as inputs.

The duplicate keeps the source Task's Project, List, parent, status, priority,
due date, description, Checklist, Tag IDs, assignee IDs, and Custom Field
values. Task-owned arrays and records are copied into separate containers.

### TDD 146

The application RED failed because `WorkspaceCommands.duplicateTask` did not
exist. GREEN made the command obtain a new ID and timestamp from the injected
runtime, call the Task domain function, and persist the result through the
existing `task/added` action.

This reuses the established Task-add validation and transactional persistence
path instead of introducing a second way to insert Tasks.

### TDD 147

The UI RED failed because no accessible `Duplicate task <title>` button existed.
GREEN added that Task control and wired it to the command boundary.

The full WorkspaceRoot suite then passed with 58 tests.

### Duplication boundary

Duplicating a Task copies one Task entity only.

It does not copy child Tasks because they are separate Task records with
`parentTaskId` references. It does not copy `blocks` or `related` relationships
because those edges are workspace-level records. Copying either would modify the
workspace graph rather than duplicate one Task.

### Repository rename before TDD 145

The local folder rename was intentionally separate from product behavior.

The first Windows rename attempt failed while PowerShell was still located in:

```text
C:\Users\yavuz\git\workspace-app
```

After `cd ..`, the same guarded rename succeeded:

```text
C:\Users\yavuz\git\workspace-app
→ C:\Users\yavuz\git\yonlek
```

The branch remained `main`, HEAD remained `44a1087`, and `origin` remained
`https://github.com/ROGOYATO/yonlek.git`.

## Documentation refresh after TDD 147

This maintenance pass updates all seven tracked root Markdown files from the confirmed
`d976d0d` behavior baseline.

The purpose is documentation consistency, not product behavior:

- make the `yonlek` repository and local-folder rename explicit;
- replace prepared TDD 137-147 checkpoints with the user-confirmed commits and
  actual test counts;
- explain Task duplication across domain, command, and UI boundaries;
- explain why `workspace-app.*` browser storage keys remain unchanged;
- separate current product state from competitor research and future work;
- keep naming research preliminary until formal trademark clearance;
- retain the historical TDD and regression lessons instead of rewriting them as
  if they were new behavior.

No application or test file is part of this documentation change. The docs-only
bundle still runs the normal lint, full test, production build, and diff gates
before it can commit.

The first prepared docs bundle had a PowerShell parser error and never executed.
The corrected r2 runner passed syntax preflight, then stopped before writing. Its
reconstructed handoff snapshot incorrectly treated `YONLEK_NAME_RESEARCH.md` as
a tracked repository file. The seven real docs had already passed existence and
baseline-hash checks when the missing-file guard stopped the run. The corrected
workflow now verifies Git's tracked Markdown set before any write and uses
`BRAND_NAME_RESEARCH.md` as the single naming record.

The r2 invocation also exposed a separate PSReadLine rendering failure while a
long multi-line command was being pasted. The bundle had not started during
those console exceptions. Future bundles should ship a standalone launcher so
the operator can use one short PowerShell command instead of an interactive
continuation block.

### Docs refresh r3 warning-capture stop

The r3 docs runner started from clean `d976d0d`, verified the exact seven-file
tracked Markdown set, and wrote all seven guarded documentation targets. It then
stopped at the first documentation-consistency Git query before staging.

The repository was left in a known dirty state with those seven Markdown files
modified and nothing staged, committed, or pushed.

The failure was in the runner's Git-output helper, not in Git or the docs. The
helper used `2>&1` while `$ErrorActionPreference = 'Stop'`. Git emitted the
normal Windows warning that LF would be replaced by CRLF the next time Git
touched `BRAND_NAME_RESEARCH.md`. Windows PowerShell 5.1 promoted that stderr
line to `NativeCommandError` even though the Git command itself had not reported
a failing exit code.

The resume runner keeps stderr visible instead of merging it into parsed stdout
and uses `$LASTEXITCODE` as the native-command result. It also pins the exact
seven-file dirty status and normalized hashes before continuing, so the resume
cannot overwrite unrelated work.
### Docs refresh r4 source-encoding stop

The r4 resume runner correctly recognized the exact seven-file dirty state left
by r3, applied the guarded documentation target, and reached documentation
consistency checks. It then stopped before staging because one runner assertion
contained the literal product name in UTF-8 source.

The Markdown payload was valid UTF-8. The failure was in Windows PowerShell 5.1
source decoding: a UTF-8-without-BOM `.ps1` file can be read through legacy
code-page rules, so the assertion string became mojibake before `ReadAllText`
compared it with the correctly decoded Markdown file.

The next resume keeps executable PowerShell source ASCII-only. Its preflight
checks raw script bytes for values above `0x7F` and then runs the normal parser
check. Unicode documentation assertions use ASCII substrings unless the exact
code point is itself part of the contract.

## TDD 148 - Task archive value semantics

**RED**

Add a Task-domain test that calls `archiveTask` and `restoreTask` through their
exported functions. It requires a new immutable Task object on each transition,
`archivedAt` on archive, no mutation of the source Task, and exact restoration
of the original Task value.

Expected RED marker: `archiveTask` is missing.

**GREEN**

Add optional `Task.archivedAt`, `archiveTask`, and `restoreTask`. No storage or
UI behavior is added in this cycle.

## TDD 149 - Workspace subtree archive and restore

**RED**

Add a reducer-level test with a parent Task, child Subtask, unrelated Task, and
an existing relationship edge. Archiving the parent must archive the parent and
child with one timestamp while leaving the unrelated Task and relationship
unchanged. Restoring the parent must restore the subtree without deleting the
relationship.

**GREEN**

Add `task/archived` and `task/restored` actions. Use one Task-subtree collector
for archive, restore, and existing cascading Task deletion so the descendant
boundary is defined once.

## TDD 150 - Archived Task persistence validation

**RED**

Add a storage-boundary test that accepts a valid ISO `archivedAt` timestamp but
rejects an invalid archive timestamp with the existing `Workspace storage is
invalid` contract.

**GREEN**

Validate optional `archivedAt` in version-1 Task records. Do not bump the storage
version because the field is additive and older version-1 documents remain
valid.

### TDD 150 repair after invalid RED

The first live TDD 150 RED was invalid. The new persistence test referenced
`project` and `task` outside their scope, so Vitest failed with
`ReferenceError: project is not defined` before archive timestamp validation was
exercised. The original runner incorrectly accepted that RED because it matched
only the suite and test names. It then applied the storage validator, and GREEN
failed with the same fixture error.

The test correction was approved before modification. The repair keeps the
assertions unchanged and defines local Project and Task fixtures using the
existing `createProject` and `createTask` imports. To restore strict test-first
evidence, the resume writes `workspace-storage.ts` back to its exact pre-TDD-150
content through a normalized-hash guard, runs the corrected test, and requires
Vitest's assertion that the invalid archive timestamp did not throw. Runtime,
syntax, transform, and undefined-variable failures are explicitly rejected.
Only after that valid RED does the resume reapply the `archivedAt` validator and
require GREEN.

This is also a runner-quality rule: RED validation must identify the failure
cause, not merely prove that a named test failed.

### TDD 150 repaired RED marker transport stop

The corrected live test then reached the intended assertion and Vitest visibly
reported `AssertionError: expected [Function] to throw an error`. The first
resume still stopped because its RED gate searched unsanitized captured output
with a raw string comparison. Vitest terminal coloring can place ANSI control
sequences inside otherwise contiguous visible text, so the displayed marker and
the captured byte sequence are not necessarily identical.

The next resume keeps raw RED output for the terminal and transcript, disables
color for the captured subprocess where possible, strips ANSI CSI sequences for
machine comparison, and applies required/rejected markers only to that
normalized copy. This is a runner correction only. The approved persistence test
and pre-GREEN storage source remain unchanged.

## TDD 151 - Persisted archive commands

**RED**

Add a `WorkspaceCommands` test that archives a parent Task through the injected
runtime clock, verifies the child Subtask receives the same timestamp, verifies
persistence, restores the parent, and verifies the restored state is persisted.

Expected RED marker: `archiveTask is not a function`.

**GREEN**

Add `archiveTask(taskId)` and `restoreTask(taskId)` commands. The command boundary
rejects missing Tasks; archive supplies `runtime.now()` and both commands reuse
the reducer/store persistence path.

## TDD 152 - Task archive and restore UI

**RED**

Add a rendered `WorkspaceRoot` interaction test. A user archives a Task from its
active controls, sees active workspace counts drop, restores it from the archive
surface, and sees the Task return to active controls and counts.

Expected RED marker: `Archive task Draft experiment plan`.

**GREEN**

Wire archive/restore commands through `WorkspaceRoot`. Normal Task lists and
summaries operate on active Tasks only. Render an `Archived tasks` section for
archived roots with semantic `Restore task <title>` buttons.

## Confirmed checkpoint after TDD 152

The repaired TDD 150-152 resume completed from `1777db5` and created:

```text
e71af4e  TDD 148-152: add task archiving
```

Live verification:

```text
Tests: 310 passed across 32 files
Lint: 0 warnings, 0 errors
Build: passed
Working tree: clean after commit
Push: origin/main updated from 1777db5 to e71af4e
```

TDD 150 RED was re-established for the intended behavior failure before GREEN.
TDD 151 and 152 then completed normally.

## Line-ending policy before TDD 153

Repeated Windows Git warnings showed that bundle payloads were writing LF while
the checkout was still governed by local `core.autocrlf` behavior. The project
now carries an explicit `.gitattributes` rule:

```text
* text=auto eol=lf
```

Repository text is therefore LF on every platform. Guarded bundle payloads write
UTF-8 LF and the runner audits changed repository text before staging. This is a
repository-format rule, not a mass rewrite of unrelated files.

## TDD 153 resume runner correction

The first Project-archive bundle stopped before TDD 153 RED after adding only
`.gitattributes`. Its Git helper used an explicit parameter named `Args`, which
collided with PowerShell's automatic `$args`/`@args` behavior and produced a
false "not tracked at HEAD" result for `src/domain/project.test.ts`. No Project
archive test or production file changed in that run.

The corrected resume keeps `e71af4e` plus untracked `.gitattributes` as the
starting boundary. It uses direct Git plumbing checks with unambiguous argument
variables. RED tests live in five new focused files, so their setup no longer
depends on the historical layout of large existing test files. Production
changes still target the same public domain, reducer, persistence, command, and
rendered UI seams.

## TDD 153 - Project archive value semantics

**RED**

Add focused `src/domain/project-archive.test.ts` coverage for `archiveProject` and `restoreProject`. The source
Project must remain unchanged, archive must return a Project with `archivedAt`,
and restore must reproduce the original Project value.

Expected RED marker: `archiveProject is not a function`.

**GREEN**

Add optional `Project.archivedAt`, `archiveProject`, and `restoreProject`.

## TDD 154 - Workspace Project archive preservation

**RED**

Add focused reducer coverage with Project-owned Tasks and a List, an Area assignment, and a
relationship edge. Project archive and restore must change only the Project
archive field. Tasks, Lists, Area assignment, and relationships remain intact.

**GREEN**

Add `project/archived` and `project/restored` actions using the Project-domain
archive functions.

## TDD 155 - Archived Project persistence validation

**RED**

Add focused storage coverage that round-trips a valid Project `archivedAt` ISO instant and
rejects an invalid value through the existing `Workspace storage is invalid`
contract.

**GREEN**

Validate optional Project `archivedAt` in storage version 1. No version bump is
needed because the field is optional and additive.

## TDD 156 - Persisted Project archive commands

**RED**

Add focused command-boundary coverage that archives a Project using the injected runtime
clock, proves its Task is not Task-archived, verifies persistence, restores the
Project, and verifies persistence again.

Expected RED marker: `archiveProject is not a function`.

**GREEN**

Add `archiveProject(projectId)` and `restoreProject(projectId)` commands through
the existing reducer/store persistence path.

## TDD 157 - Project archive and restore UI

**RED**

Add a focused rendered interaction test with one active Task and one independently
archived Task. Archiving the Project must remove the Project and both Tasks from
normal surfaces, expose `Restore project <name>`, and hide the independent Task
archive while its Project is archived. Restoring the Project returns only the
independently active Task; the independently archived Task remains in the Task
archive.

Expected RED marker: `Archive project Robotics Research`.

**GREEN**

Normal workspace UI uses active Projects. Active Task calculation requires both
an unarchived Task and an active owning Project. Project selectors, Area counts,
Project focus, Task move targets, and archive surfaces use the same active
Project boundary. Add semantic Project archive and restore controls.

## Confirmed checkpoint after TDD 157

The corrected TDD 153-157 resume completed and created:

```text
3c0213c  TDD 153-157: add project archiving
```

Live verification:

```text
Tests: 315 passed across 37 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 16 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from e71af4e to 3c0213c
```

All five REDs failed for their intended causes before GREEN. `.gitattributes` is
now tracked with `* text=auto eol=lf`.

## TDD 158 - Project template value semantics

**RED**

Add focused domain coverage that snapshots reusable Project/List/active
Task/Subtask/Checklist structure and instantiates it with fresh identities.
Workspace-specific references, due dates, and archive flags must not be copied.

Expected RED marker: `createProjectTemplate is not a function`.

**GREEN**

Add Project template blueprint types plus snapshot and instantiation functions at
the Project domain boundary. Template-local keys preserve List and parent Task
references while fresh runtime IDs replace live identities.

## TDD 159 - Workspace Project template collection

**RED**

Add focused reducer coverage for storing a template, atomically adding a Project
instance with its Lists and Tasks, and deleting the template without deleting an
already-created Project.

The first TDD 159 RED attempt in the Project-template resume dereferenced
`withTemplate.projectTemplates` before proving that the reducer returned a state.
Because an unsupported reducer action currently returns `undefined`, that attempt
failed with `TypeError` instead of the intended assertion failure. The runner
rejected it and stopped before TDD 159 GREEN. The repaired test adds a whole-state
assertion first and leaves the original field assertions in place.

**GREEN**

Add optional `projectTemplates` state and template add/delete/instantiate actions.
Instantiation adds one prepared Project/List/Task set in one reducer transition.

## TDD 160 - Project template persistence

**RED**

Add focused version-1 storage coverage that round-trips a template and rejects a
Task blueprint whose template-local List reference is missing.

**GREEN**

Validate the optional template collection, unique template/list/task keys, List
references, parent references, parent cycles, and Checklist values. No storage
version bump is required because the collection is optional and additive.

## TDD 161 - Persisted Project template commands

**RED**

Add focused command coverage that saves a template, deletes its source Project,
creates a fresh Project from the retained template, and deletes the template.

Expected RED marker: `saveProjectTemplate is not a function`.

**GREEN**

Add save/create/delete Project-template commands using injected IDs/timestamps.
The command boundary dispatches one atomic template-instance action.

## TDD 162 - Project template UI

**RED**

Add a focused rendered interaction test for `Save project as template <name>`,
`Create project from template <name>`, and `Delete project template <name>`.

Expected RED marker: `Save project as template Robotics Research`.

**GREEN**

Wire Project-template commands through `WorkspaceRoot` and render a semantic
`Project templates` section.

## Prepared verification target after TDD 162

This batch starts from clean `main` at `3c0213c`. Five focused behavior test files
are prepared, so the expected suite count is 320 across 42 test files if the live
test inventory is otherwise unchanged. Live output remains authoritative. The
runner must pass focused GREENs, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.

## Confirmed checkpoint after TDD 162

The Project-template resume completed and created:

```text
62740bb  TDD 158-162: add project templates
```

Live verification:

```text
Tests: 320 passed across 42 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 16 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 3c0213c to 62740bb
```

The TDD 159 repair kept the original field assertions and added a whole-state
assertion before dereferencing the reducer result. That produced the intended
AssertionError before GREEN and avoided repeating the earlier accidental
TypeError pattern.


### Runner precondition correction before TDD 163

The first TDD 163-167 runner stopped before mutation because its scalar Git reads
indexed one-line command output with `[0]`. PowerShell had unrolled branch output
to the scalar string `main`, so `[0]` returned only `m`. The same pattern would
have truncated HEAD and origin values. Resume r1 uses one `Invoke-GitScalar`
helper that requires exactly one output line and returns the complete line.

## TDD 163 - Task template value semantics

**RED**

Add focused domain coverage that snapshots one active Task/Subtask subtree and
instantiates it with fresh Task and Checklist identities in a selected Project
and optional List. Workspace-owned references, due dates, archive flags, and
source identities must not be copied.

Expected RED marker: `createTaskTemplate is not a function`.

**GREEN**

Add Task-template blueprint types plus snapshot and instantiation functions at
the Task domain boundary. Template-local Task keys preserve parent references.

## TDD 164 - Workspace Task template collection

**RED**

Add focused reducer coverage for storing a Task template, atomically adding one
instantiated Task subtree, and deleting the template without deleting Tasks
already created from it. The RED asserts the whole reducer result before field
access so an unsupported action fails as AssertionError rather than TypeError.

**GREEN**

Add optional `taskTemplates` state and add/delete/instantiate actions.

## TDD 165 - Task template persistence

**RED**

Add focused version-1 storage coverage that round-trips a Task template and
rejects a blueprint with a missing parent reference.

**GREEN**

Validate the optional template collection, unique template IDs and Task keys,
root identity, parent references, parent cycles, rooted ancestry, and Checklist
values. No storage version bump is required because the collection is optional.

## TDD 166 - Persisted Task template commands

**RED**

Add focused command coverage that saves a Task template, deletes its source Task
subtree, creates a fresh subtree in a selected active Project/List, and deletes
the retained template.

Expected RED marker: `saveTaskTemplate is not a function`.

**GREEN**

Add save/create/delete Task-template commands using injected IDs and timestamps.
Reject archived sources, archived/missing target Projects, and incompatible
Lists.

## TDD 167 - Task template UI

**RED**

Add a focused rendered interaction test for `Save task as template <title>`, a
semantic `Task templates` section, Project/List placement controls,
`Create task from template <name>`, and `Delete task template <name>`.

Expected RED marker: `Save task as template Define protocol`.

**GREEN**

Wire Task-template commands through `WorkspaceRoot` and render the semantic Task
template workflow.

The first focused GREEN verification reached the implemented workflow but the
test then counted `Define protocol` globally. The text correctly appeared in the
source Task, the newly instantiated target Task, and the retained Task-template
row, so the expected count of two was wrong. The user approved a test-only
correction. The repaired test scopes the instantiated root and Subtask checks to
the `Target project` section with `within(...)` and separately proves that the
Task template remains visible until deletion. Production code is unchanged by
this correction.

## Prepared verification target after TDD 167

This batch starts from clean `main` at `62740bb`. Five focused behavior tests
are prepared, so the expected suite count is 325 across 47 test files if the
live inventory is otherwise unchanged. Live output remains authoritative. The
runner must pass each focused GREEN, zero-warning lint, the full suite,
production build, LF audits, exact changed-file verification, and staged diff
checks before commit or push.

## Confirmed checkpoint after TDD 167

The approved TDD 167 test-repair resume completed from `62740bb` and created:

```text
f18d394  TDD 163-167: add task templates
```

Live verification:

```text
Tests: 325 passed across 47 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 16 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 62740bb to f18d394
```

The TDD 167 production behavior was already GREEN. The approved test-only repair
replaced a global title count with `within(...)` queries scoped to the Target
project and kept the template-retention/deletion assertions.

## TDD 168 - Task grouping value semantics

**RED**

Add focused domain coverage for `none`, status, priority, and List grouping. The
input Task order must remain stable inside every group. Empty groups are omitted.

**GREEN**

Add a Task-grouping module with one `groupTasks(...)` interface. Status group
order is To do, Doing, Done. Priority group order is High, Normal, Low. List
groups follow the supplied List order and put unlisted Tasks last.

## TDD 169 - View preference grouping

**RED**

Add focused preference coverage that treats a missing grouping field as `none`
and updates grouping without mutating the previous preference object.

**GREEN**

Add optional `group` state plus `getTaskGroup(...)`. Keeping the stored field
optional preserves exact old version-1 defaults while giving callers one effective
value.

## TDD 170 - Grouping preference persistence

**RED**

Add focused storage coverage that round-trips a valid grouping value, accepts an
old version-1 document with no grouping field, and rejects an invalid grouping
value.

**GREEN**

Extend version-1 preference validation for `none`, status, priority, and List
grouping. No preference-storage version bump is required.

## TDD 171 - Persisted grouping control

**RED**

Add a focused BrowserApp interaction test for a `Group tasks` control that writes
the grouping preference without changing workspace data.

**GREEN**

Render the grouping selector and update the existing view-preference path. The
BrowserApp persistence adapter remains unchanged because it already stores the
whole preference object.

## TDD 172 - Grouped Task rendering

**RED**

Add focused rendered coverage for non-empty status headings and for returning to
the flat list when grouping is set to `none`.

**GREEN**

Group the already filtered and sorted project Tasks before rendering. Grouping
does not mutate workspace state or change the order inside a group.

## Prepared verification target after TDD 172

This batch starts from clean `main` at `f18d394`. Five focused behavior tests are
prepared, so the expected suite count is 330 across 52 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every focused GREEN, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.


## Confirmed checkpoint after TDD 172

The per-view grouping runner completed from `f18d394` and created:

```text
d2b971a  TDD 168-172: add per-view task grouping
```

Live verification:

```text
Tests: 330 passed across 52 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 13 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from f18d394 to d2b971a
```

## TDD 173 - Saved filter set value semantics

**RED**

Add focused domain coverage for a named Task-filter snapshot. The name is
trimmed and required. The value keeps only query, status, priority, and due-date
presence.

Expected RED marker: missing `./task-filter-set` module.

**GREEN**

Add the small `TaskFilterSet` value module. It has no workspace, React, storage,
ID, timestamp, sort, grouping, or Project-focus dependency.

## TDD 174 - Saved filter sets in view preferences

**RED**

Add focused preference coverage for save/update, apply, and delete behavior.
Applying a set must preserve Project focus, sort, and grouping. Existing objects
must not be mutated.

Expected RED marker: `saveTaskFilterSet is not a function`.

**GREEN**

Add optional `savedFilterSets` plus public helpers to list, save/update, apply,
and delete named presets. A repeated normalized name replaces the prior snapshot
in place.

## TDD 175 - Saved filter set persistence

**RED**

Add focused version-1 preference-storage coverage for valid round-trip, old
documents with no saved-set collection, and rejection of duplicate preset names.

**GREEN**

Validate optional saved filter sets in storage version 1. Names must be trimmed,
non-empty, and unique, and every stored filter value must use an existing filter
enum. No preference-storage version bump is required.

## TDD 176 - Persisted save control

**RED**

Add a focused BrowserApp interaction test for `Filter set name` and `Save current
filters`. The saved preset must persist separately from workspace data.

**GREEN**

Add the name input and save control to the existing view-preference path. This
slice does not add apply/delete controls yet.

## TDD 177 - Apply and delete saved filter sets

**RED**

Add focused WorkspaceRoot coverage for `Apply saved filter set <name>` and
`Delete saved filter set <name>`. Applying must update only the four Task filter
controls and preserve Project focus, sort, and grouping.

**GREEN**

Render a semantic `Saved filter sets` section with apply/delete controls. The
section disappears when its final preset is deleted.

## TDD 177 approved matcher correction

The first GREEN verification reached the new apply/delete controls but stopped
before checking their values because the focused test used jest-dom
`toHaveValue`, which this repository does not configure. The production patch
was left unchanged. With user approval, the test keeps the same elements and
expected values but reads each native input/select `.value` and compares it
with Vitest/Chai `toBe`. This matches the assertion style already used by the
existing rendered tests and avoids adding a test-only dependency for one
matcher.

## Prepared verification target after TDD 177

This batch starts from clean `main` at `d2b971a`. Five focused behavior tests are
prepared, so the expected suite count is 335 across 57 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every focused GREEN, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.


## Confirmed checkpoint after TDD 177

The saved-filter-set resume runner completed from `d2b971a` and created:

```text
6d89703  TDD 173-177: add saved filter sets
```

Live verification:

```text
Tests: 335 passed across 57 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 13 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from d2b971a to 6d89703
```

## TDD 178 - Saved view value semantics

**RED**

Add focused domain coverage for a named complete list-view snapshot. The saved
view name is trimmed and required. The value keeps Project focus, Task search,
status, priority, due-date filter, sort, and grouping.

Expected RED marker: missing `./saved-task-view` module.

**GREEN**

Add the small `SavedTaskView` value module. It has no workspace, React, storage,
ID, or timestamp dependency.

## TDD 179 - Saved views in view preferences

**RED**

Add focused preference coverage for save/update, apply, and delete behavior.
Applying a view must restore the complete seven-value list configuration without
copying or replacing saved filter sets. Existing preference objects must remain
immutable.

Expected RED marker: `saveTaskView is not a function`.

**GREEN**

Add optional `savedViews` plus public helpers to list, save/update, apply, and
delete named views. A repeated normalized name replaces the prior saved view in
place.

## TDD 180 - Saved view persistence

**RED**

Add focused version-1 preference-storage coverage for valid round-trip, old
documents with no saved-view collection, duplicate names, and invalid view
values.

**GREEN**

Validate optional saved views in storage version 1. Names must be trimmed,
non-empty, and unique. Project focus must be non-empty, and stored filters, sort,
and grouping must use existing values. No preference-storage version bump is
required.

## TDD 181 - Persisted save-view control

**RED**

Add a focused BrowserApp interaction test for `Saved view name` and `Save current
view`. The complete list configuration must persist separately from workspace
data.

**GREEN**

Add only the saved-view name input and save control to the existing preference
path. This slice does not add apply/delete controls yet.

## TDD 182 - Apply and delete saved views

**RED**

Add focused WorkspaceRoot coverage for `Apply saved view <name>` and `Delete saved
view <name>`. Applying must restore Project focus, all Task filters, sort, and
grouping.

**GREEN**

Render a semantic `Saved views` section with apply/delete controls. The section
disappears when its final saved view is deleted.

## Prepared verification target after TDD 182

This batch starts from clean `main` at `6d89703`. Five focused behavior tests are
prepared, so the expected suite count is 340 across 62 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every focused GREEN, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.

## Confirmed checkpoint after TDD 182

The saved-views runner completed from `6d89703` and created:

```text
3f2bd99  TDD 178-182: add saved views
```

Live verification:

```text
Tests: 340 passed across 62 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 13 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 6d89703 to 3f2bd99
```

## TDD 183 - Board column semantics

**RED**

Add focused domain coverage for fixed To do, Doing, and Done Board columns. The helper must keep empty columns and preserve the incoming Task order inside each status column.

Expected RED marker: missing `./task-board` module.

**GREEN**

Add the pure `createTaskBoardColumns` helper. It depends only on Task status and does not read workspace, React, persistence, filters, or sorting.

## TDD 184 - List and Board view preference

**RED**

Add focused view-preference coverage for an effective List default and immutable update to Board mode.

Expected RED marker: `getTaskViewMode is not a function`.

**GREEN**

Add optional `viewMode` plus `getTaskViewMode`. Missing mode remains List so existing version-1 preference objects and exact default-value tests do not need a migration.

## TDD 185 - Task view mode persistence

**RED**

Add focused version-1 preference-storage coverage for Board round-trip, old documents without `viewMode`, and rejection of unsupported modes.

**GREEN**

Validate optional `viewMode` as `list` or `board` while keeping preference storage at version 1.

## TDD 186 - Persisted Task view control

**RED**

Add a focused BrowserApp test for the `Task view` selector. Choosing Board must persist only in the view-preference document and leave workspace data unchanged.

**GREEN**

Add the List/Board selector to the existing preference path. This slice does not change Task rendering yet.

## TDD 187 - Semantic Board rendering

**RED**

Add focused WorkspaceRoot coverage for fixed Board status headings, status-column Task placement, existing Task actions, and restoration of the prior List grouping after switching back.

**GREEN**

Render the same Task rows in a three-column CSS grid driven by fixed status column markers. Board ignores List grouping headings while active but does not rewrite the grouping preference.

## Prepared verification target after TDD 187

This batch starts from clean `main` at `3f2bd99`. Five focused behavior tests are prepared, so the expected suite count is 345 across 67 test files if the live inventory is otherwise unchanged. Live output remains authoritative. The runner must pass every focused GREEN, zero-warning lint, the full suite, production build, LF audits, exact changed-file verification, and staged diff checks before commit or push.

## Confirmed checkpoint after TDD 187

The Board-view runner completed from `3f2bd99` and created:

```text
9f81f0f  TDD 183-187: add board view
```

Live verification:

```text
Tests: 345 passed across 67 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 14 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 3f2bd99 to 9f81f0f
```

## TDD 188 - Calendar section semantics

**RED**

Add focused domain coverage for chronological due-date sections plus one final
`No due date` section. The helper must preserve the incoming Task order inside
each section without mutating the input array.

Expected RED marker: missing `./task-calendar` module.

**GREEN**

Add the pure `createTaskCalendarSections` helper. It depends only on Task due
dates and does not read React, persistence, workspace state, filters, or sorting.

## TDD 189 - Calendar view-mode validation

**RED**

Add focused preference coverage for a public view-mode validator. List, Board,
and Calendar must be supported while an unrelated mode is rejected. Missing mode
still defaults to List.

Expected RED marker: `isTaskViewMode is not a function`.

**GREEN**

Extend `TaskViewMode` with `calendar` and add `isTaskViewMode` as the runtime
validation seam reused by persistence.

## TDD 190 - Calendar view persistence

**RED**

Add focused version-1 preference-storage coverage for Calendar round-trip, old
documents without `viewMode`, and rejection of unsupported modes.

**GREEN**

Reuse `isTaskViewMode` to validate optional `viewMode` while keeping preference
storage at version 1.

## TDD 191 - Persisted Calendar control

**RED**

Add a focused BrowserApp test for selecting Calendar through `Task view`. The
choice must persist only in view preferences and leave workspace data unchanged.

**GREEN**

Add the Calendar option to the existing Task-view selector. This slice does not
change Task rendering yet.

## TDD 192 - Semantic Calendar rendering

**RED**

Add focused WorkspaceRoot coverage for chronological date headings, the final
`No due date` section, selected-sort order within a shared date, existing Task
actions, suppression of List grouping headings while Calendar is active, and
restoration of grouping after switching back to List.

**GREEN**

Render Calendar date markers with the existing Task rows and actions. Calendar
uses the same focused, filtered, and sorted Task sequence as List and Board. It
does not rewrite List grouping or Saved View state.

## Prepared verification target after TDD 192

This batch starts from clean `main` at `9f81f0f`. Five focused behavior tests are
prepared, so the expected suite count is 350 across 72 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every focused GREEN, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.

## TDD 192 live lint cleanup

The first live TDD 188-192 run reached GREEN through Calendar rendering and the
14-file LF audit, then the zero-warning lint gate stopped before commit because
the focused Calendar test bound the returned undated Task to an unused local
variable. The Task creation is required by the `No due date` assertion, but the
returned object is not.

Approved correction: call `commands.addTask(project.id, 'Backlog note')`
directly without storing its return value. No production code, assertion,
expected value, or Calendar behavior changes. The resume must rerun the focused
Calendar test, zero-warning lint, the full check, exact-path verification, and
staged diff checks before commit or push.

## Confirmed checkpoint after TDD 192

The Calendar resume completed from the final-lint stop and created:

```text
10cf1b5  TDD 188-192: add calendar view
```

Live verification:

```text
Tests: 350 passed across 72 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 14 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 9f81f0f to 10cf1b5
```

## TDD 193 - Task table row semantics

**RED**

Add focused domain coverage for the fixed Table scan columns. Rows must preserve
the incoming Task order, format status and priority labels, resolve List names,
and use explicit `No due date` and `No list` fallbacks.

Expected RED marker: missing `./task-table` module.

**GREEN**

Add the pure `createTaskTableRows` helper. It depends only on Tasks and Lists and
does not read React, persistence, workspace state, filters, or sorting.

## TDD 194 - Table view-mode support

**RED**

Add focused preference coverage proving `table` is a supported Task view mode, an
unrelated mode remains invalid, and missing mode still defaults to List.

**GREEN**

Extend `TaskViewMode` and the shared runtime validator with `table`. Preference
storage already delegates to this validator, so no duplicate storage branch is
added.

## TDD 195 - Persisted Table control

**RED**

Add a focused BrowserApp test for selecting Table through `Task view`. The choice
must persist in the separate view-preference document and leave workspace data
unchanged.

**GREEN**

Add the Table option to the existing Task-view selector. This slice does not
change Task rendering yet.

## TDD 196 - Semantic Table summary

**RED**

Add focused WorkspaceRoot coverage for an accessible Task table with fixed Title,
Status, Priority, Due date, and List headers. Rows must follow the selected Task
sort and use the domain row labels.

**GREEN**

Render the compact Table scan surface from the already focused, filtered, and
sorted Task sequence. Keep the existing Task detail list unchanged in this slice.

## TDD 197 - Table detail behavior

**RED**

Add focused WorkspaceRoot coverage proving Table keeps existing Task actions,
hides List grouping headings while active, exposes flat detail rows in the same
Task order, and restores the prior grouping after switching back to List.

**GREEN**

Use the same flat Task sequence for Table detail rows and add a Table-specific
accessible label. Do not create a second Task command or editing path.

## Prepared verification target after TDD 197

This batch starts from clean `main` at `10cf1b5`. Five focused behavior tests are
prepared, so the expected suite count is 355 across 77 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every focused GREEN, zero-warning lint, the full suite, production
build, LF audits, exact changed-file verification, and staged diff checks before
commit or push.

## Confirmed checkpoint after TDD 197

The Table resume completed from the final-lint stop and created:

```text
bad27b3  TDD 193-197: add table view
```

Live verification:

```text
Tests: 355 passed across 77 files
Lint: 0 warnings, 0 errors
Build: passed
Line-ending audit: 13 changed repository files passed
Working tree: clean after commit
Push: origin/main updated from 10cf1b5 to bad27b3
```

## TDD 198 - Task timeline ordering semantics

**RED**

Add focused domain coverage for chronological due-date ordering, stable incoming
order when Tasks share a date, a final `No due date` position, and input
immutability.

Expected RED marker: missing `./task-timeline` module.

Runner history before GREEN:

- The original TDD 198-202 bundle stopped before mutation because its expected-absent
  path probe used `git cat-file -e`; Windows PowerShell 5.1 surfaced Git's expected
  nonzero stderr as a terminating native-command error.
- Resume-r1 reached the intended TDD 198 missing-module RED with the prepared test
  unchanged, then stopped because the runner also required the Vitest suite title
  `Task timeline items`. Vitest does not load the suite body when the imported module
  is missing, so that title is not emitted. No GREEN patch was applied.
- Resume-r2 starts only from `bad27b3` plus that one untracked RED test, verifies it
  byte-for-byte, and accepts the missing-module marker without weakening the test.

**GREEN**

Add the pure `createTaskTimelineItems` helper. It depends only on Tasks and does
not read React, persistence, workspace state, filters, sorting, or grouping.

## TDD 199 - Timeline view-mode support

**RED**

Add focused preference coverage proving `timeline` is supported, `gantt` remains
unsupported, and missing mode still defaults to List.

**GREEN**

Extend `TaskViewMode` and the shared runtime validator with `timeline`. Preference
storage continues to reuse that validator.

## TDD 200 - Persisted Timeline control

**RED**

Add a focused BrowserApp test for selecting Timeline through `Task view`. The
choice must persist in the separate view-preference document and leave workspace
data unchanged.

**GREEN**

Add the Timeline option to the existing Task-view selector. This slice does not
change Task rendering yet.

## TDD 201 - Semantic Timeline summary

**RED**

Add focused WorkspaceRoot coverage for an accessible Timeline list ordered by due
date. Shared dates must preserve the selected incoming Task sort and undated Tasks
must appear last.

**GREEN**

Render the compact Timeline summary from the already focused, filtered, and
sorted Task sequence. Keep the existing Task detail list unchanged in this slice.

## TDD 202 - Timeline detail behavior

**RED**

Add focused WorkspaceRoot coverage proving Timeline keeps existing Task actions,
hides List grouping headings while active, orders flat detail rows with the same
Timeline projection, and restores the prior grouping after switching back to
List.

**GREEN**

Use Timeline order for the existing Task detail rows and add a Timeline-specific
accessible label. Do not create a second Task command or editing path.

## Prepared verification target after TDD 202

This batch starts from clean `main` at full commit
`bad27b332b3a2991729001ff635692980cdae048`. Five focused behavior tests are
prepared, so the expected suite count is 360 across 82 test files if the live
inventory is otherwise unchanged. Live output remains authoritative. The runner
must pass every intended RED and focused GREEN, zero-warning lint, the full suite,
production build, LF audits, exact changed-file verification, byte-for-byte final
content verification, staged diff checks, remote-tip checks, commit, and non-force
push.

## TDD 198-202 full-suite compatibility stop and approved repair

The live resume-r2 run completed the five intended Timeline RED -> GREEN cycles.
The post-202 documentation and style patch applied, the 13-file LF audit passed,
and zero-warning lint passed. `npm run check` then stopped in the full test suite
with 4 historical view-preference failures. The suite reported 356 passing tests
and 4 failing tests across 82 test files. No staging, commit, push, reset, or
cleanup ran after the failure.

The failures were stale test boundaries, not a Timeline implementation failure.
The Calendar and Table domain tests still expected `timeline` to be unsupported.
The Board and Calendar persistence tests still used `timeline` as their
invalid-mode fixture. Timeline is now supported, while `gantt` remains
unsupported.

The user approved a narrow repair. The Calendar and Table domain tests now accept
`timeline` and continue to reject `gantt`. The Board and Calendar persistence
tests now use `gantt` as the invalid-mode fixture. The repair changes no
production code and keeps the original compatibility and invalid-value
assertions.

## TDD 198-202 verification retry after task-template timeout

Resume-r3 verified the exact 17-file Timeline continuation state, applied the
user-approved historical view-mode test repairs, and passed the focused
compatibility regression and zero-warning lint. The normal full suite then
stopped only because `src/WorkspaceRoot.task-template.test.tsx` exceeded the
unchanged 5000 ms test timeout, completing in 5174 ms. The suite reported 359
passing tests and 1 timed-out test across 82 test files. No staging, commit,
push, reset, or cleanup ran after that stop.

Resume-r4 stopped before the isolated retry and before any live repository
mutation. Its scratch constructor captured child PowerShell progress text in the
same success stream as the intended temporary-directory return value. The
resulting combined string was not a valid path, so the runner stopped during
exact-state reconstruction. The 17-path resume-r3 stop state remained unchanged.

Resume-r5 fixed that scratch-output problem and again verified the exact 17-path
resume-r3 stop byte-for-byte. It then invoked the isolated retry through `npx`
without pinning the working directory to the repository. Because the launcher
had been started from `C:\Users\yavuz`, npx did not resolve Yönlek's local
Vitest installation. It offered and installed Vitest 5.0.0 in the npm cache,
ran with `C:/Users/yavuz` as the root, and failed before executing any test
because that temporary Vitest installation could not resolve the project's
`jsdom` dependency. Resume-r5 made no live repository change.

Resume-r6 removes caller-working-directory dependence. The isolated retry uses
only `node_modules\.bin\vitest.cmd` from the Yönlek repository and runs with the
repository as its explicit working directory. The later lint and full-check
commands use that same explicit working directory. No npx package installation,
test change, timeout change, Vitest configuration change, worker override, or
production-code change is permitted. This note is appended only after the
unchanged historical task-template test passes in isolation; zero-warning lint
and the normal full `npm run check` still gate commit and push.

## Confirmed checkpoint after TDD 202

Resume-r6 completed the Timeline batch from the preserved verification stop. The
unchanged historical Task-template test passed alone, zero-warning lint passed,
and the normal full check reported 360 passing tests across 82 test files. The
production build passed after Vite transformed 46 modules. The runner committed
`TDD 198-202: add timeline view` as
`cf536db70256953f9b3c6e3998b03966dc91174f`, left the post-commit tree clean,
performed a non-force push, and verified `origin/main` at the same commit.

## TDD 203 - Task start-date domain seam

**RED**

Add focused Task-domain coverage for setting a normalized exact `YYYY-MM-DD`
start date, clearing it, rejecting an invalid calendar date, and preserving the
source Task.

**GREEN**

Add optional `startDate` to Task and the pure `setTaskStartDate` helper. Reuse the
existing calendar-date validator. Do not add range semantics yet.

## TDD 204 - Persisted start-date command

**RED**

Add a focused command test that changes a Task start date through the public
workspace command seam, observes the store state, reloads persisted workspace
data, then clears the start date.

**GREEN**

Add `task/startDateChanged` to the workspace reducer and
`changeTaskStartDate` to the command boundary. Route mutation through
`setTaskStartDate`; do not create a second persistence path.

## TDD 205 - Start-date storage compatibility

**RED**

Add focused storage coverage proving a valid start date round-trips in version 1,
an older version-1 Task without `startDate` still loads, and an invalid persisted
calendar start date is rejected.

**GREEN**

Validate optional persisted `startDate` by calling the Task-domain setter. Keep
storage version 1 and the existing compatibility model.

## TDD 206 - Task schedule range invariant

**RED**

Add focused domain coverage proving start cannot move after an existing due date,
due cannot move before an existing start date, and a same-day range remains
valid.

**GREEN**

Enforce `startDate <= dueDate` from both Task date setters. Exact `YYYY-MM-DD`
strings are directly comparable after calendar validation, so no duration or
time-zone model is introduced.

## TDD 207 - Pure Gantt schedule projection

**RED**

Add focused domain coverage for a pure Gantt projection. Every input Task must
remain represented in the same order, but only Tasks with both start and due
dates are marked scheduled. The input array and Tasks must remain unchanged.

Expected RED marker: missing `./task-gantt` module.

**GREEN**

Add `createTaskGanttItems`. Each item carries the original Task, nullable start
and due boundaries, and an `isScheduled` flag. The helper does not sort, render,
read workspace state, or infer schedule data.

## Prepared verification target after TDD 207

This batch starts from clean `main` at full commit
`cf536db70256953f9b3c6e3998b03966dc91174f`. Five new focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 371 tests across 87 test files; live output remains
authoritative. The runner must observe each intended RED before its GREEN patch,
pass each focused GREEN, zero-warning lint, the full suite, production build, LF
audits, exact changed-path verification, byte-for-byte final-content verification,
staged diff checks, remote-tip checks, commit, and non-force push.

## TDD 203-207 verification stop and retry

Resume-r1 completed TDD 203 and 204 RED/GREEN. TDD 205 produced the intended
storage-validation RED, but the runner's PowerShell `-like` matcher interpreted
`[Function]` as wildcard syntax and stopped before TDD 205 GREEN. No reset or
cleanup ran.

Resume-r2 verified the exact stop, reconfirmed TDD 205 RED with literal marker
matching, completed TDD 205-207 RED/GREEN, applied the post-207 documentation
patch, passed the LF audit, and passed zero-warning lint. The normal
`npm run check` ran 371 tests across 87 test files. 370 tests passed; only the
historical `src/WorkspaceRoot.task-template.test.tsx` timed out at 5326 ms
against the unchanged 5000 ms limit. No staging, commit, push, reset, or cleanup
ran after that stop.

Resume-r3 first verifies the exact 14-path post-207 state and confirms that the
historical Task-template test remains HEAD-clean. It retries that test alone with
repository-local Vitest and the unchanged timeout. This note is appended only
after that isolated retry passes. The retry changes no test, timeout, Vitest
configuration, worker setting, or production behavior. Zero-warning lint and the
normal full `npm run check` still gate commit and non-force push.

## Confirmed checkpoint after TDD 207

Resume-r3 verified the preserved TDD 203-207 target after the historical
Task-template timeout, reran that unchanged test in isolation, and then passed
the normal full check: 371 tests across 87 test files, zero-warning lint, and the
production build with 46 transformed modules. The runner committed
`TDD 203-207: add Gantt foundation` as
`87f65f9c4d0538f369b981f2cebffe358e273315`, left the tree clean, performed a
non-force push, and verified `origin/main` at the same commit.

## TDD 208 - Start-date UI boundary

**RED**

Add focused WorkspaceRoot coverage requiring an optional Task start-date input
that updates and clears the already-confirmed persisted start-date command path.

**GREEN**

Expose `onChangeTaskStartDate` through App and WorkspaceRoot and bind the Task
date input to `task.startDate`. Do not create Gantt-specific persistence.

## TDD 209 - Gantt view preference

**RED**

Add focused domain coverage requiring `gantt` to be a valid Task view mode while
an unrelated sentinel remains invalid.

**GREEN**

Extend optional `TaskViewMode` with `gantt`. Apply only the five explicitly
approved historical compatibility repairs: Calendar, Table, and Timeline domain
tests now recognize Gantt and retain `matrix` as negative coverage; Board and
Calendar storage tests use `matrix` as their invalid persisted fixture.

## TDD 210 - Browser Gantt persistence

**RED**

Add focused BrowserApp coverage requiring a selectable Gantt layout that persists
separately from workspace data.

**GREEN**

Add Gantt to the existing Task-view selector. Reuse the version-1 view-preference
storage path; do not change workspace persistence.

## TDD 211 - Semantic Gantt rendering

**RED**

Add focused WorkspaceRoot coverage requiring every incoming Task to appear in a
semantic Gantt summary in existing sort order. Complete ranges expose both exact
dates; incomplete ranges are explicitly unscheduled.

**GREEN**

Render the existing pure `createTaskGanttItems` projection. Do not calculate pixel
positions, durations, or a time scale.

## TDD 212 - Gantt Task actions and grouping boundary

**RED**

Add focused coverage requiring Gantt to keep the existing Task detail/action path,
hide List grouping headings, preserve the grouping preference, and restore those
headings after switching back to List.

**GREEN**

Route Gantt detail rows through the same Task entries while suppressing grouping
headings only for the active Gantt layout. Saved Views remain layout-neutral.

## Confirmed checkpoint after TDD 212

The TDD 208-212 Gantt view runner completed all five RED/GREEN cycles, passed
zero-warning lint, passed 376 tests across 92 test files, and built the production
bundle with 47 transformed modules. It committed `TDD 208-212: add Gantt view` as
`a31c36df9639cc50781a4cf94074ff889c28d2df`, performed a non-force push, and
verified `origin/main` at the same commit.

## TDD 213 - Active-view filter/sort snapshot state

**RED**

Add focused domain coverage requiring active filter/sort updates to keep the
legacy List-only preference shape before any layout switch, then synchronize only
the active layout when an optional snapshot collection already exists.

**GREEN**

Add the optional `filterSortByView` map and `updateTaskViewFilterSort`. Snapshot
only query, status, priority, due-date presence, and sort; leave Project focus,
grouping, saved presets, and layout mode outside the snapshot.

## TDD 214 - Task-view snapshot and restore

**RED**

Add focused domain coverage requiring the first layout switch to snapshot the
outgoing state, let an unseen target inherit that state, and restore known layout
states on later switches without mutating the source preferences.

**GREEN**

Add `switchTaskViewMode`. It creates the optional snapshot map on the first real
switch, records the outgoing layout, restores a known target, and preserves global
Project focus and grouping.

## TDD 215 - Version-1 per-view preference storage

**RED**

Add focused storage coverage for version-1 round-trip, legacy documents without
the optional snapshot map, and fallback on unsupported view keys or malformed
filter/sort snapshot values.

**GREEN**

Validate the optional per-view snapshot map inside the existing version-1 view
preference document. Do not bump the storage version.

## TDD 216 - Browser persistence across layout switches

**RED**

Add focused BrowserApp coverage that configures List filters/sort, inherits them
on first Board entry, changes Board independently, restores List, reloads browser
composition, and then restores Board again without changing workspace data.

**GREEN**

Route the five filter/sort controls and Clear task filters through the active-view
update helper, and route Task-view selection through `switchTaskViewMode`. Keep
Project focus and grouping on the existing global preference path.

## TDD 217 - Saved preset isolation

**RED**

Add focused domain coverage requiring Saved Filter Set and Saved View application
to synchronize only the active layout snapshot while preserving other layouts.
Saved Views must remain layout-neutral.

**GREEN**

Apply saved filter fields through `updateTaskViewFilterSort`. Apply Saved View
Project focus/grouping through the existing preference update, then synchronize
its filters/sort through the active-view helper.

## Prepared verification target after TDD 217

This batch starts from clean `main` at
`a31c36df9639cc50781a4cf94074ff889c28d2df`, tree
`0ab69f7cec9863763367583b5b3e66bb22fbbf5a`. Five focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 383 tests across 97 test files; live output remains
authoritative. The runner must observe every intended RED before its GREEN patch,
pass each focused GREEN, zero-warning lint, the normal full check, LF and diff
audits, exact changed-path/content gates, remote-tip checks, commit, and non-force
push.

## TDD 218 - Atomic bulk Task status

**RED**

Add focused command coverage requiring two selected Tasks to receive one status
change through one persisted store dispatch.

**GREEN**

Add `changeTasksStatus` and one bulk status workspace action. The reducer updates
the selected Task IDs in one state transition.

## TDD 219 - Atomic bulk Task priority

**RED**

Add focused command coverage requiring two selected Tasks to receive one priority
change through one persisted store dispatch.

**GREEN**

Add `changeTasksPriority` and one bulk priority workspace action. The reducer
updates the selected Task IDs in one state transition.

## TDD 220 - Atomic bulk Task archive

**RED**

Add focused command coverage requiring multiple selected roots and a descendant
Subtask to archive with one runtime timestamp and one persisted store dispatch.

**GREEN**

Add `archiveTasks` and one bulk archive workspace action. The reducer unions the
existing Subtask archive sets for all selected roots and applies the same
`archivedAt` value to the resulting Task set.

## TDD 221 - Visible active Task selection

**RED**

Add focused WorkspaceRoot coverage requiring selection to expose only active
Tasks inside the current Project focus and Task filters. `Select all visible
tasks` must select and clear that visible set.

**GREEN**

Keep selected Task IDs in App state. Derive the selectable IDs from the existing
active, focused, filtered Task pipeline and add per-Task plus select-all
checkboxes. Do not persist selection.

## TDD 222 - Bulk Task action controls

**RED**

Add focused WorkspaceRoot coverage for bulk status, priority, and archive. Each
successful action must update the selected Tasks and clear selection.

**GREEN**

Wire the three bulk workspace commands through WorkspaceRoot. Add status and
priority selectors plus archive action controls in App. Pass only currently
visible selected IDs to each handler and clear selection after a successful
handler call.

## Prepared verification target after TDD 222

This batch starts from clean `main` at
`4c01e4509a7e4f11b17883e6adeec1cf6cfcc6ef`, tree
`bc05e2746dce9832b92447cfc56b30248b9918b8`. Five focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 388 tests across 102 test files; live output remains
authoritative. The runner must observe every intended RED before its GREEN patch,
pass each focused GREEN, zero-warning lint, the normal full check, LF and diff
audits, exact changed-path/content gates, remote-tip checks, commit, and
non-force push.

## TDD 223 - Select Custom Field option domain

**RED**

Add focused domain coverage for Select field creation and immutable option
add/rename/delete behavior, including blank-name, duplicate-ID, non-Select, and
missing-option rejection.

**GREEN**

Extend `CustomFieldType` with `select`, create Select fields with an ordered empty
option list, and add pure option mutation helpers. Option labels are trimmed and
option IDs remain stable across rename.

## TDD 224 - Select option workspace commands and cleanup

**RED**

Add focused command/reducer coverage for option add, rename, and delete. Deleting
an option must clear only Task values that reference that option while preserving
other values. Missing fields, non-Select fields, and missing options must fail.

**GREEN**

Add Select option workspace commands and actions. New option IDs come from the
existing runtime ID source. Option deletion reuses the reducer path to clean only
matching Task references.

## TDD 225 - Task Select value integrity

**RED**

Add focused workspace coverage requiring a Task Select value to reference one of
the field's current option IDs. `null` clears the value and existing Text, Number,
and Checkbox normalization remains unchanged.

**GREEN**

Normalize Task values against the full Custom Field definition. Select accepts an
owned option ID and rejects unknown IDs; existing scalar field behavior stays on
the same normalization path.

## TDD 226 - Select persistence validation

**RED**

Add version-1 storage coverage for Select definition/value round-trip, legacy v1
compatibility, malformed or duplicate options, Select metadata on non-Select
fields, and Task values that reference unknown options.

**GREEN**

Keep workspace storage at version 1 and validate Select option collections and
Task option-ID references strictly. Existing v1 workspaces without Select fields
remain valid.

## TDD 227 - Select Custom Field UI

**RED**

Add focused WorkspaceRoot coverage for creating a Select field, adding options,
selecting an option on a Task, renaming that option without losing the selection,
and deleting the selected option.

**GREEN**

Expose Select in the Custom Field type chooser, add option add/rename/delete
controls, and render Task Select fields as labeled dropdowns whose values are
stable option IDs. Deleting the selected option clears the Task value through the
workspace cleanup path.

## Prepared verification target after TDD 227

This batch starts from confirmed `main` at
`aa0717f8c21a7d66b671cdf796fced95969ce18c`. The authoritative live tree is
intentionally captured by the runner from that commit instead of being hard-coded
from an offline reconstruction. Five focused RED files are prepared. If the live
inventory is otherwise unchanged, the final suite is expected to contain 400
tests across 107 test files; live output remains authoritative. The runner must
observe every intended RED before its GREEN patch, pass each focused GREEN,
zero-warning lint, the normal full check, LF and diff audits, exact changed-path
and content gates, remote-tip checks, commit, and non-force push.

## TDD 228 - Date Custom Field domain value

**RED**

Add focused domain coverage for Date field creation plus exact calendar-date
normalization. Valid leap dates must normalize after trimming; malformed and
impossible dates must fail.

**GREEN**

Add `date` to `CustomFieldType` and a pure Date Custom Field normalizer. Date
definitions carry no Select option metadata.

## TDD 229 - Task Date Custom Field workspace path

**RED**

Add focused reducer coverage for setting and clearing a Date Custom Field while
preserving unrelated Custom Field values and Task start/due dates.

**GREEN**

Route Date values through the existing definition-aware Custom Field
normalization path. Date values normalize to exact `YYYY-MM-DD`; `null` keeps
the existing generic clear behavior.

## TDD 230 - Date persistence validation

**RED**

Add version-1 storage coverage for Date definition/value round-trip, legacy v1
compatibility, Date definitions carrying Select-only metadata, and malformed,
impossible, or non-exact persisted Date values.

**GREEN**

Keep workspace storage at version 1 and validate Date definitions and Task Date
values strictly. Existing version-1 workspaces without Date fields remain valid.

## TDD 231 - Date field definition UI

**RED**

Add focused WorkspaceRoot coverage requiring Date in the Custom Field type
chooser and creation of a Date definition without Select option controls.

**GREEN**

Expose Date in the existing Custom Field type chooser. The existing create-field
command path creates the Date definition.

## TDD 232 - Task Date Custom Field UI

**RED**

Add focused WorkspaceRoot coverage requiring a labeled native date input that
shows the stored Date value, writes an exact date, clears with `null`, and leaves
Task start/due dates unchanged.

**GREEN**

Render Date Custom Fields with `<input type="date">` and route changes through
the existing Task Custom Field value callback. Other field controls remain
unchanged.

## Prepared verification target after TDD 232

This batch starts from confirmed `main` at
`72a932766b2b4abaeb3069f8d1f79ed3a89e5d59`. The runner captures the live
`HEAD^{tree}` directly from Git after confirming the expected HEAD, parent,
origin, clean working tree, and empty index. Five focused RED files are prepared.
If the live inventory is otherwise unchanged, the final suite is expected to
contain 411 tests across 112 test files; live output remains authoritative. The
runner must observe every intended RED before its GREEN patch, pass each focused
GREEN, zero-warning lint, the normal full check, LF and diff audits, exact
changed-path/content gates, remote-tip checks, commit, and non-force push.

## TDD 233 - Type-aware Custom Field filtering

**RED**

Add focused domain coverage for normalized typed Custom Field filters across
Text, Number, Checkbox, Select, and Date fields, including composition with the
existing Task filters and inactive stale references.

**GREEN**

Add a stable field-ID/type/value filter specification and extend `filterTasks`
with Workspace field definitions. Text uses case-insensitive substring matching;
other supported field types use exact normalized values. Missing definitions,
type mismatches, and removed Select options are inactive stale state.

## TDD 234 - Type-aware Custom Field sorting

**RED**

Add focused domain coverage for ascending Text, Number, Checkbox, Select, and
Date ordering, missing values, deterministic ties, and deleted field references.

**GREEN**

Add a stable field-ID sort specification and extend `sortTasks` with optional
Custom Field definitions. Missing values sort last, equal values use Task
`createdAt`, Select fields use option order, and missing field definitions leave
the incoming Task order unchanged.

## TDD 235 - Per-view preferences and saved presets

**RED**

Add focused view-preference coverage requiring Custom Field filter/sort state to
inherit and restore per Task layout. Saved Filter Sets must capture only the
Custom Field filter; Saved Views must capture both filter and sort while keeping
the existing active-layout isolation behavior.

**GREEN**

Extend active filter/sort state, per-view snapshots, Saved Filter Sets, and Saved
Views with optional Custom Field state. Preserve legacy preference shapes when
those optional values are absent.

## TDD 236 - Preference storage validation

**RED**

Add version-1 preference storage coverage for top-level, per-view, Saved Filter
Set, and Saved View Custom Field state, legacy compatibility, and malformed typed
payloads.

**GREEN**

Keep preference storage at version 1. Validate non-empty field IDs plus typed
Text, Number, Checkbox, Select, and Date filter payloads and optional Custom
Field sort IDs without requiring Workspace definitions to exist.

## TDD 237 - App pipeline, UI, and browser persistence

**RED**

Add jsdom BrowserApp coverage requiring Custom Field filter controls, Custom
Field sort choices, shared visible-Task behavior, bulk Select-all integration,
layout consistency, reload persistence, and inactive stale field references.

**GREEN**

Feed the existing focused Task sequence through the type-aware Custom Field
filter/sort domain seams. Add one Custom Field filter selector with type-specific
value controls and one Custom Field sort option per current field. BrowserApp
continues to persist the preference document separately from workspace data.

## Prepared verification target after TDD 237

This batch starts from confirmed `main` at
`94e5576e5259247ab8bee316a19a6701bec7c39f`. The runner captures the live
`HEAD^{tree}` directly from Git after checking the expected HEAD, parent, origin,
remote tip, clean working tree, and empty index. Five focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 424 tests across 117 test files; live output remains
authoritative. The runner must observe every intended RED before its GREEN
patch, pass each focused GREEN, zero-warning lint, the normal full check, LF and
diff audits, exact changed-path/content gates, remote-tip checks, commit, and
non-force push.

## TDD 238 - Formula Custom Field definition

**RED**

Add focused domain coverage requiring Formula as a Custom Field type, optional
binary configuration with stable operand field IDs, supported arithmetic
operators, immutable configure/clear helpers, and rejection of malformed
configuration.

**GREEN**

Add `formula` to the Custom Field type model and add optional binary Formula
definition metadata. Formula fields are created unconfigured and do not carry
Select option metadata.

## TDD 239 - Formula evaluation

**RED**

Add focused domain coverage for Number operands, chained Formula references,
all four arithmetic operators, unavailable operands, division by zero,
non-finite results, and malformed cyclic persisted data.

**GREEN**

Add a pure recursive Formula evaluator. It reads current Task Custom Field
values without mutating workspace state and returns `null` for unavailable or
unsafe results.

## TDD 240 - Formula workspace configuration

**RED**

Add focused workspace-command coverage for configure/clear persistence,
Number/Formula operand validation, self/cycle rejection, referenced-field
deletion cleanup, and rejection of direct Formula Task-value writes.

**GREEN**

Add one Formula configuration command/action. Validate the Formula dependency
graph before accepting configuration, clear directly dangling Formula
configurations when a referenced field is deleted, and keep Formula Task values
read-only.

## TDD 241 - Formula workspace storage

**RED**

Add version-1 workspace-storage coverage for configured and unconfigured Formula
definitions, legacy compatibility, malformed metadata, invalid dependencies,
cycles, and forbidden stored Formula Task values.

**GREEN**

Keep workspace storage at version 1. Validate Formula definition metadata and
dependency graphs on load and reject Task `customFieldValues` entries owned by
Formula definitions.

## TDD 242 - Formula UI and read-only results

**RED**

Add jsdom WorkspaceRoot coverage requiring Formula field creation,
Number/Formula operand controls, configure/clear actions, read-only computed Task
results, live recomputation after Number edits, and no Formula Task-value
persistence.

**GREEN**

Expose Formula in the Custom Field definition UI, wire Formula configuration
through the workspace command, and render Task Formula results as read-only
computed output. Formula fields stay outside Custom Field filter/sort choices in
this batch.

## Prepared verification target after TDD 242

This batch starts from confirmed `main` at
`ae6458bf6f9f3d80bf7e4217ca762d5ca5952271`. The runner captures the live
`HEAD^{tree}` directly from Git after checking the expected HEAD, parent, origin,
remote tip, clean working tree, and empty index. Five focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 440 tests across 122 test files; live output remains
authoritative. The runner must observe every intended RED before its GREEN
patch, pass each focused GREEN, zero-warning lint, the normal full check, LF and
diff audits, exact changed-path/content gates, remote-tip checks, commit, and
non-force push.

## TDD 243 - Pure Custom Field type migration

**RED**

Add focused domain coverage requiring explicit type migration to preserve stable
field identity while replacing incompatible Select/Formula metadata and making
same-type migration a no-op across all current field types.

**GREEN**

Add `migrateCustomFieldType`. Migration preserves ID, name, and creation time,
initializes Select with an empty option list, leaves Formula unconfigured, and
removes metadata that does not belong to the target type.

## TDD 244 - Workspace migration cleanup and Formula integrity

**RED**

Add focused workspace-command coverage requiring one-dispatch migration, Task
value cleanup, unrelated-value preservation, same-type no-op behavior, missing
field rejection, and Formula dependency cleanup only when an operand becomes a
non-numeric field type.

**GREEN**

Add the Custom Field type-change command/action. Clear migrated Task values and
clear directly incompatible Formula configurations while preserving downstream
Formula definitions and dependencies that still point to Number/Formula fields.

## TDD 245 - Migration UI and persisted reload

**RED**

Add jsdom BrowserApp coverage requiring an explicit per-field migration control,
a disabled same-type action, clear wording about Task-value deletion, immediate
new-type rendering, stale preference inactivity, and persistence across reload.

**GREEN**

Wire the migration command through WorkspaceRoot and App. Render a target-type
selector plus explicit destructive action, clear obsolete local field drafts
after migration, and rely on the existing version-1 workspace persistence and
stale-preference behavior for reload.

## Prepared verification target after TDD 245

This batch starts from confirmed `main` at
`4108eabc015886a4d8788425382b5909bb877476`. The runner captures the live
`HEAD^{tree}` directly from Git after checking the expected HEAD, parent, origin,
remote tip, clean working tree, and empty index. Three focused RED files are
prepared. If the live inventory is otherwise unchanged, the final suite is
expected to contain 446 tests across 125 test files; live output remains
authoritative. The runner must observe every intended RED before its GREEN
patch, pass each focused GREEN, zero-warning lint, the normal full check, LF and
diff audits, exact changed-path/content gates, remote-tip checks, commit, and
non-force push.


## TDD 246 - Recurrence rule and calendar advancement

**RED**

Add focused Task-domain coverage requiring optional daily/weekly/monthly recurrence with a positive interval, due-date requirement, clear semantics, and calendar-safe date advancement including month-end clamping.

**GREEN**

Add Task recurrence metadata, configure/clear helper, and exact calendar advancement without millisecond-duration month arithmetic.

## TDD 247 - Next recurring occurrence

**RED**

Add pure-domain coverage requiring a completed recurring Task to produce one fresh `todo` occurrence that preserves Task-owned data, advances start/due dates, resets Checklist completion, and does not carry archive state.

**GREEN**

Add pure next-occurrence creation with a fresh Task ID/creation time, copied recurrence and Task-owned values, month-safe date advancement, and reset Checklist completion.

## TDD 248 - Atomic recurring completion

**RED**

Add workspace-command coverage requiring persisted recurrence configuration plus one-dispatch completion-and-next-occurrence creation, no duplicate generation when the completed source is set to `done` again, unchanged non-recurring completion, and fail-before-dispatch behavior for invalid recurrence state.

**GREEN**

Add the recurrence command/action and a dedicated atomic recurring-completion action on the singular Task status path. Bulk status behavior remains unchanged.

## TDD 249 - Recurrence storage version 1

**RED**

Add storage coverage requiring recurrence round-trip, legacy Task compatibility, and rejection of malformed rules or recurrence without a valid due date.

**GREEN**

Keep workspace storage at version 1 and validate optional Task recurrence through the same domain rule used by live mutations.

## TDD 250 - Recurrence UI and BrowserApp persistence

**RED**

Add jsdom BrowserApp coverage requiring recurrence unit/interval controls, due-date validation, immediate rendering of completed plus next occurrence, and persistence across reload.

**GREEN**

Wire recurrence through WorkspaceRoot and render `No recurrence`, Daily, Weekly, Monthly, plus positive interval controls. Surface due-date errors through the existing App alert path and persist generated occurrences through the normal workspace store.

## Prepared verification target after TDD 250

This batch starts from confirmed `main` at `56e52ea4835aedeb459dcfa4df7afdf3d1e74efc`. The runner captures the live `HEAD^{tree}` directly after checking HEAD, parent, origin, remote tip, clean working tree, and empty index. Five focused RED files are prepared. If live inventory is otherwise unchanged, the final suite is expected to contain 458 tests across 130 test files; live output remains authoritative. The runner must observe every intended RED before its GREEN patch, pass each focused GREEN, zero-warning lint, the normal full check, LF and diff audits, exact changed-path/content gates, remote-tip checks, commit, and non-force push.

## TDD 246-250 live final-check correction

The first live run completed all five intended RED to GREEN cycles, zero-warning lint, and 458 tests across 130 test files. The final production build then caught TypeScript literal widening in the `task/recurringCompleted` reducer branch: the inline `status: 'done'` object was inferred as `string` inside the mapped Task array.

Resume r1 narrows that unchanged runtime literal with `as const`. No recurrence behavior, test, timeout, worker setting, or storage contract changes. The resume reruns focused recurrence coverage, the production build, zero-warning lint, and the full check before the original commit and non-force push gates.

## TDD 251-255: Time estimates

- 251: Task estimate domain value and Task-copy semantics.
- 252: Task Template and Project Template estimate preservation.
- 253: Workspace estimate command/reducer.
- 254: workspace storage v1 validation for live and template estimates.
- 255: Task UI and BrowserApp persistence.

Time tracking, rollups, bulk estimate editing, filtering, and sorting remain out of scope.

### TDD 253 resume correction

The first TDD 253 RED was invalid because the focused test imported a nonexistent `ReducerStore` constructor from `workspace-store`. The approved correction changed only the new test harness to the repository's existing local reducer-backed `WorkspaceStore` pattern. Assertions, fixtures, estimate values, error expectations, and production behavior were unchanged. The corrected TDD 253 RED must fail on the missing `changeTaskTimeEstimate` command before the original TDD 253 GREEN patch is reapplied.

### TDD 255 resume correction

The first TDD 255 RED was invalid because the new BrowserApp test seeded workspace JSON under an invented raw key, so BrowserApp rendered an empty workspace in both RED and GREEN. The approved correction changes only the new test fixture: it uses the existing `saveWorkspace`/`loadWorkspace` contract and domain constructors, and it proves the expected Task is loaded before asserting the missing Time-estimate control. The three behavioral test names, estimate values, recurrence behavior, error expectation, production patch, timeout settings, and worker settings remain unchanged. Future BrowserApp RED tests must prove fixture validity before a missing-element failure can count as RED.

## TDD 256-260: Time tracking

- 256: Task-local completed time entries, manual minute entry, one running timer, exact elapsed milliseconds, entry deletion, and tracked-minute totals.
- 257: copy boundaries that keep actual tracked work and running timers out of Task duplication, recurring occurrences, Task Templates, and Project Templates.
- 258: workspace reducer and command coverage for manual entry, timer start/stop, and entry deletion with one dispatch per user operation.
- 259: storage version 1 validation for completed entries and a running timer, including legacy compatibility and rejection of tracking fields inside template blueprints.
- 260: Task controls in the existing UI plus BrowserApp persistence for manual entries, timer state across reload, timer stop, entry deletion, and validation errors.

Time estimates remain independent planning metadata. This batch does not add live ticking UI, rollups, billable time, People attribution, reporting, attachments, or activity history.

## TDD 256-260 live completion notes

The first TDD 256-260 full check stopped on the existing `BrowserApp.custom-field-filter-sort.test.tsx` 5-second timeout after the new focused Time-tracking coverage, build, and lint had already passed. The same historical test passed twice in isolation without changing its timeout or worker settings.

Resume r1 then stopped in its own preflight because the guard looked for a literal test path even though the runner read that path from the manifest. Resume r2 fixed that guard but duplicated `--deny-warnings` onto an npm lint script that already contained the flag, so oxlint rejected the command before any repository change. Resume r3 invoked `npm run lint` directly. The full check then passed 482 tests across 140 files, commit `f24f767` was created, and a non-force push updated `origin/main`.

## TDD 261 - Task attachment metadata domain

**RED**

Add focused Task-domain coverage requiring immutable attachment add/delete, normalized IDs and names, non-negative integer byte sizes including zero-byte files, optional media type normalization, canonical ISO timestamps, duplicate-ID rejection, and removal of the `attachments` property when the last entry is deleted.

**GREEN**

Add `TaskAttachment`, optional `Task.attachments`, `addTaskAttachment`, and `deleteTaskAttachment`. Store metadata only. No file bytes or local paths enter Task state.

## TDD 262 - Attachment copy boundaries

**RED**

Add pure-domain coverage requiring Task duplication and the next recurring occurrence to exclude attachment metadata while preserving independent planning metadata such as time estimates. Require Task Templates and Project Templates to remain free of attachment fields.

**GREEN**

Explicitly remove attachments from duplicated Tasks and recurring occurrences. Keep the existing template whitelist behavior unchanged.

## TDD 263 - Workspace attachment commands

**RED**

Add reducer-backed command coverage requiring one runtime-generated ID and timestamp for add, one dispatch per successful add/delete operation, exact metadata storage, and rejection of invalid metadata without accepting new Task state.

**GREEN**

Add attachment add/delete workspace actions, reducer delegation to the Task domain, and `WorkspaceCommands.addTaskAttachment` / `deleteTaskAttachment`.

## TDD 264 - Attachment storage version 1

**RED**

Add storage coverage requiring valid attachment metadata to round-trip in workspace storage version 1, legacy Tasks without attachments to remain valid, and malformed metadata, duplicate attachment IDs, or attachment fields inside Task/Project Template blueprints to be rejected.

**GREEN**

Validate optional live Task attachments and unique attachment IDs without a storage-version bump. Keep template blueprints free of attachment metadata.

## TDD 265 - Browser attachment metadata UI

**RED**

Add BrowserApp coverage that proves the expected Task fixture loaded before requiring a file input. Selecting a browser `File` must persist only its name, byte size, optional media type, runtime ID, and timestamp. Reload must preserve the metadata, delete must persist, and zero-byte files with no media type must not gain path or content fields.

**GREEN**

Wire attachment commands through WorkspaceRoot. Add a Task file input, metadata list, delete action, and one clear notice that file content is not stored. The UI does not add upload, download, preview, object-URL, local-path, or blob persistence.

## Prepared verification target after TDD 265

This batch starts from confirmed `main` at `f24f767a41cedbf169cccb5e865817ec62057ad7`, tree `4ab0b5c1c6bfdfbe1b2b9bbdcdbc62f36c6193ed`. Five focused RED files are prepared. If the live inventory is otherwise unchanged, the final suite is expected to contain 493 tests across 145 test files; live output remains authoritative. The runner must observe every intended RED before its GREEN patch, pass all five focused attachment suites together, run an explicit production build, zero-warning lint, the normal full check, LF and diff audits, exact changed-path/content gates, remote-tip checks, commit, and non-force push.

## TDD 261-265 full-suite harness stabilization

The first TDD 261-265 final full check passed all attachment RED/GREEN cycles, focused coverage, production build, and zero-warning lint, then hit the existing 5-second timeout in `BrowserApp.custom-field-filter-sort.test.tsx`; the same run also put `WorkspaceRoot.task-template.test.tsx` just over the threshold. A diagnostic resume showed both tests passing twice in isolation and together while the Custom Field test still timed out under the normal full suite.

A scratch A/B run then compared the unchanged `f24f767` baseline with the exact 15-file Attachments target on the same machine and dependency tree. All three targeted rounds passed on both sides, while both baseline and target full suites timed out in the same Custom Field test. Attachments therefore are not the necessary cause of the failure; the unstable boundary is full-suite file-level resource contention.

Keep the existing test bodies and 5-second timeout unchanged. Cap Vitest file-level concurrency at four workers in `vitest.config.ts`. Before applying that harness correction to the live dirty checkout, the continuation runner must reproduce the failing baseline in scratch, apply only the worker cap there, and require the normal baseline full check to pass. The harness change is committed separately before the 15-file Attachments commit.
## TDD 266-270: Task Activity history

- **266:** add the Workspace-level Task Activity entry/event model, deterministic descriptions, canonical timestamps, direct lifecycle derivation, and optional `WorkspaceState.activity`.
- **267:** add the atomic `workspace/taskActivityTracked` envelope and track direct lifecycle workspace commands with one Store dispatch and no Activity ID consumption.
- **268:** extend Activity to bulk/subtree operations, template-created Tasks, recurring completion, and Project deletion with deterministic per-Task ordering.
- **269:** keep storage version 1 while validating optional Activity entries, contiguous sequences, canonical timestamps, strict event payloads, and historical references that no longer resolve to live entities.
- **270:** add a Workspace-level lazy Activity panel and BrowserApp reload coverage, including readable history for a deleted Task.

The Activity boundary is deliberately local and actor-free. It does not add accounts, comments, notifications, backend audit logging, rollback, retention, or history for every Task-owned field. Supported user-facing lifecycle commands wrap the existing base action in one tracked envelope so the existing `WorkspaceStore` persists the mutation and its derived Activity together.

The live runner remains authoritative for RED/GREEN output, final test counts, commit SHA, and push result. It must preserve the committed four-worker Vitest cap and the existing default test timeout.

## TDD 266-270 full-suite maintenance

After the Activity-history focused cycles passed, the full suite exposed one
production no-op regression and four historical test fixtures that predated
Activity timestamps/state.

- `changeTaskStatus()` now returns before reading `runtime.now()` when the Task
  already has the requested status. This preserves recurring-completion
  idempotence and avoids consuming a timestamp for a no-op.
- Approved historical tests now account for persisted Activity state and the
  additional legitimate Activity timestamps. Delete assertions continue to
  verify empty Project/Task collections and also verify the expected Activity
  lifecycle entries.
- No historical test was weakened or changed outside the explicitly approved
  files.

## Cycles 271-275: backup export

- **271:** define backup version 1 with Workspace state, View Preferences, and one canonical export instant.
- **272:** serialize the backup deterministically as readable JSON with exactly one final line feed.
- **273:** generate a deterministic Windows-safe JSON filename from the canonical export instant.
- **274:** add the browser download boundary, including object-URL cleanup on both success and failure.
- **275:** compose export into BrowserApp without mutating Workspace or persisted View Preferences.

Backup import is deliberately deferred to TDD 276-280.

## Cycles 276-280: backup import

- **276:** parse only the exact version-1 backup envelope and reject malformed JSON, unsupported versions, non-canonical export timestamps, and extra top-level fields.
- **277:** validate nested Workspace and View Preferences through the existing persistence validation boundaries.
- **278:** import only after full validation, persist Workspace and View Preferences together, and roll back the previous values when the second persistence write fails.
- **279:** add the JSON backup-file reader boundary and reject non-JSON names or empty files.
- **280:** compose import into BrowserApp, remount WorkspaceRoot from imported state, restore imported View Preferences, and preserve the current application on invalid input.

## TDD 276-280 full-suite worker stabilization

After backup import passed focused checks, the historical Custom Field
filter/sort browser test repeatedly crossed the unchanged 5000 ms timeout only
under full-suite concurrency. It passed in isolation at 3985 ms. A full suite
with `maxWorkers=3` passed once, but the immediately repeated full suite with the
same checked-in cap failed again, so `maxWorkers=3` was rejected as unstable.

The continuation requires two consecutive no-mutation full-suite passes with
`maxWorkers=2` before changing configuration. If both pass, the worker cap is
committed separately as a test-harness stabilization. Test bodies and the
5000 ms timeout remain unchanged.

## Cycles 281-285: storage migration framework

- **281:** add the current-version migration contract and explicit migration metadata.
- **282:** apply registered migrations sequentially, one version at a time, without mutating the source document.
- **283:** distinguish invalid envelopes, newer unsupported versions, missing migration steps, and invalid migration output.
- **284:** route Workspace storage through the migration engine while preserving version-1 data, zero-write reads, and the existing unsupported-version error.
- **285:** route View Preferences storage through the same engine while preserving best-effort fallback semantics and zero-write reads.

The current Workspace and View Preferences storage formats remain version 1.
No fictional legacy schema was introduced. Backup-file versioning remains
independent from browser-storage migration versions.


## Cycles 286-290: Automation core model

- **286:** add stable Automation identity with normalized non-empty ID/name and explicit enabled state.
- **287:** add typed trigger, condition, and action records for the planned local Automation vocabulary without execution.
- **288:** validate Automation records and add immutable updates for name, enabled state, trigger, conditions, and actions while preserving the stable ID.
- **289:** add the optional Workspace Automation collection, duplicate-ID rejection, immutable updates, and deletion cleanup.
- **290:** expose Automation configuration through Workspace commands and prove valid Automation state round-trips through the existing Workspace storage version 1 boundary.

This batch does not execute Automations. TDD 291-295 begins trigger handling from
the existing Activity/event boundary, not DOM observation. Condition evaluation
is deferred to 296-300, action execution to 301-305, and Automation-specific
persisted-data validation, execution composition, and UI to 306-310. The storage
version remains 1.


## Cycles 291-295: Automation triggers

- **291:** match enabled `task.created` Automations directly from Task Activity entries and ignore unrelated Activity events.
- **292:** add `task.statusChanged` trigger matching.
- **293:** add `task.priorityChanged` trigger matching.
- **294:** add `task.dueDateChanged` trigger matching for both setting and clearing a due date.
- **295:** add `task.archived` and `task.restored`, then expose deterministic batch matching in Activity-entry order followed by Automation collection order.

This batch does not observe the DOM, evaluate Automation conditions, or execute
Automation actions. It turns the existing Activity/event stream into stable trigger
matches only. Condition evaluation starts in TDD 296-300, action application in
301-305, and controlled command-transaction execution plus UI in 306-310.
Storage version remains 1.


## Cycles 296-300: Automation conditions

- **296:** evaluate the Project condition against the triggered Task in one Workspace snapshot and reject a missing Task.
- **297:** add Task status condition matching.
- **298:** add Task priority condition matching.
- **299:** add due-date-presence matching for both present and absent due dates.
- **300:** add Tag condition matching and deterministic AND evaluation across the full Automation condition list.

Condition matching is pure and does not run Automation actions or mutate Workspace.
Action application begins in TDD 301-305. Automation-specific persisted-data
validation, controlled execution composition, and UI remain TDD 306-310. Storage
version remains 1.


## Cycles 301-305: Automation actions

- **301:** apply `status.set` immutably and introduce an explicit bounded `AutomationExecutionContext` with no hidden global state.
- **302:** add `priority.set` through the existing Workspace reducer boundary.
- **303:** add Project move while preserving subtree moves and incompatible-List cleanup.
- **304:** add List move while preserving same-Project List validation.
- **305:** add Task archive with the context timestamp while keeping Activity append and automatic Automation cascading out of this pure action layer.

Each action consumes one caller-owned budget step. The action layer reuses existing
Workspace invariants and does not compose triggers, conditions, Activity recording, or
recursive Automation execution. Automation-specific persistence validation, controlled
command-transaction execution, and UI remain TDD 306-310. Storage version remains 1.


## Cycles 306-310: Automation persistence, execution, and UI

- **306:** validate persisted Automation records and duplicate Automation IDs through the existing Workspace storage version 1 boundary.
- **307:** compose trigger matching, fixed-snapshot condition evaluation, ordered actions, generated Activity, and the explicit bounded execution context in one pure Automation transaction.
- **308:** route Activity-trackable Workspace commands through the controlled Automation transaction and commit the completed Workspace with one Store dispatch.
- **309:** add the local Automation list/editor UI and prove configuration persists through BrowserApp reload.
- **310:** surface command/Automation failures in WorkspaceRoot and prove invalid actions or exhausted execution budgets do not accept or persist initiating or intermediate Workspace state.

Automation execution remains Activity-driven rather than DOM-driven. Action-produced
Activity may cascade through the same bounded queue. Conditions for one Activity event
use one Workspace snapshot, action order is deterministic, and failed transactions are
rejected before Store dispatch. Workspace storage remains version 1. The Automation
roadmap block 286-310 is complete; Goals begin at TDD 311.

## TDD 311-315 — Goals model

- TDD 311: added stable Goal identity/name validation.
- TDD 312: added optional Goal description with trim/clear semantics.
- TDD 313: added measurable `manual` and `linkedTasks` target types.
- TDD 314: added finite non-negative target/current values without premature percentage clamping.
- TDD 315: added full Goal validation and an optional immutable Workspace Goal collection with duplicate-ID rejection.

Deferred by roadmap: Goal ↔ Task linkage (316-320), progress derivation (321-325), and persistence/UI (326-330).


## TDD 316-320 — Goal ↔ Task linkage

- **316:** add immutable Goal-side Task linking with ordered Task IDs.
- **317:** add unlinking and remove the optional linkage field when the final Task is unlinked.
- **318:** expose Workspace link/unlink actions and reject missing Goal or Task references.
- **319:** remove Goal links automatically when direct Task/subtree deletion or Project deletion removes linked Tasks.
- **320:** make linkage deterministic by deduplicating repeated links, validate persisted linkage IDs at the Goal boundary, reject prelinked Goals that reference missing Tasks, and lock the regression that Task duplication/template instantiation does not copy Goal links.

Goal progress derivation remains TDD 321-325. Goal storage validation, CRUD UI, linked-Task summaries, progress rendering, and browser reload remain TDD 326-330. Storage version remains 1.

## TDD 321-325 — Goal progress derivation

- **321:** derive manual Goal progress directly from stored non-negative current/target values without mutating the Goal.
- **322:** derive linked-Task progress from ordered Goal links, counting linked `done` Tasks as current progress and linked Task IDs as the target while ignoring unrelated Tasks.
- **323:** derive percentage for positive targets and clamp output to the inclusive 0-100 range.
- **324:** define zero-target behavior explicitly: 0/0 reports 0%, while positive current over a zero target reports 100%.
- **325:** expose one pure Goal progress summary helper that returns target type, current value, target value, and percent for either target mode without mutating inputs.

Goal progress remains derived state and is not persisted. Goal storage validation, browser reload, CRUD UI, linked-Task summary rendering, and progress rendering remain TDD 326-330. Storage version remains 1.

## TDD 326-330 — Goals persistence and UI

- **326:** validate the optional Goal collection in Workspace storage version 1, including malformed records, duplicate Goal IDs, and missing linked-Task references.
- **327:** expose Goal create/update/delete and Task link/unlink operations through `WorkspaceCommands` so Goal changes use the normal persisted Store path.
- **328:** add the local Goals CRUD panel for creation, rename, description, target type, manual values, and deletion.
- **329:** add linked-Task assignment controls and render completed/linked Task summaries for `linkedTasks` Goals.
- **330:** render the pure Goal progress summary in the browser UI and lock BrowserApp reload persistence for created Goals.

Derived progress remains non-persisted. Storage version remains 1. The Goals roadmap block TDD 311-330 is complete; reporting/dashboard primitives begin at TDD 331.

## TDD 331-335 — Reporting primitives

- **331:** derive active Task status counts and completion percentage while excluding archived Tasks and Tasks hidden by archived Projects.
- **332:** derive active Task priority counts without mutating Workspace state.
- **333:** classify active incomplete Tasks into overdue, due-today, upcoming, and unscheduled buckets against an explicit report date.
- **334:** derive ordered active Project completion rows with total/done Task counts and completion percentage, including zero-task Projects.
- **335:** reuse pure Goal progress summaries and compose Task, Project, and Goal metrics into one immutable Workspace reporting snapshot.

Reporting output remains derived and is not persisted. Workspace storage remains version 1. Dashboard composition and browser UI remain TDD 336-345.


## TDD 336-340 — Dashboard composition

- **336:** derive headline active/completed/open/overdue Task KPIs and reuse the reporting completion percentage.
- **337:** derive stable To do / Doing / Done distribution rows and percentages from Task status reporting.
- **338:** derive stable Low / Normal / High distribution rows and percentages from Task priority reporting.
- **339:** compose due-date attention counts and define immediate attention as overdue plus due-today open Tasks.
- **340:** compose the complete immutable Dashboard view model with copied Project and Goal rows so Dashboard consumers cannot mutate reporting inputs by alias.

Dashboard composition remains pure derived state and is not persisted. Workspace storage remains version 1. Browser Dashboard rendering and report-date integration remain TDD 341-345.


## TDD 341-345 — Browser Dashboard UI

- **341:** render headline active/completed/open/overdue Task KPIs and completion percentage in a dedicated `DashboardPanel`.
- **342:** render the stable Task status and priority distribution rows supplied by the Dashboard view model.
- **343:** render immediate due-date attention plus overdue, due-today, upcoming, unscheduled, and total-open counts.
- **344:** render active Project completion rows and Goal progress rows, including explicit empty-state messages.
- **345:** integrate Dashboard derivation into `WorkspaceRoot` with an injectable report date, local-calendar fallback, and reactive recomputation after accepted Workspace Store changes.

Dashboard rendering remains derived state: `DashboardPanel` does not dispatch commands or write storage, and Workspace storage remains version 1. The reporting/dashboard roadmap block TDD 331-345 is complete; Notes/Docs/Wiki begin at TDD 346.

## TDD 346-350 — Knowledge document model

- **346:** add stable trimmed Knowledge document identity and title validation.
- **347:** add explicit `note` / `doc` kind plus exact editable string content, immutable rename/content/kind helpers, and full document validation.
- **348:** add optional normalized Project linkage with immutable link/unlink helpers.
- **349:** add a sparse source-of-truth marker whose false state removes the optional field.
- **350:** add the optional ordered Workspace Knowledge document collection, duplicate-ID and missing-Project rejection, immutable document edit actions, final-delete cleanup, and Project-deletion unlink semantics that preserve document content.

Knowledge documents are not persisted or rendered by the browser yet. Storage validation, command composition, browser reload, and Notes/Docs/Wiki UI remain TDD 351-360. Workspace storage remains version 1.


## TDD 351-355 — Knowledge persistence and commands

- **351:** round-trip the optional Knowledge document collection through Workspace storage version 1.
- **352:** reject malformed Knowledge records, duplicate document IDs, and persisted Project links to missing Projects.
- **353:** create normalized Knowledge documents through `WorkspaceCommands` and the persisted Store path.
- **354:** edit title, exact content, kind, and source-of-truth through persisted commands.
- **355:** link/unlink Project context and delete Knowledge documents through persisted commands, including final optional-collection cleanup.

Workspace storage remains version 1. Browser Notes/Docs/Wiki CRUD, reload, and presentation are completed by TDD 356-360.


## TDD 356-360 — Browser Notes / Docs / Wiki

- **356:** add the Knowledge browser panel and create `note` / `doc` records with exact content through the supplied command boundary.
- **357:** add browser title, content, and kind editing without duplicating domain validation rules.
- **358:** add Project context selection plus explicit source-of-truth controls, including Project unlink through `null`.
- **359:** derive mutually exclusive Notes, Docs, and Wiki sections and route document deletion through the command callback.
- **360:** integrate the Knowledge panel into `WorkspaceRoot` and prove a Project-linked source-of-truth document survives a normal `BrowserApp` reload from storage version 1.

Knowledge UI state is derived from persisted Workspace documents; no new preference or storage document is introduced. Storage version remains 1. TDD 346-360 is complete; the roadmap continues with additional Task relationships at TDD 361.
## TDD 361-365 — Additional Task relationships

- **361:** add one runtime registry/guard for the supported relationship types:
  `blocks`, `related`, `duplicates`, and `references`.
- **362:** keep `duplicates` and `references` directional, preserve existing
  `related` canonicalization, and reject unsupported relationship types at the
  domain constructor boundary.
- **363:** persist the two additional directional relationship types through the
  existing `WorkspaceCommands` and Workspace storage version-1 path.
- **364:** add a pure relationship summary that distinguishes `Blocks`,
  `Blocked by`, `Related`, `Duplicates`, `Duplicated by`, `References`, and
  `Referenced by` without mutating relationship records.
- **365:** expose both additional types in the browser relationship controls,
  render directional labels/summaries, and prove those edges survive a normal
  Store reload from persisted Workspace state.

Storage version remains 1. Only `blocks` participates in dependency-cycle
validation; `related` remains symmetric. Additional relationship summary state is
derived and is not persisted.

## TDD 366-370 - Bulk restore and delete

- 366: bulk restore reducer semantics, including subtree union and duplicate caller IDs.
- 367: bulk delete reducer semantics with relationship and Goal-link cleanup.
- 368: one-dispatch commands and ordered Activity integration for restore/delete.
- 369: archived-root selection and bulk restore UI.
- 370: selected active Task bulk delete with explicit two-step confirmation.

Storage remains version 1. The batch extends existing lifecycle semantics rather than introducing a parallel archive/delete model.

## TDD 371-375 - Bulk Project/List movement

- 371: atomic bulk Project movement with subtree semantics and incompatible List clearing.
- 372: atomic bulk List assignment/clearing with whole-selection compatibility validation.
- 373: one-dispatch WorkspaceCommands and ordered Task Activity integration.
- 374: visible-selection bulk Project movement UI.
- 375: compatible bulk List UI with explicit cross-Project clearing behavior.

Storage remains version 1. The batch extends the existing Project/List commands rather than introducing a parallel movement model.

## TDD 376-380 - Bulk dates

- 376: bulk due-date set/clear reducer behavior for selected Tasks.
- 377: bulk start-date set/clear reducer behavior for selected Tasks.
- 378: whole-selection calendar/schedule validation, no partial acceptance, and single-Task due-clear recurrence parity.
- 379: one-dispatch WorkspaceCommands plus deterministic bulk start/due Task Activity.
- 380: visible-selection browser controls for setting and clearing bulk start/due dates.

Storage remains version 1. Bulk date operations extend the existing Task start/due commands and do not introduce separate schedule fields or subtree propagation.

## TDD 381-385 - Bulk Tags and People

- 381: bulk Tag add/remove reducer behavior across selected Tasks.
- 382: bulk Person assign/unassign reducer behavior across selected Tasks.
- 383: caller-ID deduplication plus deleted/missing Tag/Person reference handling with no partial mutation.
- 384: one-dispatch WorkspaceCommands for bulk Tag and Person changes.
- 385: visible-selection browser controls for bulk Tag add/remove and Person assign/unassign.

Storage remains version 1. Bulk Tag/Person operations extend the existing single-Task reference model and do not add a second assignment representation or subtree propagation.

## TDD 386-390 - Bulk Custom Field values

- 386: bulk Text and Number set/clear reducer behavior.
- 387: bulk Checkbox and Date typed-value behavior.
- 388: Select option compatibility plus existing missing-field, Formula, and type-migration validation.
- 389: one-dispatch WorkspaceCommands boundary for bulk Custom Field changes.
- 390: visible-selection browser controls with a type-aware editable Custom Field value editor.

Storage remains version 1. Bulk Custom Field writes extend the existing `customFieldValues` map and normalization boundary; they do not introduce a second value representation.

## TDD 391-395 - Gantt drag scheduling (confirmed live)

- Added drag-based Task schedule movement, with original duration preserved.
- Scheduling changes use the existing Task date setter and persisted command boundary.
- Gantt drag and keyboard scheduling tests guard regressions.

## TDD 396-400 - Gantt dependency lines (confirmed live)

- Render directional `blocks` edges between visible Gantt Tasks.
- Keep unrelated relationship types outside dependency rendering.
- Test display filtering, direction, and regression behavior.

## TDD 401-405 - Gantt milestones and baselines (confirmed live)

- Explicit milestone flag, persisted command and storage validation.
- Capture fixed original Task schedule baseline and compare after rescheduling.
- Render milestone and baseline state through the existing Gantt UI.

## TDD 406-410 - Pure Gantt critical-path foundations

- **406:** calendar-day duration for scheduled Tasks, and zero-day milestones; no inferred dates.
- **407:** stable scheduled-Task `blocks` graph projection with irrelevant edges removed.
- **408:** deterministic dependency order with cycle rejection.
- **409:** earliest logical finish-to-start offsets computed from task durations.
- **410:** latest offsets, slack, critical flags, and input-order result rows.

This analysis is **not a calendar-aware or resource-aware schedule**: it treats the selected scheduled Tasks as one dependency graph and computes logical day offsets, not actual date movement or UI highlights. No storage schema or command action changes. Critical-path UI and work-calendar rules remain separate future work.

## Product identity update prepared alongside TDD 406-410

- Working product name and npm identity: `uduzgak`.
- Application heading, HTML title, package and lockfile names change together.
- Existing product-identity assertions are updated to the newly requested
  identity while retaining browser persistence compatibility checks.
- `workspace-app.*` persistence keys remain unchanged; no data migration occurs.
- GitHub repo `ROGOYATO/yonlek` and local `git\yonlek` checkout remain
  unchanged until a separate coordinated infrastructure rename.
- Previous name-collision research remains historical; `uduzgak` clearance is
  unverified.

## Test-suite maintenance after TDD 410 — scoped consolidation

A focused cleanup replaces five duplicate BrowserApp layout-persistence fixtures with one sequential layout-persistence contract, merges five single-layout domain preference tests into one table-driven contract, and merges five critical-path files into one file **without changing their five assertions/cases**. Two view-preference storage files are replaced by one compatibility contract. Four dashboard helper tests repeat the aggregate `dashboard-view-model.test.ts` input/output checks and are removed; the aggregate model, dashboard browser test, and relevant reporting tests stay.

Do not use number of test files as a TDD quota. Write a failing test for meaningful behavior and keep tests that cover unique boundaries, invalid inputs, persistence, or regressions. Trivial renames and obvious presentation changes do not require new test files. At **the end of each TDD**, run the new test and short relevant existing regression smoke, zero-warning lint, and the appropriate type/build check. Do not run the full Vitest suite automatically per TDD or per bundle; run it only when explicitly requested or separately agreed. Show live test output; never declare a failing test passed or silently change assertions to pass.

Confirmed pre-cleanup live checkpoint: `ef30ab2dfc5e215496f416597c31046fd8f0f5b4` on main. The cleanup remains prepared until its Windows runner validates the actual live checkout, focused tests, build, and non-force push.

## TDD 411 — Gantt critical-path presentation

Starting user-confirmed live checkpoint: `f583d3089c68c0aef9ebcfa37113ef72f0f14fcc` (test-suite consolidation, clean `origin/main`).

RED: extend the existing `src/App.test.tsx` contract for an accessible project Gantt summary, critical Task markers, noncritical slack, unscheduled omission, and absence outside Gantt; it should fail because the UI does not yet show critical-path analysis.

GREEN: reuse the previously verified pure `createTaskGanttCriticalPath` calculation. Show the logical duration and per-Task label on visible Project Gantt entries, with simple highlighted critical rows. Avoid new persistence, state, dependencies, and redundant test files.

Verification boundary: one new behavior test, adjacent App and Gantt smoke tests, zero-warning lint, TypeScript/build, diff and hash audits, scratch replay before live transfer, non-force push. **Full Vitest intentionally omitted.** This record describes the intended verification gate; the Windows runner output and resulting commit are authoritative for whether the change became live.

## TDD 412-416 — Gantt controls and schedule consistency (prepared batch)

Starting confirmed live state: `d1576de9a36ffe7736d38702d03c9024a068fb32`, Gantt critical-path UI TDD 411. Five discrete test-first cycles: (412) critical-only overview with dependency filtering; (413) optional early/late logical offset details; (414) bulk-select visible critical Tasks without mutation; (415) pure blocking date-conflict detection including zero-day milestone semantics; (416) Gantt conflict rendering and reactive resolution. Existing relevant test files are extended; no new test files. Every cycle checks its new behavior and relevant prior targeted regressions, zero-warning lint, and TypeScript/Vite build. After all five, run only a narrowly scoped Gantt integration smoke. Never run the full Vitest suite automatically. Scratch replay and live state transitions require pinned HEAD/tree/blob/remote, exact changed paths, digest equality, clean commit and non-force push. This is a prepared target until the Windows runner succeeds; don't claim these changes are live based on this document.


## TDD 417–421 — working calendar and optional Gantt analysis (prepared)

Start boundary: `9287ee9c320dfe04be35467053011ab74d3e3f05` (`TDD 412–416: add Gantt critical controls and schedule diagnostics`).

RED/GREEN cycles: 417 count inclusive UTC weekdays without changing calendar-day duration, 418 validate/deduplicate excluded dates, 419 substitute working-day durations into in-scope `blocks` graph, 420 calculate longest working-day path/slack, 421 show optional working-day UI alongside unchanged calendar-day summary. Test coverage is added only to the existing Gantt domain and browser-view test files. No new test files.

Per-cycle gates: one RED focused test first, minimal GREEN patch, focused domain/UI tests, zero-warning lint, TypeScript/build. Final narrow Gantt regression smoke, exact-path/hash transfer audit, clean-tree/remote checks, non-force commit/push. Never run full Vitest automatically. Prepared until the user executes the Windows runner; do not claim a live checkpoint based on package creation alone.


## TDD 422–426 — Gantt holiday controls

Start boundary: `1cb953c0bb75bbbf3fcf8f4dca7685196251836e` (`chore(deps): pin patched Vitest 4.1.12 and remediate audit`), clean `main` at `ROGOYATO/uduzgak`.

422 normalized validated ISO non-working dates with no caller mutation; 423 session-only browser addition feeding working-day analysis; 424 removal and reactive recomputation; 425 separate calendar-day/working-day critical-only overviews with scoped dependency links; 426 bulk-select visible working-day critical Tasks. Exactly five RED/GREEN behavior tests were added to two existing focused Gantt test files, with per-cycle lint/build and focused final regression checks; no full Vitest. Runner gates changes on pinned HEAD/tree/blobs, clean index, exact files, remote unchanged, and non-force push. No Task or storage schema changes; non-working dates are not persisted. Actual live completion is determined by runner output, not by package preparation.


## TDD 427–431 — configurable Gantt working weekdays (prepared)

Starting confirmed live boundary: `f81f8d024f467f042d8481ac8da0acb7c879efaf` (`TDD 422-426: add Gantt holiday and working critical controls`). TDD 427 validates/normalizes nonempty UTC weekday sets. TDD 428 counts custom workdays while applying excluded dates. TDD 429 threads configured weekdays through the scheduled blocking graph. TDD 430 recomputes critical path/slack with the custom week. TDD 431 offers an optional Sunday–Thursday Gantt toggle without changing the calendar-day view or Workspace data. Each behavior is a new test appended to existing Gantt test files, with RED before GREEN, targeted tests, zero-warning lint and build. No full Vitest. Runner must confirm live SHA/tree/remote, dry-run all anchors in a scratch clone, then transfer exact bytes and non-force push. This describes prepared work only until a user-provided successful Windows log confirms completion.


## TDD 432–436 — persistent Gantt working calendar

Pinned base: `d7d0739741fa54460071d0f285a0c09e27582274` (`TDD 427-431: add configurable Gantt workweek`). Five independent RED-first behaviors: 432 validate optional Gantt workweek preset in persisted view preferences; 433 validate sorted unique ISO holiday exclusions; 434 restore stored preset and exclusions into the initial Gantt UI; 435 persist preset changes and restore after reload; 436 persist holiday additions/removals and restore after reload. No new test files, no edits or weakening of historical tests. Live commit only after 5 targeted RED/GREEN cycles, focused regression, zero-warning lint, build, source/hash gates and non-force push. The Windows runner transcript is the authority for completion; this documentation alone is not execution evidence.

## TDD 437–441 — derived Gantt working-date projection (fork branch; verified in CI)

Fork: `ysoktar/uduzgak`; branch: `tdd/437-441-gantt-working-date-projection`; base: `b2648c3dda1ecca162cd7d21a335161220893b74`.

Test-first commits precede implementation changes for working-day offset dates (437), earliest projected ranges (438), latest dates from slack (439), milestone classification (440), and optional Gantt display (441). TDD 440 includes an additional milestone regression test because the original scenario appeared already supported; that existing new test was retained unchanged. Existing tests were not edited.

GitHub Actions run 40229438290 on commit `4991e3ef9a29d8d4e395370d13987eeda5afd780` completed successfully: focused Gantt domain/UI tests, zero-warning lint, and TypeScript/Vite build passed. Earlier branch runs exposed a non-working-anchor offset bug and a dependent projection-anchor bug; each was corrected with approved test expectations preserved. Historical tests were not modified. This confirms the final branch state, not that every earlier intermediate commit passed CI.

## TDD 442–446 — local UI navigation and accessibility foundation

Fork: `ysoktar/uduzgak`. Branch: `tdd/442-446-local-ui-accessibility`. Parent: `e826e58cbd3e5a7c650b7bebfb050f742484797f`.

- 442 — named workspace main landmark and keyboard skip link
- 443 — filter/project navigation targets and semantic navigation region
- 444 — first-project empty workspace guidance
- 445 — visible keyboard focus and skip-link CSS
- 446 — narrow-screen overflow and reduced-motion CSS

Test-first changes were committed separately on the branch. One newly added CSS contract test had adjacent `})  it(` syntax; the user explicitly approved inserting only the missing line break, without changing either assertion. Final branch implementation CI for commit `81990bcbb009be39a6f27f2b4c6aa7ed2ce616a7`: [GitHub Actions run 40234617984](https://github.com/ysoktar/uduzgak/actions/runs/40234617984), 64/64 targeted Vitest tests in three files, lint 0 warnings/0 errors, TypeScript/Vite build passed. This is not a full-suite or end-to-end accessibility sign-off.

## TDD 447–451 — local task discovery

Fork branch `tdd/447-451-local-task-discovery` based on `2740313423c9153d3b84bce0ff6100f7c3f1914e`. Five test-first behaviors: visible count; no-match status; clear filters; distinguish empty Workspace; Escape search recovery. A syntax-only newline separator in the newly added test was approved explicitly by the user and changed no assertions. The final focused CI for commit `493181fb5fdafa96c876d99a78c9cfca222d45ec` passed 8/8 tests across 2 files, zero-warning lint and TypeScript/Vite build. GitHub Actions: https://github.com/ysoktar/uduzgak/actions/runs/40237637414. No full Vitest or visual browser QA was conducted.

## TDD 452–456 — native manual Task drag-order

Base `d4df2dc766bbc5ccc724c02ffcf8e1cb51b52d0d` on `ysoktar/uduzgak`. RED-first commits preceded each behavior: peer-slot move-before (452), move-after and invalid-drop helper (453), Workspace reorder commands (454), native UI drag/drop with existing keyboard buttons (455), and scoped invalid-drop rejection (456). Pure helper functions keep other-group positions unchanged; Workspace rejects cross-Project/List/parent and self drops without persistence.

Final feature commit `be5adab8fee20dbe3e62bbde5620ec34dca24fe3` verified by [GitHub Actions run 40238738296](https://github.com/ysoktar/uduzgak/actions/runs/40238738296): 6/6 targeted tests, zero-warning lint, TypeScript/Vite build. This is not a full Vitest suite or completed drag-and-drop/accessibility audit.

## TDD 457–461 — accessible Task reordering

Base: `ebffb340f5a3377119c32587adcedfbe6d0c145c`. Fork branch: `tdd/457-461-accessible-task-reordering`. Five RED-first behaviors: move-after buttons, move-before buttons, polite status announcement, native drop-after, responsive tap-target styling. The CSS test originally used `new URL('./styles.css', import.meta.url)` from jsdom and failed with `ERR_INVALID_URL_SCHEME`. User explicitly approved changing that single test file-read expression to `readFileSync('src/styles.css','utf8')`, leaving assertions intact. Final GitHub Actions run 40241379603 at commit `a3870730a1b3c384f57b81fbf36f6320d424dcde`: 9/9 targeted tests in 3 files, zero-warning lint, build passed. No full-suite or actual-device accessibility certification.
