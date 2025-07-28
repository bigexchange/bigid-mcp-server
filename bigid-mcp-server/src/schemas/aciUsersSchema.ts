export const aciUsersSchema = {
  name: 'get_aci_users',
  description: 'Get user accounts and their shared object counts for user access analysis',
  inputSchema: {
    type: 'object',
    properties: {
      skip: { type: 'number', description: 'Number of users to skip' },
      limit: { type: 'number', description: 'Number of users to return' },
      requireTotalCount: { type: 'boolean', description: 'Whether to include total count in response' },
      sort: { type: 'string', description: 'Sort criteria' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean'
      },
      data: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      description: 'User email address'
                    },
                    sharedObjectsCount: {
                      type: 'number',
                      description: 'Objects accessible to user'
                    },
                    external: {
                      type: 'boolean',
                      description: 'Whether user is external to organization'
                    },
                    dataSource: {
                      type: 'string',
                      description: 'Source system'
                    }
                  }
                }
              },
              totalCount: {
                type: 'number',
                description: 'Total users in system'
              }
            }
          }
        }
      }
    }
  }
}; 