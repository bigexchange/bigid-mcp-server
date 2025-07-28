import { BigIDMCPServer } from '../src/server';
import { FilterConverter } from '../src/utils/FilterConverter';
import { StructuredFilter } from '../src/types/filterTypes';

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Structured Filter Validation Tests', () => {
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

  describe('Basic Entity Type Filters', () => {
    test('should filter files only', async () => {
      const filter: StructuredFilter = { entityType: 'file' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter databases only', async () => {
      const filter: StructuredFilter = { entityType: 'database' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter tables only', async () => {
      const filter: StructuredFilter = { entityType: 'table' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('File Name Patterns', () => {
    test('should filter text files', async () => {
      const filter: StructuredFilter = { fileName: '*.txt' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter CSV files', async () => {
      const filter: StructuredFilter = { fileName: '*.csv' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter JSON files', async () => {
      const filter: StructuredFilter = { fileName: '*.json' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Object Name Patterns', () => {
    test('should filter objects starting with "user"', async () => {
      const filter: StructuredFilter = { objectName: 'user*' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter objects containing "password"', async () => {
      const filter: StructuredFilter = { objectName: '*password*' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('System Filters', () => {
    test('should filter database system', async () => {
      const filter: StructuredFilter = { system: 'database' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter file system', async () => {
      const filter: StructuredFilter = { system: 'file' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Database Specific Filters', () => {
    test('should filter public schema', async () => {
      const filter: StructuredFilter = { schemaName: 'public' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter users table', async () => {
      const filter: StructuredFilter = { tableName: 'users' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter email columns', async () => {
      const filter: StructuredFilter = { columnName: 'email' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Data Type Filters', () => {
    test('should filter string data type', async () => {
      const filter: StructuredFilter = { dataType: 'string' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter integer data type', async () => {
      const filter: StructuredFilter = { dataType: 'integer' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Status Filters', () => {
    test('should filter active status', async () => {
      const filter: StructuredFilter = { status: 'Active' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Access Level Filters', () => {
    test('should filter public access', async () => {
      const filter: StructuredFilter = { accessLevel: 'Public' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter private access', async () => {
      const filter: StructuredFilter = { accessLevel: 'Private' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Scanner Type Filters', () => {
    test('should filter regex scanner', async () => {
      const filter: StructuredFilter = { scannerType: 'regex' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter ML scanner', async () => {
      const filter: StructuredFilter = { scannerType: 'ml' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Encryption Filters', () => {
    test('should filter encrypted files', async () => {
      const filter: StructuredFilter = { isEncrypted: true };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter unencrypted files', async () => {
      const filter: StructuredFilter = { isEncrypted: false };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Score Filters', () => {
    test('should filter risk score 5', async () => {
      const filter: StructuredFilter = { 
        riskScore: { operator: 'equal', value: 5 } 
      };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });

    test('should filter quality score 8', async () => {
      const filter: StructuredFilter = { 
        dataQualityScore: { operator: 'equal', value: 8 } 
      };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Owner Filters', () => {
    test('should filter admin owned files', async () => {
      const filter: StructuredFilter = { fileOwner: 'admin' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Object Type Filters', () => {
    test('should filter detailed object type table', async () => {
      const filter: StructuredFilter = { detailedObjectType: 'table' };
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 5
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });

  describe('Catalog Count Tests', () => {
    test('should count files', async () => {
      const filter: StructuredFilter = { entityType: 'file' };
      const result = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: filter
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(typeof parsedContent.data.count).toBe('number');
    });

    test('should count tables', async () => {
      const filter: StructuredFilter = { entityType: 'table' };
      const result = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: filter
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(typeof parsedContent.data.count).toBe('number');
    });

    test('should count text files', async () => {
      const filter: StructuredFilter = { fileName: '*.txt' };
      const result = await server.handleToolCall({
        name: 'get_catalog_count',
        arguments: {
          structuredFilter: filter
        }
      });
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(typeof parsedContent.data.count).toBe('number');
    });
  });

  describe('Complex Filter Tests', () => {
    test('should handle complex filter with multiple parameters', async () => {
      const filter: StructuredFilter = {
        entityType: 'file',
        fileName: '*.csv',
        containsPI: true,
        tags: { tagHierarchy: 'system.risk.riskGroup', value: 'high' }
      };

      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter,
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      const parsedContent = JSON.parse(result.result!.content);
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
    });
  });
}); 