# Agent Guide - PocketSmith TypeScript Client

This file contains essential information for AI agents working on this project.

## Project Overview

TypeScript API client library for PocketSmith, auto-generated from their official OpenAPI specification with minimal bespoke code.

**Author**: John Barton (@joho)
**Tech Stack**: TypeScript, openapi-fetch, openapi-typescript, Jest
**Purpose**: Fully-typed client for PocketSmith API with authentication support

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Generate types from OpenAPI spec
npm run generate

# Download latest OpenAPI spec
npm run download-spec
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=unit

# Run integration tests (requires POCKETSMITH_API_KEY in .env)
npm run test:integration

# Run with coverage
npm test -- --coverage
```

### Type Checking
```bash
# TypeScript compilation check
npm run build

# Watch mode
npm run dev
```

## Project Structure

```
├── src/
│   ├── index.ts              # Main client factory and exports
│   └── types.ts              # Auto-generated from OpenAPI spec
├── tests/
│   ├── setup.ts              # Jest setup with dotenv loading
│   ├── unit/
│   │   └── client.test.ts    # Unit tests for client creation
│   └── integration/
│       └── api.test.ts       # Integration tests against real API
├── examples/
│   └── basic-usage.ts        # Usage examples
├── specs/
│   └── pocketsmith-openapi.json  # Downloaded OpenAPI spec
├── scripts/
│   └── test-integration.js   # Integration test runner with env checks
├── dist/                     # Built output (gitignored)
└── .env                      # Environment variables (gitignored)
```

## Code Generation Workflow

1. **Download spec**: `npm run download-spec` - Gets latest OpenAPI spec from GitHub
2. **Generate types**: `openapi-typescript` converts spec to TypeScript types
3. **Build**: `tsc` compiles TypeScript to JavaScript

**Important**: Types are auto-generated - never edit `src/types.ts` manually!

## Authentication

Client supports two authentication methods:
- **API Key**: `X-Developer-Key` header (for personal use)
- **OAuth2**: `Authorization: Bearer` header (for apps)

API keys obtained from: PocketSmith → Settings → Security & Integrations

## Testing Strategy

### Unit Tests
- Test client creation and configuration
- No external API calls
- Fast execution, no env vars needed

### Integration Tests  
- Real API calls to PocketSmith
- Requires `POCKETSMITH_API_KEY` in `.env`
- Tests authentication, data fetching, error handling
- Uses dotenv for environment loading

### Environment Setup
```bash
# Copy example env file
cp .env.example .env
# Edit .env with real API key
```

## Code Style & Conventions

### TypeScript
- **Strict mode enabled** in tsconfig.json
- **Full type safety** - no `any` types
- **Generated types** from OpenAPI spec for API responses
- **Optional chaining** used for nullable API responses

### Client Design
- **Factory pattern**: `createPocketSmithClient(config)`
- **Minimal interface**: Uses openapi-fetch for HTTP operations
- **Type-safe**: All endpoints, params, and responses typed
- **Headers-based auth**: Set during client creation

### Error Handling
- **openapi-fetch pattern**: `{ data, error }` response objects
- **Null checks**: Handle optional properties from API
- **Type guards**: Check types before assignment (e.g., `typeof user.id === 'number'`)

### Testing Patterns
- **Descriptive test names**: "should authenticate and fetch current user"
- **Grouped tests**: Related tests in `describe` blocks
- **Setup/teardown**: Use `beforeAll` for shared setup
- **Type assertions**: Use `as` after type checks
- **Environment checks**: Fail fast if API key missing

## Dependencies

### Runtime
- `openapi-fetch`: HTTP client with OpenAPI integration

### Development
- `openapi-typescript`: Generates types from OpenAPI specs
- `typescript`: TypeScript compiler
- `jest` + `ts-jest`: Testing framework
- `dotenv`: Environment variable loading

## Common Patterns

### API Response Handling
```typescript
const { data: user, error } = await client.GET('/me');
if (error) {
  // Handle error case
  return;
}
// data is typed and safe to use
```

### Type Safety with Optional Properties
```typescript
// API types have optional properties
if (!user || typeof user.id !== 'number') {
  throw new Error('Invalid user data');
}
// Now user.id is guaranteed to be number
const userId = user.id as number;
```

### Client Creation
```typescript
const client = createPocketSmithClient({
  apiKey: process.env.POCKETSMITH_API_KEY,
  // OR
  accessToken: process.env.POCKETSMITH_ACCESS_TOKEN,
  // Optional custom base URL
  baseUrl: 'https://api.pocketsmith.com/v2',
});
```

## Troubleshooting

### Common Issues
1. **"Property 'id' is possibly undefined"** → Add type checks before using optional properties
2. **Integration tests fail** → Check POCKETSMITH_API_KEY in .env file
3. **Type errors after spec update** → Rebuild with `npm run build`
4. **API calls fail** → Verify API key is valid and has required permissions

### Updating API Spec
When PocketSmith updates their API:
1. Run `npm run generate` to fetch latest spec and regenerate types
2. Update integration tests if new endpoints added
3. Check for breaking changes in existing endpoints

## Release Process

1. Update version in package.json
2. Run `npm test` to ensure all tests pass
3. Run `npm run build` to create clean build
4. Update README.md if needed
5. Commit and tag release

## External Resources

- **PocketSmith API Docs**: https://developers.pocketsmith.com/
- **OpenAPI Spec Source**: https://github.com/pocketsmith/api
- **openapi-fetch docs**: https://openapi-ts.pages.dev/openapi-fetch/
- **API Key Setup**: Log into PocketSmith → Settings → Security & Integrations
