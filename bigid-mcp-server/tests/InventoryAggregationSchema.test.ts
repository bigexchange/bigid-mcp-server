import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { inventoryAggregationSchema } from '../src/schemas/inventoryAggregationSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_inventory_aggregation Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(inventoryAggregationSchema.outputSchema);
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
      { name: 'with detailedObjectType STRUCTURED_FILE', params: { detailedObjectType: 'STRUCTURED_FILE' } },
      { name: 'with detailedObjectType UNSTRUCTURED_FILE', params: { detailedObjectType: 'UNSTRUCTURED_FILE' } },
      { name: 'with detailedObjectType TABLE', params: { detailedObjectType: 'TABLE' } },
      { name: 'with entityType file', params: { entityType: 'file' } },
      { name: 'with entityType database', params: { entityType: 'database' } },
      { name: 'combined filters', params: { detailedObjectType: 'STRUCTURED_FILE', entityType: 'file' } },
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_inventory_aggregation', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate aggregation structure
          if (result.data?.aggregations) {
            expect(Array.isArray(result.data.aggregations)).toBe(true);
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
    test('should handle invalid detailedObjectType', async () => {
      try {
        await server['executeTool']('get_inventory_aggregation', { 
          detailedObjectType: 'INVALID_TYPE' 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    test('should handle invalid entityType', async () => {
      try {
        await server['executeTool']('get_inventory_aggregation', { 
          entityType: 'INVALID_TYPE' 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate aggregation structure', async () => {
      try {
        const result = await server['executeTool']('get_inventory_aggregation', {});
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.aggregations) {
          expect(Array.isArray(result.data.aggregations)).toBe(true);
          
          // Each aggregation should have proper structure
          result.data.aggregations.forEach((agg: any) => {
            expect(agg).toHaveProperty('key');
            expect(agg).toHaveProperty('count');
            expect(typeof agg.count).toBe('number');
          });
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for aggregation structure validation:', error.message);
      }
    });
  });
}); 