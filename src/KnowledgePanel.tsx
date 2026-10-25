import { useState, type FormEvent } from 'react'

import type { KnowledgeDocument, KnowledgeDocumentKind } from './domain/knowledge-document'
import type { WorkspaceState } from './domain/workspace'

export interface KnowledgePanelProps {
  state: WorkspaceState
  onAddKnowledgeDocument(title: string, input: { kind: KnowledgeDocumentKind; content: string; projectId?: string; sourceOfTruth?: boolean }): void
  onRenameKnowledgeDocument(documentId: string, title: string): void
  onChangeKnowledgeDocumentContent(documentId: string, content: string): void
  onChangeKnowledgeDocumentKind(documentId: string, kind: KnowledgeDocumentKind): void
  onChangeKnowledgeDocumentProject(documentId: string, projectId: string | null): void
  onChangeKnowledgeDocumentSourceOfTruth(documentId: string, sourceOfTruth: boolean): void
  onDeleteKnowledgeDocument(documentId: string): void
}

function KnowledgeEditor({ document, state, onRename, onContentChange, onKindChange, onProjectChange, onSourceOfTruthChange, onDelete }: {
  document: KnowledgeDocument
  state: WorkspaceState
  onRename(title: string): void
  onContentChange(content: string): void
  onKindChange(kind: KnowledgeDocumentKind): void
  onProjectChange(projectId: string | null): void
  onSourceOfTruthChange(sourceOfTruth: boolean): void
  onDelete(): void
}) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(document.content)

  return (
    <article>
      <h3>{document.title}</h3>
      <form onSubmit={(event) => { event.preventDefault(); onRename(title) }}>
        <label htmlFor={`knowledge-title-${document.id}`}>Document title for {document.title}</label>
        <input id={`knowledge-title-${document.id}`} value={title} onChange={(event) => setTitle(event.target.value)} />
        <button type="submit">Rename {document.title}</button>
      </form>
      <form onSubmit={(event) => { event.preventDefault(); onContentChange(content) }}>
        <label htmlFor={`knowledge-content-${document.id}`}>Document content for {document.title}</label>
        <textarea id={`knowledge-content-${document.id}`} value={content} onChange={(event) => setContent(event.target.value)} />
        <button type="submit">Save content for {document.title}</button>
      </form>
      <label htmlFor={`knowledge-kind-${document.id}`}>Document kind for {document.title}</label>
      <select id={`knowledge-kind-${document.id}`} value={document.kind} onChange={(event) => onKindChange(event.target.value as KnowledgeDocumentKind)}>
        <option value="note">Note</option><option value="doc">Doc</option>
      </select>
      <label htmlFor={`knowledge-project-${document.id}`}>Project for {document.title}</label>
      <select id={`knowledge-project-${document.id}`} value={document.projectId ?? ''} onChange={(event) => onProjectChange(event.target.value || null)}>
        <option value="">No Project</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
      <label><input type="checkbox" checked={document.sourceOfTruth === true} onChange={(event) => onSourceOfTruthChange(event.target.checked)} />Source of truth for {document.title}</label>
      <button type="button" onClick={onDelete}>Delete {document.title}</button>
    </article>
  )
}

function KnowledgeSection({ title, documents, state, props }: { title: string; documents: KnowledgeDocument[]; state: WorkspaceState; props: KnowledgePanelProps }) {
  return (
    <section aria-label={title}>
      <h3>{title}</h3>
      {documents.length === 0 ? <p>No {title}</p> : null}
      {documents.map((document) => (
        <KnowledgeEditor key={document.id} document={document} state={state}
          onRename={(nextTitle) => props.onRenameKnowledgeDocument(document.id, nextTitle)}
          onContentChange={(nextContent) => props.onChangeKnowledgeDocumentContent(document.id, nextContent)}
          onKindChange={(nextKind) => props.onChangeKnowledgeDocumentKind(document.id, nextKind)}
          onProjectChange={(nextProjectId) => props.onChangeKnowledgeDocumentProject(document.id, nextProjectId)}
          onSourceOfTruthChange={(nextSourceOfTruth) => props.onChangeKnowledgeDocumentSourceOfTruth(document.id, nextSourceOfTruth)}
          onDelete={() => props.onDeleteKnowledgeDocument(document.id)}
        />
      ))}
    </section>
  )
}

export function KnowledgePanel(props: KnowledgePanelProps) {
  const { state, onAddKnowledgeDocument } = props
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<KnowledgeDocumentKind>('note')
  const [content, setContent] = useState('')
  const [projectId, setProjectId] = useState('')
  const [sourceOfTruth, setSourceOfTruth] = useState(false)
  const documents = state.knowledgeDocuments ?? []
  const wiki = documents.filter((document) => document.sourceOfTruth === true)
  const notes = documents.filter((document) => document.sourceOfTruth !== true && document.kind === 'note')
  const docs = documents.filter((document) => document.sourceOfTruth !== true && document.kind === 'doc')

  function addDocument(event: FormEvent) {
    event.preventDefault()
    onAddKnowledgeDocument(title, { kind, content, projectId: projectId || undefined, sourceOfTruth })
    setTitle(''); setContent('')
  }

  return (
    <section id="workspace-knowledge" aria-label="Knowledge">
      <h2>Notes / Docs / Wiki</h2>
      <form onSubmit={addDocument}>
        <label htmlFor="new-knowledge-title">New document title</label>
        <input id="new-knowledge-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <label htmlFor="new-knowledge-kind">New document kind</label>
        <select id="new-knowledge-kind" value={kind} onChange={(event) => setKind(event.target.value as KnowledgeDocumentKind)}><option value="note">Note</option><option value="doc">Doc</option></select>
        <label htmlFor="new-knowledge-content">New document content</label>
        <textarea id="new-knowledge-content" value={content} onChange={(event) => setContent(event.target.value)} />
        <label htmlFor="new-knowledge-project">New document Project</label>
        <select id="new-knowledge-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">No Project</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <label><input type="checkbox" checked={sourceOfTruth} onChange={(event) => setSourceOfTruth(event.target.checked)} />New document is Wiki source of truth</label>
        <button type="submit">Add document</button>
      </form>
      <KnowledgeSection title="Notes" documents={notes} state={state} props={props} />
      <KnowledgeSection title="Docs" documents={docs} state={state} props={props} />
      <KnowledgeSection title="Wiki" documents={wiki} state={state} props={props} />
    </section>
  )
}
