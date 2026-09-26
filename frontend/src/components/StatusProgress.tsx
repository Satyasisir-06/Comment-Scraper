import React, { useEffect, useState } from 'react';
import LatticeLoader from './LatticeLoader';

interface StatusProgressProps {
  isLoading: boolean;
}

const STEPS = [
  'Extracting comments from source',
  'Isolating authentic user inquiries',
  'Clustering thematic intent & demand',
  'Synthesizing actionable content blueprints',
];

export const StatusProgress: React.FC<StatusProgressProps> = ({ isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / STEPS.length) * 100));

  return (
    <div className="status-progress-card clean-panel">
      <div className="loader-inner-container">
        {/* LatticeLoader Integration with Taste & Hallmark Styling */}
        <div className="lattice-loader-wrapper">
          <LatticeLoader
            status="working"
            label={STEPS[currentStep]}
            doneLabel="Done in"
            errorLabel="Failed after"
            pattern="orbit"
            grid={3}
            shape="round"
            doneColor="#10b981"
            errorColor="#f43f5e"
            cellSize={6}
            gap={2}
            fontSize={14}
            step={90}
            idleOpacity={0.15}
            glow={false}
            glowColor=""
            showTimer
            color="#f8fafc"
          />
        </div>

        {/* Clean Contained Progress Bar */}
        <div className="progress-bar-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator Badges (Contained & Wrapped) */}
        <div className="steps-badges-row">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <span
                key={step}
                className={`step-badge-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <span className="step-badge-dot" />
                <span className="step-badge-text">
                  Step {idx + 1}: {step}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusProgress;
