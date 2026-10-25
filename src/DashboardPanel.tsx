import type { DashboardViewModel } from './domain/dashboard'

export interface DashboardPanelProps {
  dashboard: DashboardViewModel
}

function formatPercent(value: number): string {
  const rounded = Number(value.toFixed(1))
  return `${rounded}%`
}

export function DashboardPanel({ dashboard }: DashboardPanelProps) {
  return (
    <section id="workspace-dashboard" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">Dashboard</h2>
      <div aria-label="Dashboard KPIs">
        <article aria-label="Active Tasks">
          <h3>Active Tasks</h3>
          <p>{dashboard.kpis.activeTasks}</p>
        </article>
        <article aria-label="Completed Tasks">
          <h3>Completed Tasks</h3>
          <p>{dashboard.kpis.completedTasks}</p>
        </article>
        <article aria-label="Open Tasks">
          <h3>Open Tasks</h3>
          <p>{dashboard.kpis.openTasks}</p>
        </article>
        <article aria-label="Completion">
          <h3>Completion</h3>
          <p>{formatPercent(dashboard.kpis.completionPercent)}</p>
        </article>
        <article aria-label="Overdue Tasks">
          <h3>Overdue Tasks</h3>
          <p>{dashboard.kpis.overdueTasks}</p>
        </article>
      </div>

      <section aria-label="Task status">
        <h3>Task status</h3>
        <div>
          {dashboard.taskStatus.map((item) => (
            <p key={item.key}>
              {item.label}: {item.count} ({formatPercent(item.percent)})
            </p>
          ))}
        </div>
      </section>

      <section aria-label="Task priority">
        <h3>Task priority</h3>
        <div>
          {dashboard.taskPriority.map((item) => (
            <p key={item.key}>
              {item.label}: {item.count} ({formatPercent(item.percent)})
            </p>
          ))}
        </div>
      </section>

      <section aria-label="Due-date attention">
        <h3>Due-date attention</h3>
        <p>Attention now: {dashboard.attention.attentionNow}</p>
        <div>
          <p>Overdue: {dashboard.attention.overdue}</p>
          <p>Due today: {dashboard.attention.dueToday}</p>
          <p>Upcoming: {dashboard.attention.upcoming}</p>
          <p>Unscheduled: {dashboard.attention.unscheduled}</p>
          <p>Total open: {dashboard.attention.totalOpen}</p>
        </div>
      </section>

      <section aria-label="Project progress">
        <h3>Project progress</h3>
        {dashboard.projects.length === 0 ? <p>No active Projects</p> : null}
        <div>
          {dashboard.projects.map((project) => (
            <p key={project.projectId}>
              {project.projectName}: {project.doneTasks} / {project.totalTasks} ({formatPercent(project.completionPercent)})
            </p>
          ))}
        </div>
      </section>

      <section aria-label="Goal progress">
        <h3>Goal progress</h3>
        {dashboard.goals.length === 0 ? <p>No Goals</p> : null}
        <div>
          {dashboard.goals.map((goal) => (
            <p key={goal.goalId}>
              {goal.goalName}: {goal.currentValue} / {goal.targetValue} ({formatPercent(goal.percent)})
            </p>
          ))}
        </div>
      </section>
    </section>
  )
}
