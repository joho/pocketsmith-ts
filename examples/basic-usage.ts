import { createPocketSmithClient } from '../src';

// Example usage with API key
async function example() {
  const client = createPocketSmithClient({
    apiKey: process.env.POCKETSMITH_API_KEY,
  });

  try {
    // Get current user
    const { data: user, error } = await client.GET('/me');
    if (error) {
      console.error('Error fetching user:', error);
      return;
    }
    console.log('Current user:', user);

    // Get user's accounts
    const { data: accounts, error: accountsError } = await client.GET('/users/{id}/accounts', {
      params: {
        path: {
          id: user.id,
        },
      },
    });
    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return;
    }
    console.log('Accounts:', accounts);

    // Get transactions for the user
    const { data: transactions, error: transactionsError } = await client.GET('/users/{id}/transactions', {
      params: {
        path: {
          id: user.id,
        },
        query: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
      },
    });
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return;
    }
    console.log(`Found ${transactions.length} transactions`);

    // Create a new category
    const { data: newCategory, error: categoryError } = await client.POST('/users/{id}/categories', {
      params: {
        path: {
          id: user.id,
        },
      },
      body: {
        title: 'API Test Category',
        colour: '#FF6B6B',
      },
    });
    if (categoryError) {
      console.error('Error creating category:', categoryError);
      return;
    }
    console.log('Created category:', newCategory);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example with OAuth token
async function oauthExample() {
  const client = createPocketSmithClient({
    accessToken: process.env.POCKETSMITH_ACCESS_TOKEN,
  });

  const { data: user, error } = await client.GET('/me');
  if (error) {
    console.error('OAuth error:', error);
    return;
  }
  console.log('OAuth user:', user);
}

// Run examples if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
}
