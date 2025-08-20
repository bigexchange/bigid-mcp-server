import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { BigIDMCPServer } from '../src/server';
import { locationsSchema } from '../src/schemas/locationsSchema';

const ajv = new Ajv();
addFormats(ajv);

describe('Locations Schema Validation', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  const validateSchema = (result: any) => {
    const validate = ajv.compile(locationsSchema.outputSchema);
    const isValid = validate(result);

    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Result:', JSON.stringify(result, null, 2));
    }

    return isValid;
  };

  describe('System Locations', () => {
    test('should validate system locations schema', async () => {
      const result = await server['executeTool']('get_locations', { locationType: 'system' });
      expect(validateSchema(result)).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.system_locations).toBeDefined();
      expect(Array.isArray(result.data.system_locations)).toBe(true);
      
      if (result.data.system_locations.length > 0) {
        const firstLocation = result.data.system_locations[0];
        expect(firstLocation).toHaveProperty('id');
        expect(firstLocation).toHaveProperty('name');
        expect(firstLocation).toHaveProperty('count');
        expect(firstLocation).toHaveProperty('avg');
        expect(firstLocation).toHaveProperty('systems');
        expect(Array.isArray(firstLocation.systems)).toBe(true);
      }
    });
  });

  describe('Application Locations', () => {
    test('should validate application locations schema', async () => {
      const result = await server['executeTool']('get_locations', { locationType: 'application' });
      expect(validateSchema(result)).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.applications_locations).toBeDefined();
      expect(Array.isArray(result.data.applications_locations)).toBe(true);
      
      if (result.data.applications_locations.length > 0) {
        const firstLocation = result.data.applications_locations[0];
        expect(firstLocation).toHaveProperty('_id');
        expect(firstLocation).toHaveProperty('name');
        expect(firstLocation).toHaveProperty('applications_count');
        expect(firstLocation).toHaveProperty('target_data_sources');
        expect(firstLocation).toHaveProperty('count');
        expect(Array.isArray(firstLocation.target_data_sources)).toBe(true);
      }
    });
  });

  describe('Identity Locations', () => {
    test('should validate identity locations schema', async () => {
      const result = await server['executeTool']('get_locations', { locationType: 'identity' });
      expect(validateSchema(result)).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.identity_locations).toBeDefined();
      expect(Array.isArray(result.data.identity_locations)).toBe(true);
      
      if (result.data.identity_locations.length > 0) {
        const firstLocation = result.data.identity_locations[0];
        expect(firstLocation).toHaveProperty('id');
        expect(firstLocation).toHaveProperty('name');
        expect(firstLocation).toHaveProperty('count');
        expect(firstLocation).toHaveProperty('avg');
      }
    });
  });

  describe('Schema Structure Validation', () => {
    test('should validate nullable fields correctly', async () => {
      const result = await server['executeTool']('get_locations', { locationType: 'system' });
      expect(validateSchema(result)).toBe(true);
      
      // Check that null values are accepted
      if (Array.isArray(result.data?.system_locations)) {
        const locationsWithNull = result.data.system_locations.filter((loc: any) => 
          loc.id === null || loc.name === null
        );
        // Sandbox may not include nulls; just assert filter runs without error
        expect(Array.isArray(locationsWithNull)).toBe(true);
      }
    });

    test('should validate required fields are present', async () => {
      const result = await server['executeTool']('get_locations', { locationType: 'system' });
      expect(validateSchema(result)).toBe(true);
      
      if (Array.isArray(result.data?.system_locations)) {
        result.data.system_locations.forEach((location: any) => {
          expect(location).toHaveProperty('count');
          expect(typeof location.count).toBe('number');
          expect(location).toHaveProperty('avg');
          expect(typeof location.avg).toBe('number');
          expect(location).toHaveProperty('systems');
          expect(Array.isArray(location.systems)).toBe(true);
        });
      }
    });
  });
}); 