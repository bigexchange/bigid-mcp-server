export const policiesSchema = {
  name: 'get_policies',
  description: 'Get all compliance policies and their status for policy management',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean'
      },
      data: {
        type: 'array',
        description: 'Compliance policies',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Policy name'
            },
            status: {
              type: 'string',
              description: 'Status: VIOLATED, UNVIOLATED'
            },
            findings: {
              type: 'object',
              properties: {
                findingsAmt: {
                  type: 'number',
                  description: 'Number of violations found'
                },
                violated: {
                  type: 'boolean',
                  description: 'Whether policy is currently violated'
                }
              }
            },
            severity: {
              type: 'string',
              description: 'Policy severity level'
            },
            description: {
              type: 'string',
              description: 'Policy description'
            }
          }
        }
      }
    }
  }
}; 