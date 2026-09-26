import React, { useState } from 'react';
import { Copy, Check, FileJson, FileText } from 'lucide-react';
import type { AnalyzeResponse } from '../types';

interface ExportBarProps {
  data: AnalyzeResponse;
}

export const ExportBar: React.FC<ExportBarProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdownReport = (): string => {
    let md = `# Comment Scraper Intelligence Report\n\n`;
    md += `**Source Title:** ${data.metadata.source_title}\n`;
    md += `**Platform:** ${data.metadata.source_type.toUpperCase()}\n`;
    md += `**Date:** ${new Date(data.timestamp).toLocaleString()}\n`;
    md += `**Total Comments Scanned:** ${data.metadata.total_comments_scanned}\n`;
    md += `**Questions Extracted:** ${data.metadata.questions_found}\n`;
    md += `**Themes Discovered:** ${data.metadata.themes_count}\n\n`;
    md += `---\n\n`;

    data.themes.forEach((theme, idx) => {
      md += `## Theme ${idx + 1}: ${theme.name}\n`;
      md += `*Sentiment: ${theme.sentiment}*\n\n`;
      md += `> ${theme.summary}\n\n`;

      md += `### ❓ Audience Questions (${theme.questions.length})\n`;
      theme.questions.forEach((q) => {
        md += `- **${q.author}** (${q.likes} likes): "${q.text}"\n`;
      });
      md += `\n`;

      md += `### 💡 Generated Ideas (${theme.generated_ideas.length})\n`;
      theme.generated_ideas.forEach((idea) => {
        md += `#### ${idea.title}\n`;
        md += `- **Format:** ${idea.format}\n`;
        md += `- **Target Audience:** ${idea.target_audience}\n`;
        md += `- **Overview:** ${idea.description}\n\n`;
      });
      md += `---\n\n`;
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdownReport();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comment-insights-${data.job_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comment-insights-${data.job_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdownReport();
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="export-bar-container glass-panel">
      <div className="export-text-group">
        <h3 className="export-heading">Export Audience Insights</h3>
        <p className="export-subtext">
          Download clean Markdown documentation or JSON payloads for your content workflow.
        </p>
      </div>

      <div className="export-buttons-group">
        <button
          className="btn btn-secondary"
          onClick={handleCopyMarkdown}
          id="copy-report-btn"
        >
          {copied ? (
            <>
              <Check size={16} className="text-success" />
              <span>Copied Report!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Markdown</span>
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleDownloadMarkdown}
          id="download-md-btn"
        >
          <FileText size={16} />
          <span>Download .MD</span>
        </button>

        <button
          className="btn btn-outline"
          onClick={handleDownloadJson}
          id="download-json-btn"
        >
          <FileJson size={16} />
          <span>Download JSON</span>
        </button>
      </div>
    </div>
  );
};
