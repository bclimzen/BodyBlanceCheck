import { useState } from 'react';
import { usePoseDetection } from './hooks/usePoseDetection';
import { CAPTURE_STEPS } from './utils/constants';
import StepIndicator from './components/StepIndicator';
import CameraCapture from './components/CameraCapture';
import ResultsView from './components/ResultsView';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedData, setCapturedData] = useState({});
  const { detectPose, isLoading, loadError } = usePoseDetection();

  const handleCapture = (stepKey, imageData, landmarks) => {
    const newData = { ...capturedData, [stepKey]: { imageData, landmarks } };
    setCapturedData(newData);

    if (currentStep < CAPTURE_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setCurrentStep(CAPTURE_STEPS.length); // show results
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setCapturedData({});
  };

  if (loadError) {
    return (
      <div className="app-error">
        <div className="error-icon">⚠️</div>
        <h2>AI 모델 로드 실패</h2>
        <p>{loadError}</p>
        <p className="error-hint">인터넷 연결을 확인 후 페이지를 새로고침해주세요.</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          새로고침
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-logo">🧍</div>
        <h2>체형 균형 분석</h2>
        <div className="spinner large" />
        <p>AI 포즈 감지 모델 로딩 중...</p>
        <p className="loading-sub">처음 실행 시 수초가 걸릴 수 있습니다</p>
      </div>
    );
  }

  if (currentStep >= CAPTURE_STEPS.length) {
    return <ResultsView data={capturedData} onRetry={handleRetry} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">🧍</span>
        <h1 className="app-title">체형 균형 분석</h1>
      </header>

      <StepIndicator steps={CAPTURE_STEPS} currentStep={currentStep} />

      <CameraCapture
        key={currentStep}
        step={CAPTURE_STEPS[currentStep]}
        onCapture={handleCapture}
        detectPose={detectPose}
      />
    </div>
  );
}
