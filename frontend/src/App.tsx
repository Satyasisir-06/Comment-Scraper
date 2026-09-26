import { useState, useEffect } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { StatusProgress } from './components/StatusProgress';
import { MetricsBanner } from './components/MetricsBanner';
import { ThematicExplorer } from './components/ThematicExplorer';
import { ExportBar } from './components/ExportBar';
import { FeatureShowcase } from './components/FeatureShowcase';
import { mockAnalysisResult } from './mocks/mockAnalysisData';
import { analyzeComments, checkBackendHealth } from './services/api';
import type { AnalyzeResponse, SourceType } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check live backend connectivity on load
  useEffect(() => {
    checkBackendHealth()
      .then((res) => {
        if (res.status === 'healthy') {
          setIsBackendHealthy(true);
        }
      })
      .catch(() => {
        setIsBackendHealthy(false);
      });
  }, []);

  const handleAnalyze = async (options: {
    sourceType: SourceType;
    url: string;
    maxComments: number;
    generateIdeas: boolean;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await analyzeComments({
        source_type: options.sourceType,
        url: options.url,
        max_comments: options.maxComments,
        generate_ideas: options.generateIdeas,
      });
      setAnalysisData(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const totalIdeasCount =
    analysisData?.themes.reduce(
      (sum, theme) => sum + theme.generated_ideas.length,
      0,
    ) || 0;

  return (
    <div className="app-wrapper">
      <Navbar isBackendHealthy={isBackendHealthy} />

      <main className="main-content">
        <div className="container">
          <HeroInput onAnalyze={handleAnalyze} isLoading={isLoading} />

          <StatusProgress isLoading={isLoading} />

          {errorMessage && (
            <div className="clean-panel error-banner">
              <AlertCircle size={18} className="text-error" />
              <div>
                <strong className="error-title">Analysis failed:</strong> {errorMessage}
                {!isBackendHealthy && (
                  <p className="error-hint">
                    Backend is unreachable at{' '}
                    <code>{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code>. Ensure the server is running.
                  </p>
                )}
              </div>
            </div>
          )}

          {!analysisData && !isLoading && (
            <FeatureShowcase onLoadSample={() => setAnalysisData(mockAnalysisResult)} />
          )}

          {analysisData && !isLoading && (
            <>
              <div className="results-top-nav">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setAnalysisData(null)}
                >
                  ← New Analysis
                </button>
              </div>

              <MetricsBanner
                metadata={analysisData.metadata}
                ideasCount={totalIdeasCount}
              />

              <ThematicExplorer
                themes={analysisData.themes}
                rawComments={analysisData.raw_comments}
              />

              <ExportBar data={analysisData} />
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>InsightEcho · Minimalist Audience Intelligence</p>
          <span className="footer-meta">API v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
