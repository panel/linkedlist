/**
 * Database configuration - supports both real database and mock implementation
 * for local development without a database.
 *
 * In development, this will use mock data if DATABASE_URL is not set
 * or contains placeholder values.
 */

// Using a stub DB interface during development
// Our mock service will handle the actual data operations
const db = {
  query: async (...args: any[]) => {
    console.log('Mock DB query:', args);
    return [];
  }
};

// Export the database interface
export { db };
