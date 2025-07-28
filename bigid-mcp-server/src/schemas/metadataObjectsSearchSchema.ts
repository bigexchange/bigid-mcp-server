export const metadataObjectsSearchSchema = {
  name: 'metadata_objects_search',
  description: 'Search for objects in the data explorer',
  inputSchema: {
    type: 'object',
    properties: {
      entityType: { type: 'string', description: 'The type of entity to search for' },
      searchText: { type: 'string', description: 'The text to search for' },
      paging: { type: 'object', description: 'A paging object' },
      sort: { type: 'array', items: { type: 'object' }, description: 'An array of sort objects' },
      isHighlight: { type: 'boolean', description: 'Whether to highlight results' },
      fieldsToProject: { type: 'array', items: { type: 'string' }, description: 'The fields to project' },
      offset: { type: 'object', description: 'An offset object' },
      needToHighlight: { type: 'boolean', description: 'Whether to highlight results' },
    },
    required: ['searchText'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            description: 'Data explorer objects with rich metadata',
            items: {
              type: 'object',
              properties: {
                entityType: {
                  type: 'string',
                  enum: ['catalog', 'actionable_insights_cases', 'rdb'],
                  description: 'Entity type - catalog (data objects), actionable_insights_cases (security cases), rdb (database objects)'
                },
                data: {
                  type: 'object',
                  description: 'Object data varies by entity type but includes core identification fields',
                  properties: {
                    fullyQualifiedName: { type: 'string', description: 'Unique object path identifier' },
                    fileName: { type: 'string', description: 'File or object name' },
                    source: { type: 'string', description: 'Data source system' },
                    dataSourceName: { type: 'string', description: 'Data source display name' },
                    tags: { type: 'array', description: 'Classification and metadata tags' },
                    category: { type: 'array', description: 'Data categories and classifications' },
                    updated_at: { type: 'object', description: 'Last update timestamp object' },
                    sizeInBytes: { type: 'number', description: 'Object size in bytes' },
                    scanDate: { type: 'string', description: 'Last scan timestamp' }
                  }
                }
              }
            }
          },
          offset: {
            type: 'object',
            description: 'Pagination continuation token',
            properties: {
              offsetKey: { 
                type: 'array',
                description: 'Key for retrieving next page of results'
              }
            }
          }
        }
      },
      error: { type: 'string' }
    }
  },
}; 