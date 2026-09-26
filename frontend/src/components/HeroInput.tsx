import React, { useState } from 'react';
import { ArrowRight, X, AlertCircle, MessageCircle, FileText, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { SourceType } from '../types';

interface HeroInputProps {
  onAnalyze: (options: {
    sourceType: SourceType;
    url: string;
    maxComments: number;
    fetchAll: boolean;
    generateIdeas: boolean;
  }) => void;
  isLoading: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [maxComments, setMaxComments] = useState(150);
  const [fetchAll, setFetchAll] = useState(false);
  const [generateIdeas, setGenerateIdeas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEMO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const PRESETS = [100, 250, 500, 1000];

  const validateUrl = (input: string): boolean => {
    if (!input.trim()) {
      setError('Please paste or enter a URL');
      return false;
    }
    if (sourceType === 'youtube') {
      const isYoutube = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/i.test(input);
      if (!isYoutube) {
        setError('Please provide a valid YouTube URL');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url)) return;

    onAnalyze({
      sourceType,
      url: url.trim(),
      maxComments: fetchAll ? 0 : maxComments,
      fetchAll,
      generateIdeas,
    });
  };

  const handleUseDemo = () => {
    setUrl(DEMO_URL);
    setError(null);
    onAnalyze({
      sourceType: 'youtube',
      url: DEMO_URL,
      maxComments: 150,
      fetchAll: false,
      generateIdeas: true,
    });
  };

  return (
    <section className="hero-section">
      <div className="hero-header">
        <div className="hero-badge-pill">
          <span className="hero-badge-dot" />
          <span>Audience Intelligence Engine</span>
        </div>
        <h1 className="hero-title">
          Turn comment threads into actionable content blueprints
        </h1>
        <p className="hero-subtitle">
          Isolate recurring user questions, group thematic demand, and synthesize high-yield ideas with algorithmic precision.
        </p>
      </div>

      <form className="search-box clean-panel" onSubmit={handleSubmit} id="analyze-form">
        {/* Platform Segmented Switch Hallmark */}
        <div className="platform-segmented-bar">
          <button
            type="button"
            className={`platform-pill ${sourceType === 'youtube' ? 'active' : ''}`}
            onClick={() => setSourceType('youtube')}
            disabled={isLoading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>YouTube</span>
          </button>
          <button
            type="button"
            className={`platform-pill ${sourceType === 'reddit' ? 'active' : ''}`}
            onClick={() => setSourceType('reddit')}
            disabled={isLoading}
          >
            <MessageCircle size={14} />
            <span>Reddit</span>
            <span className="platform-beta-tag">BETA</span>
          </button>
          <button
            type="button"
            className={`platform-pill ${sourceType === 'raw_text' ? 'active' : ''}`}
            onClick={() => setSourceType('raw_text')}
            disabled={isLoading}
          >
            <FileText size={14} />
            <span>Direct Text</span>
          </button>
        </div>

        {/* Search Input Row with Keyboard Hallmark */}
        <div className="input-row">
          <input
            id="url-input-field"
            type="text"
            className="main-url-input"
            placeholder={
              sourceType === 'youtube'
                ? 'Paste YouTube video URL (e.g. https://www.youtube.com/watch?v=...)'
                : sourceType === 'reddit'
                ? 'Paste Reddit discussion thread URL...'
                : 'Paste text or comment block...'
            }
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />

          {url && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setUrl('')}
              title="Clear input"
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          )}

          <div className="input-shortcut-hint">
            <kbd className="kbd-shortcut">↵ Enter</kbd>
          </div>

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            id="start-analyze-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-sm animate-spin" />
                <span>Scanning</span>
              </>
            ) : (
              <>
                <span>Extract Insights</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}

        {/* Precision Fine-Tuning Controls */}
        <div className="options-row">
          <div className="fetch-mode-switch">
            <button
              type="button"
              className={`fetch-mode-btn ${!fetchAll ? 'active' : ''}`}
              onClick={() => setFetchAll(false)}
              disabled={isLoading}
            >
              <SlidersHorizontal size={12} />
              <span>Sample Volume</span>
            </button>
            <button
              type="button"
              className={`fetch-mode-btn ${fetchAll ? 'active' : ''}`}
              onClick={() => setFetchAll(true)}
              disabled={isLoading}
            >
              <Sparkles size={12} />
              <span>Fetch All Comments</span>
              <span className="badge-all-pill">ALL</span>
            </button>
          </div>

          {!fetchAll ? (
            <div className="option-item slider-item">
              <input
                id="max-comments-slider"
                type="range"
                min="50"
                max="1000"
                step="50"
                value={maxComments}
                onChange={(e) => setMaxComments(Number(e.target.value))}
                disabled={isLoading}
                className="range-slider"
              />
              <span className="mono-val">{maxComments} comments</span>
              <div className="quick-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`preset-btn ${maxComments === p ? 'active' : ''}`}
                    onClick={() => setMaxComments(p)}
                    disabled={isLoading}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="fetch-all-indicator">
              <span className="indicator-glow" />
              <span>Full Thread: extracting all public comments</span>
            </div>
          )}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={generateIdeas}
              onChange={(e) => setGenerateIdeas(e.target.checked)}
              disabled={isLoading}
            />
            <span>Synthesize Concepts</span>
          </label>

          <div className="demo-link-wrap">
            <button
              type="button"
              id="try-demo-btn"
              className="demo-link-btn"
              onClick={handleUseDemo}
              disabled={isLoading}
            >
              Load Example URL
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
