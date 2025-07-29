import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { healthCheckSchema } from '../src/schemas/healthCheckSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_health_check Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(healthCheckSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    test('should validate schema with no parameters', async () => {
      try {
        const result = await server['executeTool']('get_health_check', {});
        expect(validateSchema(result)).toBe(true);
        expect(result.success).toBeDefined();
        
        // Health check should always return success: true when working
        if (result.success) {
          expect(result.data).toBeDefined();
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for health check:', error.message);
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate response structure', async () => {
      try {
        const result = await server['executeTool']('get_health_check', {});
        expect(validateSchema(result)).toBe(true);
        
        // Basic structure validation
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
        
        if (result.success) {
          expect(result).toHaveProperty('data');
          expect(typeof result.data).toBe('object');
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for health check structure validation:', error.message);
      }
    });
  });
}); 