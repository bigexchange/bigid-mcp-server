export const aciGroupsSchema = {
  name: 'get_aci_groups',
  description: 'Get user groups and memberships for group-based access analysis and role management',
  inputSchema: {
    type: 'object',
    properties: {
      skip: { type: 'number', description: 'Number of groups to skip' },
      limit: { type: 'number', description: 'Number of groups to return' },
      requireTotalCount: { type: 'boolean', description: 'Whether to include total count in response' },
      sort: { type: 'string', description: 'Sort criteria' }
    }
  }
}; 