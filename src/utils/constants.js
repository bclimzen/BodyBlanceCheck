export const CAPTURE_STEPS = [
  {
    key: 'front',
    label: '정면',
    shortLabel: '전',
    description: '카메라를 정면으로 바라보고 전신이 보이도록 서주세요',
    guideText: '발끝부터 머리까지 전신이 화면에 들어오도록',
  },
  {
    key: 'back',
    label: '후면',
    shortLabel: '후',
    description: '카메라를 등지고 서주세요',
    guideText: '발끝부터 머리까지 전신이 화면에 들어오도록',
  },
  {
    key: 'left',
    label: '좌측면',
    shortLabel: '좌',
    description: '왼쪽 옆모습이 카메라를 향하도록 서주세요',
    guideText: '발끝부터 머리까지 전신이 화면에 들어오도록',
  },
  {
    key: 'right',
    label: '우측면',
    shortLabel: '우',
    description: '오른쪽 옆모습이 카메라를 향하도록 서주세요',
    guideText: '발끝부터 머리까지 전신이 화면에 들어오도록',
  },
];

export const METRICS = {
  shoulderTilt: {
    label: '어깨 기울기',
    unit: '°',
    description: '좌우 어깨의 수평 차이',
    normalMax: 3,
    warningMax: 6,
    lowerIsBetter: true,
  },
  hipTilt: {
    label: '골반 수평',
    unit: '°',
    description: '좌우 골반의 수평 차이',
    normalMax: 3,
    warningMax: 6,
    lowerIsBetter: true,
  },
  forwardHead: {
    label: '거북목 각도',
    unit: '°',
    description: '어깨 대비 귀의 전방 이동 (CVA)',
    normalMin: 50,
    warningMin: 40,
    lowerIsBetter: false,
  },
  headTilt: {
    label: '머리 기울기',
    unit: '°',
    description: '좌우 귀의 수평 차이',
    normalMax: 3,
    warningMax: 6,
    lowerIsBetter: true,
  },
  trunkLean: {
    label: '체간 기울기',
    unit: '°',
    description: '몸통의 좌우 기울기',
    normalMax: 3,
    warningMax: 6,
    lowerIsBetter: true,
  },
};

// MediaPipe Pose landmark indices
export const LM = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export const POSE_CONNECTIONS = [
  [LM.LEFT_EAR, LM.LEFT_SHOULDER],
  [LM.RIGHT_EAR, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
];

export const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

export const MEDIAPIPE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
