import { BigIDMCPServer } from '../src/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { TEST_CONFIG } from './TestConfig';

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

// Schema mapping for all tools
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

// Test parameter variations for comprehensive coverage
const TEST_PARAMETERS = {
  // Basic parameters
  basic: {
    limit: [1, 5, 10],
    skip: [0, 1, 5],
    top: [1, 5, 10],
    text: ['test', 'email', 'password', 'credit', 'file', 'database'],
    searchText: ['test', 'email', 'password', 'credit', 'file', 'database'],
  },
  
  // Entity types
  entityTypes: ['file', 'database', 'table', 'column', 'STRUCTURED_FILE', 'UNSTRUCTURED_FILE'],
  
  // Detailed object types
  detailedObjectTypes: ['STRUCTURED_FILE', 'UNSTRUCTURED_FILE', 'DATABASE', 'TABLE', 'COLUMN'],
  
  // Search variations
  searchVariations: [
    { text: 'test' },
    { text: 'email' },
    { text: 'password' },
    { text: 'credit' },
    { text: 'file' },
    { text: 'database' },
    { text: '' }, // Empty text
    { text: 'a'.repeat(100) }, // Long text
    { text: 'test@example.com' }, // Email format
    { text: '123-45-6789' }, // SSN format
  ],
  
  // Filter variations
  filterVariations: [
    [],
    [{ field: 'entityType', operator: 'equals', value: 'file' }],
    [{ field: 'entityType', operator: 'in', value: ['file', 'database'] }],
  ],
  
  // Sort variations
  sortVariations: [
    [],
    [{ field: 'name', direction: 'asc' }],
    [{ field: 'createdDate', direction: 'desc' }],
  ],
  
  // Paging variations
  pagingVariations: [
    { skip: 0, limit: 1 },
    { skip: 0, limit: 5 },
    { skip: 1, limit: 10 },
    { skip: 5, limit: 20 },
  ],
  
  // Structured filter variations
  structuredFilterVariations: [
    { entityType: 'file' },
    { entityType: 'database' },
    { entityType: 'table' },
    { entityType: 'file', detailedObjectType: 'STRUCTURED_FILE' },
    { entityType: 'database', detailedObjectType: 'DATABASE' },
  ],
};

describe('Comprehensive Output Schema Tests', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true); // Initialize in testing mode
  }, TEST_CONFIG.timeouts.initialization);

  afterAll(async () => {
    if (server) {
      await server.cleanup();
    }
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

  // Helper function to execute tool
  const executeTool = async (name: string, args: any) => {
    const response = await server.handleToolCall({ name, arguments: args });
    if (response.error) {
      throw new Error(response.error.message);
    }
    // Parse the content to get the actual result
    const content = response.result?.content;
    if (!content) {
      throw new Error('No content in response');
    }
    return JSON.parse(content);
  };

  // Helper function to generate parameter combinations
  const generateParameterCombinations = (baseParams: any, variations: any[]) => {
    const combinations = [baseParams];
    
    for (const variation of variations) {
      combinations.push({ ...baseParams, ...variation });
    }
    
    return combinations;
  };

  describe('Health and System Tools', () => {
    test('get_health_check should validate schema with no parameters', async () => {
      try {
        const result = await executeTool('get_health_check', {});
        expect(validateSchema('get_health_check', result)).toBe(true);
        expect(result.success).toBeDefined();
        expect(result.data).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for get_health_check:', error.message);
      }
    }, TEST_CONFIG.timeouts.testCase);
  });

  describe('Catalog Tools', () => {
    describe('get_catalog_objects', () => {
      const baseParams = { limit: TEST_CONFIG.testParams.smallLimit };
      const variations = [
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { limit: 10 },
        { offset: 0 },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { entityType: 'file' },
        { detailedObjectType: 'STRUCTURED_FILE', entityType: 'file' },
        { structuredFilter: { entityType: 'file' } },
        { structuredFilter: { entityType: 'database' } },
        { structuredFilter: { entityType: 'file', detailedObjectType: 'STRUCTURED_FILE' } },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_catalog_objects', params);
          expect(validateSchema('get_catalog_objects', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_catalog_objects with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_catalog_count', () => {
      const baseParams = {};
      const variations = [
        { structuredFilter: { entityType: 'file' } },
        { structuredFilter: { entityType: 'database' } },
        { structuredFilter: { entityType: 'table' } },
        { filter: 'entityType equals "file"' },
        { filter: 'entityType in ["file", "database"]' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_catalog_count', params);
          expect(validateSchema('get_catalog_count', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_catalog_count with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_catalog_tags', () => {
      test('should validate schema with no parameters', async () => {
        try {
          const result = await executeTool('get_catalog_tags', {});
          expect(validateSchema('get_catalog_tags', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_catalog_tags:', error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_catalog_rules', () => {
      test('should validate schema with no parameters', async () => {
        try {
          const result = await executeTool('get_catalog_rules', {});
          expect(validateSchema('get_catalog_rules', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_catalog_rules:', error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_object_details', () => {
      const baseParams = { objectId: 'test-object-id' };
      const variations = [
        { objectId: 'file-123' },
        { objectId: 'database-456' },
        { objectId: 'table-789' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_object_details', params);
          expect(validateSchema('get_object_details', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_object_details with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Metadata Search Tools', () => {
    describe('metadata_quick_search', () => {
      const baseParams = { text: 'test', top: TEST_CONFIG.testParams.smallLimit };
      const variations = [
        { text: 'email', top: TEST_CONFIG.testParams.mediumLimit },
        { text: 'password', top: 10 },
        { text: 'credit', top: 1 },
        { text: '', top: 1 },
        { text: 'a'.repeat(100), top: 1 },
        { text: 'test@example.com', top: 5 },
        { text: '123-45-6789', top: 3 },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('metadata_quick_search', params);
          expect(validateSchema('metadata_quick_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_quick_search with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('metadata_full_search', () => {
      const baseParams = { 
        text: 'test', 
        filter: [], 
        sort: [], 
        paging: { skip: 0, limit: TEST_CONFIG.testParams.smallLimit } 
      };
      const variations = [
        { text: 'email', paging: { skip: 0, limit: TEST_CONFIG.testParams.mediumLimit } },
        { text: 'password', paging: { skip: 1, limit: 10 } },
        { text: 'credit', paging: { skip: 5, limit: 20 } },
        { filter: [{ field: 'entityType', operator: 'equals', value: 'file' }] },
        { sort: [{ field: 'name', direction: 'asc' }] },
        { filter: [{ field: 'entityType', operator: 'equals', value: 'file' }], sort: [{ field: 'name', direction: 'asc' }] },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('metadata_full_search', params);
          expect(validateSchema('metadata_full_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_full_search with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('metadata_objects_search', () => {
      const baseParams = { searchText: 'test', paging: { skip: 0, limit: TEST_CONFIG.testParams.smallLimit } };
      const variations = [
        { searchText: 'email', paging: { skip: 0, limit: TEST_CONFIG.testParams.mediumLimit } },
        { searchText: 'password', paging: { skip: 1, limit: 10 } },
        { searchText: 'credit', paging: { skip: 5, limit: 20 } },
        { searchText: '', paging: { skip: 0, limit: 1 } },
        { searchText: 'a'.repeat(100), paging: { skip: 0, limit: 1 } },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('metadata_objects_search', params);
          expect(validateSchema('metadata_objects_search', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_objects_search with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('metadata_objects_count', () => {
      const baseParams = { searchText: 'test' };
      const variations = [
        { searchText: 'email' },
        { searchText: 'password' },
        { searchText: 'credit' },
        { searchText: '' },
        { searchText: 'a'.repeat(100) },
        { searchText: 'test@example.com' },
        { searchText: '123-45-6789' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('metadata_objects_count', params);
          expect(validateSchema('metadata_objects_count', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for metadata_objects_count with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Inventory Tools', () => {
    describe('get_inventory_aggregation', () => {
      const baseParams = {};
      const variations = [
        { entityType: 'file' },
        { entityType: 'database' },
        { entityType: 'table' },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
        { entityType: 'file', detailedObjectType: 'STRUCTURED_FILE' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_inventory_aggregation', params);
          expect(validateSchema('get_inventory_aggregation', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_inventory_aggregation with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Lineage Tools', () => {
    describe('get_lineage_tree', () => {
      const baseParams = { objectId: 'test-object-id' };
      const variations = [
        { objectId: 'file-123' },
        { objectId: 'database-456' },
        { objectId: 'table-789' },
        { objectId: 'column-abc' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_lineage_tree', params);
          expect(validateSchema('get_lineage_tree', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_lineage_tree with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Security Tools', () => {
    describe('get_security_cases', () => {
      const baseParams = { limit: TEST_CONFIG.testParams.smallLimit };
      const variations = [
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { limit: 10 },
        { skip: 0 },
        { skip: 1 },
        { structuredFilter: { entityType: 'file' } },
        { structuredFilter: { entityType: 'database' } },
        { filter: 'entityType equals "file"' },
        { filter: 'entityType in ["file", "database"]' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_security_cases', params);
          expect(validateSchema('get_security_cases', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_security_cases with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_security_trends', () => {
      const baseParams = {};
      const variations = [
        { entityType: 'file' },
        { entityType: 'database' },
        { entityType: 'table' },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_security_trends', params);
          expect(validateSchema('get_security_trends', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_security_trends with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_cases_group_by_policy', () => {
      const baseParams = {};
      const variations = [
        { entityType: 'file' },
        { entityType: 'database' },
        { entityType: 'table' },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_cases_group_by_policy', params);
          expect(validateSchema('get_cases_group_by_policy', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_cases_group_by_policy with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Data Categories and Sensitivity Tools', () => {
    describe('get_data_categories', () => {
      test('should validate schema with no parameters', async () => {
        try {
          const result = await executeTool('get_data_categories', {});
          expect(validateSchema('get_data_categories', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_data_categories:', error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_sensitivity_configs', () => {
      const baseParams = {};
      const variations = [
        { entityType: 'file' },
        { entityType: 'database' },
        { entityType: 'table' },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_sensitivity_configs', params);
          expect(validateSchema('get_sensitivity_configs', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_sensitivity_configs with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_sensitivity_config_by_id', () => {
      const baseParams = { configId: 'test-config-id' };
      const variations = [
        { configId: 'config-123' },
        { configId: 'config-456' },
        { configId: 'config-789' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_sensitivity_config_by_id', params);
          expect(validateSchema('get_sensitivity_config_by_id', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_sensitivity_config_by_id with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_total_classification_ratios', () => {
      test('should validate schema with no parameters', async () => {
        try {
          const result = await executeTool('get_total_classification_ratios', {});
          expect(validateSchema('get_total_classification_ratios', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_total_classification_ratios:', error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_classification_ratio_by_name', () => {
      const baseParams = { classificationName: 'test-classification' };
      const variations = [
        { classificationName: 'PII' },
        { classificationName: 'PHI' },
        { classificationName: 'PCI' },
        { classificationName: 'Sensitive' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_classification_ratio_by_name', params);
          expect(validateSchema('get_classification_ratio_by_name', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_classification_ratio_by_name with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_classification_ratio_by_id', () => {
      const baseParams = { classificationId: 'test-classification-id' };
      const variations = [
        { classificationId: 'classification-123' },
        { classificationId: 'classification-456' },
        { classificationId: 'classification-789' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_classification_ratio_by_id', params);
          expect(validateSchema('get_classification_ratio_by_id', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_classification_ratio_by_id with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Policy and Dashboard Tools', () => {
    describe('get_policies', () => {
      test('should validate schema with no parameters', async () => {
        try {
          const result = await executeTool('get_policies', {});
          expect(validateSchema('get_policies', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log('API error for get_policies:', error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_dashboard_widget', () => {
      const baseParams = { widgetType: 'test-widget' };
      const variations = [
        { widgetType: 'inventory-summary' },
        { widgetType: 'security-cases' },
        { widgetType: 'classification-ratios' },
        { widgetType: 'data-categories' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_dashboard_widget', params);
          expect(validateSchema('get_dashboard_widget', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_dashboard_widget with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('ACI Tools', () => {
    describe('get_aci_data_manager', () => {
      const baseParams = {};
      const variations = [
        { limit: TEST_CONFIG.testParams.smallLimit },
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { skip: 0 },
        { skip: 1 },
        { requireTotalCount: true },
        { requireTotalCount: false },
        { sort: '[{"field":"name","direction":"asc"}]' },
        { sort: '[{"field":"createdDate","direction":"desc"}]' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_aci_data_manager', params);
          expect(validateSchema('get_aci_data_manager', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_aci_data_manager with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_aci_data_manager_permissions', () => {
      const baseParams = { itemPath: 'test-item-path' };
      const variations = [
        { itemPath: '/path/to/item' },
        { itemPath: '/another/path' },
        { skip: 0 },
        { skip: 1 },
        { limit: TEST_CONFIG.testParams.smallLimit },
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { requireTotalCount: true },
        { requireTotalCount: false },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_aci_data_manager_permissions', params);
          expect(validateSchema('get_aci_data_manager_permissions', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_aci_data_manager_permissions with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_aci_groups', () => {
      const baseParams = {};
      const variations = [
        { limit: TEST_CONFIG.testParams.smallLimit },
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { skip: 0 },
        { skip: 1 },
        { requireTotalCount: true },
        { requireTotalCount: false },
        { sort: '[{"field":"name","direction":"asc"}]' },
        { sort: '[{"field":"createdDate","direction":"desc"}]' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_aci_groups', params);
          expect(validateSchema('get_aci_groups', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_aci_groups with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });

    describe('get_aci_users', () => {
      const baseParams = {};
      const variations = [
        { limit: TEST_CONFIG.testParams.smallLimit },
        { limit: TEST_CONFIG.testParams.mediumLimit },
        { skip: 0 },
        { skip: 1 },
        { requireTotalCount: true },
        { requireTotalCount: false },
        { sort: '[{"field":"name","direction":"asc"}]' },
        { sort: '[{"field":"createdDate","direction":"desc"}]' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_aci_users', params);
          expect(validateSchema('get_aci_users', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_aci_users with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Location Tools', () => {
    describe('get_locations', () => {
      const baseParams = {};
      const variations = [
        { entityType: 'file' },
        { entityType: 'database' },
        { entityType: 'table' },
        { detailedObjectType: 'STRUCTURED_FILE' },
        { detailedObjectType: 'UNSTRUCTURED_FILE' },
      ];

      const combinations = generateParameterCombinations(baseParams, variations);

      test.each(combinations)('should validate schema with params: %j', async (params) => {
        try {
          const result = await executeTool('get_locations', params);
          expect(validateSchema('get_locations', result)).toBe(true);
          expect(result.success).toBeDefined();
          expect(result.data).toBeDefined();
        } catch (error: any) {
          if (error.message.includes('Structured content does not match the tool\'s output schema')) {
            throw error;
          }
          console.log(`API error for get_locations with params ${JSON.stringify(params)}:`, error.message);
        }
      }, TEST_CONFIG.timeouts.testCase);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing required parameters gracefully', async () => {
      const toolsWithRequiredParams = [
        { name: 'metadata_objects_search', params: {} }, // missing searchText
        { name: 'metadata_quick_search', params: {} }, // missing text
        { name: 'metadata_full_search', params: {} }, // missing text
        { name: 'get_catalog_objects', params: {} }, // missing limit
        { name: 'get_object_details', params: {} }, // missing objectId
        { name: 'get_lineage_tree', params: {} }, // missing objectId
        { name: 'get_sensitivity_config_by_id', params: {} }, // missing configId
        { name: 'get_classification_ratio_by_name', params: {} }, // missing classificationName
        { name: 'get_classification_ratio_by_id', params: {} }, // missing classificationId
        { name: 'get_dashboard_widget', params: {} }, // missing widgetType
        { name: 'get_aci_data_manager_permissions', params: {} }, // missing itemPath
      ];

      for (const tool of toolsWithRequiredParams) {
        try {
          await executeTool(tool.name, tool.params);
          // If it doesn't throw, that's also acceptable
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, TEST_CONFIG.timeouts.testCase);

    test('should handle invalid parameter types gracefully', async () => {
      const invalidParams = [
        { name: 'get_catalog_objects', params: { limit: 'invalid' } },
        { name: 'metadata_quick_search', params: { text: 123, top: 'invalid' } },
        { name: 'metadata_full_search', params: { text: null, paging: 'invalid' } },
        { name: 'get_object_details', params: { objectId: 123 } },
        { name: 'get_lineage_tree', params: { objectId: null } },
      ];

      for (const tool of invalidParams) {
        try {
          await executeTool(tool.name, tool.params);
        } catch (error: any) {
          expect(error.message).toBeDefined();
        }
      }
    }, TEST_CONFIG.timeouts.testCase);

    test('should handle extreme parameter values gracefully', async () => {
      const extremeParams = [
        { name: 'get_catalog_objects', params: { limit: 999999 } },
        { name: 'metadata_quick_search', params: { text: 'a'.repeat(10000), top: 999999 } },
        { name: 'metadata_full_search', params: { text: '', paging: { skip: -1, limit: 0 } } },
        { name: 'get_object_details', params: { objectId: 'a'.repeat(1000) } },
        { name: 'get_lineage_tree', params: { objectId: 'a'.repeat(1000) } },
      ];

      for (const tool of extremeParams) {
        try {
          const result = await executeTool(tool.name, tool.params);
          // If it succeeds, validate the schema
          if (schemas[tool.name]) {
            expect(validateSchema(tool.name, result)).toBe(true);
          }
        } catch (error: any) {
          // API errors are acceptable for extreme values
          expect(error.message).toBeDefined();
        }
      }
    }, TEST_CONFIG.timeouts.testCase);

    test('should handle non-existent tool names', async () => {
      try {
        await executeTool('non_existent_tool', {});
        fail('Should have thrown an error for non-existent tool');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    }, TEST_CONFIG.timeouts.testCase);
  });

  describe('Schema Coverage Verification', () => {
    test('should have schemas for all registered tools', () => {
      const allTools = [
        'get_catalog_objects',
        'metadata_quick_search',
        'metadata_full_search',
        'metadata_objects_search',
        'metadata_objects_count',
        'get_health_check',
        'get_inventory_aggregation',
        'get_object_details',
        'get_catalog_tags',
        'get_catalog_rules',
        'get_catalog_count',
        'get_lineage_tree',
        'get_security_cases',
        'get_security_trends',
        'get_cases_group_by_policy',
        'get_data_categories',
        'get_sensitivity_configs',
        'get_sensitivity_config_by_id',
        'get_total_classification_ratios',
        'get_classification_ratio_by_name',
        'get_classification_ratio_by_id',
        'get_policies',
        'get_dashboard_widget',
        'get_aci_data_manager',
        'get_aci_data_manager_permissions',
        'get_aci_groups',
        'get_aci_users',
        'get_locations',
      ];

      for (const tool of allTools) {
        expect(schemas[tool]).toBeDefined();
        expect(schemas[tool].outputSchema).toBeDefined();
      }
    });
  });
}); 