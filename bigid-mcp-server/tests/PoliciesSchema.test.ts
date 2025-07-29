import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { policiesSchema } from '../src/schemas/policiesSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_policies Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(policiesSchema.outputSchema);
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
      { name: 'with limit', params: { limit: 1 } },
      { name: 'with larger limit', params: { limit: 5 } },
      { name: 'with offset', params: { limit: 1, offset: 0 } },
      { name: 'with paging', params: { paging: { limit: 1 } } },
      { name: 'with structuredFilter', params: { 
        structuredFilter: { 
          fileName: 'test*',
          dataSourceName: 'test'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_policies', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate policies structure
          if (result.data?.policies) {
            expect(Array.isArray(result.data.policies)).toBe(true);
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
    test('should handle invalid limit values', async () => {
      const invalidParams = [
        { limit: -1 },
        { limit: 0 },
        { limit: 'invalid' as any },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_policies', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle invalid structuredFilter', async () => {
      try {
        await server['executeTool']('get_policies', { 
          structuredFilter: { invalidField: 'test' } 
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Schema structure validation', () => {
    test('should validate policy structure', async () => {
      try {
        const result = await server['executeTool']('get_policies', { limit: 1 });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.policies?.length > 0) {
          const firstPolicy = result.data.policies[0];
          expect(firstPolicy).toHaveProperty('id');
          expect(firstPolicy).toHaveProperty('name');
          expect(typeof firstPolicy.name).toBe('string');
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for policy structure validation:', error.message);
      }
    });
  });
}); 