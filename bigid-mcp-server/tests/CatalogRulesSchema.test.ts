import Ajv from 'ajv';
import { BigIDMCPServer } from '../src/server';
import { catalogRulesSchema } from '../src/schemas/catalogRulesSchema';

const ajv = new Ajv({ allErrors: true });

describe('Catalog Rules Schema Tests', () => {
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
      const result = await server['executeTool']('get_catalog_rules', {});
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.rules)).toBe(true);
      
      // Validate against schema
      const validate = ajv.compile(catalogRulesSchema.outputSchema);
      const isValid = validate(result);
      
      if (!isValid) {
        console.error('Schema validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    }, 20000); // 20 second timeout for test case

    test('should validate response structure with rules', async () => {
      const result = await server['executeTool']('get_catalog_rules', {});
      
      if (result.success && result.data.rules.length > 0) {
        const firstRule = result.data.rules[0];
        
        // Validate rule structure
        expect(firstRule).toHaveProperty('id');
        expect(firstRule).toHaveProperty('name');
        expect(firstRule).toHaveProperty('type');
        expect(firstRule).toHaveProperty('description');
        expect(firstRule).toHaveProperty('isEnabled');
        expect(firstRule).toHaveProperty('isPredefined');
        expect(firstRule).toHaveProperty('action');
        expect(firstRule).toHaveProperty('bigidQuery');
        expect(firstRule).toHaveProperty('bigidQueryObject');
        expect(firstRule).toHaveProperty('createdAt');
        expect(firstRule).toHaveProperty('updatedAt');
        expect(firstRule).toHaveProperty('attributeFriendlyName');
        
        // Validate data types
        expect(typeof firstRule.id).toBe('string');
        expect(typeof firstRule.name).toBe('string');
        expect(typeof firstRule.type).toBe('string');
        expect(typeof firstRule.description).toBe('string');
        expect(typeof firstRule.isEnabled).toBe('boolean');
        expect(typeof firstRule.isPredefined).toBe('boolean');
        expect(typeof firstRule.action).toBe('object');
        expect(typeof firstRule.bigidQuery).toBe('string');
        expect(typeof firstRule.bigidQueryObject).toBe('object');
        expect(typeof firstRule.createdAt).toBe('string');
        expect(typeof firstRule.updatedAt).toBe('string');
        expect(typeof firstRule.attributeFriendlyName).toBe('string');
      }
    }, 20000); // 20 second timeout for test case

    test('should validate total count field', async () => {
      const result = await server['executeTool']('get_catalog_rules', {});
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('total');
      expect(typeof result.data.total).toBe('number');
      expect(result.data.total).toBeGreaterThanOrEqual(0);
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
      
      const validate = ajv.compile(catalogRulesSchema.outputSchema);
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
      
      const validate = ajv.compile(catalogRulesSchema.outputSchema);
      const isValid = validate(errorResponse);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Schema Structure Validation', () => {
    test('should validate schema has required properties', () => {
      expect(catalogRulesSchema).toHaveProperty('name');
      expect(catalogRulesSchema).toHaveProperty('description');
      expect(catalogRulesSchema).toHaveProperty('inputSchema');
      expect(catalogRulesSchema).toHaveProperty('outputSchema');
      
      expect(catalogRulesSchema.name).toBe('get_catalog_rules');
      expect(typeof catalogRulesSchema.description).toBe('string');
      expect(typeof catalogRulesSchema.inputSchema).toBe('object');
      expect(typeof catalogRulesSchema.outputSchema).toBe('object');
    });

    test('should validate output schema structure', () => {
      const outputSchema = catalogRulesSchema.outputSchema;
      
      expect(outputSchema).toHaveProperty('type', 'object');
      expect(outputSchema).toHaveProperty('properties');
      expect(outputSchema.properties).toHaveProperty('success');
      expect(outputSchema.properties).toHaveProperty('data');
      expect(outputSchema.properties).toHaveProperty('error');
      
      // Validate data structure
      expect(outputSchema.properties.data).toHaveProperty('type', 'object');
      expect(outputSchema.properties.data.properties).toHaveProperty('rules');
      expect(outputSchema.properties.data.properties).toHaveProperty('total');
      
      // Validate rules array structure
      const rulesSchema = outputSchema.properties.data.properties.rules;
      expect(rulesSchema).toHaveProperty('type', 'array');
      expect(rulesSchema).toHaveProperty('items');
      expect(rulesSchema.items).toHaveProperty('type', 'object');
    });
  });
}); 