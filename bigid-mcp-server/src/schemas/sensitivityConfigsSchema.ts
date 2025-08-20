import { errorSchema, messageSchema } from './sharedSchemas';

export const sensitivityConfigsSchema = {
  name: 'get_sensitivity_configs',
  description: 'Get sensitivity classification group settings for managing sensitivity levels',
  inputSchema: {
    type: 'object',
    properties: {
      skip: {
        type: 'number',
        description: 'Number of configurations to skip (for pagination)'
      },
      limit: {
        type: 'number',
        description: 'Number of configurations to return (max 10000)',
        maximum: 10000
      },
      sort: {
        type: 'string',
        description: 'Sorting criteria. Example: sort by name ascending or descending'
      },
      filter: {
        type: 'string',
        description: 'Filter criteria for configurations'
      },
      requireTotalCount: {
        type: 'boolean',
        description: 'Whether to include total count in response'
      },
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          statusCode: { type: 'number' },
          data: {
            type: 'object',
            properties: {
              scConfigs: {
                type: 'array',
                description: 'List of sensitivity configurations',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Configuration ID' },
                    name: { type: 'string', description: 'Configuration name' },
                    description: { type: 'string', description: 'Configuration description' },
                    status: { type: 'string', description: 'Configuration status' },
                    classifications: {
                      type: 'array',
                      description: 'Classification levels',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Classification name' },
                          priority: { type: 'number', description: 'Classification priority' },
                          query: { type: 'string', description: 'Classification query' },
                          queryObj: {
                            oneOf: [
                              { type: 'object' },
                              { type: 'null' }
                            ],
                            description: 'Query object'
                          },
                          levelId: { type: 'string', description: 'Level ID' },
                        },
                        additionalProperties: true,
                      },
                    },
                    createdAt: { type: 'string', description: 'Creation timestamp' },
                    modifiedAt: { type: 'string', description: 'Last modification timestamp' },
                    actionId: { type: 'string', description: 'Action ID' },
                    actionStatus: { type: 'object', description: 'Action status' },
                    lastSuccess: { type: 'string', description: 'Last success timestamp' },
                    columnTagging: {
                      anyOf: [
                        { type: 'boolean' },
                        { type: 'null' },
                        { type: 'string' },
                        { type: 'number' },
                        { type: 'object' },
                        { type: 'array' }
                      ],
                      description: 'Column tagging setting (sandbox may return various types)'
                    },
                    dsTagging: {
                      anyOf: [
                        { type: 'boolean' },
                        { type: 'null' },
                        { type: 'string' },
                        { type: 'number' },
                        { type: 'object' },
                        { type: 'array' }
                      ],
                      description: 'Data source tagging setting (sandbox may return various types)'
                    },
                    updated_at: { type: 'string', description: 'Last update timestamp' },
                    defaultSc: { type: 'boolean', description: 'Whether this is the default sensitivity configuration' },
                    progress: { type: 'string', description: 'Progress information' },
                  },
                  additionalProperties: true,
                },
              },
              totalCount: { type: 'number', description: 'Total number of configurations' },
            },
          },
          message: messageSchema,
        },
      },
      error: errorSchema
    }
  }
}; 