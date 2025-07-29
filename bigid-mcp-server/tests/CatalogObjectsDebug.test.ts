import { BigIDMCPServer } from '../src/server';

describe('Catalog Objects Debug', () => {
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

  test('should debug catalog objects response structure', async () => {
    try {
      const response = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          limit: 5,
          requireTotalCount: true
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
      console.log('Catalog objects response:', JSON.stringify(result, null, 2));

      // Check the total count
      if (result.data?.data?.totalCount !== undefined) {
        console.log('Total count from objects:', result.data.data.totalCount);
        console.log('Total count type:', typeof result.data.data.totalCount);
      }

      // Check how many results we got
      if (result.data?.data?.results) {
        console.log('Number of results returned:', result.data.data.results.length);
      }

    } catch (error: any) {
      console.error('Test error:', error.message);
    }
  }, 30000);
}); 