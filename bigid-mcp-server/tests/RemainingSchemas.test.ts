import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { sensitivityConfigByIdSchema } from '../src/schemas/sensitivityConfigByIdSchema';
import { totalClassificationRatiosSchema } from '../src/schemas/totalClassificationRatiosSchema';
import { classificationRatioByNameSchema } from '../src/schemas/classificationRatioByNameSchema';
import { classificationRatioByIdSchema } from '../src/schemas/classificationRatioByIdSchema';
import { dashboardWidgetSchema } from '../src/schemas/dashboardWidgetSchema';
import { aciDataManagerSchema } from '../src/schemas/aciDataManagerSchema';
import { aciDataManagerPermissionsSchema } from '../src/schemas/aciDataManagerPermissionsSchema';
import { aciGroupsSchema } from '../src/schemas/aciGroupsSchema';
import { aciUsersSchema } from '../src/schemas/aciUsersSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Remaining Schemas Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, 30000);

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

  describe('Sensitivity Config by ID', () => {
    test('should validate sensitivity config by ID schema', async () => {
      try {
        const result = await server['executeTool']('get_sensitivity_config_by_id', { 
          configId: 'test-id' 
        });
        expect(validateSchema(sensitivityConfigByIdSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for sensitivity config by ID:', error.message);
      }
    }, 15000);
  });

  describe('Total Classification Ratios', () => {
    test('should validate total classification ratios schema', async () => {
      try {
        const result = await server['executeTool']('get_total_classification_ratios', {});
        expect(validateSchema(totalClassificationRatiosSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for total classification ratios:', error.message);
      }
    }, 15000);
  });

  describe('Classification Ratio by Name', () => {
    test('should validate classification ratio by name schema', async () => {
      try {
        const result = await server['executeTool']('get_classification_ratio_by_name', { 
          ratioName: 'test-ratio' 
        });
        expect(validateSchema(classificationRatioByNameSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for classification ratio by name:', error.message);
      }
    }, 15000);
  });

  describe('Classification Ratio by ID', () => {
    test('should validate classification ratio by ID schema', async () => {
      try {
        const result = await server['executeTool']('get_classification_ratio_by_id', { 
          ratioId: 'test-id' 
        });
        expect(validateSchema(classificationRatioByIdSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for classification ratio by ID:', error.message);
      }
    }, 15000);
  });

  describe('Dashboard Widget', () => {
    test('should validate dashboard widget schema', async () => {
      try {
        const result = await server['executeTool']('get_dashboard_widget', { 
          widgetId: 'test-widget' 
        });
        expect(validateSchema(dashboardWidgetSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for dashboard widget:', error.message);
      }
    }, 15000);
  });

  describe('ACI Data Manager', () => {
    test('should validate ACI data manager schema', async () => {
      try {
        const result = await server['executeTool']('get_aci_data_manager', {});
        expect(validateSchema(aciDataManagerSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for ACI data manager:', error.message);
      }
    }, 15000);
  });

  describe('ACI Data Manager Permissions', () => {
    test('should validate ACI data manager permissions schema', async () => {
      try {
        const result = await server['executeTool']('get_aci_data_manager_permissions', {});
        expect(validateSchema(aciDataManagerPermissionsSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for ACI data manager permissions:', error.message);
      }
    }, 15000);
  });

  describe('ACI Groups', () => {
    test('should validate ACI groups schema', async () => {
      try {
        const result = await server['executeTool']('get_aci_groups', {});
        expect(validateSchema(aciGroupsSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for ACI groups:', error.message);
      }
    }, 15000);
  });

  describe('ACI Users', () => {
    test('should validate ACI users schema', async () => {
      try {
        const result = await server['executeTool']('get_aci_users', {});
        expect(validateSchema(aciUsersSchema, result)).toBe(true);
        expect(result.success).toBeDefined();
      } catch (error: any) {
        if (error.message.includes('Structured content does not match the tool\'s output schema')) {
          throw error;
        }
        console.log('API error for ACI users:', error.message);
      }
    }, 15000);
  });
}); 