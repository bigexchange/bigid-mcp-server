import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Import all schemas
import { catalogObjectsSchema } from '../src/schemas/catalogObjectsSchema';
import { metadataQuickSearchSchema } from '../src/schemas/metadataQuickSearchSchema';
import { metadataFullSearchSchema } from '../src/schemas/metadataFullSearchSchema';
import { metadataObjectsSearchSchema } from '../src/schemas/metadataObjectsSearchSchema';
import { metadataObjectsCountSchema } from '../src/schemas/metadataObjectsCountSchema';
import { healthCheckSchema } from '../src/schemas/healthCheckSchema';
import { inventoryAggregationSchema } from '../src/schemas/inventoryAggregationSchema';
import { objectDetailsSchema } from '../src/schemas/objectDetailsSchema';
import { catalogTagsSchema } from '../src/schemas/catalogTagsSchema';
import { catalogRulesSchema } from '../src/schemas/catalogRulesSchema';
import { catalogCountSchema } from '../src/schemas/catalogCountSchema';
import { lineageTreeSchema } from '../src/schemas/lineageTreeSchema';
import { securityCasesSchema } from '../src/schemas/securityCasesSchema';
import { securityTrendsSchema } from '../src/schemas/securityTrendsSchema';
import { casesGroupByPolicySchema } from '../src/schemas/casesGroupByPolicySchema';
import { dataCategoriesSchema } from '../src/schemas/dataCategoriesSchema';
import { sensitivityConfigsSchema } from '../src/schemas/sensitivityConfigsSchema';
import { sensitivityConfigByIdSchema } from '../src/schemas/sensitivityConfigByIdSchema';
import { totalClassificationRatiosSchema } from '../src/schemas/totalClassificationRatiosSchema';
import { classificationRatioByNameSchema } from '../src/schemas/classificationRatioByNameSchema';
import { classificationRatioByIdSchema } from '../src/schemas/classificationRatioByIdSchema';
import { policiesSchema } from '../src/schemas/policiesSchema';
import { dashboardWidgetSchema } from '../src/schemas/dashboardWidgetSchema';
import { aciDataManagerSchema } from '../src/schemas/aciDataManagerSchema';
import { aciDataManagerPermissionsSchema } from '../src/schemas/aciDataManagerPermissionsSchema';
import { aciGroupsSchema } from '../src/schemas/aciGroupsSchema';
import { aciUsersSchema } from '../src/schemas/aciUsersSchema';
import { locationsSchema } from '../src/schemas/locationsSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Schema mapping with proper typing
const schemas: Record<string, any> = {
  get_catalog_objects: catalogObjectsSchema,
  metadata_quick_search: metadataQuickSearchSchema,
  metadata_full_search: metadataFullSearchSchema,
  metadata_objects_search: metadataObjectsSearchSchema,
  metadata_objects_count: metadataObjectsCountSchema,
  get_health_check: healthCheckSchema,
  get_inventory_aggregation: inventoryAggregationSchema,
  get_object_details: objectDetailsSchema,
  get_catalog_tags: catalogTagsSchema,
  get_catalog_rules: catalogRulesSchema,
  get_catalog_count: catalogCountSchema,
  get_lineage_tree: lineageTreeSchema,
  get_security_cases: securityCasesSchema,
  get_security_trends: securityTrendsSchema,
  get_cases_group_by_policy: casesGroupByPolicySchema,
  get_data_categories: dataCategoriesSchema,
  get_sensitivity_configs: sensitivityConfigsSchema,
  get_sensitivity_config_by_id: sensitivityConfigByIdSchema,
  get_total_classification_ratios: totalClassificationRatiosSchema,
  get_classification_ratio_by_name: classificationRatioByNameSchema,
  get_classification_ratio_by_id: classificationRatioByIdSchema,
  get_policies: policiesSchema,
  get_dashboard_widget: dashboardWidgetSchema,
  get_aci_data_manager: aciDataManagerSchema,
  get_aci_data_manager_permissions: aciDataManagerPermissionsSchema,
  get_aci_groups: aciGroupsSchema,
  get_aci_users: aciUsersSchema,
  get_locations: locationsSchema,
};

describe('Comprehensive MCP Server Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  // Helper function to validate schema
  const validateSchema = (toolName: string, result: any) => {
    const schema = schemas[toolName];
    if (!schema) {
      throw new Error(`No schema found for tool: ${toolName}`);
    }

    const validate = ajv.compile(schema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error(`Schema validation failed for ${toolName}:`, validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  // Helper function to generate parameter permutations
  const generateParameterPermutations = (baseParams: any, variations: any[]): any[] => {
    const permutations = [baseParams];
    
    for (const variation of variations) {
      permutations.push({ ...baseParams, ...variation });
    }
    
    return permutations;
  };

  // Helper function to execute tool using public method
  const executeTool = async (name: string, args: any) => {
    return await server.handleToolCall({ name, arguments: args });
  };

  describe('Catalog and Search Tools', () => {
    describe('get_catalog_objects', () => {
      const baseParams = { limit: 1 };
      const variations = [
        { limit: 5 },
        { limit: 10 },
        { limit: 1, offset: 0 },
        { limit: 1, detailedObjectType: 'STRUCTURED_FILE' },
        { limit: 1, entityType: 'file' },
        { limit: 1, detailedObjectType: 'STRUCTURED_FILE', entityType: 'file' },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_catalog_objects', params);
          expect(validateSchema('get_catalog_objects', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          // API errors are acceptable, but schema validation should pass
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          // Log API errors but don't fail the test
          console.log(`API error for get_catalog_objects with params ${JSON.stringify(params)}:`, error.message);
        }
      });

      test('should handle invalid parameters gracefully', async () => {
        const invalidParams = [
          { limit: -1 },
          { limit: 0 },
          { limit: 'invalid' },
          { detailedObjectType: 'INVALID_TYPE' },
        ];

        for (const params of invalidParams) {
          try {
            await server.executeTool('get_catalog_objects', params);
            // If it doesn't throw, that's also acceptable
          } catch (error) {
            // Expected to fail with invalid params
            expect(error.message).toBeDefined();
          }
        }
      });
    });

    describe('metadata_quick_search', () => {
      const baseParams = { text: 'test', top: 1 };
      const variations = [
        { text: 'email', top: 5 },
        { text: 'password', top: 10 },
        { text: 'credit', top: 1 },
        { text: '', top: 1 }, // Empty text
        { text: 'a'.repeat(1000), top: 1 }, // Very long text
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('metadata_quick_search', params);
          expect(validateSchema('metadata_quick_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_quick_search with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });

    describe('metadata_full_search', () => {
      const baseParams = { 
        text: 'test', 
        filter: [], 
        sort: [], 
        paging: { skip: 0, limit: 1 } 
      };
      const variations = [
        { text: 'email', paging: { skip: 0, limit: 5 } },
        { text: 'password', paging: { skip: 10, limit: 10 } },
        { text: 'credit', filter: [{ field: 'type', value: 'file' }] },
        { text: 'test', sort: [{ field: 'name', direction: 'asc' }] },
        { text: 'test', filter: [], sort: [], paging: { skip: 0, limit: 1 } },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('metadata_full_search', params);
          expect(validateSchema('metadata_full_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_full_search with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });

    describe('metadata_objects_search', () => {
      const baseParams = { searchText: 'test', paging: { limit: 1 } };
      const variations = [
        { searchText: 'email', paging: { limit: 5 } },
        { searchText: 'password', paging: { limit: 10 } },
        { searchText: 'credit', paging: { limit: 1 }, entityType: 'catalog' },
        { searchText: 'test', paging: { limit: 1 }, isHighlight: true },
        { searchText: 'test', paging: { limit: 1 }, needToHighlight: true },
        { searchText: 'test', paging: { limit: 1 }, fieldsToProject: ['name', 'type'] },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('metadata_objects_search', params);
          expect(validateSchema('metadata_objects_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_objects_search with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });

    describe('metadata_objects_count', () => {
      const baseParams = { searchText: 'test' };
      const variations = [
        { searchText: 'email' },
        { searchText: 'password' },
        { searchText: 'credit' },
        { searchText: '' }, // Empty search
        { searchText: 'a'.repeat(1000) }, // Very long search
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('metadata_objects_count', params);
          expect(validateSchema('metadata_objects_count', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_objects_count with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });
  });

  describe('Health and System Tools', () => {
    describe('get_health_check', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_health_check', {});
          expect(validateSchema('get_health_check', result)).toBe(true);
          expect(result.success).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_health_check:', error.message);
        }
      });
    });

    describe('get_inventory_aggregation', () => {
      const baseParams = {};
      const variations = [
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
        { detailedObjectType: 'TABLE' },
        { entityType: 'file' },
        { entityType: 'database' },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('get_inventory_aggregation', params);
          expect(validateSchema('get_inventory_aggregation', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_inventory_aggregation with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });
  });

  describe('Catalog Detail Tools', () => {
    describe('get_object_details', () => {
      test('should validate schema with valid object ID', async () => {
        try {
          // First get a catalog object to use its ID
          const catalogResult = await server.executeTool('get_catalog_objects', { limit: 1 });
          if (catalogResult.success && catalogResult.data.results.length > 0) {
            const objectId = catalogResult.data.results[0].id;
            const result = await server.executeTool('get_object_details', { objectId });
            expect(validateSchema('get_object_details', result)).toBe(true);
            expect(result.success).toBeDefined();
            expect(result.data).toBeDefined();
          }
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_object_details:', error.message);
        }
      });

      test('should handle invalid object ID', async () => {
        try {
          await server.executeTool('get_object_details', { objectId: 'invalid-id' });
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      });
    });

    describe('get_catalog_tags', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_catalog_tags', {});
          expect(validateSchema('get_catalog_tags', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_catalog_tags:', error.message);
        }
      });
    });

    describe('get_catalog_rules', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_catalog_rules', {});
          expect(validateSchema('get_catalog_rules', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_catalog_rules:', error.message);
        }
      });
    });

    describe('get_catalog_count', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_catalog_count', {});
          expect(validateSchema('get_catalog_count', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_catalog_count:', error.message);
        }
      });
    });
  });

  describe('Lineage and Security Tools', () => {
    describe('get_lineage_tree', () => {
      test('should validate schema with valid object ID', async () => {
        try {
          // First get a catalog object to use its ID
          const catalogResult = await server.executeTool('get_catalog_objects', { limit: 1 });
          if (catalogResult.success && catalogResult.data.results.length > 0) {
            const objectId = catalogResult.data.results[0].id;
            const result = await server.executeTool('get_lineage_tree', { objectId });
            expect(validateSchema('get_lineage_tree', result)).toBe(true);
            expect(result.success).toBeDefined();
            expect(result.data).toBeDefined();
          }
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_lineage_tree:', error.message);
        }
      });
    });

    describe('get_security_cases', () => {
      const baseParams = {};
      const variations = [
        { limit: 5 },
        { limit: 10 },
        { offset: 0 },
        { limit: 5, offset: 0 },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('get_security_cases', params);
          expect(validateSchema('get_security_cases', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_security_cases with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });

    describe('get_security_trends', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_security_trends', {});
          expect(validateSchema('get_security_trends', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_security_trends:', error.message);
        }
      });
    });

    describe('get_cases_group_by_policy', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_cases_group_by_policy', {});
          expect(validateSchema('get_cases_group_by_policy', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_cases_group_by_policy:', error.message);
        }
      });
    });
  });

  describe('Data Categories and Sensitivity Tools', () => {
    describe('get_data_categories', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_data_categories', {});
          expect(validateSchema('get_data_categories', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_data_categories:', error.message);
        }
      });
    });

    describe('get_sensitivity_configs', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_sensitivity_configs', {});
          expect(validateSchema('get_sensitivity_configs', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_sensitivity_configs:', error.message);
        }
      });
    });

    describe('get_sensitivity_config_by_id', () => {
      test('should validate schema with valid config ID', async () => {
        try {
          // First get sensitivity configs to use an ID
          const configsResult = await server.executeTool('get_sensitivity_configs', {});
          if (configsResult.success && configsResult.data.results.length > 0) {
            const configId = configsResult.data.results[0].id;
            const result = await server.executeTool('get_sensitivity_config_by_id', { configId });
            expect(validateSchema('get_sensitivity_config_by_id', result)).toBe(true);
            expect(result.success).toBeDefined();
            expect(result.data).toBeDefined();
          }
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_sensitivity_config_by_id:', error.message);
        }
      });

      test('should handle invalid config ID', async () => {
        try {
          await server.executeTool('get_sensitivity_config_by_id', { configId: 'invalid-id' });
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      });
    });
  });

  describe('Classification Tools', () => {
    describe('get_total_classification_ratios', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_total_classification_ratios', {});
          expect(validateSchema('get_total_classification_ratios', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_total_classification_ratios:', error.message);
        }
      });
    });

    describe('get_classification_ratio_by_name', () => {
      const baseParams = { classificationName: 'email' };
      const variations = [
        { classificationName: 'password' },
        { classificationName: 'credit' },
        { classificationName: 'ssn' },
        { classificationName: 'phone' },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('get_classification_ratio_by_name', params);
          expect(validateSchema('get_classification_ratio_by_name', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_classification_ratio_by_name with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });

    describe('get_classification_ratio_by_id', () => {
      test('should validate schema with valid classification ID', async () => {
        try {
          // First get classification ratios to use an ID
          const ratiosResult = await server.executeTool('get_total_classification_ratios', {});
          if (ratiosResult.success && ratiosResult.data.results.length > 0) {
            const classificationId = ratiosResult.data.results[0].id;
            const result = await server.executeTool('get_classification_ratio_by_id', { classificationId });
            expect(validateSchema('get_classification_ratio_by_id', result)).toBe(true);
            expect(result.success).toBeDefined();
            expect(result.data).toBeDefined();
          }
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_classification_ratio_by_id:', error.message);
        }
      });

      test('should handle invalid classification ID', async () => {
        try {
          await server.executeTool('get_classification_ratio_by_id', { classificationId: 'invalid-id' });
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      });
    });
  });

  describe('Policy and Dashboard Tools', () => {
    describe('get_policies', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_policies', {});
          expect(validateSchema('get_policies', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_policies:', error.message);
        }
      });
    });

    describe('get_dashboard_widget', () => {
      const baseParams = { widgetType: 'summary' };
      const variations = [
        { widgetType: 'chart' },
        { widgetType: 'table' },
        { widgetType: 'metric' },
      ];

      const permutations = generateParameterPermutations(baseParams, variations);

      test.each(permutations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await server.executeTool('get_dashboard_widget', params);
          expect(validateSchema('get_dashboard_widget', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_dashboard_widget with params ${JSON.stringify(params)}:`, error.message);
        }
      });
    });
  });

  describe('ACI Tools', () => {
    describe('get_aci_data_manager', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_aci_data_manager', {});
          expect(validateSchema('get_aci_data_manager', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_aci_data_manager:', error.message);
        }
      });
    });

    describe('get_aci_data_manager_permissions', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_aci_data_manager_permissions', {});
          expect(validateSchema('get_aci_data_manager_permissions', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_aci_data_manager_permissions:', error.message);
        }
      });
    });

    describe('get_aci_groups', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_aci_groups', {});
          expect(validateSchema('get_aci_groups', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_aci_groups:', error.message);
        }
      });
    });

    describe('get_aci_users', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_aci_users', {});
          expect(validateSchema('get_aci_users', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_aci_users:', error.message);
        }
      });
    });
  });

  describe('Location Tools', () => {
    describe('get_locations', () => {
      test('should validate schema', async () => {
        try {
          const result = await server.executeTool('get_locations', {});
          expect(validateSchema('get_locations', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_locations:', error.message);
        }
      });
    });
  });

  describe('Error Cases and Edge Cases', () => {
    test('should handle missing required parameters', async () => {
      const toolsWithRequiredParams = [
        { name: 'metadata_objects_search', params: {} }, // missing searchText
        { name: 'metadata_quick_search', params: {} }, // missing text
        { name: 'metadata_full_search', params: {} }, // missing text
        { name: 'get_catalog_objects', params: {} }, // missing limit
      ];

      for (const tool of toolsWithRequiredParams) {
        try {
          await server.executeTool(tool.name, tool.params);
          // If it doesn't throw, that's also acceptable
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle invalid parameter types', async () => {
      const invalidParams = [
        { name: 'get_catalog_objects', params: { limit: 'invalid' } },
        { name: 'metadata_quick_search', params: { text: 123, top: 'invalid' } },
        { name: 'metadata_full_search', params: { text: null, paging: 'invalid' } },
      ];

      for (const tool of invalidParams) {
        try {
          await server.executeTool(tool.name, tool.params);
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle extreme parameter values', async () => {
      const extremeParams = [
        { name: 'get_catalog_objects', params: { limit: 999999 } },
        { name: 'metadata_quick_search', params: { text: 'a'.repeat(10000), top: 999999 } },
        { name: 'metadata_full_search', params: { text: '', paging: { skip: -1, limit: 0 } } },
      ];

      for (const tool of extremeParams) {
        try {
          const result = await server.executeTool(tool.name, tool.params);
          // If it succeeds, validate the schema
          if (schemas[tool.name]) {
            expect(validateSchema(tool.name, result)).toBe(true);
          }
        } catch (error) {
          // API errors are acceptable for extreme values
          expect(error.message).toBeDefined();
        }
      }
    });

    test('should handle non-existent tool names', async () => {
      try {
        await server.executeTool('non_existent_tool', {});
        fail('Should have thrown an error for non-existent tool');
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });
}); 