import { useState } from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'in-progress', label: 'In Progress', emoji: '🔄' },
  { key: 'review', label: 'Review', emoji: '👀' },
  { key: 'done', label: 'Done', emoji: '✅' },
];

export default function KanbanBoard({ tasks, onTaskClick, onAddTask, memberRole }) {
  const byStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = byStatus(col.key);
        return (
          <div key={col.key} className={`kanban-col col-${col.key}`}>
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col.emoji} {col.label}</span>
              <span className="kanban-col-count">{colTasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {colTasks.map(task => (
                <TaskCard key={task._id} task={task} onClick={onTaskClick} />
              ))}
              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  No tasks here
                </div>
              )}
            </div>
            {col.key === 'todo' && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
                onClick={onAddTask}
              >
                + Add Task
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
