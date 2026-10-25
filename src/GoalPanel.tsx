import { useState, type FormEvent } from 'react'

import type { Goal, GoalTargetType } from './domain/goal'
import { summarizeGoalProgress } from './domain/goal-progress'
import type { WorkspaceState } from './domain/workspace'

export interface GoalPanelProps {
  state: WorkspaceState
  onAddGoal(
    name: string,
    input: {
      description?: string
      targetType: GoalTargetType
      targetValue: number
      currentValue: number
    },
  ): void
  onRenameGoal(goalId: string, name: string): void
  onChangeGoalDescription(goalId: string, description: string | null): void
  onChangeGoalTargetType(goalId: string, targetType: GoalTargetType): void
  onChangeGoalValues(goalId: string, targetValue: number, currentValue: number): void
  onLinkGoalTask(goalId: string, taskId: string): void
  onUnlinkGoalTask(goalId: string, taskId: string): void
  onDeleteGoal(goalId: string): void
}

function numberDraft(value: string): number {
  return Number(value)
}

function GoalEditor({
  goal,
  onRename,
  onDescriptionChange,
  onTargetTypeChange,
  onValuesChange,
  state,
  onLinkTask,
  onUnlinkTask,
  onDelete,
}: {
  goal: Goal
  state: WorkspaceState
  onRename(name: string): void
  onDescriptionChange(description: string | null): void
  onTargetTypeChange(targetType: GoalTargetType): void
  onValuesChange(targetValue: number, currentValue: number): void
  onLinkTask(taskId: string): void
  onUnlinkTask(taskId: string): void
  onDelete(): void
}) {
  const [name, setName] = useState(goal.name)
  const [description, setDescription] = useState(goal.description ?? '')
  const [targetValue, setTargetValue] = useState(String(goal.targetValue))
  const [currentValue, setCurrentValue] = useState(String(goal.currentValue))
  const progress = summarizeGoalProgress(goal, state.tasks)

  return (
    <article>
      <h3>{goal.name}</h3>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onRename(name)
        }}
      >
        <label htmlFor={`goal-name-${goal.id}`}>Goal name for {goal.name}</label>
        <input
          id={`goal-name-${goal.id}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Rename {goal.name}</button>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onDescriptionChange(description)
        }}
      >
        <label htmlFor={`goal-description-${goal.id}`}>
          Goal description for {goal.name}
        </label>
        <input
          id={`goal-description-${goal.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button type="submit">Save description for {goal.name}</button>
      </form>

      <label htmlFor={`goal-target-type-${goal.id}`}>Target type for {goal.name}</label>
      <select
        id={`goal-target-type-${goal.id}`}
        value={goal.targetType}
        onChange={(event) =>
          onTargetTypeChange(event.target.value as GoalTargetType)
        }
      >
        <option value="manual">Manual</option>
        <option value="linkedTasks">Linked Tasks</option>
      </select>

      <p>
        Progress: {progress.currentValue} / {progress.targetValue} ({progress.percent}%)
      </p>

      {goal.targetType === 'manual' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onValuesChange(numberDraft(targetValue), numberDraft(currentValue))
          }}
        >
          <label htmlFor={`goal-target-value-${goal.id}`}>
            Target value for {goal.name}
          </label>
          <input
            id={`goal-target-value-${goal.id}`}
            type="number"
            min="0"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
          />
          <label htmlFor={`goal-current-value-${goal.id}`}>
            Current value for {goal.name}
          </label>
          <input
            id={`goal-current-value-${goal.id}`}
            type="number"
            min="0"
            value={currentValue}
            onChange={(event) => setCurrentValue(event.target.value)}
          />
          <button type="submit">Save values for {goal.name}</button>
        </form>
      ) : null}

      {goal.targetType === 'linkedTasks' ? (
        <>
          <p>Linked Tasks: {progress.currentValue} of {progress.targetValue} done</p>
          <fieldset>
            <legend>Linked Tasks for {goal.name}</legend>
            {state.tasks.length === 0 ? <p>No Tasks</p> : null}
            {state.tasks.map((task) => {
              const linked = (goal.linkedTaskIds ?? []).includes(task.id)
              return (
                <label key={task.id}>
                  <input
                    type="checkbox"
                    checked={linked}
                    onChange={(event) =>
                      event.target.checked
                        ? onLinkTask(task.id)
                        : onUnlinkTask(task.id)
                    }
                  />
                  Link {task.title} to {goal.name}
                </label>
              )
            })}
          </fieldset>
        </>
      ) : null}

      <button type="button" onClick={onDelete}>
        Delete {goal.name}
      </button>
    </article>
  )
}

export function GoalPanel({
  state,
  onAddGoal,
  onRenameGoal,
  onChangeGoalDescription,
  onChangeGoalTargetType,
  onChangeGoalValues,
  onLinkGoalTask,
  onUnlinkGoalTask,
  onDeleteGoal,
}: GoalPanelProps) {
  const [name, setName] = useState('')
  const [targetType, setTargetType] = useState<GoalTargetType>('manual')
  const [targetValue, setTargetValue] = useState('1')
  const [currentValue, setCurrentValue] = useState('0')

  function addGoal(event: FormEvent) {
    event.preventDefault()
    onAddGoal(name, {
      targetType,
      targetValue: numberDraft(targetValue),
      currentValue: numberDraft(currentValue),
    })
    setName('')
  }

  return (
    <section id="workspace-goals" aria-label="Goals">
      <h2>Goals</h2>
      <form onSubmit={addGoal}>
        <label htmlFor="new-goal-name">New Goal name</label>
        <input
          id="new-goal-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label htmlFor="new-goal-target-type">New Goal target type</label>
        <select
          id="new-goal-target-type"
          value={targetType}
          onChange={(event) => setTargetType(event.target.value as GoalTargetType)}
        >
          <option value="manual">Manual</option>
          <option value="linkedTasks">Linked Tasks</option>
        </select>
        <label htmlFor="new-goal-target-value">New Goal target value</label>
        <input
          id="new-goal-target-value"
          type="number"
          min="0"
          value={targetValue}
          onChange={(event) => setTargetValue(event.target.value)}
        />
        <label htmlFor="new-goal-current-value">New Goal current value</label>
        <input
          id="new-goal-current-value"
          type="number"
          min="0"
          value={currentValue}
          onChange={(event) => setCurrentValue(event.target.value)}
        />
        <button type="submit">Add Goal</button>
      </form>

      {(state.goals ?? []).map((goal) => (
        <GoalEditor
          key={goal.id}
          goal={goal}
          state={state}
          onRename={(nextName) => onRenameGoal(goal.id, nextName)}
          onDescriptionChange={(description) =>
            onChangeGoalDescription(goal.id, description)
          }
          onTargetTypeChange={(nextTargetType) =>
            onChangeGoalTargetType(goal.id, nextTargetType)
          }
          onValuesChange={(nextTargetValue, nextCurrentValue) =>
            onChangeGoalValues(goal.id, nextTargetValue, nextCurrentValue)
          }
          onLinkTask={(taskId) => onLinkGoalTask(goal.id, taskId)}
          onUnlinkTask={(taskId) => onUnlinkGoalTask(goal.id, taskId)}
          onDelete={() => onDeleteGoal(goal.id)}
        />
      ))}
    </section>
  )
}
