import { aciDataManagerPermissionsSchema } from '../src/schemas/aciDataManagerPermissionsSchema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('ACI Data Manager Permissions Schema', () => {
  test('should validate schema with various access permission values', () => {
    const validate = ajv.compile(aciDataManagerPermissionsSchema.outputSchema);
    
    // Test with different access permission values that might be returned by the API
    const testCases = [
      {
        success: true,
        data: {
          status: 'success',
          statusCode: 200,
          data: {
            permissions: [
              {
                _id: 'perm1',
                name: 'John Doe',
                email: 'john@example.com',
                access: ['READ', 'WRITE'],
                type: 'user',
                subType: 'EMAIL',
                grantType: 'DIRECT'
              },
              {
                _id: 'perm2',
                name: 'Admin Group',
                email: 'admin@example.com',
                access: ['FULL_CONTROL'],
                type: 'group',
                subType: 'DOMAIN',
                grantType: 'INHERITED'
              },
                             {
                 _id: 'perm3',
                 name: 'Public Link',
                 email: 'https://example.com/share/123',
                 access: ['READ'],
                 type: 'link',
                 subType: null,
                 grantType: 'DIRECT'
               },
               {
                 _id: 'perm4',
                 name: 'Service Account',
                 email: 'service@example.com',
                 access: ['READ', 'WRITE', 'DELETE'],
                 type: 'service',
                 subType: 'API',
                 grantType: 'EFFECTIVE'
               },
               {
                 _id: 'perm5',
                 name: 'User without subtype',
                 email: 'user@example.com',
                 access: ['READ'],
                 type: 'user',
                 subType: null,
                 grantType: 'DIRECT'
               }
            ],
            totalCount: 5
          },
          message: null
        }
      },
      {
        success: true,
        data: {
          status: 'success',
          statusCode: 200,
          data: {
            permissions: [
              {
                _id: 'perm4',
                name: 'Service Account',
                email: 'service@example.com',
                access: ['READ', 'WRITE', 'DELETE'], // Multiple permissions
                type: 'service',
                subType: 'API',
                grantType: 'EFFECTIVE'
              }
            ],
            totalCount: 1
          },
          message: 'Permissions retrieved successfully'
        }
      },
      {
        success: false,
        data: {
          status: 'error',
          statusCode: 404,
          data: {
            permissions: [],
            totalCount: 0
          },
          message: 'Item not found'
        },
        error: {
          code: 'NOT_FOUND',
          message: 'The specified item path was not found',
          retryable: false
        }
      }
    ];

    for (const testCase of testCases) {
      const isValid = validate(testCase);
      if (!isValid) {
        console.error('Schema validation failed:', validate.errors);
        console.error('Test case:', JSON.stringify(testCase, null, 2));
      }
      expect(isValid).toBe(true);
    }
  });

  test('should handle flexible access permission values', () => {
    const validate = ajv.compile(aciDataManagerPermissionsSchema.outputSchema);
    
    // Test with various access permission values that might be returned by the actual API
    const testCases = [
      {
        success: true,
        data: {
          status: 'success',
          statusCode: 200,
          data: {
            permissions: [
              {
                _id: 'perm1',
                name: 'User',
                email: 'user@example.com',
                access: ['read'], // lowercase
                type: 'user',
                grantType: 'DIRECT'
              },
              {
                _id: 'perm2',
                name: 'Admin',
                email: 'admin@example.com',
                access: ['write', 'delete'], // lowercase
                type: 'user',
                grantType: 'DIRECT'
              },
              {
                _id: 'perm3',
                name: 'Manager',
                email: 'manager@example.com',
                access: ['full_access'], // different format
                type: 'user',
                grantType: 'DIRECT'
              },
              {
                _id: 'perm4',
                name: 'Viewer',
                email: 'viewer@example.com',
                access: ['view'], // different permission name
                type: 'user',
                grantType: 'DIRECT'
              }
            ],
            totalCount: 4
          },
          message: null
        }
      }
    ];

    for (const testCase of testCases) {
      const isValid = validate(testCase);
      if (!isValid) {
        console.error('Schema validation failed:', validate.errors);
        console.error('Test case:', JSON.stringify(testCase, null, 2));
      }
      expect(isValid).toBe(true);
    }
  });
}); 