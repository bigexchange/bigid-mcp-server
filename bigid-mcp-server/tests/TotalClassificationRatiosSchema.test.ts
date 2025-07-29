import Ajv from 'ajv';
import { BigIDMCPServer } from '../src/server';
import { totalClassificationRatiosSchema } from '../src/schemas/totalClassificationRatiosSchema';

const ajv = new Ajv({ allErrors: true });

describe('Total Classification Ratios Schema Tests', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true); // testingMode = true
  }, 30000); // 30 second timeout for initialization

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Valid Parameters', () => {
    test('should validate response with empty parameters', async () => {
      const result = await server['executeTool']('get_total_classification_ratios', {});
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('success');
      expect(result.data.statusCode).toBe(200);
      expect(result.data.data).toBeDefined();
      expect(result.data.data).toHaveProperty('classifiedItemsAmount');
      expect(result.data.data).toHaveProperty('unclassifiedItemsAmount');
      
      // Validate against schema
      const validate = ajv.compile(totalClassificationRatiosSchema.outputSchema);
      const isValid = validate(result);
      
      if (!isValid) {
        console.error('Schema validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    }, 20000); // 20 second timeout for test case

    test('should validate response structure with ratios', async () => {
      const result = await server['executeTool']('get_total_classification_ratios', {});
      
      if (result.success) {
        const data = result.data.data;
        
        // Validate ratio structure
        expect(data).toHaveProperty('classifiedItemsAmount');
        expect(data).toHaveProperty('unclassifiedItemsAmount');
        
        // Validate data types
        expect(typeof data.classifiedItemsAmount).toBe('number');
        expect(typeof data.unclassifiedItemsAmount).toBe('number');
        expect(data.classifiedItemsAmount).toBeGreaterThanOrEqual(0);
        expect(data.unclassifiedItemsAmount).toBeGreaterThanOrEqual(0);
        
        // Validate message field
        expect(result.data).toHaveProperty('message');
        expect(['string', 'object']).toContain(typeof result.data.message);
      }
    }, 20000); // 20 second timeout for test case

    test('should validate status and statusCode fields', async () => {
      const result = await server['executeTool']('get_total_classification_ratios', {});
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('statusCode');
      expect(typeof result.data.status).toBe('string');
      expect(typeof result.data.statusCode).toBe('number');
      expect(result.data.statusCode).toBe(200);
    }, 20000); // 20 second timeout for test case
  });

  describe('Error Cases', () => {
    test('should handle API errors gracefully', async () => {
      // This test would need to be adjusted based on actual error scenarios
      // For now, we'll just ensure the schema can handle error responses
      const errorResponse = {
        success: false,
        error: "API error message"
      };
      
      const validate = ajv.compile(totalClassificationRatiosSchema.outputSchema);
      const isValid = validate(errorResponse);
      
      expect(isValid).toBe(true);
    });

    test('should validate error object structure', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: "API_ERROR",
          message: "Something went wrong",
          retryable: true
        }
      };
      
      const validate = ajv.compile(totalClassificationRatiosSchema.outputSchema);
      const isValid = validate(errorResponse);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Schema Structure Validation', () => {
    test('should validate schema has required properties', () => {
      expect(totalClassificationRatiosSchema).toHaveProperty('name');
      expect(totalClassificationRatiosSchema).toHaveProperty('description');
      expect(totalClassificationRatiosSchema).toHaveProperty('inputSchema');
      expect(totalClassificationRatiosSchema).toHaveProperty('outputSchema');
      
      expect(totalClassificationRatiosSchema.name).toBe('get_total_classification_ratios');
      expect(typeof totalClassificationRatiosSchema.description).toBe('string');
      expect(typeof totalClassificationRatiosSchema.inputSchema).toBe('object');
      expect(typeof totalClassificationRatiosSchema.outputSchema).toBe('object');
    });

    test('should validate output schema structure', () => {
      const outputSchema = totalClassificationRatiosSchema.outputSchema;
      
      expect(outputSchema).toHaveProperty('type', 'object');
      expect(outputSchema).toHaveProperty('properties');
      expect(outputSchema.properties).toHaveProperty('success');
      expect(outputSchema.properties).toHaveProperty('data');
      expect(outputSchema.properties).toHaveProperty('error');
      
      // Validate data structure
      expect(outputSchema.properties.data).toHaveProperty('type', 'object');
      expect(outputSchema.properties.data.properties).toHaveProperty('status');
      expect(outputSchema.properties.data.properties).toHaveProperty('statusCode');
      expect(outputSchema.properties.data.properties).toHaveProperty('data');
      expect(outputSchema.properties.data.properties).toHaveProperty('message');
      
      // Validate nested data structure
      const nestedDataSchema = outputSchema.properties.data.properties.data;
      expect(nestedDataSchema).toHaveProperty('type', 'object');
      expect(nestedDataSchema.properties).toHaveProperty('classifiedItemsAmount');
      expect(nestedDataSchema.properties).toHaveProperty('unclassifiedItemsAmount');
    });
  });
}); 