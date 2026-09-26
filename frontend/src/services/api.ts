import { AnalyzeRequest, AnalyzeResponse } from '../types';
import { mockAnalysisResult } from '../mocks/mockAnalysisData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Calls backend analysis endpoint or returns mock data.
 * @param req The request parameters
 * @param useMock If true, returns mock fixture with simulated delay
 */
export async function analyzeComments(
  req: AnalyzeRequest,
  useMock = false,
): Promise<AnalyzeResponse> {
  if (useMock) {
    // Artificial latency for authentic loading experience
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockAnalysisResult;
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message || `Backend request failed with status ${response.status}`,
    );
  }

  return response.json();
}

/**
 * Checks backend health status.
 */
export async function checkBackendHealth(): Promise<{ status: string; version: string; llm_connected: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}
