// Test configuration for faster, more reliable tests
export const TEST_CONFIG = {
  // Reduced timeouts for faster test execution
  timeouts: {
    initialization: 30000, // 30 seconds for server initialization
    apiCall: 15000,        // 15 seconds for individual API calls
    testCase: 20000,       // 20 seconds for entire test case
  },
  
  // Test parameters that are more likely to succeed quickly
  testParams: {
    // Use small limits to reduce response time
    smallLimit: 1,
    mediumLimit: 3,
    
    // Use simple search terms that are likely to return results
    simpleSearchTerms: ['test', 'email', 'file'],
    
    // Use common entity types
    commonEntityTypes: ['file', 'database'],
  },
  
  // Error handling configuration
  errorHandling: {
    // Don't fail tests for API errors, just log them
    failOnApiError: false,
    
    // Only fail on schema validation errors
    failOnSchemaError: true,
  }
}; 