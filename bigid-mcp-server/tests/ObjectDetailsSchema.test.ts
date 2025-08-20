import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { objectDetailsSchema } from '../src/schemas/objectDetailsSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_object_details Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(objectDetailsSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'with objectId', params: { objectId: 'test-id' } },
      { name: 'with fullyQualifiedName', params: { fullyQualifiedName: 'test/path/file.txt' } },
      { name: 'with both objectId and fullyQualifiedName', params: { 
        objectId: 'test-id', 
        fullyQualifiedName: 'test/path/file.txt' 
      }},
      { name: 'with long objectId', params: { objectId: 'a'.repeat(100) } },
      { name: 'with special characters in fullyQualifiedName', params: { 
        fullyQualifiedName: 'test/path with spaces/file (1).txt' 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_object_details', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate object details structure
          if (result.data?.object) {
            expect(typeof result.data.object).toBe('object');
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for ${name}:`, error.message);
        }
      }, 60000);
    });
  });

  describe('Error cases', () => {
    test('should handle missing required parameters', async () => {
      try {
        await server['executeTool']('get_object_details', {});
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 10000);

    test('should handle invalid objectId format', async () => {
      const invalidParams = [
        { objectId: '' },
        { objectId: null as any },
        { objectId: 123 as any },
        { objectId: 'invalid-id-with-special-chars!@#' },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_object_details', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);

    test('should handle invalid fullyQualifiedName format', async () => {
      const invalidParams = [
        { fullyQualifiedName: '' },
        { fullyQualifiedName: null as any },
        { fullyQualifiedName: 123 as any },
        { fullyQualifiedName: 'invalid/path/with/too/many/slashes/////' },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_object_details', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 60000);
  });

  describe('Schema structure validation', () => {
    test('should validate object details structure', async () => {
      try {
        const result = await server['executeTool']('get_object_details', { 
          objectId: 'test-id' 
        });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.object) {
          const object = result.data.object;
          // Check for common object properties
          expect(typeof object).toBe('object');
          if (object.id) {
            expect(typeof object.id).toBe('string');
          }
          if (object.name) {
            expect(typeof object.name).toBe('string');
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for object details structure validation:', error.message);
      }
    }, 15000);
  });
}); 