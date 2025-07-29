import { BigIDMCPServer } from '../src/server';

describe('Catalog Count Debug', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    if (server) {
      await server.cleanup();
    }
  });

  test('should debug catalog count response structure', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {}
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Full catalog count response:', JSON.stringify(result, null, 2));

      // Check the count structure specifically
      if (result.data?.data?.count !== undefined) {
        console.log('Count value:', result.data.data.count);
        console.log('Count type:', typeof result.data.data.count);
        console.log('Count is number?', typeof result.data.data.count === 'number');
        console.log('Count is string?', typeof result.data.data.count === 'string');
      }

      // Check if there are any unexpected fields
      if (result.data?.data) {
        console.log('All data fields:', Object.keys(result.data.data));
        for (const [key, value] of Object.entries(result.data.data)) {
          console.log(`Field ${key}:`, value, `(type: ${typeof value})`);
        }
      }

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with explicit empty filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          filter: '' // Explicit empty filter
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with explicit empty filter:', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with null filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          filter: null // Explicit null filter
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with null filter:', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with wildcard filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          filter: '*' // Wildcard filter to get everything
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with wildcard filter:', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with specific source filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          filter: 'source:Confluence' // Filter by specific source
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with Confluence filter:', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with structured filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: {
            entityType: 'file'
          }
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with structured filter (entityType: file):', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);

  test('should debug catalog count with empty structured filter', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: {}
        }
      });

      if (response.error) {
        console.error('Error response:', response.error);
        return;
      }

      const content = response.result?.content;
      if (!content) {
        console.error('No content in response');
        return;
      }

      const result = JSON.parse(content);
      console.log('Catalog count with empty structured filter:', JSON.stringify(result, null, 2));

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);
}); 