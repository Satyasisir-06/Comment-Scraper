import React, { useState } from 'react';
import {
  Search,
  ThumbsUp,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import type { ThemeCluster, QuestionItem, GeneratedIdea, CommentItem } from '../types';

interface ThematicExplorerProps {
  themes: ThemeCluster[];
  rawComments?: CommentItem[];
}

export const ThematicExplorer: React.FC<ThematicExplorerProps> = ({
  themes,
  rawComments,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all_comments'>(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [allCommentSearch, setAllCommentSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if ((!themes || themes.length === 0) && (!rawComments || rawComments.length === 0)) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const isAllComments = activeTab === 'all_comments';
  const currentTheme = typeof activeTab === 'number' ? themes[activeTab] || themes[0] : themes[0];

  const filteredQuestions =
    currentTheme?.questions.filter(
      (q) =>
        q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.author.toLowerCase().includes(questionSearch.toLowerCase()),
    ) || [];

  const filteredAllComments = (rawComments || []).filter(
    (c) =>
      c.text.toLowerCase().includes(allCommentSearch.toLowerCase()) ||
      c.author.toLowerCase().includes(allCommentSearch.toLowerCase()),
  );

  return (
    <div className="thematic-explorer-container">
      {/* Navigation tabs */}
      <div className="theme-tabs-row">
        {themes.map((theme, index) => {
          const isActive = activeTab === index;

          return (
            <button
              key={theme.theme_id}
              className={`theme-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(index);
                setQuestionSearch('');
              }}
            >
              <span className="tab-title">{theme.name}</span>
              <span className="tab-count-badge">{theme.questions.length}</span>
            </button>
          );
        })}

        {rawComments && rawComments.length > 0 && (
          <button
            className={`theme-tab-btn ${isAllComments ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all_comments');
              setAllCommentSearch('');
            }}
          >
            <MessageSquare size={13} />
            <span className="tab-title">All Comments</span>
            <span className="tab-count-badge">{rawComments.length}</span>
          </button>
        )}
      </div>

      {/* Detail Content View */}
      {isAllComments ? (
        /* ALL COMMENTS VIEW */
        <div className="theme-detail-panel clean-panel">
          <div className="theme-summary-box">
            <div className="theme-summary-header">
              <div>
                <span className="badge badge-curious">Raw Feed</span>
                <h2 className="theme-main-title">
                  All Ingested Comments ({rawComments?.length || 0})
                </h2>
              </div>
              <div className="question-search-wrap" style={{ width: '240px' }}>
                <Search size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={allCommentSearch}
                  onChange={(e) => setAllCommentSearch(e.target.value)}
                  className="question-search-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <p className="theme-summary-text">
              Complete stream of raw comments extracted from source before semantic filtering and thematic clustering.
            </p>
          </div>

          <div
            className="questions-list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '12px',
              maxHeight: '560px',
            }}
          >
            {filteredAllComments.length === 0 ? (
              <div className="empty-filter-state" style={{ gridColumn: '1 / -1' }}>
                <span>No comments match your search filter.</span>
              </div>
            ) : (
              filteredAllComments.map((c: CommentItem) => (
                <div key={c.id} className="question-card">
                  <div className="question-header">
                    <span className="question-author">@{c.author}</span>
                    <div className="question-meta-right">
                      <span className="question-likes">
                        <ThumbsUp size={11} />
                        {c.likes}
                      </span>
                      <button
                        className="icon-copy-btn"
                        title="Copy comment"
                        aria-label="Copy comment"
                        onClick={() => handleCopyText(c.text, c.id)}
                      >
                        {copiedId === c.id ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="question-text">"{c.text}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* THEMATIC CLUSTER VIEW */
        <div className="theme-detail-panel clean-panel">
          <div className="theme-summary-box">
            <div className="theme-summary-header">
              <div>
                <div className="theme-sentiment-row">
                  <span className={`badge badge-${currentTheme.sentiment.toLowerCase()}`}>
                    {currentTheme.sentiment}
                  </span>
                  <span className="theme-count-meta">
                    {currentTheme.questions.length} questions · {currentTheme.generated_ideas.length} ideas
                  </span>
                </div>
                <h2 className="theme-main-title">{currentTheme.name}</h2>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  handleCopyText(
                    `Theme: ${currentTheme.name}\nSummary: ${currentTheme.summary}`,
                    currentTheme.theme_id,
                  )
                }
              >
                {copiedId === currentTheme.theme_id ? (
                  <>
                    <Check size={14} className="text-success" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
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
                <h3 className="column-title">
                  Direct Inquiries <span className="mono-count">({filteredQuestions.length})</span>
                </h3>

                <div className="question-search-wrap">
                  <Search size={13} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Filter inquiries..."
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
                        <span className="question-author">@{q.author}</span>
                        <div className="question-meta-right">
                          <span className="question-likes">
                            <ThumbsUp size={11} />
                            {q.likes}
                          </span>
                          <button
                            className="icon-copy-btn"
                            title="Copy question"
                            aria-label="Copy question"
                            onClick={() => handleCopyText(q.text, q.id)}
                          >
                            {copiedId === q.id ? (
                              <Check size={12} className="text-success" />
                            ) : (
                              <Copy size={12} />
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
                <h3 className="column-title">
                  Synthesized Concepts <span className="mono-count">({currentTheme.generated_ideas.length})</span>
                </h3>
              </div>

              <div className="ideas-list">
                {currentTheme.generated_ideas.map((idea: GeneratedIdea) => (
                  <div key={idea.id} className="idea-card">
                    <div className="idea-badges-row">
                      <span className="idea-badge format">{idea.format}</span>
                      <span className="idea-badge audience">{idea.target_audience}</span>
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
                            <Check size={13} className="text-success" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Concept</span>
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
      )}
    </div>
  );
};
