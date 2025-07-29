const { BigIDMCPServer } = require('./dist/server');

async function testCatalogTags() {
  const server = new BigIDMCPServer();
  await server.initialize(true); // testingMode = true

  console.log('Testing get_catalog_tags...');
  
  try {
    const result = await server['executeTool']('get_catalog_tags', {});
    console.log('Catalog Tags Response:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing catalog tags:', error);
  }
}

testCatalogTags(); 