export const aciDataManagerPermissionsSchema = {
  name: 'get_aci_data_manager_permissions',
  description: 'Get detailed permissions for specific files/folders for granular permission analysis',
  inputSchema: {
    type: 'object',
    properties: {
      itemPath: { 
        type: 'string', 
        description: 'Path to the data manager item (required). URL encoding is handled automatically.',
        examples: [
          'SharePoint Online  Dvir Test-SF54631./sites/bigiddemo::Shared Documents/bigiddemo/Benjamin Terry Young CV.docx',
          'Network Archive.smb/cluster2/',
          'Google Drive/My Drive/'
        ]
      },
      skip: { 
        type: 'number', 
        description: 'Number of permissions to skip for pagination',
        default: 0,
        minimum: 0
      },
      limit: { 
        type: 'number', 
        description: 'Number of permissions to return (max 2000)',
        default: 10,
        minimum: 1,
        maximum: 2000
      },
      requireTotalCount: { 
        type: 'boolean', 
        description: 'Whether to include total count in response',
        default: true
      }
    },
    required: ['itemPath']
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether the request was successful'
      },
      data: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Response status',
            enum: ['success', 'error']
          },
          statusCode: {
            type: 'number',
            description: 'HTTP status code'
          },
          data: {
            type: 'object',
            properties: {
              permissions: {
                type: 'array',
                description: 'Array of permission objects',
                items: {
                  type: 'object',
                  properties: {
                    _id: {
                      type: 'string',
                      description: 'Unique identifier for the permission'
                    },
                    name: {
                      type: 'string',
                      description: 'Display name of the permission holder'
                    },
                    email: {
                      type: 'string',
                      description: 'Email address or URL of the permission holder'
                    },
                    access: {
                      type: 'array',
                      description: 'Array of access permissions granted',
                      items: {
                        type: 'string',
                        enum: ['READ', 'WRITE', 'DELETE', 'ADMIN', 'FULL_CONTROL']
                      }
                    },
                    type: {
                      type: 'string',
                      description: 'Type of permission holder',
                      enum: ['user', 'group', 'link', 'role', 'service']
                    },
                    subType: {
                      type: 'string',
                      description: 'Subtype of the permission holder (e.g., EMAIL, DOMAIN)',
                      nullable: true
                    },
                    grantType: {
                      type: 'string',
                      description: 'How the permission was granted',
                      enum: ['DIRECT', 'INHERITED', 'EFFECTIVE']
                    }
                  },
                  required: ['_id', 'name', 'email', 'access', 'type', 'grantType']
                }
              },
              totalCount: {
                type: 'number',
                description: 'Total number of permissions available'
              }
            },
            required: ['permissions', 'totalCount']
          },
          message: {
            type: 'string',
            description: 'Response message',
            nullable: true
          }
        },
        required: ['status', 'statusCode', 'data']
      }
    },
    required: ['success', 'data']
  }
}; 