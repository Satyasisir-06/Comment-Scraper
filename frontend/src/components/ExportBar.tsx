import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import type { AnalyzeResponse } from '../types';

interface ExportBarProps {
  data: AnalyzeResponse;
}

export const ExportBar: React.FC<ExportBarProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdownReport = (): string => {
    let md = `# Comment Intelligence Report\n\n`;
    md += `- **Source:** ${data.metadata.source_title}\n`;
    md += `- **Platform:** ${data.metadata.source_type.toUpperCase()}\n`;
    md += `- **Generated:** ${new Date(data.timestamp).toISOString()}\n`;
    md += `- **Comments Scanned:** ${data.metadata.total_comments_scanned}\n`;
    md += `- **Questions Extracted:** ${data.metadata.questions_found}\n`;
    md += `- **Themes Discovered:** ${data.metadata.themes_count}\n\n`;
    md += `---\n\n`;

    data.themes.forEach((theme, idx) => {
      md += `## ${idx + 1}. ${theme.name}\n`;
      md += `*Sentiment: ${theme.sentiment}*\n\n`;
      md += `${theme.summary}\n\n`;

      md += `### Audience Inquiries (${theme.questions.length})\n`;
      theme.questions.forEach((q) => {
        md += `- **@${q.author}** (${q.likes} likes): "${q.text}"\n`;
      });
      md += `\n`;

      md += `### Recommended Concepts (${theme.generated_ideas.length})\n`;
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
    <div className="export-bar-container clean-panel">
      <div className="export-text-group">
        <h3 className="export-heading">Export Structured Insights</h3>
        <p className="export-subtext">
          Export full analysis as documentation or structured JSON for your editorial pipeline.
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
              <Check size={14} className="text-success" />
              <span>Copied Markdown</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Markdown</span>
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleDownloadMarkdown}
          id="download-md-btn"
        >
          <Download size={14} />
          <span>Download .md</span>
        </button>

        <button
          className="btn btn-outline"
          onClick={handleDownloadJson}
          id="download-json-btn"
        >
          <Download size={14} />
          <span>JSON</span>
        </button>
      </div>
    </div>
  );
};
