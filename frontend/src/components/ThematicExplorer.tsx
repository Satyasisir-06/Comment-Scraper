import React, { useState, useMemo } from 'react';
import {
  Search,
  ThumbsUp,
  Copy,
  Check,
  MessageSquare,
  Flame,
  ArrowUpDown,
  X,
  Filter,
} from 'lucide-react';
import type { ThemeCluster, QuestionItem, GeneratedIdea, CommentItem } from '../types';

interface ThematicExplorerProps {
  themes: ThemeCluster[];
  rawComments?: CommentItem[];
}

type SortOrder = 'highest_likes' | 'least_likes' | 'newest' | 'relevance';
type LikeFilter = 'all' | 'zero' | '5' | '20' | '50' | '100';

const formatLikes = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const ThematicExplorer: React.FC<ThematicExplorerProps> = ({
  themes,
  rawComments,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all_comments'>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter state for "All Comments" tab
  const [allCommentSearch, setAllCommentSearch] = useState('');
  const [allCommentSort, setAllCommentSort] = useState<SortOrder>('highest_likes');
  const [allCommentLikeFilter, setAllCommentLikeFilter] = useState<LikeFilter>('all');

  // Search & Filter state for Theme Inquiries
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSort, setQuestionSort] = useState<SortOrder>('highest_likes');
  const [questionLikeFilter, setQuestionLikeFilter] = useState<LikeFilter>('all');

  if ((!themes || themes.length === 0) && (!rawComments || rawComments.length === 0)) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const isAllComments = activeTab === 'all_comments';
  const currentTheme = typeof activeTab === 'number' ? themes[activeTab] || themes[0] : themes[0];

  // Helper filter and sort
  const filterAndSort = <T extends { text: string; author: string; likes: number; published_at: string }>(
    items: T[],
    search: string,
    sort: SortOrder,
    likeFilter: LikeFilter,
  ): T[] => {
    const query = search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      // 1. Text filter
      if (query) {
        const matches =
          item.text.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query);
        if (!matches) return false;
      }
      // 2. Like filter
      if (likeFilter === 'zero') return item.likes === 0;
      if (likeFilter === '5') return item.likes >= 5;
      if (likeFilter === '20') return item.likes >= 20;
      if (likeFilter === '50') return item.likes >= 50;
      if (likeFilter === '100') return item.likes >= 100;
      return true;
    });

    // 3. Sort
    return [...filtered].sort((a, b) => {
      if (sort === 'highest_likes') return b.likes - a.likes;
      if (sort === 'least_likes') return a.likes - b.likes;
      if (sort === 'newest') {
        const dateA = new Date(a.published_at).getTime() || 0;
        const dateB = new Date(b.published_at).getTime() || 0;
        return dateB - dateA;
      }
      return 0; // relevance / platform default
    });
  };

  const filteredAllComments = useMemo(() => {
    return filterAndSort(
      rawComments || [],
      allCommentSearch,
      allCommentSort,
      allCommentLikeFilter,
    );
  }, [rawComments, allCommentSearch, allCommentSort, allCommentLikeFilter]);

  const filteredQuestions = useMemo(() => {
    return filterAndSort(
      currentTheme?.questions || [],
      questionSearch,
      questionSort,
      questionLikeFilter,
    );
  }, [currentTheme, questionSearch, questionSort, questionLikeFilter]);

  // Max likes in the dataset for popularity badges
  const maxRawLikes = useMemo(() => {
    if (!rawComments || rawComments.length === 0) return 0;
    return Math.max(...rawComments.map((c) => c.likes));
  }, [rawComments]);

  const maxThemeLikes = useMemo(() => {
    if (!currentTheme?.questions || currentTheme.questions.length === 0) return 0;
    return Math.max(...currentTheme.questions.map((q) => q.likes));
  }, [currentTheme]);

  const isAllCommentFilterActive =
    allCommentSearch.trim() !== '' ||
    allCommentSort !== 'highest_likes' ||
    allCommentLikeFilter !== 'all';

  const resetAllCommentFilters = () => {
    setAllCommentSearch('');
    setAllCommentSort('highest_likes');
    setAllCommentLikeFilter('all');
  };

  const isQuestionFilterActive =
    questionSearch.trim() !== '' ||
    questionSort !== 'highest_likes' ||
    questionLikeFilter !== 'all';

  const resetQuestionFilters = () => {
    setQuestionSearch('');
    setQuestionSort('highest_likes');
    setQuestionLikeFilter('all');
  };

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
                  All Comments Stream ({rawComments?.length || 0})
                </h2>
              </div>
            </div>
            <p className="theme-summary-text">
              Complete stream of raw comments extracted from source. Use the search and like filters below to inspect highest engagement discussions or surface zero-like questions.
            </p>

            {/* Filter & Sort Toolbar */}
            <div className="sort-filter-toolbar">
              <div className="toolbar-top-row">
                {/* Search Input */}
                <div className="search-bar-wrap">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search all comments by keyword or @author..."
                    value={allCommentSearch}
                    onChange={(e) => setAllCommentSearch(e.target.value)}
                    className="toolbar-search-input"
                  />
                  {allCommentSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setAllCommentSearch('')}
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="sort-dropdown-wrap">
                  <ArrowUpDown size={13} className="sort-icon" />
                  <span className="sort-label">Sort:</span>
                  <select
                    className="sort-select"
                    value={allCommentSort}
                    onChange={(e) => setAllCommentSort(e.target.value as SortOrder)}
                  >
                    <option value="highest_likes">🔥 Highest Likes</option>
                    <option value="least_likes">❄️ Least Likes</option>
                    <option value="newest">🕒 Newest First</option>
                    <option value="relevance">🔤 Platform Order</option>
                  </select>
                </div>
              </div>

              {/* Likes Filter Pills Row */}
              <div className="toolbar-bottom-row">
                <div className="like-filter-group">
                  <span className="filter-pill-label">
                    <Filter size={12} /> Filter Likes:
                  </span>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === 'zero' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('zero')}
                    title="Comments with zero likes"
                  >
                    0 Likes (Unanswered)
                  </button>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === '5' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('5')}
                  >
                    5+ 👍
                  </button>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === '20' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('20')}
                  >
                    20+ 👍
                  </button>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === '50' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('50')}
                  >
                    50+ 🔥
                  </button>
                  <button
                    type="button"
                    className={`like-chip ${allCommentLikeFilter === '100' ? 'active' : ''}`}
                    onClick={() => setAllCommentLikeFilter('100')}
                  >
                    100+ 🚀
                  </button>
                </div>

                <div className="toolbar-results-meta">
                  <span className="results-count-text">
                    Showing <strong>{filteredAllComments.length}</strong> of{' '}
                    {rawComments?.length || 0}
                  </span>
                  {isAllCommentFilterActive && (
                    <button
                      type="button"
                      className="reset-filters-btn"
                      onClick={resetAllCommentFilters}
                    >
                      <X size={11} />
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="questions-list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '12px',
              maxHeight: '580px',
            }}
          >
            {filteredAllComments.length === 0 ? (
              <div className="empty-filter-state" style={{ gridColumn: '1 / -1' }}>
                <span>No comments match your search filter or like criteria.</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '10px' }}
                  onClick={resetAllCommentFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredAllComments.map((c: CommentItem) => {
                const isPopular = c.likes >= 50 || (maxRawLikes > 10 && c.likes === maxRawLikes);
                const isZeroLikes = c.likes === 0;

                return (
                  <div
                    key={c.id}
                    className={`question-card ${isPopular ? 'popular-card' : ''}`}
                  >
                    <div className="question-header">
                      <div className="author-wrap">
                        <span className="question-author">@{c.author}</span>
                        {isPopular && (
                          <span className="badge-popular" title="High engagement comment">
                            <Flame size={10} /> Popular
                          </span>
                        )}
                        {isZeroLikes && (
                          <span className="badge-zero-likes">0 likes</span>
                        )}
                      </div>
                      <div className="question-meta-right">
                        <span
                          className={`question-likes ${c.likes > 0 ? 'has-likes' : 'zero-likes'}`}
                        >
                          <ThumbsUp size={11} />
                          {formatLikes(c.likes)}
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
                );
              })
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
            {/* Left: Questions column with Sort & Search */}
            <div className="content-column questions-column">
              <div className="column-header-stacked">
                <div className="column-header-top">
                  <h3 className="column-title">
                    Direct Inquiries <span className="mono-count">({filteredQuestions.length})</span>
                  </h3>
                  <div className="question-sort-mini">
                    <select
                      className="sort-select-mini"
                      value={questionSort}
                      onChange={(e) => setQuestionSort(e.target.value as SortOrder)}
                    >
                      <option value="highest_likes">🔥 Highest Likes</option>
                      <option value="least_likes">❄️ Least Likes</option>
                      <option value="newest">🕒 Newest</option>
                      <option value="relevance">Default</option>
                    </select>
                  </div>
                </div>

                <div className="column-controls-row">
                  <div className="question-search-wrap">
                    <Search size={12} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Filter inquiries..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      className="question-search-input"
                    />
                    {questionSearch && (
                      <button
                        type="button"
                        className="clear-search-btn-mini"
                        onClick={() => setQuestionSearch('')}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  <div className="question-like-chips-mini">
                    <button
                      type="button"
                      className={`mini-chip ${questionLikeFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setQuestionLikeFilter('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`mini-chip ${questionLikeFilter === 'zero' ? 'active' : ''}`}
                      onClick={() => setQuestionLikeFilter('zero')}
                    >
                      0 Likes
                    </button>
                    <button
                      type="button"
                      className={`mini-chip ${questionLikeFilter === '5' ? 'active' : ''}`}
                      onClick={() => setQuestionLikeFilter('5')}
                    >
                      5+ 👍
                    </button>
                    <button
                      type="button"
                      className={`mini-chip ${questionLikeFilter === '20' ? 'active' : ''}`}
                      onClick={() => setQuestionLikeFilter('20')}
                    >
                      20+ 👍
                    </button>
                  </div>
                </div>

                {isQuestionFilterActive && (
                  <div className="filter-active-hint">
                    <span>Showing {filteredQuestions.length} of {currentTheme.questions.length} questions</span>
                    <button
                      type="button"
                      className="reset-filters-btn"
                      onClick={resetQuestionFilters}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              <div className="questions-list">
                {filteredQuestions.length === 0 ? (
                  <div className="empty-filter-state">
                    <span>No questions match your filter.</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '8px' }}
                      onClick={resetQuestionFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredQuestions.map((q: QuestionItem) => {
                    const isPopular = q.likes >= 20 || (maxThemeLikes > 5 && q.likes === maxThemeLikes);
                    const isZeroLikes = q.likes === 0;

                    return (
                      <div
                        key={q.id}
                        className={`question-card ${isPopular ? 'popular-card' : ''}`}
                      >
                        <div className="question-header">
                          <div className="author-wrap">
                            <span className="question-author">@{q.author}</span>
                            {isPopular && (
                              <span className="badge-popular" title="High like inquiry">
                                <Flame size={10} /> Top Liked
                              </span>
                            )}
                            {isZeroLikes && (
                              <span className="badge-zero-likes">0 likes</span>
                            )}
                          </div>
                          <div className="question-meta-right">
                            <span
                              className={`question-likes ${q.likes > 0 ? 'has-likes' : 'zero-likes'}`}
                            >
                              <ThumbsUp size={11} />
                              {formatLikes(q.likes)}
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
                    );
                  })
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
