const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = SIZE * 0.36;

function polarToXY(angleRad, r) {
  return {
    x: CENTER + r * Math.cos(angleRad),
    y: CENTER + r * Math.sin(angleRad),
  };
}

export default function RadarChart({ data }) {
  const n = data.length;
  const startAngle = -Math.PI / 2;

  const axes = data.map((_, i) => {
    const angle = startAngle + (Math.PI * 2 * i) / n;
    return { angle, tip: polarToXY(angle, RADIUS) };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = data.map((item, i) => {
    const angle = axes[i].angle;
    const r = RADIUS * ((item.score ?? 0) / 100);
    return polarToXY(angle, r);
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ overflow: 'visible' }}
    >
      {/* Grid polygons */}
      {gridLevels.map((level) => {
        const pts = axes.map(({ angle }) => {
          const p = polarToXY(angle, RADIUS * level);
          return `${p.x},${p.y}`;
        });
        return (
          <polygon
            key={level}
            points={pts.join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {axes.map(({ tip }, i) => (
        <line
          key={i}
          x1={CENTER}
          y1={CENTER}
          x2={tip.x}
          y2={tip.y}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="rgba(99,102,241,0.35)"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill={data[i].score >= 80 ? '#10b981' : data[i].score >= 55 ? '#f59e0b' : '#ef4444'}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}

      {/* Labels */}
      {data.map((item, i) => {
        const angle = axes[i].angle;
        const labelR = RADIUS + 26;
        const lp = polarToXY(angle, labelR);
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9.5"
            fontWeight="600"
            fill="rgba(255,255,255,0.75)"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}
