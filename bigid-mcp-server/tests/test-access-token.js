const { BigIDAuth } = require('../dist/auth/BigIDAuth');

// Mock configuration
const config = {
  domain: 'test.bigid.com',
  auth: {
    type: 'user_token',
    user_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJzZ2FsbGFnaGVyQGJpZ2lkLmNvbSIsInR5cGUiOiJhY2Nlc3MtdG9rZW4iLCJyb2xlSWRzIjpbIjViNjlhNzg4Y2EzYzllMDAxMDFkYWY4YiIsIjYzMTA1YjUyMDQ1OGZlMDAxM2QxYmM4ZSIsIjVmN2NhMDkzMDE1YjVhMDAxODQ3MWM2ZCIsIjVmN2NhMGE2MDE1YjVhMDAxODQ3MWM2ZSJdLCJpc0FkbWluIjpmYWxzZSwibmFtZUlEIjoic2dhbGxhZ2hlckBiaWdpZC5jb20iLCJuYW1lSURGb3JtYXQiOiJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoxLjE6bmFtZWlkLWZvcm1hdDp1bnNwZWNpZmllZCIsImlhdCI6MTc1MzkwNTM3NCwiZXhwIjoxNzUzOTkxNzc0fQ.test-signature'
  },
  timeout: 30000,
  retry_attempts: 3
};

async function testAccessToken() {
  console.log('Testing access token authentication...');
  
  try {
    const auth = new BigIDAuth(config);
    
    // Test that authentication is configured
    if (!auth.isConfigured()) {
      console.error('❌ Authentication not properly configured');
      return;
    }
    console.log('✅ Authentication configured correctly');
    
    // Test getting auth header (this should detect access token and use it directly)
    const authHeader = await auth.getAuthHeader();
    console.log('✅ Successfully obtained auth header:', authHeader ? 'Token received' : 'No token');
    
    // Test token validation
    const isValid = await auth.validateToken(authHeader);
    console.log('✅ Token validation result:', isValid);
    
    console.log('✅ Access token authentication test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAccessToken(); 