import { AutomationPanel } from './AutomationPanel'
import { DashboardPanel } from './DashboardPanel'
import { GoalPanel } from './GoalPanel'
import { KnowledgePanel } from './KnowledgePanel'
import type { WorkspaceCommands } from './application/workspace-commands'
import type { DashboardViewModel } from './domain/dashboard'
import type { WorkspaceState } from './domain/workspace'

export interface WorkspaceSupplementalPanelsProps {
  state: WorkspaceState
  dashboard: DashboardViewModel
  commands: WorkspaceCommands
}

/** Supplementary local workspace editors share the guarded command boundary. */
export function WorkspaceSupplementalPanels({
  state, dashboard, commands,
}: WorkspaceSupplementalPanelsProps) {
  return (
    <>
      <DashboardPanel dashboard={dashboard} />
      <KnowledgePanel
        state={state}
        onAddKnowledgeDocument={(title, input) =>
          commands.addKnowledgeDocument(title, input)
        }
        onRenameKnowledgeDocument={(documentId, title) =>
          commands.renameKnowledgeDocument(documentId, title)
        }
        onChangeKnowledgeDocumentContent={(documentId, content) =>
          commands.changeKnowledgeDocumentContent(documentId, content)
        }
        onChangeKnowledgeDocumentKind={(documentId, kind) =>
          commands.changeKnowledgeDocumentKind(documentId, kind)
        }
        onChangeKnowledgeDocumentProject={(documentId, projectId) =>
          commands.changeKnowledgeDocumentProject(documentId, projectId)
        }
        onChangeKnowledgeDocumentSourceOfTruth={(documentId, sourceOfTruth) =>
          commands.changeKnowledgeDocumentSourceOfTruth(documentId, sourceOfTruth)
        }
        onDeleteKnowledgeDocument={(documentId) =>
          commands.deleteKnowledgeDocument(documentId)
        }
      />
      <GoalPanel
        state={state}
        onAddGoal={(name, input) => commands.addGoal(name, input)}
        onRenameGoal={(goalId, name) => commands.renameGoal(goalId, name)}
        onChangeGoalDescription={(goalId, description) =>
          commands.changeGoalDescription(goalId, description)
        }
        onChangeGoalTargetType={(goalId, targetType) =>
          commands.changeGoalTargetType(goalId, targetType)
        }
        onChangeGoalValues={(goalId, targetValue, currentValue) =>
          commands.changeGoalValues(goalId, targetValue, currentValue)
        }
        onLinkGoalTask={(goalId, taskId) => commands.linkGoalTask(goalId, taskId)}
        onUnlinkGoalTask={(goalId, taskId) =>
          commands.unlinkGoalTask(goalId, taskId)
        }
        onDeleteGoal={(goalId) => commands.deleteGoal(goalId)}
      />
      <AutomationPanel
        state={state}
        onAddAutomation={(name, input) => commands.addAutomation(name, input)}
        onRenameAutomation={(automationId, name) =>
          commands.renameAutomation(automationId, name)
        }
        onSetAutomationEnabled={(automationId, enabled) =>
          commands.setAutomationEnabled(automationId, enabled)
        }
        onChangeAutomationTrigger={(automationId, trigger) =>
          commands.changeAutomationTrigger(automationId, trigger)
        }
        onChangeAutomationConditions={(automationId, conditions) =>
          commands.changeAutomationConditions(automationId, conditions)
        }
        onChangeAutomationActions={(automationId, actions) =>
          commands.changeAutomationActions(automationId, actions)
        }
        onDeleteAutomation={(automationId) => commands.deleteAutomation(automationId)}
      />
    </>
  )
}
