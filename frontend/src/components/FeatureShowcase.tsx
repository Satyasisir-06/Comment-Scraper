import React from 'react';
import { HelpCircle, Layers, Lightbulb, Sparkles, ArrowUpRight } from 'lucide-react';

interface FeatureShowcaseProps {
  onLoadSample: () => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ onLoadSample }) => {
  return (
    <div className="showcase-section">
      <div className="showcase-header">
        <span className="showcase-eyebrow">System Capabilities</span>
        <h2 className="showcase-title">How InsightEcho structures audience feedback</h2>
      </div>

      <div className="showcase-grid">
        <div className="showcase-card clean-panel">
          <div className="showcase-icon-box">
            <HelpCircle size={18} strokeWidth={2} />
          </div>
          <h3 className="showcase-card-title">1. Question Extraction</h3>
          <p className="showcase-card-desc">
            Bypasses praise, flame wars, and noise to identify high-signal questions expressing genuine user confusion or product demand.
          </p>
          <div className="showcase-card-tag">Semantic Filtering</div>
        </div>

        <div className="showcase-card clean-panel">
          <div className="showcase-icon-box">
            <Layers size={18} strokeWidth={2} />
          </div>
          <h3 className="showcase-card-title">2. Intent Clustering</h3>
          <p className="showcase-card-desc">
            Organizes hundreds of disparate comments into distinct thematic clusters tagged by audience sentiment and inquiry volume.
          </p>
          <div className="showcase-card-tag">Thematic Synthesis</div>
        </div>

        <div className="showcase-card clean-panel">
          <div className="showcase-icon-box">
            <Lightbulb size={18} strokeWidth={2} />
          </div>
          <h3 className="showcase-card-title">3. Content Architecture</h3>
          <p className="showcase-card-desc">
            Translates validated demand into ready-to-execute editorial concepts, targeted personas, and product improvement roadmaps.
          </p>
          <div className="showcase-card-tag">Turnkey Outlines</div>
        </div>
      </div>

      <div className="showcase-footer-banner clean-panel">
        <div className="banner-left">
          <div className="banner-badge">
            <Sparkles size={12} />
            <span>Instant Preview</span>
          </div>
          <h4 className="banner-title">Want to explore a complete analysis report?</h4>
          <p className="banner-desc">Load a pre-analyzed YouTube video dataset to test the explorer and export features.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary banner-cta"
          onClick={onLoadSample}
        >
          <span>Load Sample Dataset</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
