import { useState, useSyncExternalStore } from 'react'

import { App } from './App'
import { AutomationPanel } from './AutomationPanel'
import { DashboardPanel } from './DashboardPanel'
import { GoalPanel } from './GoalPanel'
import { KnowledgePanel } from './KnowledgePanel'
import type { WorkspaceCommands } from './application/workspace-commands'
import type { WorkspaceStore } from './application/workspace-store'
import { deriveDashboardViewModel } from './domain/dashboard'
import { deriveWorkspaceReportingSnapshot } from './domain/reporting'
import type { ViewPreferences } from './domain/view-preferences'

function commandErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Workspace command failed'
}

function localReportDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface WorkspaceRootProps {
  store: WorkspaceStore
  commands: WorkspaceCommands
  initialViewPreferences?: ViewPreferences
  onViewPreferencesChange?: (preferences: ViewPreferences) => void
  dashboardReportDate?: string
}

export function WorkspaceRoot({
  store,
  commands,
  initialViewPreferences,
  onViewPreferencesChange,
  dashboardReportDate,
}: WorkspaceRootProps) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const [commandError, setCommandError] = useState<string | null>(null)
  const dashboard = deriveDashboardViewModel(
    deriveWorkspaceReportingSnapshot(
      state,
      dashboardReportDate ?? localReportDate(),
    ),
  )

  function runCommand<T>(command: () => T): T | undefined {
    try {
      const result = command()
      setCommandError(null)
      return result
    } catch (error) {
      setCommandError(commandErrorMessage(error))
      return undefined
    }
  }

  const guardedCommands = new Proxy(commands, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== 'function') return value

      return (...args: unknown[]) =>
        runCommand(() => (value as (...callArgs: unknown[]) => unknown)(...args))
    },
  }) as WorkspaceCommands

  return (
    <>
      {commandError ? <p role="alert">{commandError}</p> : null}
      <DashboardPanel dashboard={dashboard} />
      <KnowledgePanel
        state={state}
        onAddKnowledgeDocument={(title, input) =>
          guardedCommands.addKnowledgeDocument(title, input)
        }
        onRenameKnowledgeDocument={(documentId, title) =>
          guardedCommands.renameKnowledgeDocument(documentId, title)
        }
        onChangeKnowledgeDocumentContent={(documentId, content) =>
          guardedCommands.changeKnowledgeDocumentContent(documentId, content)
        }
        onChangeKnowledgeDocumentKind={(documentId, kind) =>
          guardedCommands.changeKnowledgeDocumentKind(documentId, kind)
        }
        onChangeKnowledgeDocumentProject={(documentId, projectId) =>
          guardedCommands.changeKnowledgeDocumentProject(documentId, projectId)
        }
        onChangeKnowledgeDocumentSourceOfTruth={(documentId, sourceOfTruth) =>
          guardedCommands.changeKnowledgeDocumentSourceOfTruth(documentId, sourceOfTruth)
        }
        onDeleteKnowledgeDocument={(documentId) =>
          guardedCommands.deleteKnowledgeDocument(documentId)
        }
      />
      <GoalPanel
        state={state}
        onAddGoal={(name, input) => guardedCommands.addGoal(name, input)}
        onRenameGoal={(goalId, name) => guardedCommands.renameGoal(goalId, name)}
        onChangeGoalDescription={(goalId, description) =>
          guardedCommands.changeGoalDescription(goalId, description)
        }
        onChangeGoalTargetType={(goalId, targetType) =>
          guardedCommands.changeGoalTargetType(goalId, targetType)
        }
        onChangeGoalValues={(goalId, targetValue, currentValue) =>
          guardedCommands.changeGoalValues(goalId, targetValue, currentValue)
        }
        onLinkGoalTask={(goalId, taskId) => guardedCommands.linkGoalTask(goalId, taskId)}
        onUnlinkGoalTask={(goalId, taskId) =>
          guardedCommands.unlinkGoalTask(goalId, taskId)
        }
        onDeleteGoal={(goalId) => guardedCommands.deleteGoal(goalId)}
      />
      <AutomationPanel
        state={state}
        onAddAutomation={(name, input) => guardedCommands.addAutomation(name, input)}
        onRenameAutomation={(automationId, name) =>
          guardedCommands.renameAutomation(automationId, name)
        }
        onSetAutomationEnabled={(automationId, enabled) =>
          guardedCommands.setAutomationEnabled(automationId, enabled)
        }
        onChangeAutomationTrigger={(automationId, trigger) =>
          guardedCommands.changeAutomationTrigger(automationId, trigger)
        }
        onChangeAutomationConditions={(automationId, conditions) =>
          guardedCommands.changeAutomationConditions(automationId, conditions)
        }
        onChangeAutomationActions={(automationId, actions) =>
          guardedCommands.changeAutomationActions(automationId, actions)
        }
        onDeleteAutomation={(automationId) => guardedCommands.deleteAutomation(automationId)}
      />
      <App
      state={state}
      initialViewPreferences={initialViewPreferences}
      onViewPreferencesChange={onViewPreferencesChange}
      onCreateTaskRelationship={(type, sourceTaskId, targetTaskId) => {
        guardedCommands.addTaskRelationship(type, sourceTaskId, targetTaskId)
      }}
      onDeleteTaskRelationship={(relationshipId) => {
        guardedCommands.deleteTaskRelationship(relationshipId)
      }}
      onCreateCustomField={(name, type) => {
        guardedCommands.addCustomField(name, type)
      }}
      onRenameCustomField={(fieldId, name) => {
        guardedCommands.renameCustomField(fieldId, name)
      }}
      onChangeCustomFieldType={(fieldId, nextType) => {
        guardedCommands.changeCustomFieldType(fieldId, nextType)
      }}
      onDeleteCustomField={(fieldId) => {
        guardedCommands.deleteCustomField(fieldId)
      }}
      onConfigureCustomFieldFormula={(fieldId, formula) => {
        guardedCommands.configureCustomFieldFormula(fieldId, formula)
      }}
      onAddCustomFieldOption={(fieldId, name) => {
        guardedCommands.addCustomFieldOption(fieldId, name)
      }}
      onRenameCustomFieldOption={(fieldId, optionId, name) => {
        guardedCommands.renameCustomFieldOption(fieldId, optionId, name)
      }}
      onDeleteCustomFieldOption={(fieldId, optionId) => {
        guardedCommands.deleteCustomFieldOption(fieldId, optionId)
      }}
      onChangeTaskCustomFieldValue={(taskId, fieldId, value) => {
        guardedCommands.changeTaskCustomFieldValue(taskId, fieldId, value)
      }}
      onChangeTasksCustomFieldValue={(taskIds, fieldId, value) => {
        guardedCommands.changeTasksCustomFieldValue(taskIds, fieldId, value)
      }}
      onCreatePerson={(name) => {
        guardedCommands.addPerson(name)
      }}
      onRenamePerson={(personId, name) => {
        guardedCommands.renamePerson(personId, name)
      }}
      onDeletePerson={(personId) => {
        guardedCommands.deletePerson(personId)
      }}
      onChangeTaskAssignee={(taskId, personId, assigned) => {
        if (assigned) {
          guardedCommands.assignTaskAssignee(taskId, personId)
        } else {
          guardedCommands.removeTaskAssignee(taskId, personId)
        }
      }}
      onChangeTasksAssignee={(taskIds, personId, assigned) => {
        guardedCommands.changeTasksAssignee(taskIds, personId, assigned)
      }}
      onCreateTag={(name) => {
        guardedCommands.addTag(name)
      }}
      onRenameTag={(tagId, name) => {
        guardedCommands.renameTag(tagId, name)
      }}
      onDeleteTag={(tagId) => {
        guardedCommands.deleteTag(tagId)
      }}
      onChangeTaskTag={(taskId, tagId, assigned) => {
        if (assigned) {
          guardedCommands.assignTaskTag(taskId, tagId)
        } else {
          guardedCommands.removeTaskTag(taskId, tagId)
        }
      }}
      onChangeTasksTag={(taskIds, tagId, assigned) => {
        guardedCommands.changeTasksTag(taskIds, tagId, assigned)
      }}
      onCreateArea={(name) => {
        guardedCommands.addArea(name)
      }}
      onRenameArea={(areaId, name) => {
        guardedCommands.renameArea(areaId, name)
      }}
      onDeleteArea={(areaId) => {
        guardedCommands.deleteArea(areaId)
      }}
      onMoveArea={(areaId, direction) => {
        guardedCommands.moveArea(areaId, direction)
      }}
      onChangeProjectArea={(projectId, areaId) => {
        guardedCommands.changeProjectArea(projectId, areaId)
      }}
      onCreateTaskList={(projectId, name) => {
        guardedCommands.addTaskList(projectId, name)
      }}
      onRenameTaskList={(listId, name) => {
        guardedCommands.renameTaskList(listId, name)
      }}
      onDeleteTaskList={(listId) => {
        guardedCommands.deleteTaskList(listId)
      }}
      onMoveTaskList={(listId, direction) => {
        guardedCommands.moveTaskList(listId, direction)
      }}
      onChangeTaskList={(taskId, listId) => {
        guardedCommands.changeTaskList(taskId, listId)
      }}
      onChangeTasksList={(taskIds, listId) => {
        guardedCommands.changeTasksList(taskIds, listId)
      }}
      onAddChecklistItem={(taskId, text) => {
        guardedCommands.addChecklistItem(taskId, text)
      }}
      onRenameChecklistItem={(taskId, itemId, text) => {
        guardedCommands.renameChecklistItem(taskId, itemId, text)
      }}
      onChangeChecklistItemCompleted={(taskId, itemId, completed) => {
        guardedCommands.changeChecklistItemCompleted(taskId, itemId, completed)
      }}
      onDeleteChecklistItem={(taskId, itemId) => {
        guardedCommands.deleteChecklistItem(taskId, itemId)
      }}
      onMoveChecklistItem={(taskId, itemId, direction) => {
        guardedCommands.moveChecklistItem(taskId, itemId, direction)
      }}
      onMoveProject={(projectId, direction) => {
        guardedCommands.moveProject(projectId, direction)
      }}
      onCreateProject={(name) => {
        guardedCommands.addProject(name)
      }}
      onSaveProjectTemplate={(projectId, name) => {
        guardedCommands.saveProjectTemplate(projectId, name)
      }}
      onCreateProjectFromTemplate={(templateId) => {
        guardedCommands.createProjectFromTemplate(templateId)
      }}
      onDeleteProjectTemplate={(templateId) => {
        guardedCommands.deleteProjectTemplate(templateId)
      }}
      onSaveTaskTemplate={(taskId, name) => {
        guardedCommands.saveTaskTemplate(taskId, name)
      }}
      onCreateTaskFromTemplate={(templateId, projectId, listId) => {
        guardedCommands.createTaskFromTemplate(templateId, projectId, listId)
      }}
      onDeleteTaskTemplate={(templateId) => {
        guardedCommands.deleteTaskTemplate(templateId)
      }}
      onArchiveProject={(projectId) => {
        guardedCommands.archiveProject(projectId)
      }}
      onRestoreProject={(projectId) => {
        guardedCommands.restoreProject(projectId)
      }}
      onRenameProject={(projectId, name) => {
        guardedCommands.renameProject(projectId, name)
      }}
      onChangeProjectDescription={(projectId, description) => {
        guardedCommands.changeProjectDescription(projectId, description)
      }}
      onCreateTask={(projectId, title, listId) => {
        guardedCommands.addTask(projectId, title, listId)
      }}
      onCreateSubtask={(parentTaskId, title) => {
        guardedCommands.addSubtask(parentTaskId, title)
      }}
      onDuplicateTask={(taskId) => {
        guardedCommands.duplicateTask(taskId)
      }}
      onArchiveTask={(taskId) => {
        guardedCommands.archiveTask(taskId)
      }}
      onArchiveTasks={(taskIds) => {
        guardedCommands.archiveTasks(taskIds)
      }}
      onRestoreTask={(taskId) => {
        guardedCommands.restoreTask(taskId)
      }}
      onRestoreTasks={(taskIds) => {
        guardedCommands.restoreTasks(taskIds)
      }}
      onDeleteProject={(projectId) => {
        guardedCommands.deleteProject(projectId)
      }}
      onRenameTask={(taskId, title) => {
        guardedCommands.renameTask(taskId, title)
      }}
      onDeleteTask={(taskId) => {
        guardedCommands.deleteTask(taskId)
      }}
      onDeleteTasks={(taskIds) => {
        guardedCommands.deleteTasks(taskIds)
      }}
      onMoveTask={(taskId, direction) => {
        guardedCommands.moveTask(taskId, direction)
      }}
      onMoveTaskBefore={(taskId, targetTaskId) => {
        guardedCommands.moveTaskBefore(taskId, targetTaskId)
      }}
      onMoveTaskAfter={(taskId, targetTaskId) => {
        guardedCommands.moveTaskAfter(taskId, targetTaskId)
      }}
      onChangeTaskStatus={(taskId, status) => {
        guardedCommands.changeTaskStatus(taskId, status)
      }}
      onChangeTaskRecurrence={(taskId, recurrence) => {
        guardedCommands.changeTaskRecurrence(taskId, recurrence)
      }}
      onChangeTaskTimeEstimate={(taskId, estimateMinutes) => {
        guardedCommands.changeTaskTimeEstimate(taskId, estimateMinutes)
      }}
      onAddTaskTrackedMinutes={(taskId, minutes) => {
        guardedCommands.addTaskTrackedMinutes(taskId, minutes)
      }}
      onStartTaskTimer={(taskId) => {
        guardedCommands.startTaskTimer(taskId)
      }}
      onStopTaskTimer={(taskId) => {
        guardedCommands.stopTaskTimer(taskId)
      }}
      onDeleteTaskTimeEntry={(taskId, entryId) => {
        guardedCommands.deleteTaskTimeEntry(taskId, entryId)
      }}
      onAddTaskAttachment={(taskId, input) => {
        guardedCommands.addTaskAttachment(taskId, input)
      }}
      onDeleteTaskAttachment={(taskId, attachmentId) => {
        guardedCommands.deleteTaskAttachment(taskId, attachmentId)
      }}
      onChangeTasksStatus={(taskIds, status) => {
        guardedCommands.changeTasksStatus(taskIds, status)
      }}
      onChangeTaskPriority={(taskId, priority) => {
        guardedCommands.changeTaskPriority(taskId, priority)
      }}
      onChangeTasksPriority={(taskIds, priority) => {
        guardedCommands.changeTasksPriority(taskIds, priority)
      }}
      onChangeTaskStartDate={(taskId, startDate) => {
        guardedCommands.changeTaskStartDate(taskId, startDate)
      }}
      onChangeTasksStartDate={(taskIds, startDate) => {
        guardedCommands.changeTasksStartDate(taskIds, startDate)
      }}
      onChangeTaskDueDate={(taskId, dueDate) => {
        guardedCommands.changeTaskDueDate(taskId, dueDate)
      }}
      onChangeTasksDueDate={(taskIds, dueDate) => {
        guardedCommands.changeTasksDueDate(taskIds, dueDate)
      }}
      onChangeTaskMilestone={(taskId, isMilestone) => {
        guardedCommands.changeTaskMilestone(taskId, isMilestone)
      }}
      onCaptureTaskGanttBaseline={(taskId) => {
        guardedCommands.captureTaskGanttBaseline(taskId)
      }}
      onChangeTaskGanttSchedule={(taskId, startDate, dueDate) => {
        guardedCommands.changeTaskGanttSchedule(taskId, startDate, dueDate)
      }}
      onChangeTaskDescription={(taskId, description) => {
        guardedCommands.changeTaskDescription(taskId, description)
      }}
      onChangeTaskProject={(taskId, projectId) => {
        guardedCommands.changeTaskProject(taskId, projectId)
      }}
      onChangeTasksProject={(taskIds, projectId) => {
        guardedCommands.changeTasksProject(taskIds, projectId)
      }}
      />
    </>
  )
}
