import Ajv from 'ajv';
import { BigIDMCPServer } from '../src/server';
import { sensitivityConfigsSchema } from '../src/schemas/sensitivityConfigsSchema';

const ajv = new Ajv({ allErrors: true });

describe('Sensitivity Configs Schema Tests', () => {
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
      const result = await server['executeTool']('get_sensitivity_configs', {});
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('success');
      expect(result.data.statusCode).toBe(200);
      expect(result.data.data).toBeDefined();
      expect(Array.isArray(result.data.data.scConfigs)).toBe(true);
      
      // Validate against schema
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
      const isValid = validate(result);
      
      if (!isValid) {
        console.error('Schema validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    }, 20000); // 20 second timeout for test case

    test('should validate response structure with configs', async () => {
      const result = await server['executeTool']('get_sensitivity_configs', { limit: 5 });
      
      if (result.success && result.data.data.scConfigs.length > 0) {
        const firstConfig = result.data.data.scConfigs[0];
        
        // Validate config structure
        expect(firstConfig).toHaveProperty('id');
        expect(firstConfig).toHaveProperty('name');
        expect(firstConfig).toHaveProperty('description');
        expect(firstConfig).toHaveProperty('status');
        expect(firstConfig).toHaveProperty('classifications');
        expect(firstConfig).toHaveProperty('createdAt');
        expect(firstConfig).toHaveProperty('modifiedAt');
        expect(firstConfig).toHaveProperty('actionId');
        expect(firstConfig).toHaveProperty('actionStatus');
        expect(firstConfig).toHaveProperty('lastSuccess');
        expect(firstConfig).toHaveProperty('columnTagging');
        expect(firstConfig).toHaveProperty('dsTagging');
        expect(firstConfig).toHaveProperty('updated_at');
        expect(firstConfig).toHaveProperty('defaultSc');
        expect(firstConfig).toHaveProperty('progress');
        
        // Validate data types
        expect(typeof firstConfig.id).toBe('string');
        expect(typeof firstConfig.name).toBe('string');
        expect(typeof firstConfig.description).toBe('string');
        expect(typeof firstConfig.status).toBe('string');
        expect(Array.isArray(firstConfig.classifications)).toBe(true);
        expect(typeof firstConfig.createdAt).toBe('string');
        expect(typeof firstConfig.modifiedAt).toBe('string');
        expect(typeof firstConfig.actionId).toBe('string');
        expect(typeof firstConfig.actionStatus).toBe('object');
        expect(typeof firstConfig.lastSuccess).toBe('string');
        expect(['boolean', 'object']).toContain(typeof firstConfig.columnTagging);
        expect(['boolean', 'object']).toContain(typeof firstConfig.dsTagging);
        expect(typeof firstConfig.updated_at).toBe('string');
        expect(typeof firstConfig.defaultSc).toBe('boolean');
        expect(typeof firstConfig.progress).toBe('string');
        
        // Validate classifications structure
        if (firstConfig.classifications.length > 0) {
          const firstClassification = firstConfig.classifications[0];
          expect(firstClassification).toHaveProperty('name');
          expect(firstClassification).toHaveProperty('priority');
          expect(firstClassification).toHaveProperty('query');
          expect(firstClassification).toHaveProperty('queryObj');
          expect(firstClassification).toHaveProperty('levelId');
          
          expect(typeof firstClassification.name).toBe('string');
          expect(typeof firstClassification.priority).toBe('number');
          expect(typeof firstClassification.query).toBe('string');
          expect(['object', 'object']).toContain(typeof firstClassification.queryObj);
          expect(typeof firstClassification.levelId).toBe('string');
        }
      }
    }, 20000); // 20 second timeout for test case

    test('should validate total count field', async () => {
      const result = await server['executeTool']('get_sensitivity_configs', {});
      
      expect(result.success).toBe(true);
      expect(result.data.data).toHaveProperty('totalCount');
      expect(typeof result.data.data.totalCount).toBe('number');
      expect(result.data.data.totalCount).toBeGreaterThanOrEqual(0);
    }, 20000); // 20 second timeout for test case

    test('should validate with limit parameter', async () => {
      const result = await server['executeTool']('get_sensitivity_configs', { limit: 3 });
      
      expect(result.success).toBe(true);
      expect(result.data.data.scConfigs.length).toBeLessThanOrEqual(3);
      
      // Validate against schema
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
      const isValid = validate(result);
      
      expect(isValid).toBe(true);
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
      
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
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
      
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
      const isValid = validate(errorResponse);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Schema Structure Validation', () => {
    test('should validate schema has required properties', () => {
      expect(sensitivityConfigsSchema).toHaveProperty('name');
      expect(sensitivityConfigsSchema).toHaveProperty('description');
      expect(sensitivityConfigsSchema).toHaveProperty('inputSchema');
      expect(sensitivityConfigsSchema).toHaveProperty('outputSchema');
      
      expect(sensitivityConfigsSchema.name).toBe('get_sensitivity_configs');
      expect(typeof sensitivityConfigsSchema.description).toBe('string');
      expect(typeof sensitivityConfigsSchema.inputSchema).toBe('object');
      expect(typeof sensitivityConfigsSchema.outputSchema).toBe('object');
    });

    test('should validate output schema structure', () => {
      const outputSchema = sensitivityConfigsSchema.outputSchema;
      
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
      expect(nestedDataSchema.properties).toHaveProperty('scConfigs');
      expect(nestedDataSchema.properties).toHaveProperty('totalCount');
      
      // Validate scConfigs array structure
      const scConfigsSchema = nestedDataSchema.properties.scConfigs;
      expect(scConfigsSchema).toHaveProperty('type', 'array');
      expect(scConfigsSchema).toHaveProperty('items');
      expect(scConfigsSchema.items).toHaveProperty('type', 'object');
    });
  });
}); 