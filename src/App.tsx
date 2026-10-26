import { useEffect, useRef, useState, type FormEvent } from 'react'

import { createTaskBoardColumns } from './domain/task-board'
import { createTaskCalendarSections } from './domain/task-calendar'
import {
  createTaskGanttDependencyEdges,
  createTaskGanttItems,
  createTaskGanttBaselineComparison,
  createTaskGanttCriticalPath,
  createTaskGanttScheduleConflicts,
  normalizeTaskGanttNonWorkingDates,
  createTaskGanttWorkingCriticalPath,
  createTaskGanttWorkingDateProjection,
} from './domain/task-gantt'
import { createTaskTableRows } from './domain/task-table'
import { createTaskTimelineItems } from './domain/task-timeline'
import { groupTasks, type TaskGroup } from './domain/task-group'

import {
  createCustomFieldTaskFilter,
  filterTasks,
  type CustomFieldTaskFilter,
  type TaskDueDateFilter,
} from './domain/task-filter'
import {
  createCustomFieldTaskSort,
  sortTasks,
  type TaskSort,
} from './domain/task-sort'
import { summarizeTasks } from './domain/task-summary'
import type { MoveDirection } from './domain/manual-order'
import type { TaskRelationshipType } from './domain/task-relationship'
import { summarizeTaskRelationships } from './domain/task-relationship-summary'
import {
  createDefaultViewPreferences,
  applyTaskFilterSet,
  applyTaskView,
  deleteTaskFilterSet,
  deleteTaskView,
  getTaskFilterSets,
  getSavedTaskViews,
  getTaskGroup,
  getTaskViewMode,
  saveTaskFilterSet,
  saveTaskView,
  switchTaskViewMode,
  updateTaskViewFilterSort,
  updateViewPreferences,
  type TaskViewFilterSortState,
  type TaskViewMode,
  type ViewPreferences,
} from './domain/view-preferences'
import {
  getTaskTrackedMinutes,
  type TaskPriority,
  type TaskRecurrenceRule,
  type TaskRecurrenceUnit,
  type TaskStatus,
} from './domain/task'
import {
  evaluateCustomFieldFormula,
  type CustomFieldDefinition,
  type CustomFieldFormula,
  type CustomFieldFormulaOperator,
  type CustomFieldType,
  type CustomFieldValue,
} from './domain/custom-field'
import {
  describeTaskActivityEntry,
  emptyWorkspace,
  type WorkspaceState,
} from './domain/workspace'

export interface AppProps {
  state?: WorkspaceState
  onCreateTaskRelationship?: (type: TaskRelationshipType, sourceTaskId: string, targetTaskId: string) => void
  onDeleteTaskRelationship?: (relationshipId: string) => void
  onCreateCustomField?: (name: string, type: CustomFieldType) => void
  onRenameCustomField?: (fieldId: string, name: string) => void
  onChangeCustomFieldType?: (fieldId: string, nextType: CustomFieldType) => void
  onDeleteCustomField?: (fieldId: string) => void
  onConfigureCustomFieldFormula?: (fieldId: string, formula: CustomFieldFormula | null) => void
  onAddCustomFieldOption?: (fieldId: string, name: string) => void
  onRenameCustomFieldOption?: (fieldId: string, optionId: string, name: string) => void
  onDeleteCustomFieldOption?: (fieldId: string, optionId: string) => void
  onChangeTaskCustomFieldValue?: (taskId: string, fieldId: string, value: CustomFieldValue | null) => void
  onChangeTasksCustomFieldValue?: (taskIds: string[], fieldId: string, value: CustomFieldValue | null) => void
  onCreatePerson?: (name: string) => void
  onRenamePerson?: (personId: string, name: string) => void
  onDeletePerson?: (personId: string) => void
  onChangeTaskAssignee?: (taskId: string, personId: string, assigned: boolean) => void
  onChangeTasksAssignee?: (taskIds: string[], personId: string, assigned: boolean) => void
  onCreateTag?: (name: string) => void
  onRenameTag?: (tagId: string, name: string) => void
  onDeleteTag?: (tagId: string) => void
  onChangeTaskTag?: (taskId: string, tagId: string, assigned: boolean) => void
  onChangeTasksTag?: (taskIds: string[], tagId: string, assigned: boolean) => void
  onCreateArea?: (name: string) => void
  onRenameArea?: (areaId: string, name: string) => void
  onDeleteArea?: (areaId: string) => void
  onMoveArea?: (areaId: string, direction: MoveDirection) => void
  onChangeProjectArea?: (projectId: string, areaId: string | null) => void
  onCreateTaskList?: (projectId: string, name: string) => void
  onRenameTaskList?: (listId: string, name: string) => void
  onDeleteTaskList?: (listId: string) => void
  onMoveTaskList?: (listId: string, direction: MoveDirection) => void
  onMoveTaskListBefore?: (listId: string, targetListId: string) => void
  onMoveTaskListAfter?: (listId: string, targetListId: string) => void
  onChangeTaskList?: (taskId: string, listId: string | null) => void
  onChangeTasksList?: (taskIds: string[], listId: string | null) => void
  onAddChecklistItem?: (taskId: string, text: string) => void
  onRenameChecklistItem?: (taskId: string, itemId: string, text: string) => void
  onChangeChecklistItemCompleted?: (taskId: string, itemId: string, completed: boolean) => void
  onDeleteChecklistItem?: (taskId: string, itemId: string) => void
  onMoveChecklistItem?: (taskId: string, itemId: string, direction: MoveDirection) => void
  onMoveProject?: (projectId: string, direction: MoveDirection) => void
  onMoveProjectBefore?: (projectId: string, targetProjectId: string) => void
  onMoveProjectAfter?: (projectId: string, targetProjectId: string) => void
  onCreateProject?: (name: string) => void
  onSaveProjectTemplate?: (projectId: string, name: string) => void
  onCreateProjectFromTemplate?: (templateId: string) => void
  onDeleteProjectTemplate?: (templateId: string) => void
  onSaveTaskTemplate?: (taskId: string, name: string) => void
  onCreateTaskFromTemplate?: (templateId: string, projectId: string, listId?: string) => void
  onDeleteTaskTemplate?: (templateId: string) => void
  onArchiveProject?: (projectId: string) => void
  onRestoreProject?: (projectId: string) => void
  onRenameProject?: (projectId: string, name: string) => void
  onChangeProjectDescription?: (projectId: string, description: string | null) => void
  onCreateTask?: (projectId: string, title: string, listId?: string) => void
  onCreateSubtask?: (parentTaskId: string, title: string) => void
  onDuplicateTask?: (taskId: string) => void
  onArchiveTask?: (taskId: string) => void
  onRestoreTask?: (taskId: string) => void
  onRestoreTasks?: (taskIds: string[]) => void
  onDeleteProject?: (projectId: string) => void
  onRenameTask?: (taskId: string, title: string) => void
  onDeleteTask?: (taskId: string) => void
  onDeleteTasks?: (taskIds: string[]) => void
  onMoveTask?: (taskId: string, direction: MoveDirection) => void
  onMoveTaskBefore?: (taskId: string, targetTaskId: string) => void
  onMoveTaskAfter?: (taskId: string, targetTaskId: string) => void
  onChangeTaskStatus?: (taskId: string, status: TaskStatus) => void
  onChangeTaskRecurrence?: (taskId: string, recurrence: TaskRecurrenceRule | null) => void
  onChangeTaskTimeEstimate?: (taskId: string, estimateMinutes: number | null) => void
  onAddTaskTrackedMinutes?: (taskId: string, minutes: number) => void
  onStartTaskTimer?: (taskId: string) => void
  onStopTaskTimer?: (taskId: string) => void
  onDeleteTaskTimeEntry?: (taskId: string, entryId: string) => void
  onAddTaskAttachment?: (
    taskId: string,
    input: { name: string; sizeBytes: number; mediaType?: string },
  ) => void
  onDeleteTaskAttachment?: (taskId: string, attachmentId: string) => void
  onChangeTasksStatus?: (taskIds: string[], status: TaskStatus) => void
  onChangeTaskPriority?: (taskId: string, priority: TaskPriority) => void
  onChangeTasksPriority?: (taskIds: string[], priority: TaskPriority) => void
  onArchiveTasks?: (taskIds: string[]) => void
  onChangeTaskStartDate?: (taskId: string, startDate: string | null) => void
  onChangeTasksStartDate?: (taskIds: string[], startDate: string | null) => void
  onChangeTaskDueDate?: (taskId: string, dueDate: string | null) => void
  onChangeTasksDueDate?: (taskIds: string[], dueDate: string | null) => void
  onChangeTaskMilestone?: (taskId: string, isMilestone: boolean) => void
  onCaptureTaskGanttBaseline?: (taskId: string) => void
  onChangeTaskGanttSchedule?: (taskId: string, startDate: string, dueDate: string) => void
  onChangeTaskDescription?: (taskId: string, description: string | null) => void
  onChangeTaskProject?: (taskId: string, projectId: string) => void
  onChangeTasksProject?: (taskIds: string[], projectId: string) => void
  initialViewPreferences?: ViewPreferences
  onViewPreferencesChange?: (preferences: ViewPreferences) => void
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to complete action'
}

function formatTrackedMinutes(minutes: number): string {
  return Number.isInteger(minutes)
    ? String(minutes)
    : String(Math.round(minutes * 100) / 100)
}

export function App({
  state = emptyWorkspace,
  onCreateTaskRelationship,
  onDeleteTaskRelationship,
  onCreateCustomField,
  onRenameCustomField,
  onChangeCustomFieldType,
  onDeleteCustomField,
  onConfigureCustomFieldFormula,
  onAddCustomFieldOption,
  onRenameCustomFieldOption,
  onDeleteCustomFieldOption,
  onChangeTaskCustomFieldValue,
  onChangeTasksCustomFieldValue,
  onCreatePerson,
  onRenamePerson,
  onDeletePerson,
  onChangeTaskAssignee,
  onChangeTasksAssignee,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
  onChangeTaskTag,
  onChangeTasksTag,
  onCreateArea,
  onRenameArea,
  onDeleteArea,
  onMoveArea,
  onChangeProjectArea,
  onCreateTaskList,
  onRenameTaskList,
  onDeleteTaskList,
  onMoveTaskList,
  onMoveTaskListBefore,
  onMoveTaskListAfter,
  onChangeTaskList,
  onChangeTasksList,
  onAddChecklistItem,
  onRenameChecklistItem,
  onChangeChecklistItemCompleted,
  onDeleteChecklistItem,
  onMoveChecklistItem,
  onMoveProject,
  onMoveProjectBefore,
  onMoveProjectAfter,
  onCreateProject,
  onSaveProjectTemplate,
  onCreateProjectFromTemplate,
  onDeleteProjectTemplate,
  onSaveTaskTemplate,
  onCreateTaskFromTemplate,
  onDeleteTaskTemplate,
  onArchiveProject,
  onRestoreProject,
  onRenameProject,
  onChangeProjectDescription,
  onCreateTask,
  onCreateSubtask,
  onDuplicateTask,
  onArchiveTask,
  onRestoreTask,
  onRestoreTasks,
  onDeleteProject,
  onRenameTask,
  onDeleteTask,
  onDeleteTasks,
  onMoveTask,
  onMoveTaskBefore,
  onMoveTaskAfter,
  onChangeTaskStatus,
  onChangeTaskRecurrence,
  onChangeTaskTimeEstimate,
  onAddTaskTrackedMinutes,
  onStartTaskTimer,
  onStopTaskTimer,
  onDeleteTaskTimeEntry,
  onAddTaskAttachment,
  onDeleteTaskAttachment,
  onChangeTasksStatus,
  onChangeTaskPriority,
  onChangeTasksPriority,
  onArchiveTasks,
  onChangeTaskStartDate,
  onChangeTasksStartDate,
  onChangeTaskDueDate,
  onChangeTasksDueDate,
  onChangeTaskGanttSchedule,
  onChangeTaskMilestone,
  onCaptureTaskGanttBaseline,
  onChangeTaskDescription,
  onChangeTaskProject,
  onChangeTasksProject,
  initialViewPreferences = createDefaultViewPreferences(),
  onViewPreferencesChange,
}: AppProps) {
  const [activityHistoryOpen, setActivityHistoryOpen] = useState(false)
  const [showTaskFilters, setShowTaskFilters] = useState(true)
  const taskSearchRef = useRef<HTMLInputElement>(null)
  const focusSearchOnOpen = useRef(false)
  useEffect(() => {
    if (showTaskFilters && focusSearchOnOpen.current) {
      focusSearchOnOpen.current = false
      taskSearchRef.current?.focus()
      taskSearchRef.current?.select()
    }
  }, [showTaskFilters])

  function focusTaskSearch() {
    if (!showTaskFilters) {
      focusSearchOnOpen.current = true
      setShowTaskFilters(true)
    } else {
      taskSearchRef.current?.focus()
      taskSearchRef.current?.select()
    }
  }
  useEffect(() => {
    function handleTaskSearchShortcut(event: KeyboardEvent) {
      const target = event.target
      const appMain = document.getElementById('workspace-content')
      const appHeader = document.querySelector('.workspace-app-header')
      if (target instanceof Node && target !== document.body &&
        target !== document.documentElement &&
        !appMain?.contains(target) && !appHeader?.contains(target)) return
      const slash = event.key === '/' && !event.ctrlKey && !event.metaKey
      const controlSearch = event.key.toLowerCase() === 'k' && (event.ctrlKey !== event.metaKey)
      const editable = target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (event.defaultPrevented || event.repeat || event.isComposing || (!slash && !controlSearch) || event.altKey || (slash && editable)) return
      event.preventDefault()
      focusTaskSearch()
    }
    document.addEventListener('keydown', handleTaskSearchShortcut)
    return () => document.removeEventListener('keydown', handleTaskSearchShortcut)
  }, [showTaskFilters])
  const [showProjects, setShowProjects] = useState(true)
  const [relationshipTypes, setRelationshipTypes] = useState<
    Record<string, TaskRelationshipType>
  >({})
  const [relationshipTargets, setRelationshipTargets] = useState<
    Record<string, string>
  >({})
  const [customFieldName, setCustomFieldName] = useState('')
  const [customFieldType, setCustomFieldType] = useState<CustomFieldType>('text')
  const [customFieldTypeMigrations, setCustomFieldTypeMigrations] = useState<
    Record<string, CustomFieldType>
  >({})
  const [customFieldEdits, setCustomFieldEdits] = useState<Record<string, string>>({})
  const [customFieldOptionNames, setCustomFieldOptionNames] = useState<Record<string, string>>({})
  const [customFieldOptionEdits, setCustomFieldOptionEdits] = useState<Record<string, string>>({})
  const [customFieldFormulaLeftOperands, setCustomFieldFormulaLeftOperands] = useState<Record<string, string>>({})
  const [customFieldFormulaOperators, setCustomFieldFormulaOperators] = useState<Record<string, CustomFieldFormulaOperator>>({})
  const [customFieldFormulaRightOperands, setCustomFieldFormulaRightOperands] = useState<Record<string, string>>({})
  const [customFieldValueDrafts, setCustomFieldValueDrafts] = useState<
    Record<string, string>
  >({})
  const [personName, setPersonName] = useState('')
  const [personEdits, setPersonEdits] = useState<Record<string, string>>({})
  const [tagName, setTagName] = useState('')
  const [tagEdits, setTagEdits] = useState<Record<string, string>>({})
  const [areaName, setAreaName] = useState('')
  const [areaEdits, setAreaEdits] = useState<Record<string, string>>({})
  const [listNames, setListNames] = useState<Record<string, string>>({})
  const [listEdits, setListEdits] = useState<Record<string, string>>({})
  const [projectName, setProjectName] = useState('')
  const [projectEdits, setProjectEdits] = useState<Record<string, string>>({})
  const [projectDescriptions, setProjectDescriptions] = useState<Record<string, string>>({})
  const [taskTitles, setTaskTitles] = useState<Record<string, string>>({})
  const [newTaskLists, setNewTaskLists] = useState<Record<string, string>>({})
  const [subtaskTitles, setSubtaskTitles] = useState<Record<string, string>>({})
  const [checklistTexts, setChecklistTexts] = useState<Record<string, string>>({})
  const [checklistEdits, setChecklistEdits] = useState<Record<string, string>>({})
  const [taskEdits, setTaskEdits] = useState<Record<string, string>>({})
  const [taskDescriptions, setTaskDescriptions] = useState<Record<string, string>>({})
  const [taskTrackedMinuteDrafts, setTaskTrackedMinuteDrafts] = useState<Record<string, string>>({})
  const [taskTemplateProjects, setTaskTemplateProjects] = useState<Record<string, string>>({})
  const [taskTemplateLists, setTaskTemplateLists] = useState<Record<string, string>>({})
  const [filterSetName, setFilterSetName] = useState('')
  const [savedViewName, setSavedViewName] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [selectedArchivedTaskIds, setSelectedArchivedTaskIds] = useState<string[]>([])
  const [bulkDeletePending, setBulkDeletePending] = useState(false)
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>('todo')
  const [bulkPriority, setBulkPriority] = useState<TaskPriority>('normal')
  const [bulkStartDate, setBulkStartDate] = useState('')
  const [bulkDueDate, setBulkDueDate] = useState('')
  const [bulkTagId, setBulkTagId] = useState('')
  const [bulkPersonId, setBulkPersonId] = useState('')
  const [bulkCustomFieldId, setBulkCustomFieldId] = useState('')
  const [bulkCustomFieldValue, setBulkCustomFieldValue] = useState('')
  const [bulkCustomFieldChecked, setBulkCustomFieldChecked] = useState(false)
  const [bulkProjectId, setBulkProjectId] = useState('')
  const [bulkListId, setBulkListId] = useState('')
  const [ganttScheduleDrafts, setGanttScheduleDrafts] = useState<
    Record<string, { startDate: string; dueDate: string }>
  >({})
  const [ganttOverviewCriticalOnly, setGanttOverviewCriticalOnly] = useState(false)
  const [ganttShowLogicalOffsets, setGanttShowLogicalOffsets] = useState(false)
  const [ganttShowWorkingDays, setGanttShowWorkingDays] = useState(false)
  const [ganttShowProjectedWorkingDates, setGanttShowProjectedWorkingDates] = useState(false)
  const [ganttSundayThursdayWeek, setGanttSundayThursdayWeek] = useState(
    initialViewPreferences.ganttWorkingWeek === 'sun-thu',
  )
  const ganttWorkingWeekdays = ganttSundayThursdayWeek ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5]
  const [ganttOverviewWorkingCriticalOnly, setGanttOverviewWorkingCriticalOnly] = useState(false)
  const [ganttNonWorkingDateDraft, setGanttNonWorkingDateDraft] = useState('')
  const [ganttNonWorkingDates, setGanttNonWorkingDates] = useState<string[]>(
    () => [...(initialViewPreferences.ganttNonWorkingDates ?? [])],
  )
  const [customFieldFilterFieldId, setCustomFieldFilterFieldId] = useState(
    initialViewPreferences.customFieldFilter?.fieldId ?? '',
  )
  const [customFieldFilterDraftValues, setCustomFieldFilterDraftValues] =
    useState<Record<string, string>>(() => {
      const filter = initialViewPreferences.customFieldFilter

      return filter === undefined
        ? {}
        : { [filter.fieldId]: String(filter.value) }
    })
  const [viewPreferences, setViewPreferences] = useState<ViewPreferences>(
    initialViewPreferences,
  )
  const {
    projectView,
    query: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
    dueDate: dueDateFilter,
    sort: taskSort,
    customFieldFilter,
    customFieldSortFieldId,
  } = viewPreferences
  const taskGroup = getTaskGroup(viewPreferences)
  const taskViewMode = getTaskViewMode(viewPreferences)
  const savedFilterSets = getTaskFilterSets(viewPreferences)
  const savedViews = getSavedTaskViews(viewPreferences)

  function syncCustomFieldFilterEditor(preferences: ViewPreferences) {
    const filter = preferences.customFieldFilter
    setCustomFieldFilterFieldId(filter?.fieldId ?? '')

    if (filter !== undefined) {
      setCustomFieldFilterDraftValues((current) => ({
        ...current,
        [filter.fieldId]: String(filter.value),
      }))
    }
  }

  function updatePreferences(patch: Partial<ViewPreferences>) {
    setViewPreferences((current) => {
      const next = updateViewPreferences(current, patch)
      onViewPreferencesChange?.(next)
      return next
    })
  }

  function updateFilterSortPreferences(
    patch: Partial<TaskViewFilterSortState>,
  ) {
    setViewPreferences((current) => {
      const next = updateTaskViewFilterSort(current, patch)
      onViewPreferencesChange?.(next)
      return next
    })
  }

  function changeTaskViewMode(nextMode: TaskViewMode) {
    setViewPreferences((current) => {
      const next = switchTaskViewMode(current, nextMode)
      syncCustomFieldFilterEditor(next)
      onViewPreferencesChange?.(next)
      return next
    })
  }
  const [error, setError] = useState<string | null>(null)
  const [taskReorderResult, setTaskReorderResult] = useState('')
  const [boardDragResult, setBoardDragResult] = useState('')
  const [lastBoardStatusChange, setLastBoardStatusChange] = useState<{
    taskId: string
    previousStatus: TaskStatus
    taskTitle: string
  } | null>(null)

  function submitCustomField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCreateCustomField) {
      return
    }

    try {
      onCreateCustomField(customFieldName, customFieldType)
      setCustomFieldName('')
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function submitPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCreatePerson) {
      return
    }

    try {
      onCreatePerson(personName)
      setPersonName('')
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function submitTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCreateTag) {
      return
    }

    try {
      onCreateTag(tagName)
      setTagName('')
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function submitArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCreateArea) {
      return
    }

    try {
      onCreateArea(areaName)
      setAreaName('')
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onCreateProject) {
      return
    }

    try {
      onCreateProject(projectName)
      setProjectName('')
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  const relationships = state.relationships ?? []
  const customFields = state.customFields ?? []
  const filterableCustomFields = customFields.filter(
    (field) => field.type !== 'formula',
  )

  function resolveCustomFieldFilter(
    filter: CustomFieldTaskFilter | undefined,
  ): CustomFieldTaskFilter | undefined {
    if (filter === undefined) {
      return undefined
    }

    const field = filterableCustomFields.find(
      (candidate) =>
        candidate.id === filter.fieldId && candidate.type === filter.fieldType,
    )

    if (!field) {
      return undefined
    }

    try {
      return createCustomFieldTaskFilter(field, filter.value)
    } catch {
      return undefined
    }
  }

  function changeCustomFieldFilter(
    field: CustomFieldDefinition,
    value: unknown,
  ) {
    try {
      const filter = createCustomFieldTaskFilter(field, value)
      updateFilterSortPreferences({ customFieldFilter: filter })
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function clearCustomFieldFilter() {
    updateFilterSortPreferences({ customFieldFilter: undefined })
    setError(null)
  }

  const effectiveCustomFieldFilter = resolveCustomFieldFilter(customFieldFilter)
  const selectedCustomFieldFilterField = filterableCustomFields.find(
    (field) => field.id === customFieldFilterFieldId,
  )
  const customFieldFilterIsStale =
    customFieldFilter !== undefined && effectiveCustomFieldFilter === undefined
  const customFieldFilterSelectValue = customFieldFilterIsStale
    ? ''
    : selectedCustomFieldFilterField?.id ?? ''
  const customFieldFilterControlField =
    customFieldFilterSelectValue === ''
      ? undefined
      : selectedCustomFieldFilterField
  const customFieldFilterControlValue = customFieldFilterControlField
    ? customFieldFilterDraftValues[customFieldFilterControlField.id] ??
      (effectiveCustomFieldFilter?.fieldId === customFieldFilterControlField.id
        ? String(effectiveCustomFieldFilter.value)
        : '')
    : ''
  const activeCustomFieldSortField = customFieldSortFieldId
    ? filterableCustomFields.find((field) => field.id === customFieldSortFieldId)
    : undefined
  const effectiveCustomFieldSort = activeCustomFieldSortField
    ? createCustomFieldTaskSort(activeCustomFieldSortField.id)
    : undefined
  const people = state.people ?? []
  const tags = state.tags ?? []
  const areas = state.areas ?? []
  const lists = state.lists ?? []
  const projectTemplates = state.projectTemplates ?? []
  const taskTemplates = state.taskTemplates ?? []
  const activeProjects = state.projects.filter(
    (project) => project.archivedAt === undefined,
  )
  const archivedProjects = state.projects.filter(
    (project) => project.archivedAt !== undefined,
  )
  const activeProjectIds = new Set(
    activeProjects.map((project) => project.id),
  )
  const activeTasks = state.tasks.filter(
    (task) =>
      task.archivedAt === undefined &&
      activeProjectIds.has(task.projectId),
  )
  const archivedTasks = state.tasks.filter(
    (task) =>
      task.archivedAt !== undefined &&
      activeProjectIds.has(task.projectId),
  )
  const archivedTaskRoots = archivedTasks.filter((task) => {
    if (task.parentTaskId === undefined) {
      return true
    }

    const parent = state.tasks.find(
      (candidate) => candidate.id === task.parentTaskId,
    )
    return parent?.archivedAt === undefined
  })
  const archivedTaskRootIds = archivedTaskRoots.map((task) => task.id)
  const archivedTaskRootIdSet = new Set(archivedTaskRootIds)
  const selectedVisibleArchivedTaskIds = selectedArchivedTaskIds.filter((taskId) =>
    archivedTaskRootIdSet.has(taskId),
  )
  const selectedVisibleArchivedTaskIdSet = new Set(selectedVisibleArchivedTaskIds)
  const allArchivedTaskRootsSelected =
    archivedTaskRootIds.length > 0 &&
    archivedTaskRootIds.every((taskId) => selectedVisibleArchivedTaskIdSet.has(taskId))
  const workspaceSummary = summarizeTasks(activeTasks)
  const projectLabel = activeProjects.length === 1 ? 'project' : 'projects'
  const taskLabel = workspaceSummary.total === 1 ? 'task' : 'tasks'

  const effectiveProjectView =
    projectView === 'all' ||
    activeProjects.some((project) => project.id === projectView)
      ? projectView
      : 'all'
  const visibleProjects = activeProjects.filter(
    (project) =>
      effectiveProjectView === 'all' || project.id === effectiveProjectView,
  )
  const visibleProjectIds = new Set(visibleProjects.map((project) => project.id))
  const visibleTaskIds = sortTasks(
    filterTasks(
      activeTasks.filter((task) => visibleProjectIds.has(task.projectId)),
      {
        query: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        dueDate: dueDateFilter,
        customField: effectiveCustomFieldFilter,
      },
      customFields,
    ),
    taskSort,
    customFields,
    effectiveCustomFieldSort,
  ).map((task) => task.id)
  const visibleTaskIdSet = new Set(visibleTaskIds)
  const selectedVisibleTaskIds = selectedTaskIds.filter((taskId) =>
    visibleTaskIdSet.has(taskId),
  )
  const selectedVisibleTaskIdSet = new Set(selectedVisibleTaskIds)
  const allVisibleTasksSelected =
    visibleTaskIds.length > 0 &&
    visibleTaskIds.every((taskId) => selectedVisibleTaskIdSet.has(taskId))
  const selectedVisibleProjectIds = [
    ...new Set(
      activeTasks
        .filter((task) => selectedVisibleTaskIdSet.has(task.id))
        .map((task) => task.projectId),
    ),
  ]
  const selectedVisibleProjectId =
    selectedVisibleProjectIds.length === 1
      ? selectedVisibleProjectIds[0] ?? null
      : null
  const compatibleBulkLists =
    selectedVisibleProjectId === null
      ? []
      : lists.filter((list) => list.projectId === selectedVisibleProjectId)
  const bulkListValue = compatibleBulkLists.some(
    (list) => list.id === bulkListId,
  )
    ? bulkListId
    : ''
  const editableBulkCustomFields = customFields.filter(
    (field) => field.type !== 'formula',
  )
  const bulkCustomField =
    editableBulkCustomFields.find((field) => field.id === bulkCustomFieldId) ??
    null

  function changeVisibleTaskSelection(taskId: string, selected: boolean) {
    if (selected) {
      setBulkSelectionMode(true)
    }

    setSelectedTaskIds((current) => {
      if (selected) {
        return current.includes(taskId) ? current : [...current, taskId]
      }

      return current.filter((candidate) => candidate !== taskId)
    })
  }

  function changeAllVisibleTaskSelection(selected: boolean) {
    if (selected) {
      setBulkSelectionMode(true)
    }

    setSelectedTaskIds((current) => {
      const next = new Set(current)

      for (const taskId of visibleTaskIds) {
        if (selected) {
          next.add(taskId)
        } else {
          next.delete(taskId)
        }
      }

      return [...next]
    })
  }

  function runBulkAction(action: () => void) {
    try {
      action()
      setSelectedTaskIds([])
      setBulkDeletePending(false)
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function runGanttScheduleAction(
    taskId: string,
    startDate: string,
    dueDate: string,
  ) {
    if (!onChangeTaskGanttSchedule) {
      return
    }

    try {
      onChangeTaskGanttSchedule(taskId, startDate, dueDate)
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  function selectVisibleCriticalGanttTasks() {
    const criticalTaskIds = visibleProjects.flatMap((project) =>
      createTaskGanttCriticalPath(
        activeTasks.filter(
          (task) => task.projectId === project.id && visibleTaskIdSet.has(task.id),
        ),
        relationships,
      ).criticalTaskIds,
    )
    if (criticalTaskIds.length === 0) return
    setBulkSelectionMode(true)
    setSelectedTaskIds(criticalTaskIds)
    setBulkDeletePending(false)
  }


  function selectVisibleWorkingCriticalGanttTasks() {
    const criticalTaskIds = visibleProjects.flatMap((project) =>
      createTaskGanttWorkingCriticalPath(
        activeTasks.filter(
          (task) => task.projectId === project.id && visibleTaskIdSet.has(task.id),
        ),
        relationships,
        ganttNonWorkingDates,
        ganttWorkingWeekdays,
      ).criticalTaskIds,
    )
    if (criticalTaskIds.length === 0) return
    setBulkSelectionMode(true)
    setSelectedTaskIds(criticalTaskIds)
    setBulkDeletePending(false)
  }

  function changeArchivedTaskSelection(taskId: string, selected: boolean) {
    setSelectedArchivedTaskIds((current) => {
      if (selected) {
        return current.includes(taskId) ? current : [...current, taskId]
      }

      return current.filter((candidate) => candidate !== taskId)
    })
  }

  function changeAllArchivedTaskSelection(selected: boolean) {
    setSelectedArchivedTaskIds(selected ? [...archivedTaskRootIds] : [])
  }

  function runArchivedBulkAction(action: () => void) {
    try {
      action()
      setSelectedArchivedTaskIds([])
      setError(null)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  return (
    <>
      <a className="skip-link" href="#workspace-content">Skip to workspace content</a>
      <header className="workspace-app-header">        <h1>uduzgak</h1>
      </header>
      <main id="workspace-content">
      <nav aria-label="Workspace navigation" className="workspace-navigation">
        <a href="#workspace-filters" onClick={() => setShowTaskFilters(true)}>Task filters</a>
        <a href="#workspace-projects" onClick={() => setShowProjects(true)}>Projects</a>
      </nav>
      <p className="workspace-summary">
        {activeProjects.length} {projectLabel} · {workspaceSummary.total}{' '}
        {taskLabel} · {workspaceSummary.done} done
      </p>

      <button
        type="button"
        onClick={() => setActivityHistoryOpen((current) => !current)}
      >
        {activityHistoryOpen
          ? 'Hide activity history'
          : `Show activity history (${state.activity?.length ?? 0})`}
      </button>

      {activityHistoryOpen ? (
        <section>
          <h2>Activity history</h2>
          {(state.activity?.length ?? 0) === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <ol aria-label="Activity history entries">
              {[...(state.activity ?? [])].reverse().map((entry) => (
                <li key={entry.sequence}>
                  <time dateTime={entry.occurredAt}>{entry.occurredAt}</time>{' '}
                  {describeTaskActivityEntry(entry)}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      {onAddTaskAttachment && onDeleteTaskAttachment ? (
        <p>Attachment metadata only. File content is not stored.</p>
      ) : null}

      <button type="button" className="workspace-disclosure-button" aria-controls="workspace-filters"
        aria-expanded={showTaskFilters} onClick={() => setShowTaskFilters(value => !value)}>
        {showTaskFilters ? "Hide task filters" : "Show task filters"}
      </button>
      <div id="workspace-filters" role="region" aria-label="Task filters and sorting" className="workspace-filters" hidden={!showTaskFilters}>
      <label htmlFor="project-view">View project</label>
      <select
        id="project-view"
        value={effectiveProjectView}
        onChange={(event) => updatePreferences({ projectView: event.target.value })}
      >
        <option value="all">All projects</option>
        {activeProjects.map((project) => {
          const taskCount = activeTasks.filter(
            (task) => task.projectId === project.id,
          ).length

          return (
            <option key={project.id} value={project.id}>
              {project.name} ({taskCount} tasks)
            </option>
          )
        })}
      </select>

      {error ? <p role="alert">{error}</p> : null}
      <p role="status" aria-label="Task reorder result" aria-live="polite">{taskReorderResult}</p>
      <p role="status" aria-label="Board drag result" aria-live="polite">{boardDragResult}</p>
      {boardDragResult ? (
        <button type="button" onClick={() => setBoardDragResult('')}>Dismiss Board status message</button>
      ) : null}
      {taskViewMode === 'board' && lastBoardStatusChange && onChangeTaskStatus ? (
        <button type="button" title={`Undo status change for ${lastBoardStatusChange.taskTitle} to ${lastBoardStatusChange.previousStatus === 'todo' ? 'To do' : lastBoardStatusChange.previousStatus === 'doing' ? 'Doing' : 'Done'}`} onClick={() => {
          onChangeTaskStatus(lastBoardStatusChange.taskId, lastBoardStatusChange.previousStatus)
          setBoardDragResult(`Restored ${lastBoardStatusChange.taskTitle} to ${lastBoardStatusChange.previousStatus === 'todo' ? 'To do' : lastBoardStatusChange.previousStatus === 'doing' ? 'Doing' : 'Done'}`)
          setLastBoardStatusChange(null)
        }}>Undo Board status change</button>
      ) : null}

      <label htmlFor="task-search">Search tasks</label>
      <small className="task-search-shortcut-hint">Press / to search tasks</small>
      <small className="task-search-shortcut-hint">Or use Ctrl+K / Cmd+K</small>
      <input
        aria-keyshortcuts="/ Control+K Meta+K"
        id="task-search"
        type="search"
        enterKeyHint="search"
        ref={taskSearchRef}
        value={searchQuery}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            if (searchQuery !== '') {
              updateFilterSortPreferences({ query: '' })
            } else {
              event.currentTarget.blur()
            }
          }
        }}
        onChange={(event) =>
          updateFilterSortPreferences({ query: event.target.value })
        }
      />

      <button type="button" disabled={searchQuery === ''} onClick={() => {
        updateFilterSortPreferences({ query: '' })
        taskSearchRef.current?.focus()
      }}>
        Clear task search
      </button>

      <label htmlFor="task-status-filter">Filter by status</label>
      <select
        id="task-status-filter"
        value={statusFilter}
        onChange={(event) =>
          updateFilterSortPreferences({
            status: event.target.value as TaskStatus | 'all',
          })
        }
      >
        <option value="all">All statuses</option>
        <option value="todo">To do</option>
        <option value="doing">Doing</option>
        <option value="done">Done</option>
      </select>

      <label htmlFor="task-priority-filter">Filter by priority</label>
      <select
        id="task-priority-filter"
        value={priorityFilter}
        onChange={(event) =>
          updateFilterSortPreferences({
            priority: event.target.value as TaskPriority | 'all',
          })
        }
      >
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>



      <label htmlFor="custom-field-filter">Custom field filter</label>
      <select
        id="custom-field-filter"
        value={customFieldFilterSelectValue}
        onChange={(event) => {
          const fieldId = event.target.value
          setCustomFieldFilterFieldId(fieldId)

          if (fieldId === '') {
            clearCustomFieldFilter()
            return
          }

          const field = customFields.find(
            (candidate) => candidate.id === fieldId,
          )

          if (!field) {
            clearCustomFieldFilter()
            return
          }

          if (field.type === 'checkbox') {
            setCustomFieldFilterDraftValues((current) => ({
              ...current,
              [field.id]: 'false',
            }))
            changeCustomFieldFilter(field, false)
            return
          }

          setCustomFieldFilterDraftValues((current) => ({
            ...current,
            [field.id]: '',
          }))
          clearCustomFieldFilter()
        }}
      >
        <option value="">No custom field filter</option>
        {filterableCustomFields.map((field) => (
          <option key={field.id} value={field.id}>
            {field.name}
          </option>
        ))}
      </select>

      {customFieldFilterControlField?.type === 'select' ? (
        <label>
          Filter custom field {customFieldFilterControlField.name}
          <select
            aria-label={`Filter custom field ${customFieldFilterControlField.name}`}
            value={customFieldFilterControlValue}
            onChange={(event) => {
              const value = event.target.value
              setCustomFieldFilterDraftValues((current) => ({
                ...current,
                [customFieldFilterControlField.id]: value,
              }))

              if (value === '') {
                clearCustomFieldFilter()
              } else {
                changeCustomFieldFilter(customFieldFilterControlField, value)
              }
            }}
          >
            <option value="">Choose option</option>
            {(customFieldFilterControlField.options ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      ) : customFieldFilterControlField?.type === 'checkbox' ? (
        <label>
          <input
            type="checkbox"
            aria-label={`Filter custom field ${customFieldFilterControlField.name}`}
            checked={
              effectiveCustomFieldFilter?.fieldId ===
                customFieldFilterControlField.id &&
              effectiveCustomFieldFilter.value === true
            }
            onChange={(event) => {
              setCustomFieldFilterDraftValues((current) => ({
                ...current,
                [customFieldFilterControlField.id]: String(
                  event.target.checked,
                ),
              }))
              changeCustomFieldFilter(
                customFieldFilterControlField,
                event.target.checked,
              )
            }}
          />
          Filter custom field {customFieldFilterControlField.name}
        </label>
      ) : customFieldFilterControlField ? (
        <label>
          Filter custom field {customFieldFilterControlField.name}
          <input
            aria-label={`Filter custom field ${customFieldFilterControlField.name}`}
            type={
              customFieldFilterControlField.type === 'number'
                ? 'number'
                : customFieldFilterControlField.type === 'date'
                  ? 'date'
                  : 'text'
            }
            value={customFieldFilterControlValue}
            onChange={(event) => {
              const rawValue = event.target.value
              setCustomFieldFilterDraftValues((current) => ({
                ...current,
                [customFieldFilterControlField.id]: rawValue,
              }))

              if (rawValue === '' || rawValue.trim() === '') {
                clearCustomFieldFilter()
                return
              }

              if (customFieldFilterControlField.type === 'number') {
                const numericValue = Number(rawValue)

                if (!Number.isFinite(numericValue)) {
                  clearCustomFieldFilter()
                  return
                }

                changeCustomFieldFilter(
                  customFieldFilterControlField,
                  numericValue,
                )
                return
              }

              changeCustomFieldFilter(
                customFieldFilterControlField,
                rawValue,
              )
            }}
          />
        </label>
      ) : null}

      <label htmlFor="task-due-date-filter">Filter by due date</label>
      <select
        id="task-due-date-filter"
        value={dueDateFilter}
        onChange={(event) =>
          updateFilterSortPreferences({
            dueDate: event.target.value as TaskDueDateFilter,
          })
        }
      >
        <option value="all">All due dates</option>
        <option value="withDueDate">With due date</option>
        <option value="withoutDueDate">Without due date</option>
      </select>



      <label htmlFor="task-sort">Sort tasks</label>
      <select
        id="task-sort"
        value={
          activeCustomFieldSortField
            ? `custom:${activeCustomFieldSortField.id}`
            : taskSort
        }
        onChange={(event) => {
          const value = event.target.value

          if (value.startsWith('custom:')) {
            updateFilterSortPreferences({
              customFieldSortFieldId: value.slice('custom:'.length),
            })
            return
          }

          updateFilterSortPreferences({
            sort: value as TaskSort,
            customFieldSortFieldId: undefined,
          })
        }}
      >
        <option value="created">Created</option>
        <option value="title">Title</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
        <option value="manual">Manual</option>
        {filterableCustomFields.map((field) => (
          <option key={field.id} value={`custom:${field.id}`}>
            Custom field: {field.name}
          </option>
        ))}
      </select>

      <label htmlFor="task-view">Task view</label>
      <select
        id="task-view"
        value={taskViewMode}
        onChange={(event) =>
          changeTaskViewMode(event.target.value as TaskViewMode)
        }
      >
        <option value="list">List</option>
        <option value="board">Board</option>
        <option value="calendar">Calendar</option>
        <option value="table">Table</option>
        <option value="timeline">Timeline</option>
        <option value="gantt">Gantt</option>
      </select>

      <label htmlFor="task-group">Group tasks</label>
      <select
        id="task-group"
        value={taskGroup}
        onChange={(event) =>
          updatePreferences({ group: event.target.value as TaskGroup })
        }
      >
        <option value="none">None</option>
        <option value="status">Status</option>
        <option value="priority">Priority</option>
        <option value="list">List</option>
      </select>

      <label>
        <input
          type="checkbox"
          aria-label="Select all visible tasks"
          checked={allVisibleTasksSelected}
          onChange={(event) =>
            changeAllVisibleTaskSelection(event.target.checked)
          }
        />
        Select all visible tasks
      </label>
      {activeProjects.length > 0 && activeTasks.length === 0 ? (
        <p role="status" aria-label="No tasks in workspace">No tasks yet. Add a task to a project below.</p>
      ) : null}
      {visibleTaskIds.length === 0 && activeTasks.length > 0 ? (
        <div role="status" aria-label="No matching tasks">
          <p>No tasks match the current filters.</p>
          <button type="button" onClick={() => {
            setCustomFieldFilterFieldId('')
            updateFilterSortPreferences({
              query: '', status: 'all', priority: 'all', dueDate: 'all',
              customFieldFilter: undefined,
            })
          }}>Clear filters and show tasks</button>
        </div>
      ) : null}
      <span role="status" aria-label="Visible task count">
        {visibleTaskIds.length} visible {visibleTaskIds.length === 1 ? 'task' : 'tasks'}
      </span>
      <span>
        {selectedVisibleTaskIds.length}{' '}
        {selectedVisibleTaskIds.length === 1 ? 'task' : 'tasks'} selected
      </span>
      {onRestoreTasks ? (
        <span>
          {selectedVisibleArchivedTaskIds.length}{' '}
          {selectedVisibleArchivedTaskIds.length === 1
            ? 'archived task'
            : 'archived tasks'}{' '}
          selected
        </span>
      ) : null}

      {bulkSelectionMode ? (
        <button
          type="button"
          onClick={() => {
            setSelectedTaskIds([])
            setBulkDeletePending(false)
            setBulkSelectionMode(false)
          }}
        >
          Exit bulk selection mode
        </button>
      ) : null}

      {onChangeTasksStatus ? (
        <>
          <label htmlFor="bulk-task-status">Bulk status</label>
          <select
            id="bulk-task-status"
            value={bulkStatus}
            onChange={(event) =>
              setBulkStatus(event.target.value as TaskStatus)
            }
          >
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksStatus(selectedVisibleTaskIds, bulkStatus),
              )
            }
          >
            Apply bulk status
          </button>
        </>
      ) : null}

      {onChangeTasksPriority ? (
        <>
          <label htmlFor="bulk-task-priority">Bulk priority</label>
          <select
            id="bulk-task-priority"
            value={bulkPriority}
            onChange={(event) =>
              setBulkPriority(event.target.value as TaskPriority)
            }
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksPriority(selectedVisibleTaskIds, bulkPriority),
              )
            }
          >
            Apply bulk priority
          </button>
        </>
      ) : null}

      {onChangeTasksTag && tags.length > 0 ? (
        <>
          <label htmlFor="bulk-task-tag">Bulk tag</label>
          <select
            id="bulk-task-tag"
            value={bulkTagId}
            onChange={(event) => setBulkTagId(event.target.value)}
          >
            <option value="">Choose tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0 || bulkTagId === ''}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksTag(selectedVisibleTaskIds, bulkTagId, true),
              )
            }
          >
            Add bulk tag
          </button>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0 || bulkTagId === ''}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksTag(selectedVisibleTaskIds, bulkTagId, false),
              )
            }
          >
            Remove bulk tag
          </button>
        </>
      ) : null}

      {onChangeTasksAssignee && people.length > 0 ? (
        <>
          <label htmlFor="bulk-task-assignee">Bulk assignee</label>
          <select
            id="bulk-task-assignee"
            value={bulkPersonId}
            onChange={(event) => setBulkPersonId(event.target.value)}
          >
            <option value="">Choose person</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0 || bulkPersonId === ''}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksAssignee(
                  selectedVisibleTaskIds,
                  bulkPersonId,
                  true,
                ),
              )
            }
          >
            Assign bulk person
          </button>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0 || bulkPersonId === ''}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksAssignee(
                  selectedVisibleTaskIds,
                  bulkPersonId,
                  false,
                ),
              )
            }
          >
            Unassign bulk person
          </button>
        </>
      ) : null}

      {onChangeTasksStartDate ? (
        <>
          <label htmlFor="bulk-task-start-date">Bulk start date</label>
          <input
            id="bulk-task-start-date"
            type="date"
            value={bulkStartDate}
            onChange={(event) => setBulkStartDate(event.target.value)}
          />
          <button
            type="button"
            disabled={
              selectedVisibleTaskIds.length === 0 || bulkStartDate === ''
            }
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksStartDate(
                  selectedVisibleTaskIds,
                  bulkStartDate,
                ),
              )
            }
          >
            Apply bulk start date
          </button>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksStartDate(selectedVisibleTaskIds, null),
              )
            }
          >
            Clear bulk start date
          </button>
        </>
      ) : null}

      {onChangeTasksDueDate ? (
        <>
          <label htmlFor="bulk-task-due-date">Bulk due date</label>
          <input
            id="bulk-task-due-date"
            type="date"
            value={bulkDueDate}
            onChange={(event) => setBulkDueDate(event.target.value)}
          />
          <button
            type="button"
            disabled={
              selectedVisibleTaskIds.length === 0 || bulkDueDate === ''
            }
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksDueDate(
                  selectedVisibleTaskIds,
                  bulkDueDate,
                ),
              )
            }
          >
            Apply bulk due date
          </button>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksDueDate(selectedVisibleTaskIds, null),
              )
            }
          >
            Clear bulk due date
          </button>
        </>
      ) : null}

      {onChangeTasksCustomFieldValue && editableBulkCustomFields.length > 0 ? (
        <>
          <label htmlFor="bulk-task-custom-field">Bulk custom field</label>
          <select
            id="bulk-task-custom-field"
            value={bulkCustomField?.id ?? ''}
            onChange={(event) => {
              setBulkCustomFieldId(event.target.value)
              setBulkCustomFieldValue('')
              setBulkCustomFieldChecked(false)
            }}
          >
            <option value="">Choose custom field</option>
            {editableBulkCustomFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>

          {bulkCustomField?.type === 'select' ? (
            <>
              <label htmlFor="bulk-task-custom-field-select-value">
                Bulk custom field value
              </label>
              <select
                id="bulk-task-custom-field-select-value"
                value={bulkCustomFieldValue}
                onChange={(event) => setBulkCustomFieldValue(event.target.value)}
              >
                <option value="">No selection</option>
                {(bulkCustomField.options ?? []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </>
          ) : bulkCustomField?.type === 'checkbox' ? (
            <>
              <label htmlFor="bulk-task-custom-field-checkbox-value">
                Bulk custom field value
              </label>
              <input
                id="bulk-task-custom-field-checkbox-value"
                type="checkbox"
                checked={bulkCustomFieldChecked}
                onChange={(event) =>
                  setBulkCustomFieldChecked(event.target.checked)
                }
              />
            </>
          ) : bulkCustomField ? (
            <>
              <label htmlFor="bulk-task-custom-field-value">
                Bulk custom field value
              </label>
              <input
                id="bulk-task-custom-field-value"
                type={
                  bulkCustomField.type === 'number'
                    ? 'number'
                    : bulkCustomField.type === 'date'
                      ? 'date'
                      : 'text'
                }
                value={bulkCustomFieldValue}
                onChange={(event) => setBulkCustomFieldValue(event.target.value)}
              />
            </>
          ) : null}

          <button
            type="button"
            disabled={
              selectedVisibleTaskIds.length === 0 ||
              bulkCustomField === null ||
              ((bulkCustomField.type === 'number' ||
                bulkCustomField.type === 'date' ||
                bulkCustomField.type === 'select') &&
                bulkCustomFieldValue === '')
            }
            onClick={() => {
              if (!bulkCustomField) {
                return
              }

              const value: CustomFieldValue =
                bulkCustomField.type === 'checkbox'
                  ? bulkCustomFieldChecked
                  : bulkCustomField.type === 'number'
                    ? Number(bulkCustomFieldValue)
                    : bulkCustomFieldValue

              runBulkAction(() =>
                onChangeTasksCustomFieldValue(
                  selectedVisibleTaskIds,
                  bulkCustomField.id,
                  value,
                ),
              )
            }}
          >
            Apply bulk custom field
          </button>
          <button
            type="button"
            disabled={
              selectedVisibleTaskIds.length === 0 || bulkCustomField === null
            }
            onClick={() => {
              if (!bulkCustomField) {
                return
              }

              runBulkAction(() =>
                onChangeTasksCustomFieldValue(
                  selectedVisibleTaskIds,
                  bulkCustomField.id,
                  null,
                ),
              )
            }}
          >
            Clear bulk custom field
          </button>
        </>
      ) : null}

      {onChangeTasksProject ? (
        <>
          <label htmlFor="bulk-task-project">Bulk project</label>
          <select
            id="bulk-task-project"
            value={bulkProjectId}
            onChange={(event) => setBulkProjectId(event.target.value)}
          >
            <option value="">Choose project</option>
            {activeProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={
              selectedVisibleTaskIds.length === 0 || bulkProjectId === ''
            }
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksProject(selectedVisibleTaskIds, bulkProjectId),
              )
            }
          >
            Move selected tasks to project
          </button>
        </>
      ) : null}

      {onChangeTasksList ? (
        <>
          <label htmlFor="bulk-task-list">Bulk list</label>
          <select
            id="bulk-task-list"
            value={bulkListValue}
            onChange={(event) => setBulkListId(event.target.value)}
          >
            <option value="">No list</option>
            {compatibleBulkLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() =>
              runBulkAction(() =>
                onChangeTasksList(
                  selectedVisibleTaskIds,
                  bulkListValue || null,
                ),
              )
            }
          >
            Apply bulk list
          </button>
          {selectedVisibleTaskIds.length > 0 &&
          selectedVisibleProjectId === null ? (
            <span>Only list clearing is available across projects.</span>
          ) : null}
        </>
      ) : null}

      {onArchiveTasks ? (
        <button
          type="button"
          disabled={selectedVisibleTaskIds.length === 0}
          onClick={() =>
            runBulkAction(() => onArchiveTasks(selectedVisibleTaskIds))
          }
        >
          Archive selected tasks
        </button>
      ) : null}

      {onDeleteTasks ? (
        <>
          <button
            type="button"
            disabled={selectedVisibleTaskIds.length === 0}
            onClick={() => setBulkDeletePending(true)}
          >
            Delete selected tasks
          </button>
          {bulkDeletePending && selectedVisibleTaskIds.length > 0 ? (
            <div role="group" aria-label="Confirm bulk task delete">
              <p>Delete {selectedVisibleTaskIds.length} selected tasks?</p>
              <button
                type="button"
                onClick={() =>
                  runBulkAction(() => onDeleteTasks(selectedVisibleTaskIds))
                }
              >
                Confirm delete selected tasks
              </button>
              <button
                type="button"
                onClick={() => setBulkDeletePending(false)}
              >
                Cancel bulk delete
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      <label htmlFor="filter-set-name">Filter set name</label>
      <input
        id="filter-set-name"
        value={filterSetName}
        onChange={(event) => setFilterSetName(event.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          try {
            const next = saveTaskFilterSet(viewPreferences, filterSetName)
            setViewPreferences(next)
            onViewPreferencesChange?.(next)
            setFilterSetName('')
            setError(null)
          } catch (caught) {
            setError(errorMessage(caught))
          }
        }}
      >
        Save current filters
      </button>

      {savedFilterSets.length > 0 ? (
        <section>
          <h2>Saved filter sets</h2>
          <ul>
            {savedFilterSets.map((filterSet) => (
              <li key={filterSet.name}>
                <span>{filterSet.name}</span>
                <button
                  type="button"
                  aria-label={`Apply saved filter set ${filterSet.name}`}
                  onClick={() => {
                    try {
                      const next = applyTaskFilterSet(
                        viewPreferences,
                        filterSet.name,
                      )
                      setViewPreferences(next)
                      syncCustomFieldFilterEditor(next)
                      onViewPreferencesChange?.(next)
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  aria-label={`Delete saved filter set ${filterSet.name}`}
                  onClick={() => {
                    try {
                      const next = deleteTaskFilterSet(
                        viewPreferences,
                        filterSet.name,
                      )
                      setViewPreferences(next)
                      syncCustomFieldFilterEditor(next)
                      onViewPreferencesChange?.(next)
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <label htmlFor="saved-view-name">Saved view name</label>
      <input
        id="saved-view-name"
        value={savedViewName}
        onChange={(event) => setSavedViewName(event.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          try {
            const next = saveTaskView(viewPreferences, savedViewName)
            setViewPreferences(next)
            onViewPreferencesChange?.(next)
            setSavedViewName('')
            setError(null)
          } catch (caught) {
            setError(errorMessage(caught))
          }
        }}
      >
        Save current view
      </button>

      {savedViews.length > 0 ? (
        <section>
          <h2>Saved views</h2>
          <ul>
            {savedViews.map((savedView) => (
              <li key={savedView.name}>
                <span>{savedView.name}</span>
                <button
                  type="button"
                  aria-label={`Apply saved view ${savedView.name}`}
                  onClick={() => {
                    try {
                      const next = applyTaskView(
                        viewPreferences,
                        savedView.name,
                      )
                      setViewPreferences(next)
                      syncCustomFieldFilterEditor(next)
                      onViewPreferencesChange?.(next)
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  aria-label={`Delete saved view ${savedView.name}`}
                  onClick={() => {
                    try {
                      const next = deleteTaskView(
                        viewPreferences,
                        savedView.name,
                      )
                      setViewPreferences(next)
                      onViewPreferencesChange?.(next)
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setCustomFieldFilterFieldId('')
          updateFilterSortPreferences({
            query: '',
            status: 'all',
            priority: 'all',
            dueDate: 'all',
            customFieldFilter: undefined,
          })
        }}
      >
        Clear task filters
      </button>

      </div>
      <button type="button" className="workspace-disclosure-button" aria-controls="workspace-projects"
        aria-expanded={showProjects} onClick={() => setShowProjects(value => !value)}>
        {showProjects ? "Hide projects and tasks" : "Show projects and tasks"}
      </button>
      <div id="workspace-projects" role="region" aria-label="Projects and tasks" className="workspace-projects" hidden={!showProjects}>
      {onCreateArea ? (
        <section>
          <h2>Areas</h2>
          <form onSubmit={submitArea}>
            <label htmlFor="area-name">Area name</label>
            <input
              id="area-name"
              value={areaName}
              onChange={(event) => setAreaName(event.target.value)}
            />
            <button type="submit">Add area</button>
          </form>

          {areas.length === 0 ? (
            <p>No areas yet.</p>
          ) : (
            <ul>
              {areas.map((area) => {
                const editedAreaName = areaEdits[area.id] ?? area.name

                return (
                  <li key={area.id}>
                    <span>
                      {area.name} (
                      {
                        activeProjects.filter(
                          (project) => project.areaId === area.id,
                        ).length
                      }{' '}
                      {
                        activeProjects.filter(
                          (project) => project.areaId === area.id,
                        ).length === 1
                          ? 'project'
                          : 'projects'
                      }
                      )
                    </span>
                    {onMoveArea ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onMoveArea(area.id, 'up')}
                        >
                          Move area {area.name} up
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveArea(area.id, 'down')}
                        >
                          Move area {area.name} down
                        </button>
                      </>
                    ) : null}
                    {onRenameArea ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()

                          try {
                            onRenameArea(area.id, editedAreaName)
                            setAreaEdits((current) => {
                              const next = { ...current }
                              delete next[area.id]
                              return next
                            })
                            setError(null)
                          } catch (caught) {
                            setError(errorMessage(caught))
                          }
                        }}
                      >
                        <label htmlFor={`area-edit-${area.id}`}>
                          Name for area {area.name}
                        </label>
                        <input
                          id={`area-edit-${area.id}`}
                          value={editedAreaName}
                          onChange={(event) =>
                            setAreaEdits((current) => ({
                              ...current,
                              [area.id]: event.target.value,
                            }))
                          }
                        />
                        <button type="submit">
                          Save area name for {area.name}
                        </button>
                      </form>
                    ) : null}
                    {onDeleteArea ? (
                      <button
                        type="button"
                        onClick={() => onDeleteArea(area.id)}
                      >
                        Delete area {area.name}
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {onCreateCustomField ? (
        <section>
          <h2>Custom fields</h2>
          <form onSubmit={submitCustomField}>
            <label htmlFor="custom-field-name">Custom field name</label>
            <input
              id="custom-field-name"
              value={customFieldName}
              onChange={(event) =>
                setCustomFieldName(event.target.value)
              }
            />
            <label htmlFor="custom-field-type">Custom field type</label>
            <select
              id="custom-field-type"
              value={customFieldType}
              onChange={(event) =>
                setCustomFieldType(
                  event.target.value as CustomFieldType,
                )
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="checkbox">Checkbox</option>
              <option value="select">Select</option>
              <option value="date">Date</option>
              <option value="formula">Formula</option>
            </select>
            <button type="submit">Add custom field</button>
          </form>

          {customFields.length === 0 ? (
            <p>No custom fields yet.</p>
          ) : (
            <ul>
              {customFields.map((field) => {
                const editedName =
                  customFieldEdits[field.id] ?? field.name

                return (
                  <li key={field.id}>
                    <span>
                      {field.name} ({field.type})
                    </span>
                    {onRenameCustomField ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()

                          try {
                            onRenameCustomField(field.id, editedName)
                            setCustomFieldEdits((current) => {
                              const next = { ...current }
                              delete next[field.id]
                              return next
                            })
                            setError(null)
                          } catch (caught) {
                            setError(errorMessage(caught))
                          }
                        }}
                      >
                        <label htmlFor={`custom-field-edit-${field.id}`}>
                          Name for custom field {field.name}
                        </label>
                        <input
                          id={`custom-field-edit-${field.id}`}
                          value={editedName}
                          onChange={(event) =>
                            setCustomFieldEdits((current) => ({
                              ...current,
                              [field.id]: event.target.value,
                            }))
                          }
                        />
                        <button type="submit">
                          Save custom field name for {field.name}
                        </button>
                      </form>
                    ) : null}
                    {onChangeCustomFieldType ? (
                      <>
                        <label htmlFor={`custom-field-type-migrate-${field.id}`}>
                          Type for custom field {field.name}
                        </label>
                        <select
                          id={`custom-field-type-migrate-${field.id}`}
                          value={customFieldTypeMigrations[field.id] ?? field.type}
                          onChange={(event) =>
                            setCustomFieldTypeMigrations((current) => ({
                              ...current,
                              [field.id]: event.target.value as CustomFieldType,
                            }))
                          }
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="select">Select</option>
                          <option value="date">Date</option>
                          <option value="formula">Formula</option>
                        </select>
                        <button
                          type="button"
                          disabled={
                            (customFieldTypeMigrations[field.id] ?? field.type) ===
                            field.type
                          }
                          onClick={() => {
                            const nextType =
                              customFieldTypeMigrations[field.id] ?? field.type

                            if (nextType === field.type) {
                              return
                            }

                            try {
                              onChangeCustomFieldType(field.id, nextType)
                              setCustomFieldTypeMigrations((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldOptionNames((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldFormulaLeftOperands((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldFormulaOperators((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldFormulaRightOperands((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldValueDrafts((current) =>
                                Object.fromEntries(
                                  Object.entries(current).filter(
                                    ([key]) => !key.endsWith(`:${field.id}`),
                                  ),
                                ),
                              )
                              setError(null)
                            } catch (caught) {
                              setError(errorMessage(caught))
                            }
                          }}
                        >
                          Change type for {field.name} and clear Task values
                        </button>
                      </>
                    ) : null}
                    {field.type === 'select' ? (
                      <>
                        {onAddCustomFieldOption ? (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault()

                              try {
                                onAddCustomFieldOption(
                                  field.id,
                                  customFieldOptionNames[field.id] ?? '',
                                )
                                setCustomFieldOptionNames((current) => ({
                                  ...current,
                                  [field.id]: '',
                                }))
                                setError(null)
                              } catch (caught) {
                                setError(errorMessage(caught))
                              }
                            }}
                          >
                            <label
                              htmlFor={`custom-field-option-new-${field.id}`}
                            >
                              Option name for custom field {field.name}
                            </label>
                            <input
                              id={`custom-field-option-new-${field.id}`}
                              value={customFieldOptionNames[field.id] ?? ''}
                              onChange={(event) =>
                                setCustomFieldOptionNames((current) => ({
                                  ...current,
                                  [field.id]: event.target.value,
                                }))
                              }
                            />
                            <button type="submit">
                              Add option to {field.name}
                            </button>
                          </form>
                        ) : null}
                        {(field.options ?? []).length === 0 ? (
                          <p>No options yet.</p>
                        ) : (
                          <ul>
                            {(field.options ?? []).map((option) => {
                              const optionEditKey = `${field.id}:${option.id}`
                              const editedOptionName =
                                customFieldOptionEdits[optionEditKey] ??
                                option.name

                              return (
                                <li key={option.id}>
                                  <span>{option.name}</span>
                                  {onRenameCustomFieldOption ? (
                                    <form
                                      onSubmit={(event) => {
                                        event.preventDefault()

                                        try {
                                          onRenameCustomFieldOption(
                                            field.id,
                                            option.id,
                                            editedOptionName,
                                          )
                                          setCustomFieldOptionEdits(
                                            (current) => {
                                              const next = { ...current }
                                              delete next[optionEditKey]
                                              return next
                                            },
                                          )
                                          setError(null)
                                        } catch (caught) {
                                          setError(errorMessage(caught))
                                        }
                                      }}
                                    >
                                      <label
                                        htmlFor={`custom-field-option-edit-${field.id}-${option.id}`}
                                      >
                                        Name for option {option.name} in custom field {field.name}
                                      </label>
                                      <input
                                        id={`custom-field-option-edit-${field.id}-${option.id}`}
                                        value={editedOptionName}
                                        onChange={(event) =>
                                          setCustomFieldOptionEdits(
                                            (current) => ({
                                              ...current,
                                              [optionEditKey]: event.target.value,
                                            }),
                                          )
                                        }
                                      />
                                      <button type="submit">
                                        Save option name {option.name} in {field.name}
                                      </button>
                                    </form>
                                  ) : null}
                                  {onDeleteCustomFieldOption ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onDeleteCustomFieldOption(
                                          field.id,
                                          option.id,
                                        )
                                      }
                                    >
                                      Delete option {option.name} from {field.name}
                                    </button>
                                  ) : null}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </>
                    ) : null}
                    {field.type === 'formula' && onConfigureCustomFieldFormula ? (
                      <>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault()

                            const leftFieldId =
                              customFieldFormulaLeftOperands[field.id] ??
                              field.formula?.leftFieldId ??
                              ''
                            const operator =
                              customFieldFormulaOperators[field.id] ??
                              field.formula?.operator ??
                              '+'
                            const rightFieldId =
                              customFieldFormulaRightOperands[field.id] ??
                              field.formula?.rightFieldId ??
                              ''

                            try {
                              onConfigureCustomFieldFormula(field.id, {
                                leftFieldId,
                                operator,
                                rightFieldId,
                              })
                              setError(null)
                            } catch (caught) {
                              setError(errorMessage(caught))
                            }
                          }}
                        >
                          <label htmlFor={`formula-left-${field.id}`}>
                            Left operand for formula {field.name}
                          </label>
                          <select
                            id={`formula-left-${field.id}`}
                            value={
                              customFieldFormulaLeftOperands[field.id] ??
                              field.formula?.leftFieldId ??
                              ''
                            }
                            onChange={(event) =>
                              setCustomFieldFormulaLeftOperands((current) => ({
                                ...current,
                                [field.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Choose field</option>
                            {customFields
                              .filter(
                                (candidate) =>
                                  candidate.id !== field.id &&
                                  (candidate.type === 'number' ||
                                    candidate.type === 'formula'),
                              )
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {candidate.name}
                                </option>
                              ))}
                          </select>
                          <label htmlFor={`formula-operator-${field.id}`}>
                            Operator for formula {field.name}
                          </label>
                          <select
                            id={`formula-operator-${field.id}`}
                            value={
                              customFieldFormulaOperators[field.id] ??
                              field.formula?.operator ??
                              '+'
                            }
                            onChange={(event) =>
                              setCustomFieldFormulaOperators((current) => ({
                                ...current,
                                [field.id]: event.target.value as CustomFieldFormulaOperator,
                              }))
                            }
                          >
                            <option value="+">+</option>
                            <option value="-">-</option>
                            <option value="*">*</option>
                            <option value="/">/</option>
                          </select>
                          <label htmlFor={`formula-right-${field.id}`}>
                            Right operand for formula {field.name}
                          </label>
                          <select
                            id={`formula-right-${field.id}`}
                            value={
                              customFieldFormulaRightOperands[field.id] ??
                              field.formula?.rightFieldId ??
                              ''
                            }
                            onChange={(event) =>
                              setCustomFieldFormulaRightOperands((current) => ({
                                ...current,
                                [field.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="">Choose field</option>
                            {customFields
                              .filter(
                                (candidate) =>
                                  candidate.id !== field.id &&
                                  (candidate.type === 'number' ||
                                    candidate.type === 'formula'),
                              )
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {candidate.name}
                                </option>
                              ))}
                          </select>
                          <button type="submit">
                            Configure formula {field.name}
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              onConfigureCustomFieldFormula(field.id, null)
                              setCustomFieldFormulaLeftOperands((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldFormulaOperators((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setCustomFieldFormulaRightOperands((current) => {
                                const next = { ...current }
                                delete next[field.id]
                                return next
                              })
                              setError(null)
                            } catch (caught) {
                              setError(errorMessage(caught))
                            }
                          }}
                        >
                          Clear formula {field.name}
                        </button>
                      </>
                    ) : null}
                    {onDeleteCustomField ? (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomField(field.id)}
                      >
                        Delete custom field {field.name}
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {onCreatePerson ? (
        <section>
          <h2>People</h2>
          <form onSubmit={submitPerson}>
            <label htmlFor="person-name">Person name</label>
            <input
              id="person-name"
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
            />
            <button type="submit">Add person</button>
          </form>

          {people.length === 0 ? (
            <p>No people yet.</p>
          ) : (
            <ul>
              {people.map((person) => {
                const editedPersonName =
                  personEdits[person.id] ?? person.name

                return (
                  <li key={person.id}>
                    <span>{person.name}</span>
                    {onRenamePerson ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()

                          try {
                            onRenamePerson(person.id, editedPersonName)
                            setPersonEdits((current) => {
                              const next = { ...current }
                              delete next[person.id]
                              return next
                            })
                            setError(null)
                          } catch (caught) {
                            setError(errorMessage(caught))
                          }
                        }}
                      >
                        <label htmlFor={`person-edit-${person.id}`}>
                          Name for person {person.name}
                        </label>
                        <input
                          id={`person-edit-${person.id}`}
                          value={editedPersonName}
                          onChange={(event) =>
                            setPersonEdits((current) => ({
                              ...current,
                              [person.id]: event.target.value,
                            }))
                          }
                        />
                        <button type="submit">
                          Save person name for {person.name}
                        </button>
                      </form>
                    ) : null}
                    {onDeletePerson ? (
                      <button
                        type="button"
                        onClick={() => onDeletePerson(person.id)}
                      >
                        Delete person {person.name}
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {onCreateTag ? (
        <section>
          <h2>Tags</h2>
          <form onSubmit={submitTag}>
            <label htmlFor="tag-name">Tag name</label>
            <input
              id="tag-name"
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
            />
            <button type="submit">Add tag</button>
          </form>

          {tags.length === 0 ? (
            <p>No tags yet.</p>
          ) : (
            <ul>
              {tags.map((tag) => {
                const editedTagName = tagEdits[tag.id] ?? tag.name

                return (
                  <li key={tag.id}>
                    <span>{tag.name}</span>
                    {onRenameTag ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()

                          try {
                            onRenameTag(tag.id, editedTagName)
                            setTagEdits((current) => {
                              const next = { ...current }
                              delete next[tag.id]
                              return next
                            })
                            setError(null)
                          } catch (caught) {
                            setError(errorMessage(caught))
                          }
                        }}
                      >
                        <label htmlFor={`tag-edit-${tag.id}`}>
                          Name for tag {tag.name}
                        </label>
                        <input
                          id={`tag-edit-${tag.id}`}
                          value={editedTagName}
                          onChange={(event) =>
                            setTagEdits((current) => ({
                              ...current,
                              [tag.id]: event.target.value,
                            }))
                          }
                        />
                        <button type="submit">
                          Save tag name for {tag.name}
                        </button>
                      </form>
                    ) : null}
                    {onDeleteTag ? (
                      <button
                        type="button"
                        onClick={() => onDeleteTag(tag.id)}
                      >
                        Delete tag {tag.name}
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {activeProjects.length === 0 ? (
        <div role="status" aria-label="Empty workspace guidance" className="workspace-empty-guidance">
          <p>Create your first project to organize tasks and lists.</p>
          <a href="#project-create">Go to project creation</a>
        </div>
      ) : null}
      <span id="project-create" />
      {onCreateProject ? (
        <form onSubmit={submitProject}>
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
          <button type="submit">Add project</button>
        </form>
      ) : null}

      {taskViewMode === 'gantt' && activeProjects.length > 0 ? (
        <button
          type="button"
          aria-pressed={ganttOverviewCriticalOnly}
          onClick={() => {
            setGanttOverviewCriticalOnly((current) => !current)
            setGanttOverviewWorkingCriticalOnly(false)
          }}
        >
          Critical tasks only in Gantt overview
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 ? (
        <button
          type="button"
          aria-pressed={ganttShowLogicalOffsets}
          onClick={() => setGanttShowLogicalOffsets((current) => !current)}
        >
          Show Gantt logical offsets
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 ? (
        <button type="button" aria-pressed={ganttShowWorkingDays}
          onClick={() => {
            setGanttShowWorkingDays((current) => !current)
            setGanttOverviewWorkingCriticalOnly(false)
          }}>
          Show Gantt working-day analysis
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 && ganttShowWorkingDays ? (
        <button type="button" aria-pressed={ganttShowProjectedWorkingDates}
          onClick={() => setGanttShowProjectedWorkingDates((current) => !current)}>
          Show Gantt projected working dates
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 && ganttShowWorkingDays ? (
        <button type="button" aria-pressed={ganttSundayThursdayWeek}
          onClick={() => {
            const next = !ganttSundayThursdayWeek
            setGanttSundayThursdayWeek(next)
            updatePreferences({ ganttWorkingWeek: next ? 'sun-thu' : 'mon-fri' })
          }}>
          Use Sunday-Thursday Gantt workweek
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 && ganttShowWorkingDays ? (
        <div>
          <label>
            Gantt non-working date
            <input type="date" value={ganttNonWorkingDateDraft}
              onChange={(event) => setGanttNonWorkingDateDraft(event.target.value)} />
          </label>
          <button type="button"
            disabled={!ganttNonWorkingDateDraft || ganttNonWorkingDates.includes(ganttNonWorkingDateDraft)}
            onClick={() => {
              try {
                const next = normalizeTaskGanttNonWorkingDates([...ganttNonWorkingDates, ganttNonWorkingDateDraft])
                setGanttNonWorkingDates(next)
                updatePreferences({ ganttNonWorkingDates: next })
                setGanttNonWorkingDateDraft('')
                setError(null)
              } catch (caught) {
                setError(errorMessage(caught))
              }
            }}>
            Add Gantt non-working date
          </button>
          {ganttNonWorkingDates.length > 0 ? (
            <ul aria-label="Gantt non-working dates">
              {ganttNonWorkingDates.map((date) => (
                <li key={date}>
                  {date}
                  <button type="button" onClick={() => {
                    const next = ganttNonWorkingDates.filter((candidate) => candidate !== date)
                    setGanttNonWorkingDates(next)
                    updatePreferences({ ganttNonWorkingDates: next })
                  }}>
                    Remove Gantt non-working date {date}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 && ganttShowWorkingDays ? (
        <button type="button" aria-pressed={ganttOverviewWorkingCriticalOnly}
          onClick={() => {
            setGanttOverviewWorkingCriticalOnly((current) => !current)
            setGanttOverviewCriticalOnly(false)
          }}>
          Working-day critical tasks only in Gantt overview
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 && ganttShowWorkingDays ? (
        <button type="button" onClick={selectVisibleWorkingCriticalGanttTasks}>
          Select visible working-day critical Gantt tasks
        </button>
      ) : null}
      {taskViewMode === 'gantt' && activeProjects.length > 0 ? (
        <button type="button" onClick={selectVisibleCriticalGanttTasks}>
          Select visible critical Gantt tasks
        </button>
      ) : null}

      {activeProjects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        visibleProjects.map((project) => {
          const projectLists = lists.filter(
            (list) => list.projectId === project.id,
          )
          const projectTasks = activeTasks.filter(
            (task) => task.projectId === project.id,
          )
          const tasks = sortTasks(
            filterTasks(
              projectTasks,
              {
                query: searchQuery,
                status: statusFilter,
                priority: priorityFilter,
                dueDate: dueDateFilter,
                customField: effectiveCustomFieldFilter,
              },
              customFields,
            ),
            taskSort,
            customFields,
            effectiveCustomFieldSort,
          )
          const taskGroups = groupTasks(tasks, taskGroup, projectLists)
          const boardColumns = createTaskBoardColumns(tasks)
          const calendarSections = createTaskCalendarSections(tasks)
          const tableRows = createTaskTableRows(tasks, projectLists)
          const timelineItems = createTaskTimelineItems(tasks)
          const ganttItems = createTaskGanttItems(tasks)
          const ganttDependencyEdges = createTaskGanttDependencyEdges(
            tasks,
            relationships,
          )
          const ganttCriticalPath = taskViewMode === 'gantt'
            ? createTaskGanttCriticalPath(tasks, relationships)
            : null
          const ganttCriticalRows = new Map(
            (ganttCriticalPath?.rows ?? []).map((row) => [row.taskId, row] as const),
          )
          const ganttWorkingPath = taskViewMode === 'gantt' && ganttShowWorkingDays
            ? createTaskGanttWorkingCriticalPath(tasks, relationships, ganttNonWorkingDates, ganttWorkingWeekdays)
            : null
          const ganttWorkingRows = new Map(
            (ganttWorkingPath?.rows ?? []).map((row) => [row.taskId, row] as const),
          )
          const ganttAnchorDate = tasks
            .filter((task) => task.startDate !== undefined && task.dueDate !== undefined)
            .map((task) => task.startDate!)
            .sort()[0]
          const ganttProjectedWorkingDates = ganttShowWorkingDays && ganttShowProjectedWorkingDates && ganttAnchorDate
            ? createTaskGanttWorkingDateProjection(
                tasks, relationships, ganttAnchorDate, ganttNonWorkingDates, ganttWorkingWeekdays,
              )
            : null
          const ganttProjectedWorkingRows = new Map(
            (ganttProjectedWorkingDates?.rows ?? []).map((row) => [row.taskId, row] as const),
          )
          const ganttOverviewItems = ganttOverviewWorkingCriticalOnly
            ? ganttItems.filter((item) => ganttWorkingRows.get(item.task.id)?.isCritical)
            : ganttOverviewCriticalOnly
              ? ganttItems.filter((item) => ganttCriticalRows.get(item.task.id)?.isCritical)
              : ganttItems
          const ganttOverviewIds = new Set(ganttOverviewItems.map((item) => item.task.id))
          const ganttOverviewEdges = ganttOverviewCriticalOnly || ganttOverviewWorkingCriticalOnly
            ? ganttDependencyEdges.filter(
                (edge) => ganttOverviewIds.has(edge.sourceTaskId) && ganttOverviewIds.has(edge.targetTaskId),
              )
            : ganttDependencyEdges
          const ganttScheduleConflicts = taskViewMode === 'gantt'
            ? createTaskGanttScheduleConflicts(tasks, relationships)
            : []
          const ganttTaskNames = new Map(tasks.map((task) => [task.id, task.title] as const))
          const taskEntries =
            taskViewMode === 'board'
              ? boardColumns.flatMap((column) => [
                  {
                    type: 'board-column' as const,
                    key: column.key,
                    label: column.label,
                    count: column.tasks.length,
                  },
                  ...column.tasks.map((task) => ({
                    type: 'task' as const,
                    task,
                  })),
                ])
              : taskViewMode === 'calendar'
                ? calendarSections.flatMap((section) => [
                    {
                      type: 'calendar-section' as const,
                      key: section.key,
                      label: section.label,
                    },
                    ...section.tasks.map((task) => ({
                      type: 'task' as const,
                      task,
                    })),
                  ])
                : taskViewMode === 'timeline'
                  ? timelineItems.map((item) => ({
                      type: 'task' as const,
                      task: item.task,
                    }))
                  : taskViewMode === 'gantt'
                    ? ganttItems.map((item) => ({
                        type: 'task' as const,
                        task: item.task,
                      }))
                  : taskViewMode === 'table'
                    ? tasks.map((task) => ({ type: 'task' as const, task }))
                    : taskGroup === 'none'
                ? tasks.map((task) => ({ type: 'task' as const, task }))
                : taskGroups.flatMap((group) => [
                    {
                      type: 'group' as const,
                      key: group.key,
                      label: group.label,
                    },
                    ...group.tasks.map((task) => ({
                      type: 'task' as const,
                      task,
                    })),
                  ])
          const listName = listNames[project.id] ?? ''
          const taskTitle = taskTitles[project.id] ?? ''
          const newTaskListId = newTaskLists[project.id] ?? ''
          const editedProjectName = projectEdits[project.id] ?? project.name
          const editedProjectDescription =
            projectDescriptions[project.id] ?? project.description ?? ''
          const projectSummary = summarizeTasks(projectTasks)

          return (
            <section key={project.id}>
              <h2>{project.name}</h2>
              {onMoveProjectBefore ? (
                <div className="workspace-native-drag">
                  <button type="button" draggable aria-label={`Drag project ${project.name}`}
                    onDragStart={event => {
                      event.dataTransfer.setData('application/x-uduzgak-project',project.id)
                      event.dataTransfer.effectAllowed='move'
                    }}>Drag project {project.name}</button>
                  {onMoveProjectAfter ? (
                    <button type="button" aria-label={`Drop after project ${project.name}`}
                      onDragOver={event=>event.preventDefault()}
                      onDrop={event=>{
                        event.preventDefault()
                        const source=event.dataTransfer.getData('application/x-uduzgak-project')
                        if(source && source!==project.id)onMoveProjectAfter(source,project.id)
                      }}>Drop after project {project.name}</button>
                  ) : null}
                  <button type="button" aria-label={`Drop before project ${project.name}`}
                    onDragOver={event=>event.preventDefault()}
                    onDrop={event=>{
                      event.preventDefault()
                      const source=event.dataTransfer.getData('application/x-uduzgak-project')
                      if(source && source!==project.id)onMoveProjectBefore(source,project.id)
                    }}>Drop before project {project.name}</button>
                </div>
              ) : null}
              {onMoveProjectBefore ? (
                <div className="workspace-reorder-controls" aria-label={`Reorder project ${project.name}`}>
                  {activeProjects.filter(p=>p.id!==project.id && p.areaId===project.areaId).map(candidate=>(
                    <button key={candidate.id} type="button" onClick={()=>onMoveProjectBefore(project.id,candidate.id)}>
                      Move project {project.name} before {candidate.name}
                    </button>
                  ))}
                </div>
              ) : null}
              {onMoveProject ? (
                <>
                  <button
                    type="button"
                    onClick={() => onMoveProject(project.id, 'up')}
                  >
                    Move project {project.name} up
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveProject(project.id, 'down')}
                  >
                    Move project {project.name} down
                  </button>
                </>
              ) : null}
              <p className="project-summary">
                {projectSummary.done} of {projectSummary.total} tasks done
              </p>

              <p className="project-visible-count">
                Showing {tasks.length} of {projectTasks.length} tasks
              </p>

              {onChangeProjectArea ? (
                <>
                  <label htmlFor={`project-area-${project.id}`}>
                    Area for {project.name}
                  </label>
                  <select
                    id={`project-area-${project.id}`}
                    value={project.areaId ?? ''}
                    onChange={(event) =>
                      onChangeProjectArea(
                        project.id,
                        event.target.value || null,
                      )
                    }
                  >
                    <option value="">No area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}

              {onRenameProject ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()

                    try {
                      onRenameProject(project.id, editedProjectName)
                      setProjectEdits((current) => {
                        const next = { ...current }
                        delete next[project.id]
                        return next
                      })
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  <label htmlFor={`project-edit-${project.id}`}>
                    Name for {project.name}
                  </label>
                  <input
                    id={`project-edit-${project.id}`}
                    value={editedProjectName}
                    onChange={(event) =>
                      setProjectEdits((current) => ({
                        ...current,
                        [project.id]: event.target.value,
                      }))
                    }
                  />
                  <button type="submit">
                    Save project name for {project.name}
                  </button>
                </form>
              ) : null}

              {onChangeProjectDescription ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()

                    onChangeProjectDescription(
                      project.id,
                      editedProjectDescription || null,
                    )
                    setProjectDescriptions((current) => {
                      const next = { ...current }
                      delete next[project.id]
                      return next
                    })
                  }}
                >
                  <label htmlFor={`project-description-${project.id}`}>
                    Description for {project.name}
                  </label>
                  <textarea
                    id={`project-description-${project.id}`}
                    value={editedProjectDescription}
                    onChange={(event) =>
                      setProjectDescriptions((current) => ({
                        ...current,
                        [project.id]: event.target.value,
                      }))
                    }
                  />
                  <button type="submit">
                    Save project description for {project.name}
                  </button>
                </form>
              ) : null}

              {onCreateTaskList ? (
                <section>
                  <h3>Lists for {project.name}</h3>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()

                      try {
                        onCreateTaskList(project.id, listName)
                        setListNames((current) => ({
                          ...current,
                          [project.id]: '',
                        }))
                        setError(null)
                      } catch (caught) {
                        setError(errorMessage(caught))
                      }
                    }}
                  >
                    <label htmlFor={`list-name-${project.id}`}>
                      List name for {project.name}
                    </label>
                    <input
                      id={`list-name-${project.id}`}
                      value={listName}
                      onChange={(event) =>
                        setListNames((current) => ({
                          ...current,
                          [project.id]: event.target.value,
                        }))
                      }
                    />
                    <button type="submit">
                      Add list to {project.name}
                    </button>
                  </form>

                  {projectLists.length === 0 ? (
                    <p>No lists yet.</p>
                  ) : (
                    <ul>
                      {projectLists.map((list) => {
                        const editedName = listEdits[list.id] ?? list.name

                        return (
                          <li key={list.id}>
                            <span>
                              {list.name} (
                              {
                                projectTasks.filter(
                                  (task) => task.listId === list.id,
                                ).length
                              }{' '}
                              {
                                projectTasks.filter(
                                  (task) => task.listId === list.id,
                                ).length === 1
                                  ? 'task'
                                  : 'tasks'
                              }
                              )
                            </span>
                            {onMoveTaskListBefore ? (
                              <div className="workspace-native-drag">
                                <button type="button" draggable aria-label={`Drag list ${list.name}`}
                                  onDragStart={event=>{
                                    event.dataTransfer.setData('application/x-uduzgak-list',list.id)
                                    event.dataTransfer.effectAllowed='move'
                                  }}>Drag list {list.name}</button>
                                {onMoveTaskListAfter ? (
                                  <button type="button" aria-label={`Drop after list ${list.name}`}
                                    onDragOver={event=>event.preventDefault()}
                                    onDrop={event=>{
                                      event.preventDefault()
                                      const source=event.dataTransfer.getData('application/x-uduzgak-list')
                                      if(source && source!==list.id)onMoveTaskListAfter(source,list.id)
                                    }}>Drop after list {list.name}</button>
                                ) : null}
                                <button type="button" aria-label={`Drop before list ${list.name}`}
                                  onDragOver={event=>event.preventDefault()}
                                  onDrop={event=>{
                                    event.preventDefault()
                                    const source=event.dataTransfer.getData('application/x-uduzgak-list')
                                    if(source && source!==list.id)onMoveTaskListBefore(source,list.id)
                                  }}>Drop before list {list.name}</button>
                              </div>
                            ) : null}
                            {onMoveTaskListBefore ? (
                              <div className="workspace-reorder-controls" aria-label={`Reorder list ${list.name}`}>
                                {projectLists.filter(candidate=>candidate.id!==list.id).map(candidate=>(
                                  <button key={candidate.id} type="button" onClick={()=>onMoveTaskListBefore(list.id,candidate.id)}>
                                    Move list {list.name} before {candidate.name}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                            {onMoveTaskList ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onMoveTaskList(list.id, 'up')
                                  }
                                >
                                  Move list {list.name} up
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onMoveTaskList(list.id, 'down')
                                  }
                                >
                                  Move list {list.name} down
                                </button>
                              </>
                            ) : null}
                            {onRenameTaskList ? (
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  onRenameTaskList(list.id, editedName)
                                  setListEdits((current) => {
                                    const next = { ...current }
                                    delete next[list.id]
                                    return next
                                  })
                                }}
                              >
                                <label htmlFor={`list-edit-${list.id}`}>
                                  Name for list {list.name}
                                </label>
                                <input
                                  id={`list-edit-${list.id}`}
                                  value={editedName}
                                  onChange={(event) =>
                                    setListEdits((current) => ({
                                      ...current,
                                      [list.id]: event.target.value,
                                    }))
                                  }
                                />
                                <button type="submit">
                                  Save list name for {list.name}
                                </button>
                              </form>
                            ) : null}
                            {onDeleteTaskList ? (
                              <button
                                type="button"
                                onClick={() => onDeleteTaskList(list.id)}
                              >
                                Delete list {list.name}
                              </button>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              ) : null}

              {onSaveProjectTemplate ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      onSaveProjectTemplate(project.id, project.name)
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  Save project as template {project.name}
                </button>
              ) : null}

              {onArchiveProject ? (
                <button
                  type="button"
                  onClick={() => {
                    if (effectiveProjectView === project.id) {
                      updatePreferences({ projectView: 'all' })
                    }

                    onArchiveProject(project.id)
                  }}
                >
                  Archive project {project.name}
                </button>
              ) : null}

              {onDeleteProject ? (
                <button
                  type="button"
                  onClick={() => {
                    if (effectiveProjectView === project.id) {
                      updatePreferences({ projectView: 'all' })
                    }

                    onDeleteProject(project.id)
                  }}
                >
                  Delete project {project.name}
                </button>
              ) : null}

              {onCreateTask ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()

                    try {
                      onCreateTask(
                        project.id,
                        taskTitle,
                        newTaskListId || undefined,
                      )
                      setTaskTitles((current) => ({
                        ...current,
                        [project.id]: '',
                      }))
                      setError(null)
                    } catch (caught) {
                      setError(errorMessage(caught))
                    }
                  }}
                >
                  {projectLists.length > 0 ? (
                    <>
                      <label htmlFor={`new-task-list-${project.id}`}>
                        List for new task in {project.name}
                      </label>
                      <select
                        id={`new-task-list-${project.id}`}
                        value={newTaskListId}
                        onChange={(event) =>
                          setNewTaskLists((current) => ({
                            ...current,
                            [project.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">No list</option>
                        {projectLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}

                  <label htmlFor={`task-title-${project.id}`}>
                    Task title for {project.name}
                  </label>
                  <input
                    id={`task-title-${project.id}`}
                    value={taskTitle}
                    onChange={(event) =>
                      setTaskTitles((current) => ({
                        ...current,
                        [project.id]: event.target.value,
                      }))
                    }
                  />
                  <button type="submit">Add task</button>
                </form>
              ) : null}

              {tasks.length === 0 && taskViewMode !== 'board' ? (
                <p>{projectTasks.length === 0 ? 'No tasks yet.' : 'No matching tasks.'}</p>
              ) : (
                <>
                  {taskViewMode === 'gantt' && ganttCriticalPath ? (
                    <p aria-label={`Gantt critical path for ${project.name}`}>
                      {ganttCriticalPath.rows.length === 0
                        ? 'No scheduled tasks for critical-path analysis'
                        : `Logical critical path: ${ganttCriticalPath.durationDays} days (visible scheduled tasks; blocks dependencies only)`}
                    </p>
                  ) : null}
                  {taskViewMode === 'gantt' && ganttWorkingPath ? (
                    <p aria-label={`Gantt working-day critical path for ${project.name}`}>
                      {ganttWorkingPath.rows.length === 0
                        ? 'No scheduled tasks for working-day analysis'
                        : `Working-day critical path: ${ganttWorkingPath.durationDays} working days (${ganttSundayThursdayWeek ? 'Sunday-Thursday' : 'Monday-Friday'}; ${ganttNonWorkingDates.length === 0 ? 'holidays not configured' : `${ganttNonWorkingDates.length} excluded date${ganttNonWorkingDates.length === 1 ? '' : 's'}`})`}
                    </p>
                  ) : null}
                  {taskViewMode === 'gantt' ? (
                    <ol
                      className="task-gantt-summary"
                      aria-label={`Task Gantt for ${project.name}`}
                    >
                      {ganttOverviewItems.map((item) => {
                        const criticalRow = ganttCriticalRows.get(item.task.id)
                        const draft = ganttScheduleDrafts[item.task.id] ?? {
                          startDate: item.startDate ?? '',
                          dueDate: item.dueDate ?? '',
                        }

                        return (
                          <li
                            key={item.task.id}
                            className={criticalRow?.isCritical ? 'task-gantt-critical' : undefined}
                            draggable={onChangeTaskGanttSchedule !== undefined}
                            onDragStart={(event) =>
                              event.dataTransfer.setData('text/plain', item.task.id)
                            }
                            aria-label={
                              item.isScheduled
                                ? `${item.startDate} to ${item.dueDate} Gantt item ${item.task.title}`
                                : `Unscheduled Gantt item ${item.task.title}`
                            }
                          >
                            <span>{item.task.title}</span>
                            {criticalRow ? (
                              <span aria-label={`Critical path status for ${item.task.title}`}>
                                {criticalRow.isCritical
                                  ? 'Critical (0 days slack)'
                                  : `Not critical (${criticalRow.slackDays} days slack)`}
                              </span>
                            ) : null}
                            {ganttWorkingPath && ganttWorkingRows.has(item.task.id) ? (
                              <span aria-label={`Gantt working-day status for ${item.task.title}`}>
                                {ganttWorkingRows.get(item.task.id)!.isCritical
                                  ? 'Critical (0 working days slack)'
                                  : `Not critical (${ganttWorkingRows.get(item.task.id)!.slackDays} working days slack)`}
                              </span>
                            ) : null}
                            {ganttShowWorkingDays && ganttShowProjectedWorkingDates && ganttProjectedWorkingRows.has(item.task.id) ? (
                              <span aria-label={`Gantt projected working dates for ${item.task.title}`}>
                                {`Earliest ${ganttProjectedWorkingRows.get(item.task.id)!.earliestStartDate} to ${ganttProjectedWorkingRows.get(item.task.id)!.earliestFinishDate}; latest ${ganttProjectedWorkingRows.get(item.task.id)!.latestStartDate} to ${ganttProjectedWorkingRows.get(item.task.id)!.latestFinishDate} (derived, not saved)`}
                              </span>
                            ) : null}
                            {ganttShowLogicalOffsets && criticalRow ? (
                              <span aria-label={`Gantt logical offsets for ${item.task.title}`}>
                                {`Earliest ${criticalRow.earliestStart} to ${criticalRow.earliestFinish} days; latest ${criticalRow.latestStart} to ${criticalRow.latestFinish} days`}
                              </span>
                            ) : null}
                            {item.task.isMilestone ? <span>Milestone</span> : null}
                            {item.task.ganttBaseline ? (
                              <span>Baseline {createTaskGanttBaselineComparison(item.task)}</span>
                            ) : null}
                            {onChangeTaskMilestone ? (
                              <button
                                type="button"
                                onClick={() => onChangeTaskMilestone(item.task.id, !item.task.isMilestone)}
                              >
                                {item.task.isMilestone ? `Unmark milestone ${item.task.title}` : `Mark milestone ${item.task.title}`}
                              </button>
                            ) : null}
                            {onCaptureTaskGanttBaseline ? (
                              <button
                                type="button"
                                disabled={!item.isScheduled}
                                onClick={() => onCaptureTaskGanttBaseline(item.task.id)}
                              >
                                Capture Gantt baseline for {item.task.title}
                              </button>
                            ) : null}
                            {item.isScheduled ? (
                              <span>{item.startDate} to {item.dueDate}</span>
                            ) : (
                              <span>Unscheduled</span>
                            )}
                            {onChangeTaskGanttSchedule ? (
                              <span>
                                <label>
                                  Gantt start for {item.task.title}
                                  <input
                                    type="date"
                                    value={draft.startDate}
                                    onChange={(event) =>
                                      setGanttScheduleDrafts((current) => ({
                                        ...current,
                                        [item.task.id]: {
                                          ...draft,
                                          startDate: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>
                                <label>
                                  Gantt due for {item.task.title}
                                  <input
                                    type="date"
                                    value={draft.dueDate}
                                    onChange={(event) =>
                                      setGanttScheduleDrafts((current) => ({
                                        ...current,
                                        [item.task.id]: {
                                          ...draft,
                                          dueDate: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>
                                <span
                                  aria-label={`Drop Gantt schedule for ${item.task.title}`}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={(event) => {
                                    event.preventDefault()
                                    if (
                                      event.dataTransfer.getData('text/plain') !==
                                      item.task.id
                                    ) {
                                      return
                                    }
                                    runGanttScheduleAction(
                                      item.task.id,
                                      draft.startDate,
                                      draft.dueDate,
                                    )
                                  }}
                                >
                                  Drop schedule here
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    runGanttScheduleAction(
                                      item.task.id,
                                      draft.startDate,
                                      draft.dueDate,
                                    )
                                  }
                                >
                                  Apply Gantt schedule for {item.task.title}
                                </button>
                              </span>
                            ) : null}
                          </li>
                        )
                      })}
                    </ol>
                  ) : null}
                  {taskViewMode === 'gantt' &&
                  ganttOverviewEdges.length > 0 ? (
                    <ol
                      className="task-gantt-dependency-lines"
                      aria-label={`Gantt dependencies for ${project.name}`}
                    >
                      {ganttOverviewEdges.map((edge) => (
                        <li
                          key={edge.relationshipId}
                          className="task-gantt-dependency-line"
                          aria-label={`Gantt dependency ${edge.directionLabel}`}
                        >
                          {edge.directionLabel}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {taskViewMode === 'gantt' && ganttScheduleConflicts.length > 0 ? (
                    <div className="task-gantt-schedule-warning">
                      <p>{`${ganttScheduleConflicts.length} Gantt dependency schedule conflict${ganttScheduleConflicts.length === 1 ? '' : 's'}`}</p>
                      <ul aria-label={`Gantt schedule conflicts for ${project.name}`}>
                        {ganttScheduleConflicts.map((conflict) => (
                          <li key={`${conflict.sourceTaskId}-${conflict.targetTaskId}`}>
                            {`${ganttTaskNames.get(conflict.sourceTaskId)} ends ${conflict.sourceFinishDate}; ${ganttTaskNames.get(conflict.targetTaskId)} starts ${conflict.targetStartDate}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {taskViewMode === 'timeline' ? (
                    <ol
                      className="task-timeline-summary"
                      aria-label={`Task timeline for ${project.name}`}
                    >
                      {timelineItems.map((item) => (
                        <li
                          key={item.task.id}
                          aria-label={`${item.dueDateLabel} timeline item ${item.task.title}`}
                        >
                          <span>{item.dueDateLabel}</span>
                          <span>{item.task.title}</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {taskViewMode === 'table' ? (
                    <table
                      className="task-table-summary"
                      aria-label={`Task table for ${project.name}`}
                    >
                      <thead>
                        <tr>
                          <th scope="col">Title</th>
                          <th scope="col">Status</th>
                          <th scope="col">Priority</th>
                          <th scope="col">Due date</th>
                          <th scope="col">List</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row) => (
                          <tr key={row.taskId}>
                            <td>{row.title}</td>
                            <td>{row.status}</td>
                            <td>{row.priority}</td>
                            <td>{row.dueDate}</td>
                            <td>{row.list}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                  {taskViewMode === 'board' ? (
                    <p role="status" aria-label="Board visible summary">
                      {tasks.length} of {projectTasks.length} tasks visible
                    </p>
                  ) : null}
                  <ul
                    className={
                      taskViewMode === 'board'
                        ? 'task-board'
                        : taskViewMode === 'calendar'
                          ? 'task-calendar'
                          : taskViewMode === 'timeline'
                            ? 'task-timeline-details'
                            : taskViewMode === 'gantt'
                              ? 'task-gantt-details'
                            : taskViewMode === 'table'
                              ? 'task-table-details'
                              : undefined
                    }
                  >
                  {taskEntries.map((entry) => {
                    if (entry.type === 'group') {
                      return (
                        <li key={`task-group-${entry.key}`}>
                          <h3>{entry.label}</h3>
                        </li>
                      )
                    }

                    if (entry.type === 'board-column') {
                      return (
                        <li
                          key={`board-column-${entry.key}`}
                          className={`task-board-heading task-board-heading-${entry.key}`}
                          aria-label={entry.key === 'todo' ? 'Drop task into To do' : entry.key === 'doing' ? 'Drop task into Doing' : 'Drop task into Done'}
                          onDragOver={event => event.preventDefault()}
                          onDrop={event => {
                            event.preventDefault()
                            const id=event.dataTransfer.getData('application/x-uduzgak-board-task')
                            if (!id) {
                              setBoardDragResult('No task selected for Board drop')
                              return
                            }
                            const dragged=activeTasks.find(t=>t.id===id && t.projectId===project.id)
                            if (id && !dragged && activeTasks.some(t=>t.id===id)) {
                              setBoardDragResult('Cannot move tasks between project boards')
                              return
                            }
                            if (!dragged) {
                              setBoardDragResult('Task is no longer available for Board drop')
                              return
                            }
                            if (dragged.status === entry.key) {
                              setBoardDragResult(`${dragged.title} is already in ${entry.label}`)
                              return
                            }
                            onChangeTaskStatus?.(dragged.id,entry.key)
                            setLastBoardStatusChange({ taskId: dragged.id, previousStatus: dragged.status, taskTitle: dragged.title })
                            setBoardDragResult(`Moved ${dragged.title} into ${entry.key}`)
                          }}
                        >
                          <div role="group" aria-label={`${entry.label} Board column`}>
                            <h3>{entry.label}</h3>
                            <span>{entry.count} {entry.count === 1 ? 'task' : 'tasks'}</span>
                            {entry.count === 0 ? <small>Drop a task here</small> : null}
                          </div>
                        </li>
                      )
                    }

                    if (entry.type === 'calendar-section') {
                      return (
                        <li
                          key={`calendar-section-${entry.key}`}
                          className="task-calendar-heading"
                        >
                          <h3>{entry.label}</h3>
                        </li>
                      )
                    }

                    const task = entry.task

                    if (bulkSelectionMode && taskViewMode === 'list') {
                      return (
                        <li key={task.id}>
                          <label>
                            <input
                              type="checkbox"
                              aria-label={`Select task ${task.title}`}
                              checked={selectedVisibleTaskIdSet.has(task.id)}
                              onChange={(event) =>
                                changeVisibleTaskSelection(
                                  task.id,
                                  event.target.checked,
                                )
                              }
                            />
                            Select task {task.title}
                          </label>
                          <span>{task.title}</span>
                        </li>
                      )
                    }

                    const parentTask =
                      task.parentTaskId === undefined
                        ? undefined
                        : state.tasks.find(
                            (candidate) => candidate.id === task.parentTaskId,
                          )
                    const subtaskTitle = subtaskTitles[task.id] ?? ''
                    const checklistText = checklistTexts[task.id] ?? ''
                    const checklist = task.checklist ?? []
                    const completedChecklistCount = checklist.filter(
                      (item) => item.completed,
                    ).length
                    const immediateSubtaskCount = activeTasks.filter(
                      (candidate) => candidate.parentTaskId === task.id,
                    ).length
                    const relationshipType =
                      relationshipTypes[task.id] ?? 'blocks'
                    const relationshipTarget =
                      relationshipTargets[task.id] ?? ''
                    const taskRelationships = relationships.filter(
                      (relationship) =>
                        relationship.sourceTaskId === task.id ||
                        relationship.targetTaskId === task.id,
                    )
                    const relationshipSummary =
                      summarizeTaskRelationships(task.id, taskRelationships)
                    const hasAdditionalRelationshipCounts =
                      relationshipSummary.duplicates > 0 ||
                      relationshipSummary.duplicatedBy > 0 ||
                      relationshipSummary.references > 0 ||
                      relationshipSummary.referencedBy > 0
                    const editedTitle = taskEdits[task.id] ?? task.title
                    const editedDescription = taskDescriptions[task.id] ?? task.description ?? ''

                    const boardStatusLabel =
                      task.status === 'todo'
                        ? 'To do'
                        : task.status === 'doing'
                          ? 'Doing'
                          : 'Done'

                    return (
                      <li
                        key={task.id}
                        draggable={taskViewMode === 'board'}
                        onDragStart={event => {
                          if(taskViewMode === 'board') {
                            event.dataTransfer.setData('application/x-uduzgak-board-task',task.id)
                            event.dataTransfer.effectAllowed='move'
                          }
                        }}
                        className={
                          taskViewMode === 'board'
                            ? `task-board-card task-board-card-${task.status}`
                            : taskViewMode === 'calendar'
                              ? 'task-calendar-card'
                              : undefined
                        }
                        aria-label={
                          taskViewMode === 'board'
                            ? `${boardStatusLabel} board task ${task.title}`
                            : taskViewMode === 'calendar'
                              ? `${task.dueDate ?? 'No due date'} calendar task ${task.title}`
                              : taskViewMode === 'timeline'
                                ? `Timeline task details ${task.title}`
                                : taskViewMode === 'gantt'
                                  ? `Gantt task details ${task.title}`
                                : taskViewMode === 'table'
                                  ? `Table task details ${task.title}`
                                  : undefined
                        }
                      >
                        <label>
                          <input
                            type="checkbox"
                            aria-label={`Select task ${task.title}`}
                            checked={selectedVisibleTaskIdSet.has(task.id)}
                            onChange={(event) =>
                              changeVisibleTaskSelection(
                                task.id,
                                event.target.checked,
                              )
                            }
                          />
                          Select task {task.title}
                        </label>
                        <span>{task.title}</span>
                        {taskViewMode === 'board' && onChangeTaskStatus && task.status !== 'done' ? (
                          <button type="button" onClick={() => {
                            const nextStatus = task.status === 'todo' ? 'doing' : 'done'
                            onChangeTaskStatus(task.id, nextStatus)
                            setLastBoardStatusChange({ taskId: task.id, previousStatus: task.status, taskTitle: task.title })
                            setBoardDragResult(`Moved ${task.title} to ${nextStatus === 'doing' ? 'Doing' : 'Done'}`)
                          }}>Move {task.title} to {task.status === 'todo' ? 'Doing' : 'Done'}</button>
                        ) : null}
                        {taskViewMode === 'board' && onChangeTaskStatus && task.status !== 'todo' ? (
                          <button type="button" onClick={() => {
                            const previousStatus = task.status === 'done' ? 'doing' : 'todo'
                            onChangeTaskStatus(task.id, previousStatus)
                            setLastBoardStatusChange({ taskId: task.id, previousStatus: task.status, taskTitle: task.title })
                            setBoardDragResult(`Moved ${task.title} to ${previousStatus === 'doing' ? 'Doing' : 'To do'}`)
                          }}>Move {task.title} to {task.status === 'done' ? 'Doing' : 'To do'}</button>
                        ) : null}
                        {taskViewMode === 'board' && onChangeTaskStatus && task.status === 'todo' ? (
                          <button type="button" onClick={() => {
                            onChangeTaskStatus(task.id, 'done')
                            setLastBoardStatusChange({ taskId: task.id, previousStatus: task.status, taskTitle: task.title })
                            setBoardDragResult(`Moved ${task.title} to Done`)
                          }}>Move {task.title} directly to Done</button>
                        ) : null}
                        {taskViewMode === 'board' && onChangeTaskStatus && task.status === 'done' ? (
                          <button type="button" onClick={() => {
                            onChangeTaskStatus(task.id, 'todo')
                            setLastBoardStatusChange({ taskId: task.id, previousStatus: task.status, taskTitle: task.title })
                            setBoardDragResult(`Moved ${task.title} to To do`)
                          }}>Move {task.title} directly to To do</button>
                        ) : null}
                        <span
                          aria-label={`Subtask count for ${task.title}`}
                        >
                          {immediateSubtaskCount}{' '}
                          {immediateSubtaskCount === 1
                            ? 'subtask'
                            : 'subtasks'}
                        </span>
                        {onCreateTaskRelationship &&
                        activeTasks.length > 1 ? (
                          <section>
                            <h4>Relationships for {task.title}</h4>
                            <span
                              aria-label={`Relationship summary for ${task.title}`}
                            >
                              {`Blocks ${relationshipSummary.blocks}; Blocked by ${relationshipSummary.blockedBy}; Related ${relationshipSummary.related}${
                                hasAdditionalRelationshipCounts
                                  ? `; Duplicates ${relationshipSummary.duplicates}; Duplicated by ${relationshipSummary.duplicatedBy}; References ${relationshipSummary.references}; Referenced by ${relationshipSummary.referencedBy}`
                                  : ''
                              }`}
                            </span>
                            <form
                              onSubmit={(event) => {
                                event.preventDefault()

                                try {
                                  onCreateTaskRelationship(
                                    relationshipType,
                                    task.id,
                                    relationshipTarget,
                                  )
                                  setRelationshipTargets((current) => ({
                                    ...current,
                                    [task.id]: '',
                                  }))
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            >
                              <label
                                htmlFor={`relationship-type-${task.id}`}
                              >
                                Relationship type from {task.title}
                              </label>
                              <select
                                id={`relationship-type-${task.id}`}
                                value={relationshipType}
                                onChange={(event) =>
                                  setRelationshipTypes((current) => ({
                                    ...current,
                                    [task.id]:
                                      event.target
                                        .value as TaskRelationshipType,
                                  }))
                                }
                              >
                                <option value="blocks">Blocks</option>
                                <option value="related">Related</option>
                                <option value="duplicates">Duplicates</option>
                                <option value="references">References</option>
                              </select>
                              <label
                                htmlFor={`relationship-target-${task.id}`}
                              >
                                Relationship target from {task.title}
                              </label>
                              <select
                                id={`relationship-target-${task.id}`}
                                value={relationshipTarget}
                                onChange={(event) =>
                                  setRelationshipTargets((current) => ({
                                    ...current,
                                    [task.id]: event.target.value,
                                  }))
                                }
                              >
                                <option value="">Select task</option>
                                {activeTasks
                                  .filter(
                                    (candidate) =>
                                      candidate.id !== task.id,
                                  )
                                  .map((candidate) => (
                                    <option
                                      key={candidate.id}
                                      value={candidate.id}
                                    >
                                      Target: {candidate.title}
                                    </option>
                                  ))}
                              </select>
                              <button type="submit">
                                Add relationship from {task.title}
                              </button>
                            </form>

                            {taskRelationships.length > 0 ? (
                              <ul>
                                {taskRelationships.map((relationship) => {
                                  const source = state.tasks.find(
                                    (candidate) =>
                                      candidate.id ===
                                      relationship.sourceTaskId,
                                  )
                                  const target = state.tasks.find(
                                    (candidate) =>
                                      candidate.id ===
                                      relationship.targetTaskId,
                                  )
                                  const isSource =
                                    relationship.sourceTaskId === task.id
                                  let label: string

                                  switch (relationship.type) {
                                    case 'related':
                                      label = `Related to ${
                                        isSource
                                          ? target?.title
                                          : source?.title
                                      }`
                                      break
                                    case 'blocks':
                                      label = isSource
                                        ? `Blocks ${target?.title}`
                                        : `Blocked by ${source?.title}`
                                      break
                                    case 'duplicates':
                                      label = isSource
                                        ? `Duplicates ${target?.title}`
                                        : `Duplicated by ${source?.title}`
                                      break
                                    case 'references':
                                      label = isSource
                                        ? `References ${target?.title}`
                                        : `Referenced by ${source?.title}`
                                      break
                                  }

                                  return (
                                    <li key={relationship.id}>
                                      <span>{label}</span>
                                      {onDeleteTaskRelationship &&
                                      relationship.sourceTaskId ===
                                        task.id ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteTaskRelationship(
                                              relationship.id,
                                            )
                                          }
                                        >
                                          Delete relationship {relationship.id}
                                        </button>
                                      ) : null}
                                    </li>
                                  )
                                })}
                              </ul>
                            ) : null}
                          </section>
                        ) : null}

                        {customFields.length > 0 &&
                        (onChangeTaskCustomFieldValue ||
                          customFields.some((field) => field.type === 'formula')) ? (
                          <fieldset>
                            <legend>Custom fields for {task.title}</legend>
                            {customFields.map((field) => {
                              const currentValue =
                                task.customFieldValues?.[field.id]
                              const draftKey = `${task.id}:${field.id}`
                              const draftValue =
                                customFieldValueDrafts[draftKey]

                              if (field.type === 'formula') {
                                const result = evaluateCustomFieldFormula(
                                  field.id,
                                  task,
                                  customFields,
                                )

                                return (
                                  <label key={field.id}>
                                    Custom field {field.name} for {task.title}
                                    <output
                                      aria-label={`Custom field ${field.name} for ${task.title}`}
                                    >
                                      {result === null ? 'Unavailable' : String(result)}
                                    </output>
                                  </label>
                                )
                              }

                              if (!onChangeTaskCustomFieldValue) {
                                return null
                              }

                              if (field.type === 'select') {
                                return (
                                  <label key={field.id}>
                                    Custom field {field.name} for {task.title}
                                    <select
                                      value={
                                        typeof currentValue === 'string'
                                          ? currentValue
                                          : ''
                                      }
                                      onChange={(event) =>
                                        onChangeTaskCustomFieldValue(
                                          task.id,
                                          field.id,
                                          event.target.value === ''
                                            ? null
                                            : event.target.value,
                                        )
                                      }
                                    >
                                      <option value="">No selection</option>
                                      {(field.options ?? []).map((option) => (
                                        <option key={option.id} value={option.id}>
                                          {option.name}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                )
                              }

                              if (field.type === 'checkbox') {
                                return (
                                  <label key={field.id}>
                                    <input
                                      type="checkbox"
                                      checked={currentValue === true}
                                      onChange={(event) =>
                                        onChangeTaskCustomFieldValue(
                                          task.id,
                                          field.id,
                                          event.target.checked,
                                        )
                                      }
                                    />
                                    Custom field {field.name} for {task.title}
                                  </label>
                                )
                              }

                              return (
                                <label key={field.id}>
                                  Custom field {field.name} for {task.title}
                                  <input
                                    type={
                                      field.type === 'number'
                                        ? 'number'
                                        : field.type === 'date'
                                          ? 'date'
                                          : 'text'
                                    }
                                    value={
                                      field.type === 'text' &&
                                      draftValue !== undefined
                                        ? draftValue
                                        : typeof currentValue === 'string' ||
                                            typeof currentValue === 'number'
                                          ? currentValue
                                          : ''
                                    }
                                    onChange={(event) => {
                                      const rawValue = event.target.value

                                      if (field.type === 'text') {
                                        setCustomFieldValueDrafts((current) => ({
                                          ...current,
                                          [draftKey]: rawValue,
                                        }))
                                        return
                                      }

                                      if (field.type === 'date') {
                                        onChangeTaskCustomFieldValue(
                                          task.id,
                                          field.id,
                                          rawValue === '' ? null : rawValue,
                                        )
                                        return
                                      }

                                      if (rawValue === '') {
                                        onChangeTaskCustomFieldValue(
                                          task.id,
                                          field.id,
                                          null,
                                        )
                                        return
                                      }

                                      onChangeTaskCustomFieldValue(
                                        task.id,
                                        field.id,
                                        Number(rawValue),
                                      )
                                    }}
                                    onBlur={(event) => {
                                      if (field.type !== 'text') {
                                        return
                                      }

                                      const rawValue = event.target.value

                                      onChangeTaskCustomFieldValue(
                                        task.id,
                                        field.id,
                                        rawValue === '' ? null : rawValue,
                                      )
                                      setCustomFieldValueDrafts((current) => {
                                        const next = { ...current }
                                        delete next[draftKey]
                                        return next
                                      })
                                    }}
                                  />
                                </label>
                              )
                            })}
                          </fieldset>
                        ) : null}
                        {people.length > 0 &&
                        onChangeTaskAssignee ? (
                          <fieldset>
                            <legend>Assignees for {task.title}</legend>
                            {people.map((person) => (
                              <label key={person.id}>
                                <input
                                  type="checkbox"
                                  checked={(task.assigneeIds ?? []).includes(
                                    person.id,
                                  )}
                                  onChange={(event) =>
                                    onChangeTaskAssignee(
                                      task.id,
                                      person.id,
                                      event.target.checked,
                                    )
                                  }
                                />
                                Assignee {person.name} for {task.title}
                              </label>
                            ))}
                          </fieldset>
                        ) : null}
                        {tags.length > 0 && onChangeTaskTag ? (
                          <fieldset>
                            <legend>Tags for {task.title}</legend>
                            {tags.map((tag) => (
                              <label key={tag.id}>
                                <input
                                  type="checkbox"
                                  checked={(task.tagIds ?? []).includes(tag.id)}
                                  onChange={(event) =>
                                    onChangeTaskTag(
                                      task.id,
                                      tag.id,
                                      event.target.checked,
                                    )
                                  }
                                />
                                Tag {tag.name} for {task.title}
                              </label>
                            ))}
                          </fieldset>
                        ) : null}
                        {taskSort === 'manual' && onMoveTaskBefore && taskViewMode === 'list' ? (
                          <>
                            <button type="button" draggable aria-label={`Drag task ${task.title}`}
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', task.id)
                                event.dataTransfer.effectAllowed = 'move'
                              }}>Drag {task.title}</button>
                            {onMoveTaskAfter ? (
                              <button type="button" aria-label={`Drop after task ${task.title}`}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                  event.preventDefault()
                                  const draggedTaskId = event.dataTransfer.getData('text/plain')
                                  if (draggedTaskId && draggedTaskId !== task.id) {
                                    onMoveTaskAfter(draggedTaskId, task.id)
                                    const draggedTask = activeTasks.find((candidate) => candidate.id === draggedTaskId)
                                    if (draggedTask) setTaskReorderResult(`Moved ${draggedTask.title} after ${task.title}`)
                                  }
                                }}>Drop after {task.title}</button>
                            ) : null}
                            <button type="button" aria-label={`Drop before task ${task.title}`}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault()
                                const draggedTaskId = event.dataTransfer.getData('text/plain')
                                if (draggedTaskId && draggedTaskId !== task.id) onMoveTaskBefore(draggedTaskId, task.id)
                              }}>Drop before {task.title}</button>
                          </>
                        ) : null}
                        {taskSort === 'manual' && taskViewMode === 'list' && onMoveTaskBefore ? (
                          <div className="task-touch-reorder" aria-label={`Move task ${task.title} before a sibling`}>
                            {activeTasks.filter((candidate) => candidate.id !== task.id &&
                              candidate.projectId === task.projectId && candidate.listId === task.listId &&
                              candidate.parentTaskId === task.parentTaskId).map((candidate) => (
                              <button type="button" key={candidate.id}
                                onClick={() => {
                                  onMoveTaskBefore(task.id, candidate.id)
                                  setTaskReorderResult(`Moved ${task.title} before ${candidate.title}`)
                                }}>
                                Move task {task.title} before {candidate.title}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        {taskSort === 'manual' && taskViewMode === 'list' && onMoveTaskAfter ? (
                          <div className="task-touch-reorder" aria-label={`Reorder task ${task.title}`}>
                            {activeTasks.filter((candidate) => candidate.id !== task.id &&
                              candidate.projectId === task.projectId && candidate.listId === task.listId &&
                              candidate.parentTaskId === task.parentTaskId).map((candidate) => (
                              <button type="button" key={candidate.id}
                                onClick={() => {
                                  onMoveTaskAfter(task.id, candidate.id)
                                  setTaskReorderResult(`Moved ${task.title} after ${candidate.title}`)
                                }}>
                                Move task {task.title} after {candidate.title}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        {taskSort === 'manual' && onMoveTask ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onMoveTask(task.id, 'up')}
                            >
                              Move task {task.title} up
                            </button>
                            <button
                              type="button"
                              onClick={() => onMoveTask(task.id, 'down')}
                            >
                              Move task {task.title} down
                            </button>
                          </>
                        ) : null}
                        {parentTask ? (
                          <span>Subtask of {parentTask.title}</span>
                        ) : null}

                        {onCreateSubtask ? (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault()

                              try {
                                onCreateSubtask(task.id, subtaskTitle)
                                setSubtaskTitles((current) => ({
                                  ...current,
                                  [task.id]: '',
                                }))
                                setError(null)
                              } catch (caught) {
                                setError(errorMessage(caught))
                              }
                            }}
                          >
                            <label htmlFor={`subtask-title-${task.id}`}>
                              Subtask title for {task.title}
                            </label>
                            <input
                              id={`subtask-title-${task.id}`}
                              value={subtaskTitle}
                              onChange={(event) =>
                                setSubtaskTitles((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                            />
                            <button type="submit">
                              Add subtask to {task.title}
                            </button>
                          </form>
                        ) : null}

                        {onAddChecklistItem ? (
                          <section>
                            <h4>Checklist for {task.title}</h4>
                            <span
                              aria-label={`Checklist progress for ${task.title}`}
                            >
                              {completedChecklistCount}/{checklist.length}{' '}
                              checklist items complete
                            </span>
                            <form
                              onSubmit={(event) => {
                                event.preventDefault()

                                try {
                                  onAddChecklistItem(task.id, checklistText)
                                  setChecklistTexts((current) => ({
                                    ...current,
                                    [task.id]: '',
                                  }))
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            >
                              <label htmlFor={`checklist-new-${task.id}`}>
                                Checklist item for {task.title}
                              </label>
                              <input
                                id={`checklist-new-${task.id}`}
                                value={checklistText}
                                onChange={(event) =>
                                  setChecklistTexts((current) => ({
                                    ...current,
                                    [task.id]: event.target.value,
                                  }))
                                }
                              />
                              <button type="submit">
                                Add checklist item to {task.title}
                              </button>
                            </form>

                            {checklist.length === 0 ? (
                              <p>No checklist items.</p>
                            ) : (
                              <ul>
                                {checklist.map((item) => {
                                  const editKey = `${task.id}:${item.id}`
                                  const editedChecklistText =
                                    checklistEdits[editKey] ?? item.text

                                  return (
                                    <li key={item.id}>
                                      <span>{item.text}</span>
                                      {onMoveChecklistItem ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onMoveChecklistItem(
                                                task.id,
                                                item.id,
                                                'up',
                                              )
                                            }
                                          >
                                            Move checklist item {item.text} up in {task.title}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onMoveChecklistItem(
                                                task.id,
                                                item.id,
                                                'down',
                                              )
                                            }
                                          >
                                            Move checklist item {item.text} down in {task.title}
                                          </button>
                                        </>
                                      ) : null}
                                      {onChangeChecklistItemCompleted ? (
                                        <>
                                          <label
                                            htmlFor={`checklist-complete-${task.id}-${item.id}`}
                                          >
                                            Checklist item {item.text} complete
                                          </label>
                                          <input
                                            id={`checklist-complete-${task.id}-${item.id}`}
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={(event) =>
                                              onChangeChecklistItemCompleted(
                                                task.id,
                                                item.id,
                                                event.target.checked,
                                              )
                                            }
                                          />
                                        </>
                                      ) : null}

                                      {onRenameChecklistItem ? (
                                        <form
                                          onSubmit={(event) => {
                                            event.preventDefault()

                                            try {
                                              onRenameChecklistItem(
                                                task.id,
                                                item.id,
                                                editedChecklistText,
                                              )
                                              setChecklistEdits((current) => {
                                                const next = { ...current }
                                                delete next[editKey]
                                                return next
                                              })
                                              setError(null)
                                            } catch (caught) {
                                              setError(errorMessage(caught))
                                            }
                                          }}
                                        >
                                          <label
                                            htmlFor={`checklist-edit-${task.id}-${item.id}`}
                                          >
                                            Checklist text for {item.text} in {task.title}
                                          </label>
                                          <input
                                            id={`checklist-edit-${task.id}-${item.id}`}
                                            value={editedChecklistText}
                                            onChange={(event) =>
                                              setChecklistEdits((current) => ({
                                                ...current,
                                                [editKey]: event.target.value,
                                              }))
                                            }
                                          />
                                          <button type="submit">
                                            Save checklist item {item.text}
                                          </button>
                                        </form>
                                      ) : null}

                                      {onDeleteChecklistItem ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteChecklistItem(
                                              task.id,
                                              item.id,
                                            )
                                          }
                                        >
                                          Delete checklist item {item.text} from {task.title}
                                        </button>
                                      ) : null}
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </section>
                        ) : null}

                        {onChangeTaskDescription ? (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault()

                              onChangeTaskDescription(
                                task.id,
                                editedDescription || null,
                              )
                              setTaskDescriptions((current) => {
                                const next = { ...current }
                                delete next[task.id]
                                return next
                              })
                            }}
                          >
                            <label htmlFor={`task-description-${task.id}`}>
                              Description for {task.title}
                            </label>
                            <textarea
                              id={`task-description-${task.id}`}
                              value={editedDescription}
                              onChange={(event) =>
                                setTaskDescriptions((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                            />
                            <button type="submit">
                              Save description for {task.title}
                            </button>
                          </form>
                        ) : null}

                        {onRenameTask ? (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault()

                              try {
                                onRenameTask(task.id, editedTitle)
                                setTaskEdits((current) => {
                                  const next = { ...current }
                                  delete next[task.id]
                                  return next
                                })
                                setError(null)
                              } catch (caught) {
                                setError(errorMessage(caught))
                              }
                            }}
                          >
                            <label htmlFor={`task-edit-${task.id}`}>
                              Title for {task.title}
                            </label>
                            <input
                              id={`task-edit-${task.id}`}
                              value={editedTitle}
                              onChange={(event) =>
                                setTaskEdits((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                            />
                            <button type="submit">
                              Save title for {task.title}
                            </button>
                          </form>
                        ) : null}

                        {onChangeTaskStatus ? (
                          <>
                            <label htmlFor={`task-status-${task.id}`}>
                              Status for {task.title}
                            </label>
                            <select
                              id={`task-status-${task.id}`}
                              value={task.status}
                              onChange={(event) => {
                                onChangeTaskStatus(
                                  task.id,
                                  event.target.value as TaskStatus,
                                )
                                setLastBoardStatusChange(null)
                              }}
                            >
                              <option value="todo">To do</option>
                              <option value="doing">Doing</option>
                              <option value="done">Done</option>
                            </select>
                          </>
                        ) : null}

                        {onChangeTaskPriority ? (
                          <>
                            <label htmlFor={`task-priority-${task.id}`}>
                              Priority for {task.title}
                            </label>
                            <select
                              id={`task-priority-${task.id}`}
                              value={task.priority}
                              onChange={(event) =>
                                onChangeTaskPriority(
                                  task.id,
                                  event.target.value as TaskPriority,
                                )
                              }
                            >
                              <option value="low">Low</option>
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                            </select>
                          </>
                        ) : null}




                        {onChangeTaskTimeEstimate ? (
                          <>
                            <label htmlFor={`task-time-estimate-${task.id}`}>
                              Time estimate (minutes) for {task.title}
                            </label>
                            <input
                              id={`task-time-estimate-${task.id}`}
                              type="number"
                              min={1}
                              step={1}
                              value={task.estimateMinutes ?? ''}
                              onChange={(event) => {
                                try {
                                  const raw = event.target.value
                                  onChangeTaskTimeEstimate(
                                    task.id,
                                    raw === '' ? null : Number(raw),
                                  )
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            />
                          </>
                        ) : null}

                        {onAddTaskTrackedMinutes &&
                        onStartTaskTimer &&
                        onStopTaskTimer &&
                        onDeleteTaskTimeEntry ? (
                          <>
                            <p>
                              Tracked time for {task.title}: {' '}
                              {formatTrackedMinutes(getTaskTrackedMinutes(task))} minutes
                            </p>
                            <label htmlFor={`task-tracked-minutes-${task.id}`}>
                              Add tracked minutes for {task.title}
                            </label>
                            <input
                              id={`task-tracked-minutes-${task.id}`}
                              type="number"
                              min={1}
                              step={1}
                              value={taskTrackedMinuteDrafts[task.id] ?? ''}
                              onChange={(event) =>
                                setTaskTrackedMinuteDrafts((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              aria-label={`Add tracked time for ${task.title}`}
                              onClick={() => {
                                try {
                                  onAddTaskTrackedMinutes(
                                    task.id,
                                    Number(taskTrackedMinuteDrafts[task.id] ?? ''),
                                  )
                                  setTaskTrackedMinuteDrafts((current) => ({
                                    ...current,
                                    [task.id]: '',
                                  }))
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            >
                              Add tracked time
                            </button>

                            {task.timerStartedAt === undefined ? (
                              <button
                                type="button"
                                aria-label={`Start timer for ${task.title}`}
                                onClick={() => {
                                  try {
                                    onStartTaskTimer(task.id)
                                    setError(null)
                                  } catch (caught) {
                                    setError(errorMessage(caught))
                                  }
                                }}
                              >
                                Start timer
                              </button>
                            ) : (
                              <>
                                <p>
                                  Timer running for {task.title} since {task.timerStartedAt}
                                </p>
                                <button
                                  type="button"
                                  aria-label={`Stop timer for ${task.title}`}
                                  onClick={() => {
                                    try {
                                      onStopTaskTimer(task.id)
                                      setError(null)
                                    } catch (caught) {
                                      setError(errorMessage(caught))
                                    }
                                  }}
                                >
                                  Stop timer
                                </button>
                              </>
                            )}

                            {task.timeEntries?.length ? (
                              <ul aria-label={`Time entries for ${task.title}`}>
                                {task.timeEntries.map((entry, index) => (
                                  <li key={entry.id}>
                                    {formatTrackedMinutes(entry.durationMs / 60_000)} minutes
                                    <button
                                      type="button"
                                      aria-label={`Delete time entry ${index + 1} for ${task.title}`}
                                      onClick={() => {
                                        try {
                                          onDeleteTaskTimeEntry(task.id, entry.id)
                                          setError(null)
                                        } catch (caught) {
                                          setError(errorMessage(caught))
                                        }
                                      }}
                                    >
                                      Delete time entry
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </>
                        ) : null}

                        {onAddTaskAttachment && onDeleteTaskAttachment ? (
                          <>
                            <label htmlFor={`task-attachment-${task.id}`}>
                              Add attachment for {task.title}
                            </label>
                            <input
                              id={`task-attachment-${task.id}`}
                              type="file"
                              onChange={(event) => {
                                const input = event.currentTarget
                                const file = input.files?.[0]

                                if (!file) {
                                  return
                                }

                                try {
                                  onAddTaskAttachment(task.id, {
                                    name: file.name,
                                    sizeBytes: file.size,
                                    ...(file.type ? { mediaType: file.type } : {}),
                                  })
                                  input.value = ''
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            />
                            {task.attachments?.length ? (
                              <ul aria-label={`Attachments for ${task.title}`}>
                                {task.attachments.map((attachment) => (
                                  <li key={attachment.id}>
                                    <span>{attachment.name}</span>{' '}
                                    <span>{attachment.sizeBytes} bytes</span>
                                    {attachment.mediaType ? (
                                      <> <span>{attachment.mediaType}</span></>
                                    ) : null}
                                    <button
                                      type="button"
                                      aria-label={`Delete attachment ${attachment.name} from ${task.title}`}
                                      onClick={() => {
                                        try {
                                          onDeleteTaskAttachment(
                                            task.id,
                                            attachment.id,
                                          )
                                          setError(null)
                                        } catch (caught) {
                                          setError(errorMessage(caught))
                                        }
                                      }}
                                    >
                                      Delete attachment
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </>
                        ) : null}

                        {onChangeTaskStartDate ? (
                          <>
                            <label htmlFor={`task-start-date-${task.id}`}>
                              Start date for {task.title}
                            </label>
                            <input
                              id={`task-start-date-${task.id}`}
                              type="date"
                              value={task.startDate ?? ''}
                              onChange={(event) =>
                                onChangeTaskStartDate(
                                  task.id,
                                  event.target.value || null,
                                )
                              }
                            />
                          </>
                        ) : null}

                        {onChangeTaskDueDate ? (
                          <>
                            <label htmlFor={`task-due-date-${task.id}`}>
                              Due date for {task.title}
                            </label>
                            <input
                              id={`task-due-date-${task.id}`}
                              type="date"
                              value={task.dueDate ?? ''}
                              onChange={(event) =>
                                onChangeTaskDueDate(
                                  task.id,
                                  event.target.value || null,
                                )
                              }
                            />
                          </>
                        ) : null}

                        {onChangeTaskRecurrence ? (
                          <>
                            <label htmlFor={`task-recurrence-${task.id}`}>
                              Recurrence for {task.title}
                            </label>
                            <select
                              id={`task-recurrence-${task.id}`}
                              value={task.recurrence?.unit ?? ''}
                              onChange={(event) => {
                                try {
                                  const unit = event.target.value as
                                    | TaskRecurrenceUnit
                                    | ''
                                  onChangeTaskRecurrence(
                                    task.id,
                                    unit === ''
                                      ? null
                                      : {
                                          unit,
                                          interval: task.recurrence?.interval ?? 1,
                                        },
                                  )
                                  setError(null)
                                } catch (caught) {
                                  setError(errorMessage(caught))
                                }
                              }}
                            >
                              <option value="">No recurrence</option>
                              <option value="day">Daily</option>
                              <option value="week">Weekly</option>
                              <option value="month">Monthly</option>
                            </select>

                            {task.recurrence ? (
                              <>
                                <label htmlFor={`task-recurrence-interval-${task.id}`}>
                                  Recurrence interval for {task.title}
                                </label>
                                <input
                                  id={`task-recurrence-interval-${task.id}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={task.recurrence.interval}
                                  onChange={(event) => {
                                    try {
                                      onChangeTaskRecurrence(task.id, {
                                        unit: task.recurrence!.unit,
                                        interval: Number(event.target.value),
                                      })
                                      setError(null)
                                    } catch (caught) {
                                      setError(errorMessage(caught))
                                    }
                                  }}
                                />
                              </>
                            ) : null}
                          </>
                        ) : null}

                        {onChangeTaskList ? (
                          <>
                            <label htmlFor={`task-list-${task.id}`}>
                              List for {task.title}
                            </label>
                            <select
                              id={`task-list-${task.id}`}
                              value={task.listId ?? ''}
                              onChange={(event) =>
                                onChangeTaskList(
                                  task.id,
                                  event.target.value || null,
                                )
                              }
                            >
                              <option value="">No list</option>
                              {projectLists.map((list) => (
                                <option key={list.id} value={list.id}>
                                  {list.name}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : null}

                        {onChangeTaskProject ? (
                          <>
                            <label htmlFor={`task-project-${task.id}`}>
                              Project for {task.title}
                            </label>
                            <select
                              id={`task-project-${task.id}`}
                              value={task.projectId}
                              onChange={(event) =>
                                onChangeTaskProject(
                                  task.id,
                                  event.target.value,
                                )
                              }
                            >
                              {activeProjects.map((candidateProject) => (
                                <option
                                  key={candidateProject.id}
                                  value={candidateProject.id}
                                >
                                  {candidateProject.name}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : null}

                        {onDuplicateTask ? (
                          <button
                            type="button"
                            onClick={() => onDuplicateTask(task.id)}
                          >
                            Duplicate task {task.title}
                          </button>
                        ) : null}
                        {onSaveTaskTemplate ? (
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                onSaveTaskTemplate(task.id, task.title)
                                setError(null)
                              } catch (caught) {
                                setError(errorMessage(caught))
                              }
                            }}
                          >
                            Save task as template {task.title}
                          </button>
                        ) : null}
                        {onArchiveTask ? (
                          <button
                            type="button"
                            onClick={() => onArchiveTask(task.id)}
                          >
                            Archive task {task.title}
                          </button>
                        ) : null}
                        {onDeleteTask ? (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            Delete task {task.title}
                          </button>
                        ) : null}
                      </li>
                    )
                  })}
                  </ul>
                </>
              )}
            </section>
          )
        })
      )}


      {taskTemplates.length > 0 ? (
        <section>
          <h2>Task templates</h2>
          <ul>
            {taskTemplates.map((template) => {
              const selectedProjectId =
                taskTemplateProjects[template.id] !== undefined &&
                activeProjects.some(
                  (project) =>
                    project.id === taskTemplateProjects[template.id],
                )
                  ? taskTemplateProjects[template.id]
                  : activeProjects[0]?.id ?? ''
              const templateLists = lists.filter(
                (list) => list.projectId === selectedProjectId,
              )
              const selectedListId = templateLists.some(
                (list) => list.id === taskTemplateLists[template.id],
              )
                ? taskTemplateLists[template.id]
                : ''

              return (
                <li key={template.id}>
                  <span>{template.name}</span>
                  <label htmlFor={`task-template-project-${template.id}`}>
                    Project for task template {template.name}
                  </label>
                  <select
                    id={`task-template-project-${template.id}`}
                    value={selectedProjectId}
                    onChange={(event) => {
                      setTaskTemplateProjects((current) => ({
                        ...current,
                        [template.id]: event.target.value,
                      }))
                      setTaskTemplateLists((current) => ({
                        ...current,
                        [template.id]: '',
                      }))
                    }}
                  >
                    {activeProjects.length === 0 ? (
                      <option value="">No active projects</option>
                    ) : null}
                    {activeProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`task-template-list-${template.id}`}>
                    List for task template {template.name}
                  </label>
                  <select
                    id={`task-template-list-${template.id}`}
                    value={selectedListId}
                    onChange={(event) =>
                      setTaskTemplateLists((current) => ({
                        ...current,
                        [template.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">No list</option>
                    {templateLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  {onCreateTaskFromTemplate ? (
                    <button
                      type="button"
                      disabled={!selectedProjectId}
                      onClick={() => {
                        try {
                          onCreateTaskFromTemplate(
                            template.id,
                            selectedProjectId,
                            selectedListId || undefined,
                          )
                          setError(null)
                        } catch (caught) {
                          setError(errorMessage(caught))
                        }
                      }}
                    >
                      Create task from template {template.name}
                    </button>
                  ) : null}
                  {onDeleteTaskTemplate ? (
                    <button
                      type="button"
                      onClick={() => onDeleteTaskTemplate(template.id)}
                    >
                      Delete task template {template.name}
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {projectTemplates.length > 0 ? (
        <section>
          <h2>Project templates</h2>
          <ul>
            {projectTemplates.map((template) => (
              <li key={template.id}>
                <span>{template.name}</span>
                {onCreateProjectFromTemplate ? (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        onCreateProjectFromTemplate(template.id)
                        setError(null)
                      } catch (caught) {
                        setError(errorMessage(caught))
                      }
                    }}
                  >
                    Create project from template {template.name}
                  </button>
                ) : null}
                {onDeleteProjectTemplate ? (
                  <button
                    type="button"
                    onClick={() => onDeleteProjectTemplate(template.id)}
                  >
                    Delete project template {template.name}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {archivedProjects.length > 0 ? (
        <section>
          <h2>Archived projects</h2>
          <ul>
            {archivedProjects.map((project) => (
              <li key={project.id}>
                <span>{project.name}</span>
                {onRestoreProject ? (
                  <button
                    type="button"
                    onClick={() => onRestoreProject(project.id)}
                  >
                    Restore project {project.name}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {archivedTaskRoots.length > 0 ? (
        <section>
          <h2>Archived tasks</h2>
          {onRestoreTasks ? (
            <>
              <label>
                <input
                  type="checkbox"
                  aria-label="Select all archived tasks"
                  checked={allArchivedTaskRootsSelected}
                  onChange={(event) =>
                    changeAllArchivedTaskSelection(event.target.checked)
                  }
                />
                Select all archived tasks
              </label>
              <button
                type="button"
                disabled={selectedVisibleArchivedTaskIds.length === 0}
                onClick={() =>
                  runArchivedBulkAction(() =>
                    onRestoreTasks(selectedVisibleArchivedTaskIds),
                  )
                }
              >
                Restore selected archived tasks
              </button>
            </>
          ) : null}
          <ul>
            {archivedTaskRoots.map((task) => (
              <li key={task.id}>
                {onRestoreTasks ? (
                  <label>
                    <input
                      type="checkbox"
                      aria-label={`Select archived task ${task.title}`}
                      checked={selectedVisibleArchivedTaskIdSet.has(task.id)}
                      onChange={(event) =>
                        changeArchivedTaskSelection(task.id, event.target.checked)
                      }
                    />
                    Select archived task {task.title}
                  </label>
                ) : null}
                <span>{task.title}</span>
                {onRestoreTask ? (
                  <button
                    type="button"
                    onClick={() => onRestoreTask(task.id)}
                  >
                    Restore task {task.title}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </div>
    </main>
    </>
  )
}
