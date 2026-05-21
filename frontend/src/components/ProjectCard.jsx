import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const pct = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;

  return (
    <div className="project-card fade-in" onClick={() => navigate(`/projects/${project._id}`)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h3 className="project-card-name">{project.name}</h3>
        <span className={`badge badge-${project.status}`}>{project.status}</span>
      </div>
      <p className="project-card-desc">{project.description || 'No description provided.'}</p>
      <div className="project-progress">
        <div className="project-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="project-stats">
        <span>📋 {project.taskCount} tasks</span>
        <span>✅ {project.completedCount} done</span>
        <span>📊 {pct}%</span>
      </div>
      <div className="project-card-footer" style={{ marginTop: '1rem' }}>
        <div className="avatar-group project-members">
          {project.members.slice(0, 5).map(m => (
            <Avatar key={m.user._id} name={m.user.name} size="sm" />
          ))}
          {project.members.length > 5 && (
            <div className="avatar avatar-sm" style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '2px solid var(--surface)' }}>
              +{project.members.length - 5}
            </div>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {project.members.length} member{project.members.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
