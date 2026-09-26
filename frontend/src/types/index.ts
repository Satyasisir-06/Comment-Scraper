/**
 * Shared Type Definitions for Comment Scraper
 * Synchronized with docs/API_CONTRACT.md
 */

export type SourceType = 'youtube' | 'reddit' | 'raw_text';

export interface AnalyzeRequest {
  source_type: SourceType;
  url?: string;
  raw_text?: string;
  max_comments?: number;
  generate_ideas?: boolean;
}

export interface QuestionItem {
  id: string;
  author: string;
  text: string;
  likes: number;
  published_at: string;
}

export interface GeneratedIdea {
  id: string;
  title: string;
  format: string;
  target_audience: string;
  description: string;
}

export interface ThemeCluster {
  theme_id: string;
  name: string;
  summary: string;
  sentiment: string;
  questions: QuestionItem[];
  generated_ideas: GeneratedIdea[];
}

export interface AnalysisMetadata {
  source_type: SourceType;
  source_title: string;
  total_comments_scanned: number;
  questions_found: int_or_number;
  themes_count: number;
}

type int_or_number = number;

export interface AnalyzeResponse {
  job_id: string;
  timestamp: string;
  metadata: AnalysisMetadata;
  themes: ThemeCluster[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
