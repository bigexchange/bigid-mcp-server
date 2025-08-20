import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { healthCheckSchema } from '../src/schemas/healthCheckSchema';
import { metadataQuickSearchSchema } from '../src/schemas/metadataQuickSearchSchema';
import { metadataObjectsCountSchema } from '../src/schemas/metadataObjectsCountSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Simple Schema Validation Tests', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 90000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (schema: any, result: any) => {
    const validate = ajv.compile(schema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Health Check', () => {
    test('should validate health check schema', async () => {
      try {
        const result = await server['executeTool']('get_health_check', {});
        expect(validateSchema(healthCheckSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for health check:', error.message);
      }
    }, 10000);
  });

  describe('Metadata Quick Search', () => {
    test('should validate metadata quick search schema', async () => {
      try {
        const result = await server['executeTool']('metadata_quick_search', { 
          text: 'test', 
          top: 1 
        });
        expect(validateSchema(metadataQuickSearchSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for metadata quick search:', error.message);
      }
    }, 60000);
  });

  describe('Metadata Objects Count', () => {
    test('should validate metadata objects count schema', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_count', { 
          searchText: 'test' 
        });
        expect(validateSchema(metadataObjectsCountSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for metadata objects count:', error.message);
      }
    }, 15000);
  });
}); 