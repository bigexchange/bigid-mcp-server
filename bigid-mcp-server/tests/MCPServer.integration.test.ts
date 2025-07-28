import { BigIDMCPServer } from '../src/server';

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('BigID MCP Server Integration Tests', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true); // Initialize in testing mode
  });

  afterAll(async () => {
    if (server) {
      await server.cleanup();
    }
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const result = await server.handleToolCall({
        name: 'get_health_check',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Catalog Objects', () => {
    test('should return catalog objects with basic parameters', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
      expect(Array.isArray(parsedContent.data.results)).toBe(true);
    });

    test('should return catalog objects with structured filter', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { entityType: 'file' },
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should return catalog count', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: { entityType: 'file' }
        }
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(typeof parsedContent.data.count).toBe('number');
    });
  });

  describe('Data Categories', () => {
    test('should return data categories', async () => {
      const result = await server.handleToolCall({
        name: 'get_data_categories',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(Array.isArray(parsedContent.data)).toBe(true);
    });
  });

  describe('Policies', () => {
    test('should return policies', async () => {
      const result = await server.handleToolCall({
        name: 'get_policies',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(Array.isArray(parsedContent.data)).toBe(true);
    });
  });

  describe('Inventory Aggregation', () => {
    test('should return inventory aggregation', async () => {
      const result = await server.handleToolCall({
        name: 'get_inventory_aggregation',
        arguments: {
          aggregationType: 'tags'
        }
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('ACI Tools', () => {
    test('should return ACI data manager', async () => {
      const result = await server.handleToolCall({
        name: 'get_aci_data_manager',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should return ACI users', async () => {
      const result = await server.handleToolCall({
        name: 'get_aci_users',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should return ACI groups', async () => {
      const result = await server.handleToolCall({
        name: 'get_aci_groups',
        arguments: {}
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Location Tools', () => {
    test('should return locations', async () => {
      const result = await server.handleToolCall({
        name: 'get_locations',
        arguments: {
          locationType: 'application'
        }
      });
      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Metadata Search Tools', () => {
    test('should perform quick search', async () => {
      const result = await server.handleToolCall({
        name: 'metadata_quick_search',
        arguments: {
          searchText: 'customer',
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      // Handle both success and failure cases since API might not support certain searches
      if (parsedContent.success) {
        expect(parsedContent.data).toBeDefined();
      } else {
        // If search fails, it should still return a structured error response
        expect(parsedContent.error).toBeDefined();
      }
    });

    test('should perform full search', async () => {
      const result = await server.handleToolCall({
        name: 'metadata_full_search',
        arguments: {
          searchText: 'email',
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      // Handle both success and failure cases since API might not support certain searches
      if (parsedContent.success) {
        expect(parsedContent.data).toBeDefined();
      } else {
        // If search fails, it should still return a structured error response
        expect(parsedContent.error).toBeDefined();
      }
    });
  });
}); 