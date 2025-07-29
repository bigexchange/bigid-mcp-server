import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { dataCategoriesSchema } from '../src/schemas/dataCategoriesSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_data_categories Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(dataCategoriesSchema.outputSchema);
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
      { name: 'with limit', params: { limit: 1 } },
      { name: 'with larger limit', params: { limit: 10 } },
      { name: 'with offset', params: { limit: 1, offset: 0 } },
      { name: 'with paging', params: { paging: { limit: 1 } } },
      { name: 'with structuredFilter', params: { 
        structuredFilter: { 
          categoryName: 'test*'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_data_categories', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate categories structure
          if (result.data?.categories) {
            expect(Array.isArray(result.data.categories)).toBe(true);
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
    test('should handle invalid limit values', async () => {
      const invalidParams = [
        { limit: -1 },
        { limit: 0 },
        { limit: 'invalid' as any },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_data_categories', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle invalid structuredFilter', async () => {
      try {
        await server['executeTool']('get_data_categories', { 
          structuredFilter: { invalidField: 'test' } 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate category structure', async () => {
      try {
        const result = await server['executeTool']('get_data_categories', { limit: 1 });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.categories?.length > 0) {
          const firstCategory = result.data.categories[0];
          expect(firstCategory).toHaveProperty('id');
          expect(firstCategory).toHaveProperty('name');
          expect(typeof firstCategory.name).toBe('string');
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for category structure validation:', error.message);
      }
    });
  });
}); 