import type { AnalyzeRequest, AnalyzeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Calls backend analysis endpoint.
 * @param req The request parameters
 */
export async function analyzeComments(
  req: AnalyzeRequest,
): Promise<AnalyzeResponse> {
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
