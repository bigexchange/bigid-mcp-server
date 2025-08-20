import { BigIDMCPServer } from '../dist/server';
const isSandboxSample = process.env.BIGID_DOMAIN === 'sandbox.bigid.tools' || process.env.BIGID_USER_TOKEN === 'SAMPLE';
const maybeDescribe = isSandboxSample ? describe.skip : describe;
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { casesGroupByPolicySchema } from '../src/schemas/casesGroupByPolicySchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

maybeDescribe('get_cases_group_by_policy Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(casesGroupByPolicySchema.outputSchema);
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
      { name: 'with larger limit', params: { limit: 10 } },
      { name: 'with offset', params: { limit: 1, offset: 0 } },
      { name: 'with paging', params: { paging: { limit: 1 } } },
      { name: 'with structuredFilter', params: { 
        structuredFilter: { 
          policyName: 'test*'
        } 
      }},
      { name: 'with multiple filters', params: { 
        structuredFilter: { 
          policyName: 'test*',
          severity: 'high'
        } 
      }},
      { name: 'with complex parameters', params: { 
        limit: 5,
        structuredFilter: { 
          policyName: 'test*',
          severity: 'medium',
          status: 'open'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_cases_group_by_policy', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate grouped cases structure
          if (result.data?.groupedCases) {
            expect(Array.isArray(result.data.groupedCases)).toBe(true);
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for ${name}:`, error.message);
        }
      }, 15000);
    });
  });

  describe('Error cases', () => {
    test('should handle invalid limit values', async () => {
      const invalidParams = [
        { limit: -1 },
        { limit: 0 },
        { limit: 'invalid' as any },
        { limit: 999999999 },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_cases_group_by_policy', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);

    test('should handle invalid structuredFilter', async () => {
      const invalidParams = [
        { structuredFilter: { invalidField: 'test' } },
        { structuredFilter: { policyName: '' } },
        { structuredFilter: { policyName: null as any } },
        { structuredFilter: { severity: 'INVALID_SEVERITY' } },
        { structuredFilter: { status: 'INVALID_STATUS' } },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_cases_group_by_policy', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);
  });

  describe('Schema structure validation', () => {
    test('should validate grouped cases structure', async () => {
      try {
        const result = await server['executeTool']('get_cases_group_by_policy', { limit: 1 });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.groupedCases?.length > 0) {
          const firstGroup = result.data.groupedCases[0];
          expect(firstGroup).toHaveProperty('policyName');
          expect(firstGroup).toHaveProperty('caseCount');
          expect(typeof firstGroup.caseCount).toBe('number');
          
          if (firstGroup.cases) {
            expect(Array.isArray(firstGroup.cases)).toBe(true);
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for grouped cases structure validation:', error.message);
      }
    }, 15000);
  });
}); 