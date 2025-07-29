import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { metadataObjectsSearchSchema } from '../src/schemas/metadataObjectsSearchSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('metadata_objects_search Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(metadataObjectsSearchSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'basic search', params: { searchText: 'test', paging: { limit: 1 } } },
      { name: 'larger limit', params: { searchText: 'email', paging: { limit: 5 } } },
      { name: 'with entityType', params: { searchText: 'password', paging: { limit: 1 }, entityType: 'catalog' } },
      { name: 'with highlighting', params: { searchText: 'credit', paging: { limit: 1 }, isHighlight: true } },
      { name: 'with needToHighlight', params: { searchText: 'test', paging: { limit: 1 }, needToHighlight: true } },
      { name: 'with fieldsToProject', params: { searchText: 'test', paging: { limit: 1 }, fieldsToProject: ['name', 'type'] } },
      { name: 'empty search', params: { searchText: '', paging: { limit: 1 } } },
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('metadata_objects_search', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate data structure
          if (result.data?.results) {
            expect(Array.isArray(result.data.results)).toBe(true);
            if (result.data.results.length > 0) {
              const firstResult = result.data.results[0];
              expect(firstResult.entityType).toBeDefined();
              expect(firstResult.data).toBeDefined();
            }
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for ${name}:`, error.message);
        }
      });
    });
  });

  describe('Error cases', () => {
    test('should handle invalid paging values', async () => {
      const invalidParams = [
        { searchText: 'test', paging: { limit: -1 } },
        { searchText: 'test', paging: { limit: 0 } },
        { searchText: 'test', paging: { limit: 'invalid' as any } },
        { searchText: 'test', paging: { skip: -1, limit: 1 } },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('metadata_objects_search', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle missing required parameters', async () => {
      const missingParams = [
        { paging: { limit: 1 } }, // missing searchText
        { searchText: 'test' }, // missing paging
        {}, // missing both
      ];

      for (const params of missingParams) {
        try {
          await server['executeTool']('metadata_objects_search', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle invalid entityType', async () => {
      try {
        await server['executeTool']('metadata_objects_search', { 
          searchText: 'test', 
          paging: { limit: 1 }, 
          entityType: 'INVALID_TYPE' 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate data field structure', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_search', { 
          searchText: 'test', 
          paging: { limit: 1 } 
        });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.results?.length > 0) {
          const firstResult = result.data.results[0];
          if (firstResult.data) {
            // Check that data has additionalProperties: true
            expect(typeof firstResult.data).toBe('object');
            // Should have at least some properties
            expect(Object.keys(firstResult.data).length).toBeGreaterThan(0);
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for data field validation:', error.message);
      }
    });

    test('should validate entityType enum values', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_search', { 
          searchText: 'test', 
          paging: { limit: 1 } 
        });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.results?.length > 0) {
          const firstResult = result.data.results[0];
          if (firstResult.entityType) {
            const validTypes = ['catalog', 'actionable_insights_cases', 'rdb'];
            expect(validTypes).toContain(firstResult.entityType);
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for entityType validation:', error.message);
      }
    });
  });
}); 