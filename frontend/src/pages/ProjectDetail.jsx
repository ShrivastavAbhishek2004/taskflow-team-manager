import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TaskModal({ task, project, members, onClose, onSave, onDelete, memberRole, toast }) {
  const isNew = !task._id;
  const [form, setForm] = useState({
    title: task.title || '', description: task.description || '',
    status: task.status || 'todo', priority: task.priority || 'medium',
    assignee: task.assignee?._id || task.assignee || '',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    tags: (task.tags || []).join(', ')
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try { await onDelete(task._id); onClose(); }
    catch { toast.error('Failed to delete task'); }
  };

  return (
    <Modal
      title={isNew ? '+ New Task' : 'Edit Task'}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          {!isNew && memberRole === 'admin' && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳' : isNew ? '+ Create' : '💾 Save'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Title *</label>
          <input className="input" autoFocus placeholder="Task title" value={form.title} onChange={set('title')} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="input" placeholder="Details…" value={form.description} onChange={set('description')} rows={3} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Assignee</label>
            <select className="input" value={form.assignee} onChange={set('assignee')}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="input" placeholder="e.g. frontend, bug, urgent" value={form.tags} onChange={set('tags')} />
        </div>
      </div>
    </Modal>
  );
}

function MembersPanel({ project, onUpdate, toast, memberRole }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/api/users/search?email=${encodeURIComponent(search)}`);
      setResults(res.data.users);
    } catch { toast.error('Search failed'); }
    finally { setSearching(false); }
  };

  const addMember = async (email) => {
    try {
      const res = await api.post(`/api/projects/${project._id}/members`, { email });
      onUpdate(res.data.project);
      setResults([]);
      setSearch('');
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/api/projects/${project._id}/members/${userId}`);
      onUpdate(res.data.project);
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeRole = async (userId, role) => {
    try {
      const res = await api.put(`/api/projects/${project._id}/members/${userId}/role`, { role });
      onUpdate(res.data.project);
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <h3 className="section-title">Team Members ({project.members.length})</h3>
      {memberRole === 'admin' && (
        <div className="search-box">
          <input
            className="input" placeholder="Search by email to add…"
            value={search} onChange={e => { setSearch(e.target.value); setResults([]); }}
            onKeyDown={e => e.key === 'Enter' && searchUsers()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" onClick={searchUsers} disabled={searching}>
            {searching ? '⏳' : '🔍'}
          </button>
        </div>
      )}
      {results.length > 0 && (
        <div style={{ marginBottom: '1rem', background: 'var(--surface2)', borderRadius: '8px', overflow: 'hidden' }}>
          {results.map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
              <Avatar name={u.name} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => addMember(u.email)}>+ Add</button>
            </div>
          ))}
        </div>
      )}
      <div className="members-list">
        {project.members.map(m => (
          <div key={m.user._id} className="member-row">
            <Avatar name={m.user.name} size="sm" />
            <div className="member-info">
              <div className="member-name">{m.user.name}</div>
              <div className="member-email">{m.user.email}</div>
            </div>
            <div className="member-actions">
              <span className={`badge badge-${m.role}`}>{m.role}</span>
              {memberRole === 'admin' && project.owner._id !== m.user._id && (
                <>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => changeRole(m.user._id, m.role === 'admin' ? 'member' : 'admin')}
                    title={m.role === 'admin' ? 'Demote to member' : 'Promote to admin'}
                  >
                    {m.role === 'admin' ? '⬇' : '⬆'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.user._id)}>✕</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberRole, setMemberRole] = useState('member');
  const [activeTab, setActiveTab] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks/project/${id}`)
      ]);
      setProject(pRes.data.project);
      setMemberRole(pRes.data.memberRole);
      setTasks(tRes.data.tasks);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSaveTask = async (payload) => {
    if (selectedTask?._id) {
      const res = await api.put(`/api/tasks/${selectedTask._id}`, payload);
      setTasks(t => t.map(x => x._id === res.data.task._id ? res.data.task : x));
      toast.success('Task updated!');
    } else {
      const res = await api.post(`/api/tasks/project/${id}`, payload);
      setTasks(t => [res.data.task, ...t]);
      toast.success('Task created!');
    }
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/api/tasks/${taskId}`);
    setTasks(t => t.filter(x => x._id !== taskId));
    toast.success('Task deleted');
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}"? This will delete all tasks.`)) return;
    try {
      await api.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete project'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!project) return null;

  return (
    <div className="page fade-in">
      <Toast toasts={toast.toasts} remove={toast.remove} />

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Projects</button>
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="avatar-group">
            {project.members.slice(0, 5).map(m => <Avatar key={m.user._id} name={m.user.name} size="sm" />)}
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedTask({}); setShowNewTask(true); }}>
            + Add Task
          </button>
          {memberRole === 'admin' && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑</button>
          )}
        </div>
      </div>

      <div className="tabs">
        {['board', 'members'].map(tab => (
          <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'board' ? '🗂 Board' : '👥 Members'}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(task) => { setSelectedTask(task); setShowNewTask(true); }}
          onAddTask={() => { setSelectedTask({}); setShowNewTask(true); }}
          memberRole={memberRole}
        />
      )}

      {activeTab === 'members' && (
        <div className="card" style={{ padding: '1.5rem', maxWidth: 600 }}>
          <MembersPanel
            project={project}
            onUpdate={setProject}
            toast={toast}
            memberRole={memberRole}
          />
        </div>
      )}

      {showNewTask && (
        <TaskModal
          task={selectedTask || {}}
          project={project}
          members={project.members}
          onClose={() => { setShowNewTask(false); setSelectedTask(null); }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          memberRole={memberRole}
          toast={toast}
        />
      )}
    </div>
  );
}
