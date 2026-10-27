/** Local anchors, not client-side routing or persisted navigation state. */
export function WorkspaceSectionNavigation() {
  return (
    <nav aria-label="Workspace sections" className="workspace-section-nav">
      <a href="#workspace-dashboard">Dashboard</a>
      <a href="#workspace-knowledge">Knowledge</a>
      <a href="#workspace-goals">Goals</a>
      <a href="#workspace-automations">Automations</a>
    </nav>
  )
}
