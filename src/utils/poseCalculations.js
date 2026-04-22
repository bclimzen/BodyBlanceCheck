import { LM, METRICS } from './constants';

const toDeg = (rad) => (rad * 180) / Math.PI;

function angleBetweenPoints(p1, p2) {
  return toDeg(Math.atan2(p2.y - p1.y, p2.x - p1.x));
}

function dist(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function midpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function isVisible(lm, threshold = 0.5) {
  return lm && lm.visibility > threshold;
}

// Shoulder tilt from horizontal (front/back view)
export function calcShoulderTilt(lm) {
  const l = lm[LM.LEFT_SHOULDER];
  const r = lm[LM.RIGHT_SHOULDER];
  if (!isVisible(l) || !isVisible(r)) return null;
  return Math.abs(angleBetweenPoints(l, r));
}

// Hip/pelvic tilt from horizontal (front/back view)
export function calcHipTilt(lm) {
  const l = lm[LM.LEFT_HIP];
  const r = lm[LM.RIGHT_HIP];
  if (!isVisible(l) || !isVisible(r)) return null;
  return Math.abs(angleBetweenPoints(l, r));
}

// Head tilt from horizontal - ear level difference (front view)
export function calcHeadTilt(lm) {
  const l = lm[LM.LEFT_EAR];
  const r = lm[LM.RIGHT_EAR];
  if (!isVisible(l) || !isVisible(r)) return null;
  return Math.abs(angleBetweenPoints(l, r));
}

// CVA: Craniovertebral Angle — angle at shoulder between horizontal and line to ear
// Normal: > 50°. Forward head: < 50°. Severe: < 40°.
export function calcForwardHead(lm, side = 'left') {
  const ear = side === 'left' ? lm[LM.LEFT_EAR] : lm[LM.RIGHT_EAR];
  const shoulder = side === 'left' ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER];
  if (!isVisible(ear) || !isVisible(shoulder)) return null;

  const vertDist = shoulder.y - ear.y; // positive = ear is above shoulder
  const horizDist = Math.abs(ear.x - shoulder.x);

  if (vertDist <= 0) return 20; // head at or below shoulder level = severe
  return toDeg(Math.atan2(vertDist, horizDist));
}

// Trunk lateral lean from vertical (front/back view)
export function calcTrunkLean(lm) {
  const midShoulder = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
  const midHip = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
  if (
    !isVisible(lm[LM.LEFT_SHOULDER]) ||
    !isVisible(lm[LM.RIGHT_SHOULDER]) ||
    !isVisible(lm[LM.LEFT_HIP]) ||
    !isVisible(lm[LM.RIGHT_HIP])
  )
    return null;

  const angle = angleBetweenPoints(midHip, midShoulder);
  // 90° = perfectly vertical, deviation from 90°
  return Math.abs(90 - Math.abs(angle));
}

// Score each metric 0-100
export function scoreMetric(value, metricKey) {
  if (value === null || value === undefined) return null;
  const metric = METRICS[metricKey];

  if (metric.lowerIsBetter) {
    if (value <= metric.normalMax) return 100;
    if (value <= metric.warningMax) {
      return 100 - ((value - metric.normalMax) / (metric.warningMax - metric.normalMax)) * 30;
    }
    return Math.max(0, 70 - ((value - metric.warningMax) / metric.warningMax) * 70);
  } else {
    // Higher is better (CVA angle)
    if (value >= metric.normalMin) return 100;
    if (value >= metric.warningMin) {
      return 100 - ((metric.normalMin - value) / (metric.normalMin - metric.warningMin)) * 30;
    }
    return Math.max(0, 70 - ((metric.warningMin - value) / metric.warningMin) * 70);
  }
}

export function getStatus(score) {
  if (score === null) return 'unknown';
  if (score >= 80) return 'good';
  if (score >= 55) return 'warning';
  return 'danger';
}

export function getStatusLabel(score) {
  if (score === null) return '측정 불가';
  if (score >= 80) return '정상';
  if (score >= 55) return '주의';
  return '위험';
}

// Analyze all captured poses
export function analyzeAll(capturedData) {
  const raw = {};
  const scores = {};

  const frontLm = capturedData.front?.landmarks;
  const backLm = capturedData.back?.landmarks;
  const leftLm = capturedData.left?.landmarks;
  const rightLm = capturedData.right?.landmarks;

  // Shoulder tilt: average of front and back
  const shoulderFront = frontLm ? calcShoulderTilt(frontLm) : null;
  const shoulderBack = backLm ? calcShoulderTilt(backLm) : null;
  raw.shoulderTilt =
    shoulderFront !== null && shoulderBack !== null
      ? (shoulderFront + shoulderBack) / 2
      : shoulderFront ?? shoulderBack;

  // Hip tilt: average of front and back
  const hipFront = frontLm ? calcHipTilt(frontLm) : null;
  const hipBack = backLm ? calcHipTilt(backLm) : null;
  raw.hipTilt =
    hipFront !== null && hipBack !== null
      ? (hipFront + hipBack) / 2
      : hipFront ?? hipBack;

  // Forward head: average of left and right side
  const fhLeft = leftLm ? calcForwardHead(leftLm, 'left') : null;
  const fhRight = rightLm ? calcForwardHead(rightLm, 'right') : null;
  raw.forwardHead =
    fhLeft !== null && fhRight !== null
      ? (fhLeft + fhRight) / 2
      : fhLeft ?? fhRight;

  // Head tilt: from front
  raw.headTilt = frontLm ? calcHeadTilt(frontLm) : null;

  // Trunk lean: from front
  raw.trunkLean = frontLm ? calcTrunkLean(frontLm) : null;

  // Score each metric
  for (const key of Object.keys(raw)) {
    scores[key] = raw[key] !== null ? scoreMetric(raw[key], key) : null;
  }

  const validScores = Object.values(scores).filter((s) => s !== null);
  const overallScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null;

  return { raw, scores, overallScore };
}

// Generate recommendations based on scores
export function getRecommendations(raw, scores) {
  const recs = [];

  if (scores.shoulderTilt !== null && scores.shoulderTilt < 80) {
    recs.push({
      icon: '💪',
      title: '어깨 불균형',
      detail: `어깨 기울기 ${raw.shoulderTilt?.toFixed(1)}° — 승모근 스트레칭과 견갑골 안정화 운동을 권장합니다.`,
    });
  }
  if (scores.hipTilt !== null && scores.hipTilt < 80) {
    recs.push({
      icon: '🦴',
      title: '골반 불균형',
      detail: `골반 기울기 ${raw.hipTilt?.toFixed(1)}° — 고관절 스트레칭 및 코어 강화 운동이 도움이 됩니다.`,
    });
  }
  if (scores.forwardHead !== null && scores.forwardHead < 80) {
    recs.push({
      icon: '🐢',
      title: '거북목 자세',
      detail: `CVA ${raw.forwardHead?.toFixed(1)}° — 턱당기기(chin tuck) 운동과 흉추 신전 스트레칭을 권장합니다.`,
    });
  }
  if (scores.headTilt !== null && scores.headTilt < 80) {
    recs.push({
      icon: '↔️',
      title: '머리 기울기',
      detail: `머리 기울기 ${raw.headTilt?.toFixed(1)}° — 목 측면 스트레칭이 도움이 됩니다.`,
    });
  }
  if (scores.trunkLean !== null && scores.trunkLean < 80) {
    recs.push({
      icon: '📐',
      title: '체간 불균형',
      detail: `체간 기울기 ${raw.trunkLean?.toFixed(1)}° — 좌우 균형 운동과 코어 트레이닝을 권장합니다.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: '✅',
      title: '균형 잡힌 체형',
      detail: '전체적으로 양호한 체형입니다. 규칙적인 운동과 바른 자세 유지를 지속하세요.',
    });
  }

  return recs;
}
