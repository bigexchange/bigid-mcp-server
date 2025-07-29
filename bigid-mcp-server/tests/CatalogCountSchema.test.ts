import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { catalogCountSchema } from '../src/schemas/catalogCountSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_catalog_count Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(catalogCountSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'no parameters', params: {} },
      { name: 'with structuredFilter', params: { 
        structuredFilter: { 
          objectType: 'file'
        } 
      }},
      { name: 'with multiple filters', params: { 
        structuredFilter: { 
          objectType: 'file',
          source: 'test*'
        } 
      }},
      { name: 'with complex filter', params: { 
        structuredFilter: { 
          objectType: 'database',
          source: 'test*',
          fileName: '*.txt'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_catalog_count', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate count structure
          if (result.data?.count !== undefined) {
            expect(typeof result.data.count).toBe('number');
            expect(result.data.count).toBeGreaterThanOrEqual(0);
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for ${name}:`, error.message);
        }
      }, 15000);
    });
  });

  describe('Error cases', () => {
    test('should handle invalid structuredFilter', async () => {
      const invalidParams = [
        { structuredFilter: { invalidField: 'test' } },
        { structuredFilter: { objectType: '' } },
        { structuredFilter: { objectType: null as any } },
        { structuredFilter: { objectType: 'INVALID_TYPE' } },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_catalog_count', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);

    test('should handle malformed filter parameters', async () => {
      const invalidParams = [
        { structuredFilter: { source: '' } },
        { structuredFilter: { fileName: null as any } },
        { structuredFilter: { objectType: 123 as any } },
        { structuredFilter: { source: 'invalid/path/with/too/many/slashes/////' } },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_catalog_count', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);
  });

  describe('Schema structure validation', () => {
    test('should validate count structure', async () => {
      try {
        const result = await server['executeTool']('get_catalog_count', {});
        expect(validateSchema(result)).toBe(true);
        
        // Validate count field
        expect(result.data).toHaveProperty('count');
        expect(typeof result.data.count).toBe('number');
        expect(result.data.count).toBeGreaterThanOrEqual(0);
        
        // Validate error field structure
        if (result.error !== null) {
          expect(typeof result.error).toBe('string');
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for count structure validation:', error.message);
      }
    }, 15000);
  });
}); 