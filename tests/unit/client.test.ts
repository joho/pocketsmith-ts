import { createPocketSmithClient } from '../../src';

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
});
