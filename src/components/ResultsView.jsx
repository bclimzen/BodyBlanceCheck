import { useMemo } from 'react';
import { analyzeAll, getRecommendations } from '../utils/poseCalculations';
import { METRICS, CAPTURE_STEPS } from '../utils/constants';
import MetricCard from './MetricCard';
import BodyDiagram from './BodyDiagram';
import RadarChart from './RadarChart';

const OVERALL_GRADE = [
  { min: 90, label: 'S', desc: '매우 우수', color: '#10b981' },
  { min: 75, label: 'A', desc: '우수', color: '#34d399' },
  { min: 60, label: 'B', desc: '보통', color: '#f59e0b' },
  { min: 45, label: 'C', desc: '주의 필요', color: '#fb923c' },
  { min: 0, label: 'D', desc: '개선 필요', color: '#ef4444' },
];

function getGrade(score) {
  return OVERALL_GRADE.find((g) => score >= g.min) ?? OVERALL_GRADE[OVERALL_GRADE.length - 1];
}

export default function ResultsView({ data, onRetry }) {
  const { raw, scores, overallScore } = useMemo(() => analyzeAll(data), [data]);
  const recommendations = useMemo(() => getRecommendations(raw, scores), [raw, scores]);
  const grade = overallScore !== null ? getGrade(overallScore) : null;

  const radarData = Object.keys(METRICS).map((key) => ({
    label: METRICS[key].label.replace('기', '').replace('목', '목\n'),
    score: scores[key] ?? 0,
  }));

  const handlePrint = () => window.print();

  return (
    <div className="results-view">
      <header className="results-header">
        <h1>체형 분석 결과</h1>
        <button className="btn-icon" onClick={handlePrint} title="인쇄">🖨️</button>
      </header>

      {/* Overall score */}
      <section className="overall-section">
        <div className="overall-score-ring" style={{ '--ring-color': grade?.color }}>
          <span className="overall-grade" style={{ color: grade?.color }}>{grade?.label}</span>
          <span className="overall-score-num">{overallScore ?? '—'}</span>
          <span className="overall-score-label">/ 100</span>
        </div>
        <div className="overall-text">
          <p className="overall-desc" style={{ color: grade?.color }}>{grade?.desc}</p>
          <p className="overall-sub">전체 균형 점수</p>
        </div>
      </section>

      {/* Body diagram + Radar chart */}
      <section className="visual-section">
        <div className="visual-card">
          <h3>체형 지도</h3>
          <BodyDiagram scores={scores} />
        </div>
        <div className="visual-card">
          <h3>균형 레이더</h3>
          <RadarChart data={radarData} />
        </div>
      </section>

      {/* Captured thumbnails */}
      <section className="thumbnails-section">
        <h3>촬영 이미지</h3>
        <div className="thumbnails-grid">
          {CAPTURE_STEPS.map((step) => {
            const imgData = data[step.key]?.imageData;
            const hasLandmarks = !!data[step.key]?.landmarks;
            return (
              <div key={step.key} className="thumbnail-item">
                {imgData ? (
                  <img src={imgData} alt={step.label} className="thumbnail-img" />
                ) : (
                  <div className="thumbnail-empty">미촬영</div>
                )}
                <span className="thumbnail-label">
                  {step.shortLabel} {hasLandmarks ? '✓' : '⚠'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metric cards */}
      <section className="metrics-section">
        <h3>세부 측정 결과</h3>
        <div className="metrics-grid">
          {Object.keys(METRICS).map((key) => (
            <MetricCard
              key={key}
              metricKey={key}
              value={raw[key]}
              score={scores[key]}
            />
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="recommendations-section">
        <h3>맞춤 권장 사항</h3>
        <div className="recs-list">
          {recommendations.map((rec, i) => (
            <div key={i} className="rec-item">
              <span className="rec-icon">{rec.icon}</span>
              <div>
                <strong className="rec-title">{rec.title}</strong>
                <p className="rec-detail">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn-secondary" onClick={handlePrint}>인쇄 / 저장</button>
        <button className="btn-primary" onClick={onRetry}>다시 측정</button>
      </div>

      <p className="results-disclaimer">
        * 이 분석은 참고용이며 의료적 진단을 대체하지 않습니다.
        정확한 체형 교정은 전문의 상담을 권장합니다.
      </p>
    </div>
  );
}
