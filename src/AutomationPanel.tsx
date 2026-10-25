import { useState, type FormEvent } from 'react'

import type { WorkspaceCommands } from './application/workspace-commands'
import type {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationTrigger,
} from './domain/automation'
import type { WorkspaceState } from './domain/workspace'

const triggerKinds: AutomationTrigger['kind'][] = [
  'task.created',
  'task.statusChanged',
  'task.priorityChanged',
  'task.dueDateChanged',
  'task.archived',
  'task.restored',
]

const triggerLabels: Record<AutomationTrigger['kind'], string> = {
  'task.created': 'Task created',
  'task.statusChanged': 'Status changed',
  'task.priorityChanged': 'Priority changed',
  'task.dueDateChanged': 'Due date changed',
  'task.archived': 'Task archived',
  'task.restored': 'Task restored',
}

type ConditionKind = AutomationCondition['kind']
type ActionKind = AutomationAction['kind']

const conditionKinds: ConditionKind[] = [
  'project',
  'status',
  'priority',
  'dueDate.present',
  'tag',
]
const actionKinds: ActionKind[] = [
  'status.set',
  'priority.set',
  'project.move',
  'list.move',
  'task.archive',
]

function triggerFromKind(kind: AutomationTrigger['kind']): AutomationTrigger {
  return { kind }
}

function defaultConditionValue(kind: ConditionKind, state: WorkspaceState): string {
  switch (kind) {
    case 'project':
      return state.projects[0]?.id ?? ''
    case 'status':
      return 'todo'
    case 'priority':
      return 'normal'
    case 'dueDate.present':
      return 'true'
    case 'tag':
      return state.tags?.[0]?.id ?? ''
  }
}

function defaultActionValue(kind: ActionKind, state: WorkspaceState): string {
  switch (kind) {
    case 'status.set':
      return 'todo'
    case 'priority.set':
      return 'normal'
    case 'project.move':
      return state.projects[0]?.id ?? ''
    case 'list.move':
      return state.lists?.[0]?.id ?? ''
    case 'task.archive':
      return ''
  }
}

function buildCondition(
  kind: ConditionKind,
  value: string,
): AutomationCondition | null {
  switch (kind) {
    case 'project':
      return value ? { kind, projectId: value } : null
    case 'status':
      return value === 'todo' || value === 'doing' || value === 'done'
        ? { kind, status: value }
        : null
    case 'priority':
      return value === 'low' || value === 'normal' || value === 'high'
        ? { kind, priority: value }
        : null
    case 'dueDate.present':
      return value === 'true' || value === 'false'
        ? { kind, present: value === 'true' }
        : null
    case 'tag':
      return value ? { kind, tagId: value } : null
  }
}

function buildAction(kind: ActionKind, value: string): AutomationAction | null {
  switch (kind) {
    case 'status.set':
      return value === 'todo' || value === 'doing' || value === 'done'
        ? { kind, status: value }
        : null
    case 'priority.set':
      return value === 'low' || value === 'normal' || value === 'high'
        ? { kind, priority: value }
        : null
    case 'project.move':
      return value ? { kind, projectId: value } : null
    case 'list.move':
      return value ? { kind, listId: value } : null
    case 'task.archive':
      return { kind }
  }
}

function projectName(state: WorkspaceState, projectId: string): string {
  return state.projects.find((project) => project.id === projectId)?.name ?? projectId
}

function listName(state: WorkspaceState, listId: string): string {
  return state.lists?.find((list) => list.id === listId)?.name ?? listId
}

function tagName(state: WorkspaceState, tagId: string): string {
  return state.tags?.find((tag) => tag.id === tagId)?.name ?? tagId
}

function conditionLabel(condition: AutomationCondition, state: WorkspaceState): string {
  switch (condition.kind) {
    case 'project':
      return `Project is ${projectName(state, condition.projectId)}`
    case 'status':
      return `Status is ${condition.status === 'todo' ? 'To do' : condition.status === 'doing' ? 'Doing' : 'Done'}`
    case 'priority':
      return `Priority is ${condition.priority[0]?.toUpperCase()}${condition.priority.slice(1)}`
    case 'dueDate.present':
      return condition.present ? 'Due date is present' : 'Due date is absent'
    case 'tag':
      return `Tag includes ${tagName(state, condition.tagId)}`
  }
}

function actionLabel(action: AutomationAction, state: WorkspaceState): string {
  switch (action.kind) {
    case 'status.set':
      return `Set status to ${action.status === 'todo' ? 'To do' : action.status === 'doing' ? 'Doing' : 'Done'}`
    case 'priority.set':
      return `Set priority to ${action.priority[0]?.toUpperCase()}${action.priority.slice(1)}`
    case 'project.move':
      return `Move to Project ${projectName(state, action.projectId)}`
    case 'list.move':
      return `Move to List ${listName(state, action.listId)}`
    case 'task.archive':
      return 'Archive Task'
  }
}

function ConditionValueSelect({
  automationName,
  kind,
  value,
  state,
  onChange,
}: {
  automationName: string
  kind: ConditionKind
  value: string
  state: WorkspaceState
  onChange(value: string): void
}) {
  return (
    <>
      <label htmlFor={`automation-condition-value-${automationName}`}>
        Condition value for {automationName}
      </label>
      <select
        id={`automation-condition-value-${automationName}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {kind === 'project' ? (
          state.projects.length > 0 ? (
            state.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))
          ) : (
            <option value="">No Projects</option>
          )
        ) : null}
        {kind === 'status' ? (
          <>
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </>
        ) : null}
        {kind === 'priority' ? (
          <>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </>
        ) : null}
        {kind === 'dueDate.present' ? (
          <>
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </>
        ) : null}
        {kind === 'tag' ? (
          (state.tags?.length ?? 0) > 0 ? (
            state.tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))
          ) : (
            <option value="">No Tags</option>
          )
        ) : null}
      </select>
    </>
  )
}

function ActionValueSelect({
  automationName,
  kind,
  value,
  state,
  onChange,
}: {
  automationName: string
  kind: ActionKind
  value: string
  state: WorkspaceState
  onChange(value: string): void
}) {
  if (kind === 'task.archive') return null

  return (
    <>
      <label htmlFor={`automation-action-value-${automationName}`}>
        Action value for {automationName}
      </label>
      <select
        id={`automation-action-value-${automationName}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {kind === 'status.set' ? (
          <>
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </>
        ) : null}
        {kind === 'priority.set' ? (
          <>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </>
        ) : null}
        {kind === 'project.move' ? (
          state.projects.length > 0 ? (
            state.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))
          ) : (
            <option value="">No Projects</option>
          )
        ) : null}
        {kind === 'list.move' ? (
          (state.lists?.length ?? 0) > 0 ? (
            state.lists?.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))
          ) : (
            <option value="">No Lists</option>
          )
        ) : null}
      </select>
    </>
  )
}

function AutomationEditor({
  automation,
  state,
  onRename,
  onEnabledChange,
  onTriggerChange,
  onConditionsChange,
  onActionsChange,
  onDelete,
}: {
  automation: Automation
  state: WorkspaceState
  onRename(name: string): void
  onEnabledChange(enabled: boolean): void
  onTriggerChange(trigger: AutomationTrigger): void
  onConditionsChange(conditions: AutomationCondition[]): void
  onActionsChange(actions: AutomationAction[]): void
  onDelete(): void
}) {
  const [nameDraft, setNameDraft] = useState(automation.name)
  const [conditionKind, setConditionKind] = useState<ConditionKind>('status')
  const [conditionValue, setConditionValue] = useState('todo')
  const [actionKind, setActionKind] = useState<ActionKind>('status.set')
  const [actionValue, setActionValue] = useState('todo')

  function submitRename(event: FormEvent) {
    event.preventDefault()
    if (nameDraft.trim()) onRename(nameDraft)
  }

  const pendingCondition = buildCondition(conditionKind, conditionValue)
  const pendingAction = buildAction(actionKind, actionValue)

  return (
    <article>
      <h3>{automation.name}</h3>
      <form onSubmit={submitRename}>
        <label htmlFor={`automation-name-${automation.id}`}>
          Name for {automation.name}
        </label>
        <input
          id={`automation-name-${automation.id}`}
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
        />
        <button type="submit">Save name for {automation.name}</button>
      </form>

      <label>
        <input
          type="checkbox"
          checked={automation.enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        Enabled for {automation.name}
      </label>

      <label htmlFor={`automation-trigger-${automation.id}`}>
        Trigger for {automation.name}
      </label>
      <select
        id={`automation-trigger-${automation.id}`}
        value={automation.trigger.kind}
        onChange={(event) =>
          onTriggerChange(
            triggerFromKind(event.target.value as AutomationTrigger['kind']),
          )
        }
      >
        {triggerKinds.map((kind) => (
          <option key={kind} value={kind}>
            {triggerLabels[kind]}
          </option>
        ))}
      </select>

      <h4>Conditions</h4>
      {automation.conditions.length === 0 ? <p>No conditions</p> : null}
      <ul>
        {automation.conditions.map((condition, index) => (
          <li key={`${automation.id}-condition-${index}`}>
            {conditionLabel(condition, state)}{' '}
            <button
              type="button"
              onClick={() =>
                onConditionsChange(
                  automation.conditions.filter((_, candidate) => candidate !== index),
                )
              }
            >
              Remove condition {index + 1} from {automation.name}
            </button>
          </li>
        ))}
      </ul>
      <label htmlFor={`automation-condition-kind-${automation.id}`}>
        Condition type for {automation.name}
      </label>
      <select
        id={`automation-condition-kind-${automation.id}`}
        value={conditionKind}
        onChange={(event) => {
          const nextKind = event.target.value as ConditionKind
          setConditionKind(nextKind)
          setConditionValue(defaultConditionValue(nextKind, state))
        }}
      >
        {conditionKinds.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>
      <ConditionValueSelect
        automationName={automation.name}
        kind={conditionKind}
        value={conditionValue}
        state={state}
        onChange={setConditionValue}
      />
      <button
        type="button"
        disabled={!pendingCondition}
        onClick={() => {
          if (pendingCondition) {
            onConditionsChange([...automation.conditions, pendingCondition])
          }
        }}
      >
        Add condition to {automation.name}
      </button>

      <h4>Actions</h4>
      {automation.actions.length === 0 ? <p>No actions</p> : null}
      <ul>
        {automation.actions.map((action, index) => (
          <li key={`${automation.id}-action-${index}`}>
            {actionLabel(action, state)}{' '}
            <button
              type="button"
              onClick={() =>
                onActionsChange(
                  automation.actions.filter((_, candidate) => candidate !== index),
                )
              }
            >
              Remove action {index + 1} from {automation.name}
            </button>
          </li>
        ))}
      </ul>
      <label htmlFor={`automation-action-kind-${automation.id}`}>
        Action type for {automation.name}
      </label>
      <select
        id={`automation-action-kind-${automation.id}`}
        value={actionKind}
        onChange={(event) => {
          const nextKind = event.target.value as ActionKind
          setActionKind(nextKind)
          setActionValue(defaultActionValue(nextKind, state))
        }}
      >
        {actionKinds.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>
      <ActionValueSelect
        automationName={automation.name}
        kind={actionKind}
        value={actionValue}
        state={state}
        onChange={setActionValue}
      />
      <button
        type="button"
        disabled={!pendingAction}
        onClick={() => {
          if (pendingAction) onActionsChange([...automation.actions, pendingAction])
        }}
      >
        Add action to {automation.name}
      </button>

      <button type="button" onClick={onDelete}>
        Delete automation {automation.name}
      </button>
    </article>
  )
}

export interface AutomationPanelProps {
  state: WorkspaceState
  onAddAutomation: WorkspaceCommands['addAutomation']
  onRenameAutomation: WorkspaceCommands['renameAutomation']
  onSetAutomationEnabled: WorkspaceCommands['setAutomationEnabled']
  onChangeAutomationTrigger: WorkspaceCommands['changeAutomationTrigger']
  onChangeAutomationConditions: WorkspaceCommands['changeAutomationConditions']
  onChangeAutomationActions: WorkspaceCommands['changeAutomationActions']
  onDeleteAutomation: WorkspaceCommands['deleteAutomation']
}

export function AutomationPanel({
  state,
  onAddAutomation,
  onRenameAutomation,
  onSetAutomationEnabled,
  onChangeAutomationTrigger,
  onChangeAutomationConditions,
  onChangeAutomationActions,
  onDeleteAutomation,
}: AutomationPanelProps) {
  const [name, setName] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [triggerKind, setTriggerKind] =
    useState<AutomationTrigger['kind']>('task.created')

  function submitNewAutomation(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    onAddAutomation(name, {
      enabled,
      trigger: triggerFromKind(triggerKind),
      conditions: [],
      actions: [],
    })
    setName('')
  }

  return (
    <section id="workspace-automations" aria-labelledby="automation-heading">
      <h2 id="automation-heading">Automations</h2>
      <form onSubmit={submitNewAutomation}>
        <label htmlFor="new-automation-name">New automation name</label>
        <input
          id="new-automation-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label htmlFor="new-automation-trigger">New automation trigger</label>
        <select
          id="new-automation-trigger"
          value={triggerKind}
          onChange={(event) =>
            setTriggerKind(event.target.value as AutomationTrigger['kind'])
          }
        >
          {triggerKinds.map((kind) => (
            <option key={kind} value={kind}>
              {triggerLabels[kind]}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          New automation enabled
        </label>
        <button type="submit" disabled={!name.trim()}>
          Add automation
        </button>
      </form>

      {(state.automations?.length ?? 0) === 0 ? <p>No automations yet.</p> : null}
      {state.automations?.map((automation) => (
        <AutomationEditor
          key={automation.id}
          automation={automation}
          state={state}
          onRename={(nextName) => onRenameAutomation(automation.id, nextName)}
          onEnabledChange={(nextEnabled) =>
            onSetAutomationEnabled(automation.id, nextEnabled)
          }
          onTriggerChange={(trigger) =>
            onChangeAutomationTrigger(automation.id, trigger)
          }
          onConditionsChange={(conditions) =>
            onChangeAutomationConditions(automation.id, conditions)
          }
          onActionsChange={(actions) =>
            onChangeAutomationActions(automation.id, actions)
          }
          onDelete={() => onDeleteAutomation(automation.id)}
        />
      ))}
    </section>
  )
}
