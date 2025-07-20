import createClient from 'openapi-fetch';
import type { paths } from './types';

export type PocketSmithAPIConfig = {
  /**
   * API base URL (defaults to https://api.pocketsmith.com/v2)
   */
  baseUrl?: string;
  /**
   * Developer API key for authentication
   */
  apiKey?: string;
  /**
   * OAuth2 bearer token for authentication
   */
  accessToken?: string;
};

/**
 * Creates a PocketSmith API client
 */
export function createPocketSmithClient(config: PocketSmithAPIConfig = {}) {
  const {
    baseUrl = 'https://api.pocketsmith.com/v2',
    apiKey,
    accessToken,
  } = config;

  // Add authentication headers
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-Developer-Key'] = apiKey;
  } else if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Create client with headers
  const client = createClient<paths>({
    baseUrl,
    headers,
  });

  return client;
}

// Re-export types for convenience
export type * from './types';

// Default export
export default createPocketSmithClient;
