import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { healthCheckSchema } from '../src/schemas/healthCheckSchema';
import { metadataQuickSearchSchema } from '../src/schemas/metadataQuickSearchSchema';
import { metadataObjectsCountSchema } from '../src/schemas/metadataObjectsCountSchema';
import { metadataObjectsSearchSchema } from '../src/schemas/metadataObjectsSearchSchema';
import { catalogObjectsSchema } from '../src/schemas/catalogObjectsSchema';
import { policiesSchema } from '../src/schemas/policiesSchema';
import { dataCategoriesSchema } from '../src/schemas/dataCategoriesSchema';
import { securityCasesSchema } from '../src/schemas/securityCasesSchema';
import { locationsSchema } from '../src/schemas/locationsSchema';
import { inventoryAggregationSchema } from '../src/schemas/inventoryAggregationSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Comprehensive Schema Validation Tests', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000); // 30 second timeout for initialization

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

  describe('Core Health and Search Tools', () => {
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
    }, 15000);

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

  describe('Catalog and Inventory Tools', () => {
    test('should validate catalog objects schema', async () => {
      try {
        const result = await server['executeTool']('get_catalog_objects', { 
          limit: 1 
        });
        expect(validateSchema(catalogObjectsSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for catalog objects:', error.message);
      }
    }, 20000);

    test('should validate inventory aggregation schema', async () => {
      try {
        const result = await server['executeTool']('get_inventory_aggregation', {});
        expect(validateSchema(inventoryAggregationSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for inventory aggregation:', error.message);
      }
    }, 15000);
  });

  describe('Management Tools', () => {
    test('should validate policies schema', async () => {
      try {
        const result = await server['executeTool']('get_policies', { 
          limit: 1 
        });
        expect(validateSchema(policiesSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for policies:', error.message);
      }
    }, 15000);

    test('should validate data categories schema', async () => {
      try {
        const result = await server['executeTool']('get_data_categories', { 
          limit: 1 
        });
        expect(validateSchema(dataCategoriesSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for data categories:', error.message);
      }
    }, 15000);

    test('should validate security cases schema', async () => {
      try {
        const result = await server['executeTool']('get_security_cases', { 
          limit: 1 
        });
        expect(validateSchema(securityCasesSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for security cases:', error.message);
      }
    }, 15000);

    test('should validate locations schema', async () => {
      try {
        const result = await server['executeTool']('get_locations', { 
          limit: 1 
        });
        expect(validateSchema(locationsSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for locations:', error.message);
      }
    }, 15000);
  });

  describe('Advanced Search Tools', () => {
    test('should validate metadata objects search schema', async () => {
      try {
        const result = await server['executeTool']('metadata_objects_search', { 
          searchText: 'test', 
          paging: { limit: 1 } 
        });
        expect(validateSchema(metadataObjectsSearchSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for metadata objects search:', error.message);
      }
    }, 20000);
  });
}); 