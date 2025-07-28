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
        description: 'Sorting criteria as JSON array. Examples: [{"field": "name", "order": "asc"}]'
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
  }
}; 