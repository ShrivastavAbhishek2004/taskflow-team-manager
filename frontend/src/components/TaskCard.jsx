import Avatar from './Avatar';

const PRIORITY_COLORS = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: '#ff6b6b' };
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date() && true;
}

export default function TaskCard({ task, onClick }) {
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';
  return (
    <div className="task-card" onClick={() => onClick(task)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div
          className="priority-dot"
          style={{ background: PRIORITY_COLORS[task.priority], marginTop: '5px', borderRadius: '50%', width: 8, height: 8, flexShrink: 0 }}
        />
        <p className="task-card-title">{task.title}</p>
      </div>
      <div className="task-card-footer">
        <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
        {task.dueDate && (
          <span className={`due-date${overdue ? ' overdue' : ''}`}>
            {overdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignee && (
          <div style={{ marginLeft: 'auto' }}>
            <Avatar name={task.assignee.name} size="sm" />
          </div>
        )}
      </div>
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {task.tags.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
    </div>
  );
}
