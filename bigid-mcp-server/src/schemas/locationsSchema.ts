export const locationsSchema = {
  name: 'get_locations',
  description: 'Get geographic distribution of apps/systems/users for data residency compliance',
  inputSchema: {
    type: 'object',
    properties: {
      locationType: {
        type: 'string',
        enum: ['application', 'identity', 'system'],
        description: 'Type of location data to retrieve'
      }
    },
    required: ['locationType']
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
          system_locations: {
            type: 'array',
            description: 'Geographic distribution of data systems',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Location identifier'
                },
                name: {
                  type: 'string',
                  description: 'Country/region name'
                },
                count: {
                  type: 'number',
                  description: 'Amount of data in location'
                },
                systems: {
                  type: 'array',
                  description: 'Systems/applications in this location',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}; 