import React, { useEffect, useState } from 'react';
import { MessageSquareText, HelpCircle, Layers, Lightbulb, CheckCircle2 } from 'lucide-react';

interface StatusProgressProps {
  isLoading: boolean;
}

const STEPS = [
  { label: 'Scraping comments from source', icon: MessageSquareText },
  { label: 'Detecting genuine questions', icon: HelpCircle },
  { label: 'Clustering into thematic intents', icon: Layers },
  { label: 'Synthesizing actionable ideas', icon: Lightbulb },
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
    }, 600);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="status-progress-card glass-panel">
      <div className="progress-header">
        <h3 className="progress-title">Processing Comment Stream...</h3>
        <span className="badge badge-curious animate-pulse-glow">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="steps-grid">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.label}
              className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-icon-wrap">
                {isDone ? (
                  <CheckCircle2 size={18} className="step-icon done-icon" />
                ) : (
                  <Icon size={18} className={`step-icon ${isCurrent ? 'animate-spin' : ''}`} />
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
