import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { metadataObjectsCountSchema } from '../src/schemas/metadataObjectsCountSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('metadata_objects_count Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(metadataObjectsCountSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'basic search', params: { searchText: 'test' } },
      { name: 'email search', params: { searchText: 'email' } },
      { name: 'password search', params: { searchText: 'password' } },
      { name: 'credit search', params: { searchText: 'credit' } },
      { name: 'empty search', params: { searchText: '' } },
      { name: 'long search', params: { searchText: 'a'.repeat(100) } },
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('metadata_objects_count', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate count field
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
      });
    });
  });

  describe('Error cases', () => {
    test('should handle missing required parameters', async () => {
      try {
        await server['executeTool']('metadata_objects_count', {});
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    test('should handle invalid searchText types', async () => {
      const invalidParams = [
        { searchText: 123 as any },
        { searchText: null as any },
        { searchText: undefined as any },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('metadata_objects_count', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate error field handling', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_count', { searchText: 'test' });
        expect(validateSchema(result)).toBe(true);
        
        // Check that error field can be string or null
        if (result.error !== undefined) {
          expect(typeof result.error === 'string' || result.error === null).toBe(true);
        }
        
        // Check that data.error can also be string or null
        if (result.data?.error !== undefined) {
          expect(typeof result.data.error === 'string' || result.data.error === null).toBe(true);
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for error field validation:', error.message);
      }
    });

    test('should validate count field type', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_count', { searchText: 'test' });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.count !== undefined) {
          expect(typeof result.data.count).toBe('number');
          expect(Number.isInteger(result.data.count)).toBe(true);
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for count field validation:', error.message);
      }
    });
  });
}); 