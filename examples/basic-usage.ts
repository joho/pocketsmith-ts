import { createPocketSmithClient, serializeError } from '../src';

// Example usage with API key and new convenience methods
async function example() {
  const client = createPocketSmithClient({
    apiKey: process.env.POCKETSMITH_API_KEY,
  });

  try {
    // Get current user
    const { data: user, error } = await client.GET('/me');
    if (error) {
      console.error('Error fetching user:', serializeError(error));
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
      console.error('Error fetching accounts:', serializeError(accountsError));
      return;
    }
    console.log('Accounts:', accounts);

    // Example: Get transactions using convenience method for first account
    if (accounts && accounts.length > 0) {
      const accountId = accounts[0].id;
      const { data: accountTransactions, error: convenienceError } = await client.transactions.getByAccount(accountId, {
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });
      
      if (convenienceError) {
        console.error('Error fetching account transactions:', serializeError(convenienceError));
      } else {
        console.log(`Found ${accountTransactions?.length || 0} transactions for account ${accountId} using convenience method`);
      }
    }

    // Get transactions for the user (traditional method)
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
      console.error('Error fetching transactions:', serializeError(transactionsError));
      return;
    }
    console.log(`Found ${transactions?.length || 0} transactions via user endpoint`);

    // Get transaction accounts for the first account to demonstrate convenience method
    if (accounts && accounts.length > 0) {
      const accountId = accounts[0].id;
      const { data: transactionAccounts, error: taError } = await client.GET('/accounts/{id}/transaction_accounts', {
        params: { path: { id: accountId } }
      });
      
      if (!taError && transactionAccounts && transactionAccounts.length > 0) {
        const transactionAccountId = transactionAccounts[0].id;
        const { data: taTransactions, error: taTransactionsError } = await client.transactions.getByTransactionAccount(transactionAccountId, {
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
        
        if (taTransactionsError) {
          console.error('Error fetching transaction account transactions:', serializeError(taTransactionsError));
        } else {
          console.log(`Found ${taTransactions?.length || 0} transactions for transaction account ${transactionAccountId} using convenience method`);
        }
      }
    }

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
      console.error('Error creating category:', serializeError(categoryError));
      return;
    }
    console.log('Created category:', newCategory);

  } catch (error) {
    console.error('Unexpected error:', serializeError(error));
  }
}

// Example with OAuth token and enhanced error handling
async function oauthExample() {
  const client = createPocketSmithClient({
    accessToken: process.env.POCKETSMITH_ACCESS_TOKEN,
  });

  const { data: user, error } = await client.GET('/me');
  if (error) {
    console.error('OAuth error:', serializeError(error));
    return;
  }
  console.log('OAuth user:', user);
}

// Example demonstrating the difference between Accounts vs Transaction Accounts
async function accountsVsTransactionAccountsExample() {
  const client = createPocketSmithClient({
    apiKey: process.env.POCKETSMITH_API_KEY,
  });

  try {
    const { data: user, error } = await client.GET('/me');
    if (error) {
      console.error('Error fetching user:', serializeError(error));
      return;
    }

    console.log('\n=== Accounts vs Transaction Accounts Demo ===\n');

    // 1. Fetch high-level accounts (conceptual groupings)
    const { data: accounts, error: accountsError } = await client.GET('/users/{id}/accounts', {
      params: { path: { id: user.id } }
    });
    
    if (accountsError) {
      console.error('Error fetching accounts:', serializeError(accountsError));
      return;
    }

    console.log(`Found ${accounts?.length || 0} high-level accounts (conceptual groupings):`);
    accounts?.forEach(account => {
      console.log(`  - Account: ${account.title} (ID: ${account.id})`);
    });

    if (accounts && accounts.length > 0) {
      const firstAccount = accounts[0];
      
      // 2. Fetch transaction accounts for the first account (actual bank accounts where transactions are posted)
      const { data: transactionAccounts, error: taError } = await client.GET('/accounts/{id}/transaction_accounts', {
        params: { path: { id: firstAccount.id } }
      });
      
      if (taError) {
        console.error('Error fetching transaction accounts:', serializeError(taError));
        return;
      }

      console.log(`\nFor account "${firstAccount.title}", found ${transactionAccounts?.length || 0} transaction accounts (actual bank accounts):`);
      transactionAccounts?.forEach(ta => {
        console.log(`  - Transaction Account: ${ta.name} (ID: ${ta.id}) - ${ta.type}`);
      });

      // 3. Demonstrate convenience methods for fetching transactions
      if (transactionAccounts && transactionAccounts.length > 0) {
        const firstTA = transactionAccounts[0];
        
        console.log(`\n=== Fetching Transactions for Different Account Types ===\n`);
        
        // Method 1: Get transactions by high-level account
        const { data: accountTransactions } = await client.transactions.getByAccount(firstAccount.id, {
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
        
        // Method 2: Get transactions by specific transaction account
        const { data: taTransactions } = await client.transactions.getByTransactionAccount(firstTA.id, {
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
        
        console.log(`Transactions via high-level account "${firstAccount.title}": ${accountTransactions?.length || 0}`);
        console.log(`Transactions via transaction account "${firstTA.name}": ${taTransactions?.length || 0}`);
        console.log('\nNote: High-level account transactions aggregate across all its transaction accounts');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', serializeError(error));
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Running basic usage example...');
  example()
    .then(() => {
      console.log('\nRunning accounts vs transaction accounts example...');
      return accountsVsTransactionAccountsExample();
    })
    .catch(console.error);
}
