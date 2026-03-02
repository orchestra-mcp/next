import { useMemo, useCallback, useState } from 'react';
import type { DetailField } from '../DetailPanel';
import { DetailPanel } from '../DetailPanel';
import { StatusBadge } from '../StatusBadge';
import { PriorityIcon } from '../PriorityIcon';
import { EditableText, EditableTextarea, EditableSelect } from '../InlineEdit';
import { MarkdownRenderer } from '@orchestra-mcp/editor';
import { useTaskDetail } from '../hooks';
import type { TaskDetailParams } from '../hooks/useTaskDetail';
import { mcpCall } from '../mcp/client';
import { LabelsSection } from '../LabelsSection';
import { LinksSection } from '../LinksSection';
import { StatusActions } from './StatusActions';
import { EvidenceLog } from '../EvidenceLog';
import { StaleNotification } from '../StaleNotification';
import './TaskDetailPanel.css';

export interface TaskDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  params: TaskDetailParams | null;
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskDetailPanel({ isOpen, onClose, params }: TaskDetailPanelProps) {
  const {
    task, loading, error, refresh,
    isStale, acceptStale, dismissStale,
  } = useTaskDetail(isOpen ? params : null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const saveField = useCallback(async (field: string, value: string) => {
    if (!params) return;
    setSavingField(field);
    try {
      await mcpCall('update_task', {
        project: params.project,
        epic_id: params.epicId,
        story_id: params.storyId,
        task_id: params.taskId,
        [field]: value,
      });
      await refresh();
    } catch { /* field reverts on next refresh */ }
    setSavingField(null);
  }, [params, refresh]);

  const fields = useMemo<DetailField[]>(() => {
    if (!task) return [];
    const result: DetailField[] = [];
    result.push({ label: 'Status', value: task.status });
    result.push({ label: 'Type', value: task.type });
    if (task.estimate !== undefined) result.push({ label: 'Estimate', value: `${task.estimate} pts` });
    return result;
  }, [task]);

  return (
    <DetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={task?.title ?? 'Loading...'}
      subtitle={task?.id}
      fields={fields}
    >
      {loading && <div className="task-detail__loading">Loading task...</div>}
      {error && <div className="task-detail__error">{error}</div>}
      {task && params && (
        <>
          {isStale && (
            <StaleNotification onRefresh={acceptStale} onDismiss={dismissStale} />
          )}

          <div className="task-detail__status-row">
            <StatusBadge status={task.status} variant="pill" size="md" />
            {task.priority && <PriorityIcon priority={task.priority} size={16} />}
          </div>

          <StatusActions
            status={task.status}
            project={params.project}
            epicId={params.epicId}
            storyId={params.storyId}
            taskId={params.taskId}
            onAction={refresh}
          />

          <section className="task-detail__section">
            <h3 className="task-detail__section-title">Title</h3>
            <EditableText
              value={task.title}
              onSave={(v) => saveField('title', v)}
              saving={savingField === 'title'}
              tag="h2"
              className="task-detail__editable-title"
            />
          </section>

          <section className="task-detail__section">
            <div className="task-detail__section-header">
              <h3 className="task-detail__section-title">Description</h3>
              <button
                type="button"
                className="task-detail__edit-btn"
                onClick={() => setIsEditingDescription(!isEditingDescription)}
              >
                {isEditingDescription ? 'View' : 'Edit'}
              </button>
            </div>
            {isEditingDescription ? (
              <EditableTextarea
                value={task.description ?? ''}
                onSave={async (v) => {
                  await saveField('description', v);
                  setIsEditingDescription(false);
                }}
                saving={savingField === 'description'}
                placeholder="Click to add description..."
              />
            ) : (
              <div className="task-detail__markdown">
                {task.description ? (
                  <MarkdownRenderer content={task.description} />
                ) : (
                  <p className="task-detail__empty" onClick={() => setIsEditingDescription(true)}>
                    Click edit to add description...
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="task-detail__section">
            <h3 className="task-detail__section-title">Priority</h3>
            <EditableSelect
              value={task.priority ?? ''}
              options={PRIORITY_OPTIONS}
              onSave={(v) => saveField('priority', v)}
              saving={savingField === 'priority'}
              placeholder="Select priority"
            />
          </section>

          <section className="task-detail__section">
            <h3 className="task-detail__section-title">Assignee</h3>
            <EditableText
              value={task.assigned_to ?? ''}
              onSave={(v) => saveField('assigned_to', v)}
              saving={savingField === 'assigned_to'}
            />
          </section>

          <LabelsSection
            labels={task.labels ?? []}
            project={params!.project}
            epicId={params!.epicId}
            storyId={params!.storyId}
            taskId={params!.taskId}
            onUpdate={refresh}
          />

          {task.depends_on && task.depends_on.length > 0 && (
            <section className="task-detail__section">
              <h3 className="task-detail__section-title">Dependencies</h3>
              <ul className="task-detail__deps">
                {task.depends_on.map((dep) => (
                  <li key={dep} className="task-detail__dep">{dep}</li>
                ))}
              </ul>
            </section>
          )}

          <LinksSection
            links={task.links ?? []}
            project={params!.project}
            epicId={params!.epicId}
            storyId={params!.storyId}
            taskId={params!.taskId}
            onUpdate={refresh}
          />

          {(task.created_at || task.updated_at) && (
            <section className="task-detail__section task-detail__timestamps">
              {task.created_at && (
                <span className="task-detail__timestamp">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </span>
              )}
              {task.updated_at && (
                <span className="task-detail__timestamp">
                  Updated: {new Date(task.updated_at).toLocaleDateString()}
                </span>
              )}
            </section>
          )}

          {task.evidence && task.evidence.length > 0 && (
            <EvidenceLog evidence={task.evidence} />
          )}
        </>
      )}
    </DetailPanel>
  );
}
