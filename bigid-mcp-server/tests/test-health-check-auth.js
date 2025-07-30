const { BigIDMCPServer } = require('../dist/server');

async function testHealthCheckWithAuth() {
  console.log('Testing authentication flow with health check tool...');
  
  try {
    // Create and initialize the MCP server
    const server = new BigIDMCPServer();
    await server.initialize(true); // Initialize in testing mode
    
    console.log('✅ MCP server initialized successfully');
    
    // Call the health check tool
    const result = await server.handleToolCall({
      name: 'get_health_check',
      arguments: {}
    });
    
    console.log('✅ Health check tool called successfully');
    
    if (result.error) {
      console.error('❌ Health check failed:', result.error);
      return;
    }
    
    if (result.result && result.result.content) {
      const healthData = JSON.parse(result.result.content);
      console.log('✅ Health check response:');
      console.log('  Success:', healthData.success);
      console.log('  Data:', healthData.data ? 'Available' : 'Not available');
      
      if (healthData.success) {
        console.log('✅ Authentication flow is working correctly!');
        console.log('✅ The MCP server can successfully authenticate and make API calls.');
      } else {
        console.log('❌ Health check returned success: false');
      }
    } else {
      console.log('❌ No content in health check response');
    }
    
    // Cleanup
    await server.cleanup();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testHealthCheckWithAuth(); 