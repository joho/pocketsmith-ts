import { createPocketSmithClient, serializeError } from '../../src';

describe('PocketSmith Client Unit Tests', () => {
  describe('Client Creation', () => {
    test('should create client with default configuration', () => {
      const client = createPocketSmithClient();
      expect(client).toBeDefined();
      expect(typeof client.GET).toBe('function');
      expect(typeof client.POST).toBe('function');
      expect(typeof client.PUT).toBe('function');
      expect(typeof client.DELETE).toBe('function');
    });

    test('should create client with API key', () => {
      const client = createPocketSmithClient({
        apiKey: 'test-api-key',
      });
      expect(client).toBeDefined();
    });

    test('should create client with OAuth token', () => {
      const client = createPocketSmithClient({
        accessToken: 'test-oauth-token',
      });
      expect(client).toBeDefined();
    });

    test('should create client with custom base URL', () => {
      const client = createPocketSmithClient({
        baseUrl: 'https://custom-api.example.com/v2',
        apiKey: 'test-key',
      });
      expect(client).toBeDefined();
    });

    test('should prefer OAuth token over API key when both provided', () => {
      const client = createPocketSmithClient({
        apiKey: 'test-api-key',
        accessToken: 'test-oauth-token',
      });
      expect(client).toBeDefined();
      // Note: The actual header preference is tested in integration tests
    });
  });

  describe('Type Safety', () => {
    test('should have properly typed methods', () => {
      const client = createPocketSmithClient();
      
      // These should compile without TypeScript errors
      expect(typeof client.GET).toBe('function');
      expect(typeof client.POST).toBe('function');
      expect(typeof client.PUT).toBe('function');
      expect(typeof client.DELETE).toBe('function');
      expect(typeof client.OPTIONS).toBe('function');
      expect(typeof client.HEAD).toBe('function');
      expect(typeof client.PATCH).toBe('function');
    });
  });

  describe('Convenience Methods', () => {
    test('should include transaction convenience methods', () => {
      const client = createPocketSmithClient({
        apiKey: 'test-api-key',
      });

      expect(client.transactions).toBeDefined();
      expect(client.transactions.getByAccount).toBeDefined();
      expect(client.transactions.getByTransactionAccount).toBeDefined();
      expect(typeof client.transactions.getByAccount).toBe('function');
      expect(typeof client.transactions.getByTransactionAccount).toBe('function');
    });
  });

  describe('Error Serialization', () => {
    test('should serialize string errors', () => {
      const error = 'Simple error message';
      expect(serializeError(error)).toBe('Simple error message');
    });

    test('should serialize object errors', () => {
      const error = { message: 'Error occurred', code: 500 };
      const serialized = serializeError(error);
      expect(serialized).toContain('Error occurred');
      expect(serialized).toContain('500');
    });

    test('should handle null/undefined errors', () => {
      expect(serializeError(null)).toBe('null');
      expect(serializeError(undefined)).toBe('undefined');
    });

    test('should handle non-serializable objects', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;
      const result = serializeError(circularRef);
      expect(typeof result).toBe('string');
    });
  });
});
