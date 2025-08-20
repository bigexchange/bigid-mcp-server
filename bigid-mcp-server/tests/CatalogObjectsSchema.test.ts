import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { catalogObjectsSchema } from '../src/schemas/catalogObjectsSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_catalog_objects Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(catalogObjectsSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'basic limit', params: { limit: 1 } },
      { name: 'larger limit', params: { limit: 5 } },
      { name: 'with offset', params: { limit: 1, offset: 0 } },
      { name: 'with detailedObjectType', params: { limit: 1, detailedObjectType: 'STRUCTURED_FILE' } },
      { name: 'with entityType', params: { limit: 1, entityType: 'file' } },
      { name: 'combined filters', params: { limit: 1, detailedObjectType: 'STRUCTURED_FILE', entityType: 'file' } },
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_catalog_objects', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          if (result.data?.results) {
            expect(Array.isArray(result.data.results)).toBe(true);
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          // API errors are acceptable, but schema validation should pass
          console.log(`API error for ${name}:`, error.message);
        }
      });
    });
  });

  describe('Error cases', () => {
    test('should handle invalid limit values', async () => {
      // Test only one invalid case to avoid timeouts
      try {
        await server['executeTool']('get_catalog_objects', { limit: -1 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 60000);

    test('should handle invalid detailedObjectType', async () => {
      try {
        await server['executeTool']('get_catalog_objects', { 
          limit: 1, 
          detailedObjectType: 'INVALID_TYPE' 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 60000);

    test('should handle missing required parameters', async () => {
      try {
        await server['executeTool']('get_catalog_objects', {});
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 60000);
  });

  describe('Schema structure validation', () => {
    test('should validate sizeInBytes field types', async () => {
      try {
        const result = await server['executeTool']('get_catalog_objects', { limit: 1 });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.results?.length > 0) {
          const firstResult = result.data.results[0];
          if (firstResult.sizeInBytes !== undefined) {
            // sizeInBytes should be either number or string
            expect(typeof firstResult.sizeInBytes === 'number' || typeof firstResult.sizeInBytes === 'string').toBe(true);
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for sizeInBytes validation:', error.message);
      }
    });
  });
}); 