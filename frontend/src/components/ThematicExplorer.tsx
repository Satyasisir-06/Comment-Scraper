import React, { useState } from 'react';
import {
  Search,
  ThumbsUp,
  Copy,
  Check,
  Target,
  FileText,
  User,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import type { ThemeCluster, QuestionItem, GeneratedIdea } from '../types';

interface ThematicExplorerProps {
  themes: ThemeCluster[];
}

export const ThematicExplorer: React.FC<ThematicExplorerProps> = ({ themes }) => {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!themes || themes.length === 0) return null;

  const currentTheme = themes[selectedThemeIndex] || themes[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = currentTheme.questions.filter((q) =>
    q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.author.toLowerCase().includes(questionSearch.toLowerCase()),
  );

  return (
    <div className="thematic-explorer-container">
      {/* Theme selection tabs */}
      <div className="theme-tabs-row">
        {themes.map((theme, index) => {
          const isActive = index === selectedThemeIndex;
          const sentimentClass = `badge-${theme.sentiment.toLowerCase()}`;

          return (
            <button
              key={theme.theme_id}
              className={`theme-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedThemeIndex(index);
                setQuestionSearch('');
              }}
            >
              <div className="tab-btn-header">
                <span className="tab-title">{theme.name}</span>
                <span className={`badge ${sentimentClass}`}>
                  {theme.sentiment}
                </span>
              </div>
              <div className="tab-meta">
                <span>{theme.questions.length} Questions</span>
                <span>•</span>
                <span>{theme.generated_ideas.length} Ideas</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Theme Content */}
      <div className="theme-detail-panel glass-panel">
        <div className="theme-summary-box">
          <div className="theme-summary-header">
            <div>
              <span className={`badge badge-${currentTheme.sentiment.toLowerCase()}`}>
                Sentiment: {currentTheme.sentiment}
              </span>
              <h2 className="theme-main-title">{currentTheme.name}</h2>
            </div>
            <button
              className="btn btn-secondary btn-copy-summary"
              onClick={() =>
                handleCopyText(
                  `Theme: ${currentTheme.name}\nSummary: ${currentTheme.summary}`,
                  currentTheme.theme_id,
                )
              }
            >
              {copiedId === currentTheme.theme_id ? (
                <>
                  <Check size={16} className="text-success" />
                  <span>Copied Summary</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
          <p className="theme-summary-text">{currentTheme.summary}</p>
        </div>

        {/* 2-Column Grid: Questions on Left, Ideas on Right */}
        <div className="theme-content-grid">
          {/* Left: Questions column */}
          <div className="content-column questions-column">
            <div className="column-header">
              <div className="column-title-wrap">
                <HelpCircle size={18} className="text-violet" />
                <h3 className="column-title">
                  Audience Questions ({filteredQuestions.length})
                </h3>
              </div>

              {/* Question search */}
              <div className="question-search-wrap">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter questions..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="question-search-input"
                />
              </div>
            </div>

            <div className="questions-list">
              {filteredQuestions.length === 0 ? (
                <div className="empty-filter-state">
                  <span>No questions match your filter.</span>
                </div>
              ) : (
                filteredQuestions.map((q: QuestionItem) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <span className="question-author">
                        <User size={13} />
                        {q.author}
                      </span>
                      <div className="question-meta-right">
                        <span className="question-likes">
                          <ThumbsUp size={12} />
                          {q.likes}
                        </span>
                        <button
                          className="icon-copy-btn"
                          title="Copy question"
                          onClick={() => handleCopyText(q.text, q.id)}
                        >
                          {copiedId === q.id ? (
                            <Check size={13} className="text-success" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="question-text">"{q.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Generated Ideas column */}
          <div className="content-column ideas-column">
            <div className="column-header">
              <div className="column-title-wrap">
                <Lightbulb size={18} className="text-amber" />
                <h3 className="column-title">
                  Synthesized Ideas ({currentTheme.generated_ideas.length})
                </h3>
              </div>
            </div>

            <div className="ideas-list">
              {currentTheme.generated_ideas.map((idea: GeneratedIdea) => (
                <div key={idea.id} className="idea-card">
                  <div className="idea-badges-row">
                    <span className="idea-badge format">
                      <FileText size={12} />
                      {idea.format}
                    </span>
                    <span className="idea-badge audience">
                      <Target size={12} />
                      {idea.target_audience}
                    </span>
                  </div>

                  <h4 className="idea-title">{idea.title}</h4>
                  <p className="idea-description">{idea.description}</p>

                  <div className="idea-footer">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        handleCopyText(
                          `Idea: ${idea.title}\nFormat: ${idea.format}\nAudience: ${idea.target_audience}\n${idea.description}`,
                          idea.id,
                        )
                      }
                    >
                      {copiedId === idea.id ? (
                        <>
                          <Check size={14} className="text-success" />
                          <span>Copied Idea</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Idea</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
