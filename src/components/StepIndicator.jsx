export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <div key={step.key} className="step-item">
            <div className={`step-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
              {isDone ? '✓' : step.shortLabel}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${isDone ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
