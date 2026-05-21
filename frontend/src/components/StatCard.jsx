export default function StatCard({ icon, value, label, color, gradient }) {
  return (
    <div className="stat-card card fade-in">
      <div
        className="stat-card-icon"
        style={{ background: `rgba(${color},0.15)`, color: `rgb(${color})` }}
      >
        {icon}
      </div>
      <div className="stat-card-glow" style={{ background: `rgb(${color})` }} />
      <div className="stat-card-value" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
