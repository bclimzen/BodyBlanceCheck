import { getStatus } from '../utils/poseCalculations';

const STATUS_COLOR = {
  good: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  unknown: '#6b7280',
};

function IndicatorDot({ cx, cy, status, label }) {
  const color = STATUS_COLOR[status];
  return (
    <g>
      <circle cx={cx} cy={cy} r="7" fill={color} opacity="0.9" />
      <circle cx={cx} cy={cy} r="7" fill="none" stroke={color} strokeWidth="2" opacity="0.4">
        <animate attributeName="r" from="7" to="14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

export default function BodyDiagram({ scores }) {
  const s = (key) => getStatus(scores[key]);

  return (
    <div className="body-diagram-wrapper">
      <svg viewBox="0 0 120 260" className="body-diagram-svg" fill="none">
        {/* Head */}
        <circle cx="60" cy="28" r="18" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="55" y="45" width="10" height="12" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Shoulders */}
        <path d="M25 65 Q60 55 95 65" stroke="#475569" strokeWidth="1.5" />
        <circle cx="25" cy="65" r="5" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        <circle cx="95" cy="65" r="5" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Torso */}
        <path d="M30 65 L28 130 Q60 140 92 130 L90 65" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Arms */}
        <line x1="25" y1="65" x2="10" y2="115" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
        <line x1="95" y1="65" x2="110" y2="115" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

        {/* Hips */}
        <path d="M28 130 Q60 145 92 130" stroke="#475569" strokeWidth="1.5" />
        <circle cx="33" cy="133" r="5" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        <circle cx="87" cy="133" r="5" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Legs */}
        <line x1="38" y1="133" x2="35" y2="210" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
        <line x1="82" y1="133" x2="85" y2="210" stroke="#475569" strokeWidth="10" strokeLinecap="round" />

        {/* Feet */}
        <ellipse cx="33" cy="218" rx="12" ry="6" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="87" cy="218" rx="12" ry="6" fill="#334155" stroke="#475569" strokeWidth="1.5" />

        {/* Indicator: head tilt (top of head) */}
        <IndicatorDot cx="60" cy="14" status={s('headTilt')} label="머리" />

        {/* Indicator: forward head (neck) */}
        <IndicatorDot cx="82" cy="48" status={s('forwardHead')} label="거북목" />

        {/* Indicator: shoulder (mid-shoulder line) */}
        <IndicatorDot cx="60" cy="60" status={s('shoulderTilt')} label="어깨" />

        {/* Indicator: trunk (mid torso) */}
        <IndicatorDot cx="60" cy="97" status={s('trunkLean')} label="체간" />

        {/* Indicator: hip */}
        <IndicatorDot cx="60" cy="133" status={s('hipTilt')} label="골반" />
      </svg>

      {/* Legend */}
      <div className="diagram-legend">
        {[
          { color: '#10b981', label: '정상' },
          { color: '#f59e0b', label: '주의' },
          { color: '#ef4444', label: '위험' },
          { color: '#6b7280', label: '미측정' },
        ].map(({ color, label }) => (
          <div key={label} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
