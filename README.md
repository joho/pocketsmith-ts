# PocketSmith TypeScript Client

A fully-typed TypeScript client library for the [PocketSmith API](https://developers.pocketsmith.com/), automatically generated from their official OpenAPI specification.

## Features

- ✅ **Fully typed** - Complete TypeScript definitions for all API endpoints
- ✅ **Auto-generated** - Built directly from PocketSmith's official OpenAPI spec
- ✅ **Zero boilerplate** - Minimal configuration required
- ✅ **Modern** - Built with `openapi-fetch` for excellent performance
- ✅ **Authentication** - Supports both API keys and OAuth2

## Installation

```bash
npm install pocketsmith-ts
```

## Quick Start

### Using API Key (Developer Key)

```typescript
import { createPocketSmithClient } from 'pocketsmith-ts';

const client = createPocketSmithClient({
  apiKey: 'your-api-key-here'
});

// Get current user
const { data: user } = await client.GET('/me');
console.log(user);

// Get user's accounts
const { data: accounts } = await client.GET('/users/{id}/accounts', {
  params: { path: { id: user.id } }
});
```

### Using OAuth2

```typescript
const client = createPocketSmithClient({
  accessToken: 'your-oauth-token-here'
});

const { data: user } = await client.GET('/me');
```

## Configuration

```typescript
const client = createPocketSmithClient({
  // API base URL (optional, defaults to https://api.pocketsmith.com/v2)
  baseUrl: 'https://api.pocketsmith.com/v2',
  
  // For personal use - get from https://my.pocketsmith.com/api_keys
  apiKey: 'your-developer-key',
  
  // For OAuth apps - obtained through OAuth flow
  accessToken: 'your-oauth-token',
});
```

## Understanding Accounts vs Transaction Accounts

PocketSmith has two types of account endpoints that serve different purposes:

### Accounts (`/accounts/{id}`)
**High-level account groupings** that represent conceptual account containers. These are used for organizing and categorizing your financial structure.

```typescript
// Fetch all accounts for a user
const { data: accounts } = await client.GET('/users/{id}/accounts', {
  params: { path: { id: userId } }
});

// Get specific account details
const { data: account } = await client.GET('/accounts/{id}', {
  params: { path: { id: accountId } }
});
```

### Transaction Accounts (`/transaction_accounts/{id}`)
**Individual accounts where transactions are actually posted**. These represent the actual bank accounts, credit cards, etc. where money moves in and out.

```typescript
// Fetch transaction accounts for an account
const { data: transactionAccounts } = await client.GET('/accounts/{id}/transaction_accounts', {
  params: { path: { id: accountId } }
});

// Get transactions for a specific transaction account
const { data: transactions } = await client.GET('/transaction_accounts/{id}/transactions', {
  params: { 
    path: { id: transactionAccountId },
    query: { 
      start_date: '2024-01-01',
      end_date: '2024-12-31' 
    }
  }
});

// Create a transaction in a specific transaction account
const { data: transaction } = await client.POST('/transaction_accounts/{id}/transactions', {
  params: { path: { id: transactionAccountId } },
  body: {
    payee: 'Coffee Shop',
    amount: -4.50,
    date: '2024-01-15'
  }
});
```

## Examples

### Fetching Transactions

#### Using Standard API Endpoints

```typescript
const { data: transactions } = await client.GET('/users/{id}/transactions', {
  params: {
    path: { id: userId },
    query: {
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      search: 'coffee',
      type: 'debit'
    }
  }
});
```

#### Using Convenience Methods

```typescript
// Get transactions for a high-level account grouping
const { data: accountTransactions } = await client.transactions.getByAccount(123, {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  search: 'coffee'
});

// Get transactions for a specific transaction account (where transactions are posted)
const { data: transactionAccountTransactions } = await client.transactions.getByTransactionAccount(456, {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  type: 'debit'
});
```

### Creating a Transaction

```typescript
const { data: transaction } = await client.POST('/transaction_accounts/{id}/transactions', {
  params: {
    path: { id: transactionAccountId }
  },
  body: {
    payee: 'Coffee Shop',
    amount: -4.50,
    date: '2024-01-15',
    category_id: categoryId,
    note: 'Morning coffee'
  }
});
```

### Managing Categories

```typescript
// Create a category
const { data: category } = await client.POST('/users/{id}/categories', {
  params: { path: { id: userId } },
  body: {
    title: 'Coffee & Drinks',
    colour: '#8B4513',
    is_bill: false
  }
});

// Update a category
const { data: updated } = await client.PUT('/categories/{id}', {
  params: { path: { id: category.id } },
  body: {
    title: 'Coffee & Beverages',
    colour: '#654321'
  }
});
```

## Error Handling

The client returns a `{ data, error }` object for each request. For better error debugging, use the `serializeError` utility:

```typescript
import { createPocketSmithClient, serializeError } from 'pocketsmith-ts';

const client = createPocketSmithClient({ apiKey: 'your-key' });
const { data, error } = await client.GET('/me');

if (error) {
  // Use serializeError to properly format errors (no more [object Object])
  console.error('API Error:', serializeError(error));
  console.error('Full error object:', error);
  // Handle error case
  return;
}

// Use data safely here
console.log(data.name);
```

## Type Safety

All API responses and request bodies are fully typed:

```typescript
// user is typed as components["schemas"]["User"]
const { data: user } = await client.GET('/me');

// TypeScript knows about all user properties
console.log(user.id, user.name, user.email);

// Request body is also typed
await client.POST('/users/{id}/categories', {
  params: { path: { id: userId } },
  body: {
    title: 'Required field',
    colour: '#FF0000', // Optional but typed
    // TypeScript will error if you use invalid properties
  }
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run only integration tests (requires API key)
npm run test:integration

# Run with coverage
npm test -- --coverage
```

### Integration Tests

Integration tests require a valid PocketSmith API key. Set it as an environment variable:

```bash
export POCKETSMITH_API_KEY=your_api_key_here
npm run test:integration
```

Or create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your API key
```

**Note:** Integration tests make real API calls to PocketSmith and may count against your API rate limits.

## Development

### Updating the OpenAPI Spec

The client is automatically generated from PocketSmith's official OpenAPI specification. To update:

```bash
npm run generate
```

This will:
1. Download the latest OpenAPI spec from PocketSmith's GitHub repo
2. Generate TypeScript types and interfaces
3. Update the client accordingly

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Authentication

### Developer Keys

For personal use or simple integrations, you can generate a developer key:

1. Log into PocketSmith
2. Go to Settings → Security & Integrations
3. Create a new developer key
4. Use it with the `apiKey` option

### OAuth2

For applications that other users will use:

1. Contact PocketSmith at api@pocketsmith.com to register your app
2. Implement the OAuth2 flow to get access tokens
3. Use tokens with the `accessToken` option

See [PocketSmith's OAuth documentation](https://developers.pocketsmith.com/guides/oauth) for details.

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Author

**John Barton** - [@joho](https://github.com/joho)

## Links

- [PocketSmith API Documentation](https://developers.pocketsmith.com/)
- [OpenAPI Specification](https://github.com/pocketsmith/api)
- [Report Issues](https://github.com/joho/pocketsmith-ts/issues)
