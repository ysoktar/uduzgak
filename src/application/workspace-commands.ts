import {
  createAutomation,
  type AutomationAction,
  type AutomationCondition,
  type AutomationTrigger,
} from '../domain/automation'
import { createChecklistItem } from '../domain/checklist'
import { createTaskGanttScheduleChange } from '../domain/task-gantt'
import { createGoal, type GoalTargetType } from '../domain/goal'
import {
  createKnowledgeDocument,
  type KnowledgeDocumentKind,
} from '../domain/knowledge-document'
import {
  createCustomField,
  type CustomFieldFormula,
  type CustomFieldOption,
  type CustomFieldType,
  type CustomFieldValue,
} from '../domain/custom-field'
import { createArea } from '../domain/area'
import {
  createProject,
  createProjectTemplate,
  instantiateProjectTemplate,
} from '../domain/project'
import { createPerson } from '../domain/person'
import { createTaskList } from '../domain/task-list'
import {
  createTaskRelationship,
  type TaskRelationshipType,
} from '../domain/task-relationship'
import { createTag } from '../domain/tag'
import {
  createNextRecurringTaskOccurrence,
  createSubtask,
  createTask,
  duplicateTask as duplicateTaskDomain,
  createTaskTemplate,
  instantiateTaskTemplate,
  type TaskPriority,
  type TaskRecurrenceRule,
  type TaskStatus,
} from '../domain/task'
import type { MoveDirection } from '../domain/manual-order'
import type { ActivityTrackableWorkspaceAction } from '../domain/workspace'
import { executeAutomationTransaction } from './automation-execution'
import type { WorkspaceStore } from './workspace-store'

export interface WorkspaceRuntime {
  nextId(): string
  now(): string
  maxAutomationActionApplications?: number
}

export interface WorkspaceCommands {
  addKnowledgeDocument(
    title: string,
    input: {
      kind: KnowledgeDocumentKind
      content: string
      projectId?: string
      sourceOfTruth?: boolean
    },
  ): ReturnType<typeof createKnowledgeDocument>
  renameKnowledgeDocument(documentId: string, title: string): void
  changeKnowledgeDocumentContent(documentId: string, content: string): void
  changeKnowledgeDocumentKind(documentId: string, kind: KnowledgeDocumentKind): void
  changeKnowledgeDocumentSourceOfTruth(
    documentId: string,
    sourceOfTruth: boolean,
  ): void
  changeKnowledgeDocumentProject(
    documentId: string,
    projectId: string | null,
  ): void
  deleteKnowledgeDocument(documentId: string): void
  addGoal(
    name: string,
    input: {
      description?: string
      targetType: GoalTargetType
      targetValue: number
      currentValue: number
    },
  ): ReturnType<typeof createGoal>
  renameGoal(goalId: string, name: string): void
  changeGoalDescription(goalId: string, description: string | null): void
  changeGoalTargetType(goalId: string, targetType: GoalTargetType): void
  changeGoalValues(goalId: string, targetValue: number, currentValue: number): void
  linkGoalTask(goalId: string, taskId: string): void
  unlinkGoalTask(goalId: string, taskId: string): void
  deleteGoal(goalId: string): void
  addAutomation(
    name: string,
    input: {
      enabled: boolean
      trigger: AutomationTrigger
      conditions?: AutomationCondition[]
      actions?: AutomationAction[]
    },
  ): ReturnType<typeof createAutomation>
  renameAutomation(automationId: string, name: string): void
  setAutomationEnabled(automationId: string, enabled: boolean): void
  changeAutomationTrigger(automationId: string, trigger: AutomationTrigger): void
  changeAutomationConditions(
    automationId: string,
    conditions: AutomationCondition[],
  ): void
  changeAutomationActions(
    automationId: string,
    actions: AutomationAction[],
  ): void
  deleteAutomation(automationId: string): void
  addTaskRelationship(type: TaskRelationshipType, sourceTaskId: string, targetTaskId: string): ReturnType<typeof createTaskRelationship>
  deleteTaskRelationship(relationshipId: string): void
  addCustomField(name: string, type: CustomFieldType): ReturnType<typeof createCustomField>
  renameCustomField(fieldId: string, name: string): void
  changeCustomFieldType(fieldId: string, nextType: CustomFieldType): void
  deleteCustomField(fieldId: string): void
  configureCustomFieldFormula(fieldId: string, formula: CustomFieldFormula | null): void
  addCustomFieldOption(fieldId: string, name: string): CustomFieldOption
  renameCustomFieldOption(fieldId: string, optionId: string, name: string): void
  deleteCustomFieldOption(fieldId: string, optionId: string): void
  changeTaskCustomFieldValue(taskId: string, fieldId: string, value: CustomFieldValue | null): void
  changeTasksCustomFieldValue(taskIds: string[], fieldId: string, value: CustomFieldValue | null): void
  addPerson(name: string): ReturnType<typeof createPerson>
  renamePerson(personId: string, name: string): void
  deletePerson(personId: string): void
  assignTaskAssignee(taskId: string, personId: string): void
  removeTaskAssignee(taskId: string, personId: string): void
  changeTasksAssignee(taskIds: string[], personId: string, assigned: boolean): void
  addTag(name: string): ReturnType<typeof createTag>
  renameTag(tagId: string, name: string): void
  deleteTag(tagId: string): void
  assignTaskTag(taskId: string, tagId: string): void
  removeTaskTag(taskId: string, tagId: string): void
  changeTasksTag(taskIds: string[], tagId: string, assigned: boolean): void
  addArea(name: string): ReturnType<typeof createArea>
  renameArea(areaId: string, name: string): void
  deleteArea(areaId: string): void
  moveArea(areaId: string, direction: MoveDirection): void
  changeProjectArea(projectId: string, areaId: string | null): void
  addTaskList(projectId: string, name: string): ReturnType<typeof createTaskList>
  renameTaskList(listId: string, name: string): void
  deleteTaskList(listId: string): void
  moveTaskList(listId: string, direction: MoveDirection): void
  moveTaskListBefore(listId: string, targetListId: string): void
  moveTaskListAfter(listId: string, targetListId: string): void
  changeTaskList(taskId: string, listId: string | null): void
  changeTasksList(taskIds: string[], listId: string | null): void
  addChecklistItem(taskId: string, text: string): ReturnType<typeof createChecklistItem>
  renameChecklistItem(taskId: string, itemId: string, text: string): void
  changeChecklistItemCompleted(taskId: string, itemId: string, completed: boolean): void
  deleteChecklistItem(taskId: string, itemId: string): void
  moveChecklistItem(taskId: string, itemId: string, direction: MoveDirection): void
  moveProject(projectId: string, direction: MoveDirection): void
  moveProjectBefore(projectId: string, targetProjectId: string): void
  moveProjectAfter(projectId: string, targetProjectId: string): void
  addProject(name: string): ReturnType<typeof createProject>
  saveProjectTemplate(projectId: string, name: string): ReturnType<typeof createProjectTemplate>
  createProjectFromTemplate(templateId: string): ReturnType<typeof createProject>
  deleteProjectTemplate(templateId: string): void
  saveTaskTemplate(taskId: string, name: string): ReturnType<typeof createTaskTemplate>
  createTaskFromTemplate(templateId: string, projectId: string, listId?: string): ReturnType<typeof createTask>
  deleteTaskTemplate(templateId: string): void
  addTask(projectId: string, title: string, listId?: string): ReturnType<typeof createTask>
  addSubtask(parentTaskId: string, title: string): ReturnType<typeof createSubtask>
  duplicateTask(taskId: string): ReturnType<typeof duplicateTaskDomain>
  archiveTask(taskId: string): void
  archiveTasks(taskIds: string[]): void
  restoreTask(taskId: string): void
  restoreTasks(taskIds: string[]): void
  archiveProject(projectId: string): void
  restoreProject(projectId: string): void
  renameProject(projectId: string, name: string): void
  changeProjectDescription(projectId: string, description: string | null): void
  renameTask(taskId: string, title: string): void
  changeTaskStatus(taskId: string, status: TaskStatus): void
  changeTaskRecurrence(taskId: string, recurrence: TaskRecurrenceRule | null): void
  changeTaskTimeEstimate(taskId: string, estimateMinutes: number | null): void
  addTaskTrackedMinutes(taskId: string, minutes: number): void
  startTaskTimer(taskId: string): void
  stopTaskTimer(taskId: string): void
  deleteTaskTimeEntry(taskId: string, entryId: string): void
  addTaskAttachment(
    taskId: string,
    input: { name: string; sizeBytes: number; mediaType?: string },
  ): void
  deleteTaskAttachment(taskId: string, attachmentId: string): void
  changeTasksStatus(taskIds: string[], status: TaskStatus): void
  changeTaskPriority(taskId: string, priority: TaskPriority): void
  changeTasksPriority(taskIds: string[], priority: TaskPriority): void
  changeTaskStartDate(taskId: string, startDate: string | null): void
  changeTasksStartDate(taskIds: string[], startDate: string | null): void
  changeTaskDueDate(taskId: string, dueDate: string | null): void
  changeTasksDueDate(taskIds: string[], dueDate: string | null): void
  captureTaskGanttBaseline(taskId: string): void
  changeTaskMilestone(taskId: string, isMilestone: boolean): void
  changeTaskGanttSchedule(taskId: string, startDate: string, dueDate: string): void
  changeTaskDescription(taskId: string, description: string | null): void
  changeTaskProject(taskId: string, projectId: string): void
  changeTasksProject(taskIds: string[], projectId: string): void
  moveTask(taskId: string, direction: MoveDirection): void
  moveTaskBefore(taskId: string, targetTaskId: string): void
  moveTaskAfter(taskId: string, targetTaskId: string): void
  deleteTask(taskId: string): void
  deleteTasks(taskIds: string[]): void
  deleteProject(projectId: string): void
}

export function createWorkspaceCommands(
  store: WorkspaceStore,
  runtime: WorkspaceRuntime,
): WorkspaceCommands {
  function dispatchTracked(
    action: ActivityTrackableWorkspaceAction,
    occurredAt: string,
  ) {
    const result = executeAutomationTransaction(store.getState(), {
      action,
      occurredAt,
      maxActionApplications: runtime.maxAutomationActionApplications ?? 100,
    })

    store.dispatch({
      type: 'workspace/automationTransactionCommitted',
      workspace: result.workspace,
    })
  }

  return {
    addKnowledgeDocument(title, input) {
      const document = createKnowledgeDocument({
        id: runtime.nextId(),
        title,
        kind: input.kind,
        content: input.content,
        projectId: input.projectId,
        sourceOfTruth: input.sourceOfTruth,
      })

      store.dispatch({ type: 'knowledgeDocument/added', document })
      return document
    },

    renameKnowledgeDocument(documentId, title) {
      store.dispatch({
        type: 'knowledgeDocument/titleChanged',
        documentId,
        title,
      })
    },

    changeKnowledgeDocumentContent(documentId, content) {
      store.dispatch({
        type: 'knowledgeDocument/contentChanged',
        documentId,
        content,
      })
    },

    changeKnowledgeDocumentKind(documentId, kind) {
      store.dispatch({
        type: 'knowledgeDocument/kindChanged',
        documentId,
        kind,
      })
    },

    changeKnowledgeDocumentSourceOfTruth(documentId, sourceOfTruth) {
      store.dispatch({
        type: 'knowledgeDocument/sourceOfTruthChanged',
        documentId,
        sourceOfTruth,
      })
    },

    changeKnowledgeDocumentProject(documentId, projectId) {
      store.dispatch({
        type: 'knowledgeDocument/projectChanged',
        documentId,
        projectId,
      })
    },

    deleteKnowledgeDocument(documentId) {
      store.dispatch({ type: 'knowledgeDocument/deleted', documentId })
    },

    addGoal(name, input) {
      const goal = createGoal({
        id: runtime.nextId(),
        name,
        description: input.description,
        targetType: input.targetType,
        targetValue: input.targetValue,
        currentValue: input.currentValue,
      })

      store.dispatch({ type: 'goal/added', goal })
      return goal
    },

    renameGoal(goalId, name) {
      store.dispatch({ type: 'goal/nameChanged', goalId, name })
    },

    changeGoalDescription(goalId, description) {
      store.dispatch({ type: 'goal/descriptionChanged', goalId, description })
    },

    changeGoalTargetType(goalId, targetType) {
      store.dispatch({ type: 'goal/targetTypeChanged', goalId, targetType })
    },

    changeGoalValues(goalId, targetValue, currentValue) {
      store.dispatch({
        type: 'goal/valuesChanged',
        goalId,
        targetValue,
        currentValue,
      })
    },

    linkGoalTask(goalId, taskId) {
      store.dispatch({ type: 'goal/taskLinked', goalId, taskId })
    },

    unlinkGoalTask(goalId, taskId) {
      store.dispatch({ type: 'goal/taskUnlinked', goalId, taskId })
    },

    deleteGoal(goalId) {
      store.dispatch({ type: 'goal/deleted', goalId })
    },

    addAutomation(name, input) {
      const automation = createAutomation({
        id: runtime.nextId(),
        name,
        enabled: input.enabled,
        trigger: input.trigger,
        conditions: input.conditions,
        actions: input.actions,
      })

      store.dispatch({
        type: 'automation/added',
        automation,
      })

      return automation
    },

    renameAutomation(automationId, name) {
      store.dispatch({
        type: 'automation/nameChanged',
        automationId,
        name,
      })
    },

    setAutomationEnabled(automationId, enabled) {
      store.dispatch({
        type: 'automation/enabledChanged',
        automationId,
        enabled,
      })
    },

    changeAutomationTrigger(automationId, trigger) {
      store.dispatch({
        type: 'automation/triggerChanged',
        automationId,
        trigger,
      })
    },

    changeAutomationConditions(automationId, conditions) {
      store.dispatch({
        type: 'automation/conditionsChanged',
        automationId,
        conditions,
      })
    },

    changeAutomationActions(automationId, actions) {
      store.dispatch({
        type: 'automation/actionsChanged',
        automationId,
        actions,
      })
    },

    deleteAutomation(automationId) {
      store.dispatch({
        type: 'automation/deleted',
        automationId,
      })
    },

    addTaskRelationship(type, sourceTaskId, targetTaskId) {
      const relationship = createTaskRelationship({
        id: runtime.nextId(),
        type,
        sourceTaskId,
        targetTaskId,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'relationship/added',
        relationship,
      })

      return relationship
    },

    deleteTaskRelationship(relationshipId) {
      store.dispatch({
        type: 'relationship/deleted',
        relationshipId,
      })
    },

    addCustomField(name, type) {
      const field = createCustomField({
        id: runtime.nextId(),
        name,
        type,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'customField/added',
        field,
      })

      return field
    },

    renameCustomField(fieldId, name) {
      store.dispatch({
        type: 'customField/nameChanged',
        fieldId,
        name,
      })
    },

    changeCustomFieldType(fieldId, nextType) {
      const field = store.getState().customFields?.find(
        (candidate) => candidate.id === fieldId,
      )

      if (!field) {
        throw new Error('Cannot change type of a missing custom field')
      }

      if (field.type === nextType) {
        return
      }

      store.dispatch({
        type: 'customField/typeChanged',
        fieldId,
        nextType,
      })
    },

    deleteCustomField(fieldId) {
      store.dispatch({
        type: 'customField/deleted',
        fieldId,
      })
    },

    configureCustomFieldFormula(fieldId, formula) {
      store.dispatch({
        type: 'customField/formulaChanged',
        fieldId,
        formula,
      })
    },

    addCustomFieldOption(fieldId, name) {
      const option: CustomFieldOption = {
        id: runtime.nextId().trim(),
        name: name.trim(),
      }

      if (!option.id) {
        throw new Error('Custom field option id is required')
      }

      if (!option.name) {
        throw new Error('Custom field option name is required')
      }

      store.dispatch({
        type: 'customField/optionAdded',
        fieldId,
        option,
      })

      return option
    },

    renameCustomFieldOption(fieldId, optionId, name) {
      store.dispatch({
        type: 'customField/optionNameChanged',
        fieldId,
        optionId,
        name,
      })
    },

    deleteCustomFieldOption(fieldId, optionId) {
      store.dispatch({
        type: 'customField/optionDeleted',
        fieldId,
        optionId,
      })
    },

    changeTaskCustomFieldValue(taskId, fieldId, value) {
      store.dispatch({
        type: 'task/customFieldValueChanged',
        taskId,
        fieldId,
        value,
      })
    },

    changeTasksCustomFieldValue(taskIds, fieldId, value) {
      store.dispatch({
        type: 'task/customFieldValueChangedBulk',
        taskIds: [...taskIds],
        fieldId,
        value,
      })
    },

    addPerson(name) {
      const person = createPerson({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'person/added',
        person,
      })

      return person
    },

    renamePerson(personId, name) {
      store.dispatch({
        type: 'person/nameChanged',
        personId,
        name,
      })
    },

    deletePerson(personId) {
      store.dispatch({
        type: 'person/deleted',
        personId,
      })
    },

    assignTaskAssignee(taskId, personId) {
      store.dispatch({
        type: 'task/assigneeAdded',
        taskId,
        personId,
      })
    },

    removeTaskAssignee(taskId, personId) {
      store.dispatch({
        type: 'task/assigneeRemoved',
        taskId,
        personId,
      })
    },

    changeTasksAssignee(taskIds, personId, assigned) {
      store.dispatch({
        type: 'task/assigneeChangedBulk',
        taskIds: [...taskIds],
        personId,
        assigned,
      })
    },

    addTag(name) {
      const tag = createTag({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'tag/added',
        tag,
      })

      return tag
    },

    renameTag(tagId, name) {
      store.dispatch({
        type: 'tag/nameChanged',
        tagId,
        name,
      })
    },

    deleteTag(tagId) {
      store.dispatch({
        type: 'tag/deleted',
        tagId,
      })
    },

    assignTaskTag(taskId, tagId) {
      store.dispatch({
        type: 'task/tagAdded',
        taskId,
        tagId,
      })
    },

    removeTaskTag(taskId, tagId) {
      store.dispatch({
        type: 'task/tagRemoved',
        taskId,
        tagId,
      })
    },

    changeTasksTag(taskIds, tagId, assigned) {
      store.dispatch({
        type: 'task/tagChangedBulk',
        taskIds: [...taskIds],
        tagId,
        assigned,
      })
    },

    addArea(name) {
      const area = createArea({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'area/added',
        area,
      })

      return area
    },

    moveArea(areaId, direction) {
      store.dispatch({
        type: 'area/moved',
        areaId,
        direction,
      })
    },

    renameArea(areaId, name) {
      store.dispatch({
        type: 'area/nameChanged',
        areaId,
        name,
      })
    },

    deleteArea(areaId) {
      store.dispatch({
        type: 'area/deleted',
        areaId,
      })
    },

    changeProjectArea(projectId, areaId) {
      store.dispatch({
        type: 'project/areaChanged',
        projectId,
        areaId,
      })
    },

    addTaskList(projectId, name) {
      const list = createTaskList({
        id: runtime.nextId(),
        projectId,
        name,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'list/added',
        list,
      })

      return list
    },

    moveTaskListBefore(listId,targetListId) {
      store.dispatch({type:'list/reordered',listId,targetListId,placement:'before'})
    },
    moveTaskListAfter(listId,targetListId) {
      store.dispatch({type:'list/reordered',listId,targetListId,placement:'after'})
    },
    moveTaskList(listId, direction) {
      store.dispatch({
        type: 'list/moved',
        listId,
        direction,
      })
    },

    renameTaskList(listId, name) {
      store.dispatch({
        type: 'list/nameChanged',
        listId,
        name,
      })
    },

    deleteTaskList(listId) {
      store.dispatch({
        type: 'list/deleted',
        listId,
      })
    },

    changeTaskList(taskId, listId) {
      dispatchTracked(
        {
          type: 'task/listChanged',
          taskId,
          listId,
        },
        runtime.now(),
      )
    },

    changeTasksList(taskIds, listId) {
      dispatchTracked(
        {
          type: 'task/listChangedBulk',
          taskIds: [...taskIds],
          listId,
        },
        runtime.now(),
      )
    },

    moveChecklistItem(taskId, itemId, direction) {
      store.dispatch({
        type: 'task/checklistItemMoved',
        taskId,
        itemId,
        direction,
      })
    },

    addChecklistItem(taskId, text) {
      const item = createChecklistItem({
        id: runtime.nextId(),
        text,
      })

      store.dispatch({
        type: 'task/checklistItemAdded',
        taskId,
        item,
      })

      return item
    },

    renameChecklistItem(taskId, itemId, text) {
      store.dispatch({
        type: 'task/checklistItemTextChanged',
        taskId,
        itemId,
        text,
      })
    },

    changeChecklistItemCompleted(taskId, itemId, completed) {
      store.dispatch({
        type: 'task/checklistItemCompletedChanged',
        taskId,
        itemId,
        completed,
      })
    },

    deleteChecklistItem(taskId, itemId) {
      store.dispatch({
        type: 'task/checklistItemDeleted',
        taskId,
        itemId,
      })
    },

    moveProjectBefore(projectId, targetProjectId) {
      store.dispatch({type:'project/reordered',projectId,targetProjectId,placement:'before'})
    },
    moveProjectAfter(projectId, targetProjectId) {
      store.dispatch({type:'project/reordered',projectId,targetProjectId,placement:'after'})
    },
    moveProject(projectId, direction) {
      store.dispatch({
        type: 'project/moved',
        projectId,
        direction,
      })
    },

    addProject(name) {
      const project = createProject({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
      })

      store.dispatch({
        type: 'project/added',
        project,
      })

      return project
    },

    saveProjectTemplate(projectId, name) {
      const state = store.getState()
      const project = state.projects.find(
        (candidate) =>
          candidate.id === projectId && candidate.archivedAt === undefined,
      )

      if (!project) {
        throw new Error('Cannot template a missing or archived project')
      }

      const template = createProjectTemplate({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
        project,
        lists: state.lists ?? [],
        tasks: state.tasks,
      })

      store.dispatch({
        type: 'projectTemplate/added',
        template,
      })

      return template
    },

    createProjectFromTemplate(templateId) {
      const template = (store.getState().projectTemplates ?? []).find(
        (candidate) => candidate.id === templateId,
      )

      if (!template) {
        throw new Error('Cannot create a project from a missing template')
      }

      const now = runtime.now()
      const instance = instantiateProjectTemplate(template, {
        now,
        nextId: () => runtime.nextId(),
      })

      dispatchTracked(
        {
          type: 'projectTemplate/instantiated',
          ...instance,
        },
        now,
      )

      return instance.project
    },

    deleteProjectTemplate(templateId) {
      const exists = (store.getState().projectTemplates ?? []).some(
        (template) => template.id === templateId,
      )

      if (!exists) {
        throw new Error('Cannot delete a missing project template')
      }

      store.dispatch({
        type: 'projectTemplate/deleted',
        templateId,
      })
    },

    saveTaskTemplate(taskId, name) {
      const state = store.getState()
      const rootTask = state.tasks.find(
        (task) => task.id === taskId && task.archivedAt === undefined,
      )
      const project = rootTask
        ? state.projects.find(
            (candidate) =>
              candidate.id === rootTask.projectId &&
              candidate.archivedAt === undefined,
          )
        : undefined

      if (!rootTask || !project) {
        throw new Error('Cannot template a missing or archived task')
      }

      const template = createTaskTemplate({
        id: runtime.nextId(),
        name,
        now: runtime.now(),
        rootTask,
        tasks: state.tasks,
      })

      store.dispatch({
        type: 'taskTemplate/added',
        template,
      })

      return template
    },

    createTaskFromTemplate(templateId, projectId, listId) {
      const state = store.getState()
      const template = (state.taskTemplates ?? []).find(
        (candidate) => candidate.id === templateId,
      )
      const project = state.projects.find(
        (candidate) =>
          candidate.id === projectId && candidate.archivedAt === undefined,
      )

      if (!template) {
        throw new Error('Cannot create a task from a missing template')
      }

      if (!project) {
        throw new Error('Cannot create a task in a missing or archived project')
      }

      if (
        listId !== undefined &&
        !(state.lists ?? []).some(
          (list) => list.id === listId && list.projectId === projectId,
        )
      ) {
        throw new Error('Cannot create a task in an incompatible list')
      }

      const now = runtime.now()
      const instance = instantiateTaskTemplate(template, {
        projectId,
        listId,
        now,
        nextId: () => runtime.nextId(),
      })

      dispatchTracked(
        {
          type: 'taskTemplate/instantiated',
          tasks: instance.tasks,
        },
        now,
      )

      return instance.rootTask
    },

    deleteTaskTemplate(templateId) {
      const exists = (store.getState().taskTemplates ?? []).some(
        (template) => template.id === templateId,
      )

      if (!exists) {
        throw new Error('Cannot delete a missing task template')
      }

      store.dispatch({
        type: 'taskTemplate/deleted',
        templateId,
      })
    },

    addTask(projectId, title, listId) {
      const id = runtime.nextId()
      const now = runtime.now()
      const task = createTask({
        id,
        projectId,
        title,
        now,
        listId,
      })

      dispatchTracked(
        {
          type: 'task/added',
          task,
        },
        now,
      )

      return task
    },

    addSubtask(parentTaskId, title) {
      const parent = store
        .getState()
        .tasks.find((task) => task.id === parentTaskId)

      if (!parent) {
        throw new Error('Cannot create a subtask for a missing task')
      }

      const id = runtime.nextId()
      const now = runtime.now()
      const task = createSubtask({
        id,
        parent,
        title,
        now,
      })

      dispatchTracked(
        {
          type: 'task/added',
          task,
        },
        now,
      )

      return task
    },

    duplicateTask(taskId) {
      const source = store
        .getState()
        .tasks.find((task) => task.id === taskId)

      if (!source) {
        throw new Error('Cannot duplicate a missing task')
      }

      const id = runtime.nextId()
      const now = runtime.now()
      const task = duplicateTaskDomain(source, {
        id,
        now,
      })

      dispatchTracked(
        {
          type: 'task/added',
          task,
        },
        now,
      )

      return task
    },


    archiveTask(taskId) {
      const exists = store
        .getState()
        .tasks.some((task) => task.id === taskId)

      if (!exists) {
        throw new Error('Cannot archive a missing task')
      }

      const archivedAt = runtime.now()
      dispatchTracked(
        {
          type: 'task/archived',
          taskId,
          archivedAt,
        },
        archivedAt,
      )
    },

    archiveTasks(taskIds) {
      const archivedAt = runtime.now()
      dispatchTracked(
        {
          type: 'task/archivedBulk',
          taskIds: [...taskIds],
          archivedAt,
        },
        archivedAt,
      )
    },

    restoreTask(taskId) {
      const exists = store
        .getState()
        .tasks.some((task) => task.id === taskId)

      if (!exists) {
        throw new Error('Cannot restore a missing task')
      }

      dispatchTracked(
        {
          type: 'task/restored',
          taskId,
        },
        runtime.now(),
      )
    },

    restoreTasks(taskIds) {
      dispatchTracked(
        {
          type: 'task/restoredBulk',
          taskIds: [...taskIds],
        },
        runtime.now(),
      )
    },

    archiveProject(projectId) {
      const exists = store
        .getState()
        .projects.some((project) => project.id === projectId)

      if (!exists) {
        throw new Error('Cannot archive a missing project')
      }

      store.dispatch({
        type: 'project/archived',
        projectId,
        archivedAt: runtime.now(),
      })
    },

    restoreProject(projectId) {
      const exists = store
        .getState()
        .projects.some((project) => project.id === projectId)

      if (!exists) {
        throw new Error('Cannot restore a missing project')
      }

      store.dispatch({
        type: 'project/restored',
        projectId,
      })
    },

    renameProject(projectId, name) {
      store.dispatch({
        type: 'project/nameChanged',
        projectId,
        name,
      })
    },

    changeProjectDescription(projectId, description) {
      store.dispatch({
        type: 'project/descriptionChanged',
        projectId,
        description,
      })
    },

    renameTask(taskId, title) {
      dispatchTracked(
        {
          type: 'task/titleChanged',
          taskId,
          title,
        },
        runtime.now(),
      )
    },

    changeTaskStatus(taskId, status) {
      const task = store.getState().tasks.find((candidate) => candidate.id === taskId)

      if (task?.status === status) {
        return
      }

      if (
        task?.recurrence !== undefined &&
        task.status !== 'done' &&
        status === 'done'
      ) {
        const id = runtime.nextId()
        const now = runtime.now()
        const occurrence = createNextRecurringTaskOccurrence(
          { ...task, status: 'done' },
          {
            id,
            now,
          },
        )

        dispatchTracked(
          {
            type: 'task/recurringCompleted',
            taskId,
            occurrence,
          },
          now,
        )
        return
      }

      dispatchTracked(
        {
          type: 'task/statusChanged',
          taskId,
          status,
        },
        runtime.now(),
      )
    },

    changeTaskRecurrence(taskId, recurrence) {
      store.dispatch({
        type: 'task/recurrenceChanged',
        taskId,
        recurrence,
      })
    },

    changeTaskTimeEstimate(taskId, estimateMinutes) {
      store.dispatch({
        type: 'task/timeEstimateChanged',
        taskId,
        estimateMinutes,
      })
    },

    addTaskTrackedMinutes(taskId, minutes) {
      store.dispatch({
        type: 'task/timeTrackedManually',
        taskId,
        entryId: runtime.nextId(),
        minutes,
        now: runtime.now(),
      })
    },

    startTaskTimer(taskId) {
      store.dispatch({
        type: 'task/timerStarted',
        taskId,
        startedAt: runtime.now(),
      })
    },

    stopTaskTimer(taskId) {
      store.dispatch({
        type: 'task/timerStopped',
        taskId,
        entryId: runtime.nextId(),
        stoppedAt: runtime.now(),
      })
    },

    deleteTaskTimeEntry(taskId, entryId) {
      store.dispatch({
        type: 'task/timeEntryDeleted',
        taskId,
        entryId,
      })
    },

    addTaskAttachment(taskId, input) {
      store.dispatch({
        type: 'task/attachmentAdded',
        taskId,
        attachmentId: runtime.nextId(),
        name: input.name,
        sizeBytes: input.sizeBytes,
        mediaType: input.mediaType,
        now: runtime.now(),
      })
    },

    deleteTaskAttachment(taskId, attachmentId) {
      store.dispatch({
        type: 'task/attachmentDeleted',
        taskId,
        attachmentId,
      })
    },

    changeTasksStatus(taskIds, status) {
      dispatchTracked(
        {
          type: 'task/statusChangedBulk',
          taskIds: [...taskIds],
          status,
        },
        runtime.now(),
      )
    },

    changeTaskPriority(taskId, priority) {
      dispatchTracked(
        {
          type: 'task/priorityChanged',
          taskId,
          priority,
        },
        runtime.now(),
      )
    },

    changeTasksPriority(taskIds, priority) {
      dispatchTracked(
        {
          type: 'task/priorityChangedBulk',
          taskIds: [...taskIds],
          priority,
        },
        runtime.now(),
      )
    },

    changeTaskStartDate(taskId, startDate) {
      dispatchTracked(
        {
          type: 'task/startDateChanged',
          taskId,
          startDate,
        },
        runtime.now(),
      )
    },

    changeTasksStartDate(taskIds, startDate) {
      dispatchTracked(
        {
          type: 'task/startDateChangedBulk',
          taskIds: [...taskIds],
          startDate,
        },
        runtime.now(),
      )
    },

    changeTaskDueDate(taskId, dueDate) {
      dispatchTracked(
        {
          type: 'task/dueDateChanged',
          taskId,
          dueDate,
        },
        runtime.now(),
      )
    },

    changeTasksDueDate(taskIds, dueDate) {
      dispatchTracked(
        {
          type: 'task/dueDateChangedBulk',
          taskIds: [...taskIds],
          dueDate,
        },
        runtime.now(),
      )
    },

    captureTaskGanttBaseline(taskId) {
      const task = store.getState().tasks.find((candidate) => candidate.id === taskId)
      if (!task) {
        throw new Error('Cannot capture baseline for a missing task')
      }
      if (task.startDate === undefined || task.dueDate === undefined) {
        throw new Error('Cannot capture baseline without both Task dates')
      }
      store.dispatch({
        type: 'task/ganttBaselineCaptured',
        taskId,
        capturedAt: runtime.now(),
      })
    },

    changeTaskMilestone(taskId, isMilestone) {
      if (!store.getState().tasks.some((task) => task.id === taskId)) {
        throw new Error('Cannot update milestone on a missing task')
      }
      store.dispatch({ type: 'task/milestoneChanged', taskId, isMilestone })
    },

    changeTaskGanttSchedule(taskId, startDate, dueDate) {
      const task = store.getState().tasks.find(
        (candidate) => candidate.id === taskId,
      )

      if (!task) {
        throw new Error('Cannot schedule a missing task')
      }

      const schedule = createTaskGanttScheduleChange(
        task,
        startDate,
        dueDate,
      )
      const occurredAt = runtime.now()
      const movesForwardPastCurrentDue =
        task.dueDate !== undefined && schedule.startDate > task.dueDate

      const startAction = {
        type: 'task/startDateChanged' as const,
        taskId,
        startDate: schedule.startDate,
      }
      const dueAction = {
        type: 'task/dueDateChanged' as const,
        taskId,
        dueDate: schedule.dueDate,
      }

      if (movesForwardPastCurrentDue) {
        dispatchTracked(dueAction, occurredAt)
        dispatchTracked(startAction, occurredAt)
      } else {
        dispatchTracked(startAction, occurredAt)
        dispatchTracked(dueAction, occurredAt)
      }
    },

    changeTaskDescription(taskId, description) {
      store.dispatch({
        type: 'task/descriptionChanged',
        taskId,
        description,
      })
    },

    changeTaskProject(taskId, projectId) {
      dispatchTracked(
        {
          type: 'task/projectChanged',
          taskId,
          projectId,
        },
        runtime.now(),
      )
    },

    changeTasksProject(taskIds, projectId) {
      dispatchTracked(
        {
          type: 'task/projectChangedBulk',
          taskIds: [...taskIds],
          projectId,
        },
        runtime.now(),
      )
    },

    moveTask(taskId, direction) {
      store.dispatch({
        type: 'task/moved',
        taskId,
        direction,
      })
    },

    moveTaskBefore(taskId, targetTaskId) {
      store.dispatch({ type: 'task/reordered', taskId, targetTaskId, placement: 'before' })
    },

    moveTaskAfter(taskId, targetTaskId) {
      store.dispatch({ type: 'task/reordered', taskId, targetTaskId, placement: 'after' })
    },

    deleteTask(taskId) {
      dispatchTracked(
        {
          type: 'task/deleted',
          taskId,
        },
        runtime.now(),
      )
    },

    deleteTasks(taskIds) {
      dispatchTracked(
        {
          type: 'task/deletedBulk',
          taskIds: [...taskIds],
        },
        runtime.now(),
      )
    },

    deleteProject(projectId) {
      dispatchTracked(
        {
          type: 'project/deleted',
          projectId,
        },
        runtime.now(),
      )
    },
  }
}
