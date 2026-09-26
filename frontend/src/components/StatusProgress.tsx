import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface StatusProgressProps {
  isLoading: boolean;
}

const STEPS = [
  'Scraping comment payload',
  'Isolating direct questions',
  'Clustering thematic intents',
  'Synthesizing editorial concepts',
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
    }, 700);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="status-progress-card clean-panel">
      <div className="progress-header">
        <div className="progress-status-left">
          <div className="spinner-sm animate-spin" />
          <span className="progress-title">{STEPS[currentStep]}...</span>
        </div>
        <span className="step-counter">
          {currentStep + 1} / {STEPS.length}
        </span>
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="steps-row">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step}
              className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-bullet">
                {isDone ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  <span className="step-num">{idx + 1}</span>
                )}
              </div>
              <span className="step-label">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
