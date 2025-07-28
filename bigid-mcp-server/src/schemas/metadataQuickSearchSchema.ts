export const metadataQuickSearchSchema = {
  name: 'metadata_quick_search',
  description: 'USE FOR DISCOVERY - Finding data by name/content, user interfaces, initial exploration. Returns results grouped by type with search highlighting. Performance: Fast, user-friendly. Use simple terms ("customer", "email") or wildcards ("*customer*"). Start with this for user-facing discovery.',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text to search for. Supports wildcards (* for broad searches). Examples: \'customer\', \'email\', \'*\' for all data'
      },
      filter: {
        type: 'array',
        description: 'Array of filter conditions to narrow search results. Multiple filters use AND logic.',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Field name to filter on. Common fields: \'type\' (entity type), \'source\' (data source), \'total_pii_count\', \'scanStatus\', \'container\', \'_es_entityType\''
            },
            operator: {
              type: 'string',
              enum: ['equal', 'notEqual', 'contains', 'notContains', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'in', 'exact', 'notExact'],
              description: 'Filter operator. Use \'in\' for array values, numeric operators for numbers, string operators for text'
            },
            value: {
              description: 'Value to filter by. Use array for \'in\' operator, single values for others',
              oneOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            fieldType: {
              type: 'string',
              enum: ['STRING', 'NUMBER', 'DATE', 'BOOLEAN'],
              description: 'Data type of the field being filtered'
            }
          },
          required: ['field', 'operator', 'value', 'fieldType']
        }
      },
      top: {
        type: 'integer',
        description: 'Number of top results to return per entity type (default: 10, recommended: 5-20 to avoid overwhelming responses)',
        minimum: 1,
        maximum: 100,
        default: 10
      }
    },
    required: ['text'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          typeResults: {
            type: 'array',
            description: 'Search results grouped by entity type',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['file', 'rdb', 'policy', 'actionable_insights_cases'],
                  description: 'Entity type - file (documents), rdb (database), policy (rules), actionable_insights_cases (security incidents)'
                },
                count: { 
                  type: 'integer', 
                  description: 'Total matches for this entity type' 
                },
                results: {
                  type: 'array',
                  description: 'Individual search results for this type',
                  items: {
                    type: 'object',
                    properties: {
                      primary: {
                        type: 'array',
                        description: 'Primary fields with highlighting for search matches',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', description: 'Field name' },
                            value: { description: 'Field value' },
                            highlightedValue: { 
                              type: 'string', 
                              description: 'Value with <em> tags around search matches' 
                            },
                            originalField: { type: 'string', description: 'Original field name' }
                          }
                        }
                      },
                      assets: { 
                        type: 'object', 
                        description: 'Detailed metadata and technical properties' 
                      },
                      type: { type: 'string', description: 'Entity type' },
                      id: { type: 'string', description: 'Unique identifier' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      error: { type: 'string' }
    }
  },
}; 