// Test setup file
// This file runs before each test

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods for cleaner test output if needed
// jest.spyOn(console, 'log').mockImplementation(() => {});
// jest.spyOn(console, 'warn').mockImplementation(() => {});
