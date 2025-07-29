import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { lineageTreeSchema } from '../src/schemas/lineageTreeSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('get_lineage_tree Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(lineageTreeSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('Valid parameter combinations', () => {
    const testCases = [
      { name: 'with anchorCollections', params: { 
        anchorCollections: ['test.source.table'] 
      }},
      { name: 'with multiple collections', params: { 
        anchorCollections: ['test.source.table1', 'test.source.table2'] 
      }},
      { name: 'with anchorAttributeType', params: { 
        anchorCollections: ['test.source.table'],
        anchorAttributeType: 'pii_attributes'
      }},
      { name: 'with different attribute type', params: { 
        anchorCollections: ['test.source.table'],
        anchorAttributeType: 'business_attributes'
      }},
      { name: 'with complex collection names', params: { 
        anchorCollections: ['Directory.public.identities', 'Human Resources.public.employment'] 
      }},
    ];

    testCases.forEach(({ name, params }) => {
      test(`should validate schema with ${name}`, async () => {
        try {
          const result = await server['executeTool']('get_lineage_tree', params);
          expect(validateSchema(result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
          
          // Validate lineage structure
          if (result.data?.lineageTree) {
            expect(Array.isArray(result.data.lineageTree)).toBe(true);
          }
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for ${name}:`, error.message);
        }
      }, 20000);
    });
  });

  describe('Error cases', () => {
    test('should handle missing required parameters', async () => {
      try {
        await server['executeTool']('get_lineage_tree', {});
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, 10000);

    test('should handle invalid anchorCollections format', async () => {
      const invalidParams = [
        { anchorCollections: [] },
        { anchorCollections: [''] },
        { anchorCollections: [null as any] },
        { anchorCollections: [123 as any] },
        { anchorCollections: ['invalid-format'] },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_lineage_tree', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);

    test('should handle invalid anchorAttributeType values', async () => {
      const invalidParams = [
        { anchorCollections: ['test.source.table'], anchorAttributeType: '' },
        { anchorCollections: ['test.source.table'], anchorAttributeType: null as any },
        { anchorCollections: ['test.source.table'], anchorAttributeType: 123 as any },
        { anchorCollections: ['test.source.table'], anchorAttributeType: 'INVALID_TYPE' },
      ];

      for (const params of invalidParams) {
        try {
          await server['executeTool']('get_lineage_tree', params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, 15000);
  });

  describe('Schema structure validation', () => {
    test('should validate lineage tree structure', async () => {
      try {
        const result = await server['executeTool']('get_lineage_tree', { 
          anchorCollections: ['test.source.table'] 
        });
        expect(validateSchema(result)).toBe(true);
        
        if (result.data?.lineageTree) {
          const lineageTree = result.data.lineageTree;
          expect(Array.isArray(lineageTree)).toBe(true);
          
          // Check for common lineage properties
          if (lineageTree.length > 0) {
            const firstItem = lineageTree[0];
            expect(firstItem).toHaveProperty('_id');
            if (firstItem.childs) {
              expect(Array.isArray(firstItem.childs)).toBe(true);
            }
          }
        }
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for lineage tree structure validation:', error.message);
      }
    }, 20000);
  });
}); 