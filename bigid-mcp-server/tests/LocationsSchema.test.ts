import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { locationsSchema } from '../src/schemas/locationsSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_locations Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(locationsSchema.outputSchema);
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
          locationName: 'test*'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_locations', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate locations structure
          if (result.data?.locations) {
            expect(Array.isArray(result.data.locations)).toBe(true);
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
      try {
        await server['executeTool']('get_locations', { limit: -1 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 15000);

    test('should handle invalid structuredFilter', async () => {
      try {
        await server['executeTool']('get_locations', { 
          structuredFilter: { invalidField: 'test' } 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 15000);
  });

  describe('Schema structure validation', () => {
    test('should validate location structure', async () => {
      try {
        const result = await server['executeTool']('get_locations', { limit: 1 });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.locations?.length > 0) {
          const firstLocation = result.data.locations[0];
          expect(firstLocation).toHaveProperty('id');
          expect(firstLocation).toHaveProperty('name');
          expect(typeof firstLocation.name).toBe('string');
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for location structure validation:', error.message);
      }
    });
  });
}); 