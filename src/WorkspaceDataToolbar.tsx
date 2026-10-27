export interface WorkspaceDataToolbarProps {
  onExport: () => void
  onImport: (file: File) => void
  error: string | null
}

export function WorkspaceDataToolbar({ onExport, onImport, error }: WorkspaceDataToolbarProps) {
  return (
    <section aria-label="Workspace data" className="workspace-data-toolbar">
      <span className="workspace-data-toolbar-title">Workspace data</span>
      <div className="workspace-data-toolbar-actions">
        <button type="button" onClick={onExport}>Export backup</button>
        <label htmlFor="backup-import-file">Import backup</label>
        <input
          id="backup-import-file"
          type="file"
          accept=".json,application/json"
          onChange={event => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) onImport(file)
          }}
        />
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </section>
  )
}
