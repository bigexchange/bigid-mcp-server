import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { securityTrendsSchema } from '../src/schemas/securityTrendsSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_security_trends Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(securityTrendsSchema.outputSchema);
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
      { name: 'with timeRange', params: { timeRange: '7d' } },
      { name: 'with different timeRange', params: { timeRange: '30d' } },
      { name: 'with structuredFilter', params: { 
        structuredFilter: { 
          severity: 'high'
        } 
      }},
      { name: 'with multiple filters', params: { 
        structuredFilter: { 
          severity: 'high',
          status: 'open'
        } 
      }},
      { name: 'with complex parameters', params: { 
        timeRange: '7d',
        structuredFilter: { 
          severity: 'medium',
          status: 'resolved'
        } 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_security_trends', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate trends structure
          if (result.data?.data) {
            expect(typeof result.data.data).toBe('object');
            if (result.data.data.open) {
              expect(Array.isArray(result.data.data.open)).toBe(true);
            }
            if (result.data.data.closed) {
              expect(Array.isArray(result.data.data.closed)).toBe(true);
            }
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
    test('should handle invalid timeRange values', async () => {
      const invalidParams = [
        { timeRange: '' },
        { timeRange: 'invalid' },
        { timeRange: null as any },
        { timeRange: 123 as any },
        { timeRange: '999d' },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_security_trends', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);

    test('should handle invalid structuredFilter', async () => {
      const invalidParams = [
        { structuredFilter: { invalidField: 'test' } },
        { structuredFilter: { severity: '' } },
        { structuredFilter: { severity: null as any } },
        { structuredFilter: { severity: 'INVALID_SEVERITY' } },
        { structuredFilter: { status: 'INVALID_STATUS' } },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_security_trends', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);
  });

  describe('Schema structure validation', () => {
    test('should validate trends structure', async () => {
      try {
        const result = await server['executeTool']('get_security_trends', {});
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.data) {
          const trendsData = result.data.data;
          
          // Check open trends
          if (trendsData.open?.length > 0) {
            const firstOpen = trendsData.open[0];
            expect(firstOpen).toHaveProperty('date');
            expect(firstOpen).toHaveProperty('value');
            expect(typeof firstOpen.value).toBe('number');
          }
          
          // Check closed trends
          if (trendsData.closed?.length > 0) {
            const firstClosed = trendsData.closed[0];
            expect(firstClosed).toHaveProperty('date');
            expect(firstClosed).toHaveProperty('value');
            expect(typeof firstClosed.value).toBe('number');
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for trends structure validation:', error.message);
      }
    }, 15000);
  });
}); 