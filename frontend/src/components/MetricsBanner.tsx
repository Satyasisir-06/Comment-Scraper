import React from 'react';
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
      <div className="source-info-bar clean-panel">
        <div className="source-meta-tag">
          <span className="source-type-pill">{metadata.source_type}</span>
          <span className="source-status-pill">Analyzed</span>
        </div>
        <h2 className="source-title">{metadata.source_title}</h2>
      </div>

      <div className="metrics-grid clean-panel">
        <div className="metric-card">
          <span className="metric-label">Comments Scanned</span>
          <span className="metric-number">{metadata.total_comments_scanned}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Questions Found</span>
          <span className="metric-number">{metadata.questions_found}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Thematic Clusters</span>
          <span className="metric-number">{metadata.themes_count}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Actionable Ideas</span>
          <span className="metric-number">{ideasCount}</span>
        </div>
      </div>
    </div>
  );
};
