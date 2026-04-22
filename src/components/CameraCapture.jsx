import { useState, useEffect, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import PoseOverlay from './PoseOverlay';

const COUNTDOWN_SECONDS = 3;

export default function CameraCapture({ step, onCapture, detectPose }) {
  const { videoRef, isReady, error, startCamera, stopCamera, captureFrame } = useCamera();

  const [phase, setPhase] = useState('preview'); // preview | countdown | captured | detecting
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [capturedCanvas, setCapturedCanvas] = useState(null);
  const [detectedLandmarks, setDetectedLandmarks] = useState(null);
  const [detectError, setDetectError] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [step.key]);

  // Countdown logic
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      handleShoot();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECONDS);
    setPhase('countdown');
  };

  const handleShoot = useCallback(async () => {
    const canvas = captureFrame();
    if (!canvas) return;
    setCapturedCanvas(canvas);
    setPhase('detecting');
    setDetectError(false);

    const landmarks = await detectPose(canvas);
    setDetectedLandmarks(landmarks);
    if (!landmarks) setDetectError(true);
    setPhase('captured');
  }, [captureFrame, detectPose]);

  const handleConfirm = () => {
    if (!capturedCanvas) return;
    onCapture(step.key, capturedCanvas.toDataURL('image/jpeg', 0.85), detectedLandmarks);
  };

  const handleRetake = () => {
    setCapturedCanvas(null);
    setDetectedLandmarks(null);
    setDetectError(false);
    setPhase('preview');
  };

  if (error) {
    const lines = error.split('\n');
    return (
      <div className="camera-error">
        <div className="error-icon">📷</div>
        <div className="error-message">
          {lines.map((line, i) => (
            <p key={i} className={i === 0 ? 'error-main' : 'error-sub'}>{line}</p>
          ))}
        </div>
        <button className="btn-primary" onClick={startCamera}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <div className="step-info">
        <h2 className="step-title">{step.label} 촬영</h2>
        <p className="step-desc">{step.description}</p>
      </div>

      <div className="camera-viewport">
        {/* Live preview */}
        {phase !== 'captured' && phase !== 'detecting' && (
          <div className="video-wrapper" style={{ display: phase === 'captured' ? 'none' : 'block' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              className="camera-video"
            />
            {/* Pose guide silhouette */}
            <div className="pose-guide">
              <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="guide-svg">
                <circle cx="50" cy="20" r="12" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="50" y1="32" x2="50" y2="90" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="50" y1="45" x2="20" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="50" y1="45" x2="80" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="50" y1="90" x2="35" y2="145" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="50" y1="90" x2="65" y2="145" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="35" y1="145" x2="35" y2="190" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="65" y1="145" x2="65" y2="190" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              </svg>
            </div>
            {phase === 'countdown' && (
              <div className="countdown-overlay">
                <span className="countdown-number">{countdown}</span>
              </div>
            )}
            {!isReady && (
              <div className="camera-loading">
                <div className="spinner" />
                <span>카메라 초기화 중...</span>
              </div>
            )}
          </div>
        )}

        {/* Captured frame with pose overlay */}
        {(phase === 'captured' || phase === 'detecting') && capturedCanvas && (
          <div className="captured-wrapper">
            <img
              src={capturedCanvas.toDataURL()}
              alt="촬영된 이미지"
              className="captured-img"
            />
            {detectedLandmarks && (
              <PoseOverlay
                landmarks={detectedLandmarks}
                width={capturedCanvas.width}
                height={capturedCanvas.height}
              />
            )}
            {phase === 'detecting' && (
              <div className="detecting-overlay">
                <div className="spinner" />
                <span>포즈 분석 중...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {detectError && (
        <div className="detect-warning">
          ⚠️ 포즈 감지에 실패했습니다. 전신이 잘 보이도록 거리를 조절해 다시 촬영하거나, 이 사진으로 계속 진행할 수 있습니다.
        </div>
      )}

      <div className="camera-actions">
        {phase === 'preview' || phase === 'countdown' ? (
          <button
            className="btn-capture"
            onClick={startCountdown}
            disabled={!isReady || phase === 'countdown'}
          >
            {phase === 'countdown' ? `${countdown}` : '📸 촬영'}
          </button>
        ) : phase === 'captured' ? (
          <div className="confirm-actions">
            <button className="btn-secondary" onClick={handleRetake}>
              재촬영
            </button>
            <button className="btn-primary" onClick={handleConfirm}>
              확인 →
            </button>
          </div>
        ) : null}
      </div>

      <p className="guide-hint">💡 {step.guideText}</p>
    </div>
  );
}
