export const aciDataManagerPermissionsSchema = {
  name: 'get_aci_data_manager_permissions',
  description: 'Get detailed permissions for specific files/folders for granular permission analysis',
  inputSchema: {
    type: 'object',
    properties: {
      itemPath: { type: 'string', description: 'Path to the data manager item' },
      skip: { type: 'number', description: 'Number of permissions to skip' },
      limit: { type: 'number', description: 'Number of permissions to return' },
      requireTotalCount: { type: 'boolean', description: 'Whether to include total count in response' }
    },
    required: ['itemPath']
  }
}; 