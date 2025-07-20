#!/usr/bin/env node

/**
 * Integration test runner that checks for API key before running tests
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

function checkApiKey() {
  const apiKey = process.env.POCKETSMITH_API_KEY;
  
  if (!apiKey) {
    console.error('\n❌ POCKETSMITH_API_KEY environment variable is required for integration tests');
    console.error('\n📝 To get your API key:');
    console.error('   1. Log into PocketSmith');
    console.error('   2. Go to Settings → Security & Integrations');
    console.error('   3. Create a new developer key');
    console.error('   4. Set it as an environment variable:');
    console.error('      export POCKETSMITH_API_KEY=your_key_here');
    console.error('\n   Or create a .env file:');
    console.error('      cp .env.example .env');
    console.error('      # Edit .env with your API key\n');
    process.exit(1);
  }
  
  console.log('✅ API key found, running integration tests...\n');
}

function runTests() {
  checkApiKey();
  
  const jest = spawn('npx', ['jest', '--testPathPattern=integration', '--verbose'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.dirname(__dirname)
  });
  
  jest.on('close', (code) => {
    process.exit(code);
  });
  
  jest.on('error', (err) => {
    console.error('Failed to start test runner:', err);
    process.exit(1);
  });
}

runTests();
