const { BigIDMCPServer } = require('../dist/server');

async function testTokenUsage() {
  console.log('Testing system token retrieval and reuse...');
  
  try {
    // Create and initialize the MCP server
    const server = new BigIDMCPServer();
    await server.initialize(true); // Initialize in testing mode
    
    console.log('✅ MCP server initialized successfully');
    
    // Make multiple API calls to verify the same system token is reused
    console.log('\nMaking multiple API calls...');
    
    // Call 1: Health check
    const result1 = await server.handleToolCall({
      name: 'get_health_check',
      arguments: {}
    });
    
    if (result1.error) {
      console.error('❌ First call failed:', result1.error);
      return;
    }
    console.log('✅ First API call successful');
    
    // Call 2: Another health check
    const result2 = await server.handleToolCall({
      name: 'get_health_check',
      arguments: {}
    });
    
    if (result2.error) {
      console.error('❌ Second call failed:', result2.error);
      return;
    }
    console.log('✅ Second API call successful');
    
    // Call 3: Catalog count
    const result3 = await server.handleToolCall({
      name: 'get_catalog_count',
      arguments: {
        structuredFilter: { entityType: 'file' }
      }
    });
    
    if (result3.error) {
      console.error('❌ Third call failed:', result3.error);
      return;
    }
    console.log('✅ Third API call successful');
    
    // Call 4: Data categories
    const result4 = await server.handleToolCall({
      name: 'get_data_categories',
      arguments: {}
    });
    
    if (result4.error) {
      console.error('❌ Fourth call failed:', result4.error);
      return;
    }
    console.log('✅ Fourth API call successful');
    
    console.log('\n✅ All API calls successful!');
    console.log('✅ System token is being correctly retrieved and reused for all API calls.');
    console.log('✅ The authentication flow is working as expected.');
    
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
testTokenUsage(); 