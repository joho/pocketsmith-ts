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
 * Serializes error objects for better debugging
 */
export function serializeError(error: unknown): string {
  if (error === null || error === undefined) {
    return String(error);
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object') {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      // Fallback for non-serializable objects
      return String(error);
    }
  }
  
  return String(error);
}

/**
 * Creates convenience methods for working with transactions
 */
function createTransactionMethods(client: ReturnType<typeof createClient<paths>>) {
  return {
    /**
     * Get transactions for a specific account (high-level account grouping)
     * 
     * @param accountId - The account ID
     * @param options - Query parameters for filtering transactions
     * @example
     * ```typescript
     * const { data: transactions } = await client.transactions.getByAccount(123, {
     *   start_date: '2024-01-01',
     *   end_date: '2024-12-31'
     * });
     * ```
     */
    getByAccount: async (
      accountId: number, 
      options?: {
        start_date?: string;
        end_date?: string;
        search?: string;
        type?: 'credit' | 'debit';
        needs_review?: boolean;
        uncategorised?: boolean;
        page?: number;
      }
    ) => {
      return client.GET('/accounts/{id}/transactions', {
        params: {
          path: { id: accountId },
          query: options || {}
        }
      });
    },

    /**
     * Get transactions for a specific transaction account (individual account where transactions are posted)
     * 
     * @param transactionAccountId - The transaction account ID
     * @param options - Query parameters for filtering transactions
     * @example
     * ```typescript
     * const { data: transactions } = await client.transactions.getByTransactionAccount(456, {
     *   start_date: '2024-01-01',
     *   end_date: '2024-12-31'
     * });
     * ```
     */
    getByTransactionAccount: async (
      transactionAccountId: number,
      options?: {
        start_date?: string;
        end_date?: string;
        search?: string;
        type?: 'credit' | 'debit';
        needs_review?: boolean;
        uncategorised?: boolean;
        page?: number;
      }
    ) => {
      return client.GET('/transaction_accounts/{id}/transactions', {
        params: {
          path: { id: transactionAccountId },
          query: options || {}
        }
      });
    }
  };
}

/**
 * Creates a PocketSmith API client with convenience methods
 * 
 * @example
 * ```typescript
 * // Using API Key
 * const client = createPocketSmithClient({
 *   apiKey: 'your-developer-key'
 * });
 * 
 * // Using OAuth2
 * const client = createPocketSmithClient({
 *   accessToken: 'your-oauth-token'
 * });
 * 
 * // Fetch current user (standard openapi-fetch method)
 * const { data: user, error } = await client.GET('/me');
 * if (error) {
 *   console.error('API Error:', serializeError(error)); // Properly serialized error
 * }
 * 
 * // Use convenience methods
 * const { data: transactions } = await client.transactions.getByAccount(123, {
 *   start_date: '2024-01-01',
 *   end_date: '2024-12-31'
 * });
 * ```
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

  // Add convenience methods
  const clientWithConvenience = {
    ...client,
    transactions: createTransactionMethods(client)
  };

  return clientWithConvenience;
}

// Re-export types for convenience
export type * from './types';

// Default export
export default createPocketSmithClient;
