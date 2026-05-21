import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/api/projects')
      .then(res => setProjects(res.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/projects', form);
      setProjects(p => [res.data.project, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page fade-in">
      <Toast toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          className="input"
          placeholder="🔍 Search projects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>{search ? 'No projects match your search' : 'No projects yet'}</h3>
          <p>{search ? 'Try a different search term.' : 'Create your first project and start tracking tasks with your team.'}</p>
          {!search && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>}
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      {showModal && (
        <Modal
          title="New Project"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? '⏳ Creating…' : '🚀 Create Project'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Project Name *</label>
              <input
                className="input" autoFocus placeholder="e.g. Website Redesign"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleCreate(e)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input" placeholder="What is this project about?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
