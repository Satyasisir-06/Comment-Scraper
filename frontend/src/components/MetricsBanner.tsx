import React from 'react';
import { MessageSquare, HelpCircle, Layers, Lightbulb, PlayCircle } from 'lucide-react';
import type { AnalysisMetadata } from '../types';

interface MetricsBannerProps {
  metadata: AnalysisMetadata;
  ideasCount: number;
}

export const MetricsBanner: React.FC<MetricsBannerProps> = ({
  metadata,
  ideasCount,
}) => {
  return (
    <div className="metrics-section">
      <div className="source-info-bar glass-panel">
        <div className="source-title-group">
          <PlayCircle className="source-icon" size={20} />
          <div>
            <span className="source-type-pill">{metadata.source_type.toUpperCase()}</span>
            <h2 className="source-title">{metadata.source_title}</h2>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap indigo">
            <MessageSquare size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{metadata.total_comments_scanned}</span>
            <span className="metric-label">Comments Scanned</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap violet">
            <HelpCircle size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{metadata.questions_found}</span>
            <span className="metric-label">Questions Detected</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap cyan">
            <Layers size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{metadata.themes_count}</span>
            <span className="metric-label">Thematic Clusters</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap amber">
            <Lightbulb size={22} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{ideasCount}</span>
            <span className="metric-label">Actionable Ideas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
