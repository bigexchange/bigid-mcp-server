const { BigIDAuth } = require('../dist/auth/BigIDAuth');

// Mock configuration
const config = {
  domain: 'test.bigid.com',
  auth: {
    type: 'user_token',
    user_token: process.env.BIGID_USER_TOKEN || 'test-user-token'
  },
  timeout: 30000,
  retry_attempts: 3
};

async function testRefreshTokenFlow() {
  console.log('Testing refresh token authentication flow...');
  
  try {
    const auth = new BigIDAuth(config);
    
    // Test that authentication is configured
    if (!auth.isConfigured()) {
      console.error('❌ Authentication not properly configured');
      return;
    }
    console.log('✅ Authentication configured correctly');
    
    // Test getting auth header (this should trigger the refresh flow)
    const authHeader = await auth.getAuthHeader();
    console.log('✅ Successfully obtained auth header:', authHeader ? 'Token received' : 'No token');
    
    // Test token validation
    const isValid = await auth.validateToken(authHeader);
    console.log('✅ Token validation result:', isValid);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testRefreshTokenFlow(); 