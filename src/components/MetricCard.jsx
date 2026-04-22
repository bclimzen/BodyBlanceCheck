import { getStatus, getStatusLabel } from '../utils/poseCalculations';
import { METRICS } from '../utils/constants';

const STATUS_COLOR = {
  good: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  unknown: '#6b7280',
};

export default function MetricCard({ metricKey, value, score }) {
  const metric = METRICS[metricKey];
  const status = getStatus(score);
  const color = STATUS_COLOR[status];

  const displayValue =
    value !== null && value !== undefined ? `${value.toFixed(1)}${metric.unit}` : '—';

  const barWidth = score !== null ? `${score}%` : '0%';

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{metric.label}</span>
        <span className="metric-status-badge" style={{ backgroundColor: `${color}25`, color }}>
          {getStatusLabel(score)}
        </span>
      </div>
      <div className="metric-value" style={{ color }}>
        {displayValue}
      </div>
      <p className="metric-desc">{metric.description}</p>
      <div className="metric-bar-bg">
        <div
          className="metric-bar-fill"
          style={{ width: barWidth, backgroundColor: color }}
        />
      </div>
      <div className="metric-score-row">
        <span className="metric-score-label">점수</span>
        <span className="metric-score-value">{score !== null ? Math.round(score) : '—'}</span>
      </div>
    </div>
  );
}
