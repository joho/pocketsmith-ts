import { createPocketSmithClient, serializeError } from '../../src';

describe('PocketSmith API Integration Tests', () => {
  let client: ReturnType<typeof createPocketSmithClient>;
  let apiKey: string;

  beforeAll(() => {
    // Read API key from environment variable
    apiKey = process.env.POCKETSMITH_API_KEY || '';
    
    if (!apiKey) {
      throw new Error(
        'POCKETSMITH_API_KEY environment variable is required for integration tests. ' +
        'Get your API key by logging into PocketSmith → Settings → Security & Integrations'
      );
    }

    client = createPocketSmithClient({
      apiKey,
    });
  });

  describe('Authentication', () => {
    test('should authenticate and fetch current user', async () => {
      const { data: user, error } = await client.GET('/me');

      expect(error).toBeUndefined();
      expect(user).toBeDefined();
      
      if (user) {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('login');
        expect(typeof user.id).toBe('number');
        expect(typeof user.login).toBe('string');
      }
    });
  });

  describe('User Data', () => {
    let userId: number;

    beforeAll(async () => {
      const { data: user } = await client.GET('/me');
      if (!user || typeof user.id !== 'number') {
        throw new Error('Failed to fetch user data or user ID is missing');
      }
      userId = user.id as number;
    });

    test('should fetch user accounts', async () => {
      const { data: accounts, error } = await client.GET('/users/{id}/accounts', {
        params: {
          path: {
            id: userId,
          },
        },
      });

      expect(error).toBeUndefined();
      expect(accounts).toBeDefined();
      expect(Array.isArray(accounts)).toBe(true);
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        expect(account).toHaveProperty('id');
        expect(account).toHaveProperty('title');
        expect(account).toHaveProperty('currency_code');
        expect(typeof account.id).toBe('number');
        expect(typeof account.title).toBe('string');
      }
    });

    test('should fetch user categories', async () => {
      const { data: categories, error } = await client.GET('/users/{id}/categories', {
        params: {
          path: {
            id: userId,
          },
        },
      });

      expect(error).toBeUndefined();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      
      if (categories && categories.length > 0) {
        const category = categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('title');
        expect(typeof category.id).toBe('number');
        expect(typeof category.title).toBe('string');
      }
    });

    test('should fetch user transactions', async () => {
      const endDate = new Date().toISOString().split('T')[0]; // Today
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

      const { data: transactions, error } = await client.GET('/users/{id}/transactions', {
        params: {
          path: {
            id: userId,
          },
          query: {
            start_date: startDate,
            end_date: endDate,
          },
        },
      });

      expect(error).toBeUndefined();
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
      
      if (transactions && transactions.length > 0) {
        const transaction = transactions[0];
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('payee');
        expect(transaction).toHaveProperty('amount');
        expect(transaction).toHaveProperty('date');
        expect(typeof transaction.id).toBe('number');
        expect(typeof transaction.amount).toBe('number');
      }
    });
  });

  describe('Reference Data', () => {
    test('should fetch currencies', async () => {
      const { data: currencies, error } = await client.GET('/currencies');

      expect(error).toBeUndefined();
      expect(currencies).toBeDefined();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies!.length).toBeGreaterThan(0);

      const currency = currencies![0];
      expect(currency).toHaveProperty('id');
      expect(currency).toHaveProperty('name');
      expect(currency).toHaveProperty('symbol');
      expect(typeof currency.id).toBe('string');
      expect(typeof currency.name).toBe('string');
    });

    test('should fetch specific currency (USD)', async () => {
      const { data: currency, error } = await client.GET('/currencies/{id}', {
        params: {
          path: {
            id: 'usd',
          },
        },
      });

      expect(error).toBeUndefined();
      expect(currency).toBeDefined();
      expect(currency!.id).toBe('usd');
      expect(currency!.name).toContain('Dollar');
      expect(currency).toHaveProperty('symbol');
    });

    test('should fetch time zones', async () => {
      const { data: timeZones, error } = await client.GET('/time_zones');

      expect(error).toBeUndefined();
      expect(timeZones).toBeDefined();
      expect(Array.isArray(timeZones)).toBe(true);
      expect(timeZones!.length).toBeGreaterThan(0);

      const timeZone = timeZones![0];
      expect(timeZone).toHaveProperty('name');
      expect(timeZone).toHaveProperty('identifier');
      expect(typeof timeZone.name).toBe('string');
      expect(typeof timeZone.identifier).toBe('string');
    });
  });

  describe('Convenience Methods', () => {
    let accountId: number;
    let transactionAccountId: number;

    beforeAll(async () => {
      const { data: user } = await client.GET('/me');
      if (!user || typeof user.id !== 'number') {
        throw new Error('Failed to fetch user data');
      }

      const { data: accounts } = await client.GET('/users/{id}/accounts', {
        params: { path: { id: user.id } },
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found for testing convenience methods');
      }

      accountId = accounts[0].id as number;

      const { data: transactionAccounts } = await client.GET('/users/{id}/transaction_accounts', {
        params: { path: { id: user.id } },
      });

      if (transactionAccounts && Array.isArray(transactionAccounts) && transactionAccounts.length > 0) {
        transactionAccountId = transactionAccounts[0].id as number;
      }
    });

    test('should fetch transactions by account using convenience method', async () => {
      const { data: transactions, error } = await client.transactions.getByAccount(accountId, {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(error).toBeUndefined();
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });

    test('should fetch transactions by transaction account using convenience method', async () => {
      if (!transactionAccountId) {
        console.log('Skipping transaction account test - no transaction accounts available');
        return;
      }

      const { data: transactions, error } = await client.transactions.getByTransactionAccount(transactionAccountId, {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(error).toBeUndefined();
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });

    test('should support all query options in convenience methods', async () => {
      const { data: transactions, error } = await client.transactions.getByAccount(accountId, {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        type: 'debit',
        page: 1,
      });

      expect(error).toBeUndefined();
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid endpoint gracefully', async () => {
      // Try to fetch a non-existent user
      const { data, error } = await client.GET('/users/{id}', {
        params: {
          path: {
            id: 999999999, // Very unlikely to exist
          },
        },
      });

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
      expect(error).toHaveProperty('error');
    });

    test('should provide enhanced error serialization', async () => {
      const { data, error } = await client.GET('/users/{id}', {
        params: {
          path: {
            id: 999999999, // Very unlikely to exist
          },
        },
      });

      expect(error).toBeDefined();
      
      // Test that serializeError works with the error
      const serialized = serializeError(error);
      expect(typeof serialized).toBe('string');
      expect(serialized).not.toBe('[object Object]');
      expect(serialized.length).toBeGreaterThan(0);
    });

    test('should handle convenience method errors gracefully', async () => {
      const { data, error } = await client.transactions.getByAccount(999999999, {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
      
      // Ensure the error is serializable
      const serialized = serializeError(error);
      expect(typeof serialized).toBe('string');
      expect(serialized).not.toBe('[object Object]');
    });
  });
});
