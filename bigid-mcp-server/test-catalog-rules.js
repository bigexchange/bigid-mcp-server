const { BigIDMCPServer } = require('./dist/server');

async function testCatalogRules() {
  const server = new BigIDMCPServer();
  await server.initialize(true); // testingMode = true

  console.log('Testing get_catalog_rules...');
  
  try {
    const result = await server['executeTool']('get_catalog_rules', {});
    console.log('Catalog Rules Response:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing catalog rules:', error);
  }
}

testCatalogRules(); 