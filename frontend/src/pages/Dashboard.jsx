import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import Avatar from '../components/Avatar';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };
const PRIORITY_COLORS = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: '#ff6b6b' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/tasks/dashboard/summary')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading dashboard…</span>
    </div>
  );

  const { stats = {}, myTasks = [] } = data || {};

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          + New Project
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon="📁" value={stats.totalProjects ?? 0} label="Total Projects"
          color="99,102,241" gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard icon="📋" value={stats.totalTasks ?? 0} label="Total Tasks"
          color="6,182,212" gradient="linear-gradient(135deg,#06b6d4,#0891b2)" />
        <StatCard icon="⏰" value={stats.dueToday ?? 0} label="Due Today"
          color="245,158,11" gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard icon="🚨" value={stats.overdueTasks ?? 0} label="Overdue"
          color="239,68,68" gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>My Tasks</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ✅ {stats.completedThisWeek ?? 0} completed this week
            </span>
          </div>
          {myTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3>All caught up!</h3>
              <p>You have no tasks assigned to you. Join a project or create tasks.</p>
              <button className="btn btn-primary" onClick={() => navigate('/projects')}>View Projects</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myTasks.map(task => {
                const overdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/projects/${task.project._id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.875rem 1rem', background: 'var(--surface2)',
                      borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${overdue ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = overdue ? 'rgba(239,68,68,0.3)' : 'var(--border)'}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📁 {task.project?.name}</div>
                    </div>
                    <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: '0.75rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {overdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
