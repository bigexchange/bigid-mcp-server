const { ConfigManager } = require('../dist/config/ConfigManager');
const { BigIDAuth } = require('../dist/auth/BigIDAuth');

async function testMCPAuthIntegration() {
  console.log('Testing MCP server authentication integration...');
  
  try {
    // Test configuration loading
    const configManager = new ConfigManager();
    const config = configManager.getBigIDConfig();
    
    console.log('✅ Configuration loaded successfully');
    console.log('Auth type:', config.auth.type);
    console.log('Domain:', config.domain);
    
    // Test authentication setup
    const auth = new BigIDAuth(config);
    
    if (!auth.isConfigured()) {
      console.error('❌ Authentication not properly configured');
      console.log('Please ensure BIGID_USER_TOKEN environment variable is set');
      return;
    }
    
    console.log('✅ Authentication configured correctly');
    
    // Test getting auth header (this will trigger the refresh flow if using user token)
    const authHeader = await auth.getAuthHeader();
    console.log('✅ Successfully obtained auth header');
    
    console.log('✅ MCP server authentication integration test passed!');
    console.log('The MCP server is ready to handle requests with proper authentication.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMCPAuthIntegration(); 