const COLORS = [
  ['#6366f1','#312e81'],['#8b5cf6','#4c1d95'],['#06b6d4','#164e63'],
  ['#10b981','#064e3b'],['#f59e0b','#78350f'],['#ef4444','#7f1d1d'],
  ['#ec4899','#831843'],['#14b8a6','#134e4a'],
];

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export default function Avatar({ name = '?', size = 'md', style = {} }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [fg, bg] = getColor(name);
  return (
    <div
      className={`avatar avatar-${size}`}
      style={{ background: `linear-gradient(135deg, ${fg}, ${bg})`, color: '#fff', ...style }}
      title={name}
    >
      {initials}
    </div>
  );
}
