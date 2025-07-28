export const aciDataManagerSchema = {
  name: 'get_aci_data_manager',
  description: 'Get access control data across data sources for cross-system access analysis',
  inputSchema: {
    type: 'object',
    properties: {
      requireTotalCount: { type: 'boolean', description: 'Whether to include total count in response' },
      limit: { type: 'number', description: 'Number of items to return' },
      sort: { type: 'string', description: 'Sort criteria' },
      grouping: { type: 'string', description: 'Grouping criteria' },
      app_id: { type: 'string', description: 'Application ID filter' },
      skip: { type: 'number', description: 'Number of items to skip' }
    }
  }
}; 