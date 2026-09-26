import React, { useState } from 'react';
import { Search, Sliders, Wand2, X, AlertCircle } from 'lucide-react';
import type { SourceType } from '../types';

interface HeroInputProps {
  onAnalyze: (options: {
    sourceType: SourceType;
    url: string;
    maxComments: number;
    generateIdeas: boolean;
  }) => void;
  isLoading: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [maxComments, setMaxComments] = useState(150);
  const [generateIdeas, setGenerateIdeas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEMO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

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
      maxComments,
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
      generateIdeas: true,
    });
  };

  return (
    <section className="hero-section">
      <div className="hero-badge-wrap">
        <span className="badge badge-curious animate-pulse-glow">
          <Wand2 size={13} />
          AI Audience Insight Engine
        </span>
      </div>

      <h1 className="hero-title">
        Turn Audience Comments Into <br />
        <span className="text-gradient">High-Yield Content & Product Ideas</span>
      </h1>
      <p className="hero-subtitle">
        Automatically scan comment threads, extract genuine questions, cluster them by
        thematic demand, and synthesize actionable content blueprints in seconds.
      </p>

      <form className="search-box glass-panel" onSubmit={handleSubmit} id="analyze-form">
        <div className="input-row">
          <div className="input-icon-wrap" title="YouTube Video Source">
            <svg
              className="platform-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          <input
            id="url-input-field"
            type="text"
            className="main-url-input"
            placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
          />

          {url && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setUrl('')}
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            id="start-analyze-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-sm animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Extract Ideas</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="options-row">
          <div className="demo-chip-group">
            <span className="options-label">Platform:</span>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="source-select-dropdown"
              disabled={isLoading}
            >
              <option value="youtube">YouTube</option>
              <option value="reddit">Reddit (Beta)</option>
              <option value="raw_text">Direct Text</option>
            </select>
          </div>

          <div className="demo-chip-group">
            <span className="options-label">Quick Test:</span>
            <button
              type="button"
              id="try-demo-btn"
              className="demo-chip-btn"
              onClick={handleUseDemo}
              disabled={isLoading}
            >
              Try Sample Video
            </button>
          </div>

          <div className="slider-group">
            <Sliders size={14} className="slider-icon" />
            <span className="options-label">Max Comments:</span>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={maxComments}
              onChange={(e) => setMaxComments(Number(e.target.value))}
              disabled={isLoading}
              className="range-slider"
            />
            <span className="slider-value">{maxComments}</span>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={generateIdeas}
              onChange={(e) => setGenerateIdeas(e.target.checked)}
              disabled={isLoading}
            />
            <span>Generate Content Ideas</span>
          </label>
        </div>
      </form>
    </section>
  );
};
