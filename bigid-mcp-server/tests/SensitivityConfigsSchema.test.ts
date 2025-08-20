import Ajv from 'ajv';
import { BigIDMCPServer } from '../src/server';
import { sensitivityConfigsSchema } from '../src/schemas/sensitivityConfigsSchema';

const ajv = new Ajv({ allErrors: true });
const isSandboxSample = process.env.BIGID_DOMAIN === 'sandbox.bigid.tools' || process.env.BIGID_USER_TOKEN === 'SAMPLE';
const maybeDescribe = isSandboxSample ? describe.skip : describe;

maybeDescribe('Sensitivity Configs Schema Tests', () => {
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
        expect(typeof firstConfig.id).toBe('string');
      }
    }, 20000);

    test('should validate total count field', async () => {
      const result = await server['executeTool']('get_sensitivity_configs', {});
      expect(result.success).toBe(true);
      expect(result.data.data).toHaveProperty('totalCount');
      expect(typeof result.data.data.totalCount).toBe('number');
      expect(result.data.data.totalCount).toBeGreaterThanOrEqual(0);
    }, 20000);

    test('should validate with limit parameter', async () => {
      const result = await server['executeTool']('get_sensitivity_configs', { limit: 3 });
      expect(result.success).toBe(true);
      expect(result.data.data.scConfigs.length).toBeLessThanOrEqual(3);
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
      const isValid = validate(result);
      expect(isValid).toBe(true);
    }, 20000);
  });

  describe('Error Cases', () => {
    test('should handle API errors gracefully', async () => {
      const errorResponse = { success: false, error: 'API error message' };
      const validate = ajv.compile(sensitivityConfigsSchema.outputSchema);
      const isValid = validate(errorResponse);
      expect(isValid).toBe(true);
    });

    test('should validate error object structure', async () => {
      const errorResponse = { success: false, error: { code: 'API_ERROR', message: 'Something went wrong', retryable: true } };
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
    });
  });
}); 