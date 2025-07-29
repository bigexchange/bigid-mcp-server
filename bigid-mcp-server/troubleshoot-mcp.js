const { BigIDMCPServer } = require('./dist/server');

async function troubleshootMCP() {
  console.log('=== Troubleshooting MCP Schema Issues ===\n');

  try {
    // Initialize the MCP server
    const server = new BigIDMCPServer();
    await server.initialize(true); // Initialize in testing mode
    
    console.log('✓ MCP Server initialized\n');

    // Test 1: metadata_objects_search
    console.log('1. Testing metadata_objects_search...');
    try {
      const result = await server.executeTool('metadata_objects_search', {
        searchText: 'test',
        paging: { limit: 1 }
      });
      
      console.log('Response structure:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check schema validation
      console.log('\nSchema validation check:');
      console.log('- success field exists:', 'success' in result);
      console.log('- data field exists:', 'data' in result);
      if (result.data) {
        console.log('- data.results exists:', 'results' in result.data);
        console.log('- data.error exists:', 'error' in result.data);
        if (result.data.results && result.data.results.length > 0) {
          const firstResult = result.data.results[0];
          console.log('- first result has entityType:', 'entityType' in firstResult);
          console.log('- first result has data:', 'data' in firstResult);
          if (firstResult.data) {
            console.log('- data.sizeInBytes type:', typeof firstResult.data.sizeInBytes);
            console.log('- data.sizeInBytes value:', firstResult.data.sizeInBytes);
          }
        }
      }
    } catch (error) {
      console.log('metadata_objects_search error:', error.message);
      console.log('Full error:', error);
    }

    console.log('\n2. Testing metadata_full_search...');
    try {
      const result = await server.executeTool('metadata_full_search', {
        text: 'test',
        filter: [],
        sort: [],
        paging: { skip: 0, limit: 1 }
      });
      
      console.log('Response structure:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check schema validation
      console.log('\nSchema validation check:');
      console.log('- success field exists:', 'success' in result);
      console.log('- data field exists:', 'data' in result);
      if (result.data) {
        console.log('- data.results exists:', 'results' in result.data);
        if (result.data.results && result.data.results.length > 0) {
          const firstResult = result.data.results[0];
          console.log('- first result has primary:', 'primary' in firstResult);
          console.log('- first result has assets:', 'assets' in firstResult);
          console.log('- assets type:', typeof firstResult.assets);
          console.log('- assets is array:', Array.isArray(firstResult.assets));
          if (firstResult.assets) {
            console.log('- assets length:', firstResult.assets.length);
            if (firstResult.assets.length > 0) {
              console.log('- first asset structure:', JSON.stringify(firstResult.assets[0], null, 2));
            }
          }
        }
      }
    } catch (error) {
      console.log('metadata_full_search error:', error.message);
      console.log('Full error:', error);
    }

    console.log('\n3. Testing metadata_quick_search...');
    try {
      const result = await server.executeTool('metadata_quick_search', {
        text: 'test',
        top: 1
      });
      
      console.log('Response structure:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check schema validation
      console.log('\nSchema validation check:');
      console.log('- success field exists:', 'success' in result);
      console.log('- data field exists:', 'data' in result);
      if (result.data) {
        console.log('- data.typeResults exists:', 'typeResults' in result.data);
        if (result.data.typeResults && result.data.typeResults.length > 0) {
          const firstTypeResult = result.data.typeResults[0];
          console.log('- first typeResult has results:', 'results' in firstTypeResult);
          if (firstTypeResult.results && firstTypeResult.results.length > 0) {
            const firstResult = firstTypeResult.results[0];
            console.log('- first result has assets:', 'assets' in firstResult);
            console.log('- assets type:', typeof firstResult.assets);
            console.log('- assets is array:', Array.isArray(firstResult.assets));
            if (firstResult.assets) {
              console.log('- assets length:', firstResult.assets.length);
              if (firstResult.assets.length > 0) {
                console.log('- first asset structure:', JSON.stringify(firstResult.assets[0], null, 2));
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('metadata_quick_search error:', error.message);
      console.log('Full error:', error);
    }

    console.log('\n4. Testing get_catalog_objects...');
    try {
      const result = await server.executeTool('get_catalog_objects', {
        limit: 1
      });
      
      console.log('Response structure:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check schema validation
      console.log('\nSchema validation check:');
      console.log('- success field exists:', 'success' in result);
      console.log('- data field exists:', 'data' in result);
      if (result.data) {
        console.log('- data.results exists:', 'results' in result.data);
        if (result.data.results && result.data.results.length > 0) {
          const firstResult = result.data.results[0];
          console.log('- first result has sizeInBytes:', 'sizeInBytes' in firstResult);
          console.log('- sizeInBytes type:', typeof firstResult.sizeInBytes);
          console.log('- sizeInBytes value:', firstResult.sizeInBytes);
        }
      }
    } catch (error) {
      console.log('get_catalog_objects error:', error.message);
      console.log('Full error:', error);
    }

    console.log('\n5. Testing metadata_objects_count...');
    try {
      const result = await server.executeTool('metadata_objects_count', {
        searchText: 'test'
      });
      
      console.log('Response structure:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check schema validation
      console.log('\nSchema validation check:');
      console.log('- success field exists:', 'success' in result);
      console.log('- data field exists:', 'data' in result);
      console.log('- error field exists:', 'error' in result);
      if (result.data) {
        console.log('- data.count exists:', 'count' in result.data);
        console.log('- data.error exists:', 'error' in result.data);
      }
    } catch (error) {
      console.log('metadata_objects_count error:', error.message);
      console.log('Full error:', error);
    }

    await server.cleanup();
    console.log('\n✓ Cleanup completed');

  } catch (error) {
    console.error('Troubleshooting failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the troubleshooting
troubleshootMCP().catch(console.error); 