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
import type { ThemeCluster, QuestionItem, GeneratedIdea, CommentItem } from '../types';

interface ThematicExplorerProps {
  themes: ThemeCluster[];
  rawComments?: CommentItem[];
}

export const ThematicExplorer: React.FC<ThematicExplorerProps> = ({ themes, rawComments }) => {
  const [activeTab, setActiveTab] = useState<number | 'all_comments'>(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [allCommentSearch, setAllCommentSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if ((!themes || themes.length === 0) && (!rawComments || rawComments.length === 0)) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAllComments = activeTab === 'all_comments';
  const currentTheme = typeof activeTab === 'number' ? themes[activeTab] || themes[0] : themes[0];

  const filteredQuestions = currentTheme?.questions.filter((q) =>
    q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.author.toLowerCase().includes(questionSearch.toLowerCase()),
  ) || [];

  const filteredAllComments = (rawComments || []).filter((c) =>
    c.text.toLowerCase().includes(allCommentSearch.toLowerCase()) ||
    c.author.toLowerCase().includes(allCommentSearch.toLowerCase()),
  );

  return (
    <div className="thematic-explorer-container">
      {/* Selection tabs */}
      <div className="theme-tabs-row">
        {themes.map((theme, index) => {
          const isActive = activeTab === index;
          const sentimentClass = `badge-${theme.sentiment.toLowerCase()}`;

          return (
            <button
              key={theme.theme_id}
              className={`theme-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(index);
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

        {rawComments && rawComments.length > 0 && (
          <button
            className={`theme-tab-btn ${isAllComments ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all_comments');
              setAllCommentSearch('');
            }}
          >
            <div className="tab-btn-header">
              <span className="tab-title">💬 All Comments</span>
              <span className="badge badge-curious">
                {rawComments.length} Total
              </span>
            </div>
            <div className="tab-meta">
              <span>View full comment list</span>
            </div>
          </button>
        )}
      </div>

      {/* Content View */}
      {isAllComments ? (
        /* ALL COMMENTS VIEW */
        <div className="theme-detail-panel glass-panel">
          <div className="theme-summary-box">
            <div className="theme-summary-header">
              <div>
                <span className="badge badge-curious">Raw Scraped Feed</span>
                <h2 className="theme-main-title">All Scraped Comments ({rawComments?.length || 0})</h2>
              </div>
              <div className="question-search-wrap" style={{ width: '280px' }}>
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search all comments..."
                  value={allCommentSearch}
                  onChange={(e) => setAllCommentSearch(e.target.value)}
                  className="question-search-input"
                />
              </div>
            </div>
            <p className="theme-summary-text">
              Complete list of comments retrieved from the source before question filtering and thematic AI clustering.
            </p>
          </div>

          <div className="questions-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {filteredAllComments.length === 0 ? (
              <div className="empty-filter-state" style={{ gridColumn: '1 / -1' }}>
                <span>No comments match your search query.</span>
              </div>
            ) : (
              filteredAllComments.map((c: CommentItem) => (
                <div key={c.id} className="question-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="question-header">
                      <span className="question-author">
                        <User size={13} />
                        {c.author}
                      </span>
                      <div className="question-meta-right">
                        <span className="question-likes">
                          <ThumbsUp size={12} />
                          {c.likes}
                        </span>
                        <button
                          className="icon-copy-btn"
                          title="Copy comment"
                          onClick={() => handleCopyText(c.text, c.id)}
                        >
                          {copiedId === c.id ? (
                            <Check size={13} className="text-success" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="question-text">"{c.text}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* THEMATIC CLUSTER VIEW */
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
      )}
    </div>
  );
};

