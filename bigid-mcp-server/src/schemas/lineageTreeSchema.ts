export const lineageTreeSchema = {
  name: 'get_lineage_tree',
  description: 'Get data relationships and lineage between datasets for impact analysis and GDPR mapping. Requires target: anchorCollections.',
  inputSchema: {
    type: 'object',
    properties: {
      anchorCollections: { 
        type: 'array', 
        description: 'Array of collection identifiers to establish relationships. Format: DataSource.Schema.Table. Example: Directory.public.identities',
        items: { type: 'string' },
        minItems: 1
      },
      anchorAttributeType: { 
        type: 'string', 
        description: 'Type of attributes to analyze for relationships. Examples: "idsor_attributes", "pii_attributes", "business_attributes"'
      },
    },
    required: ['anchorCollections'],
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
          lineageTree: {
            type: 'array',
            description: 'Data flow relationships',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                source: { type: 'string' },
                scanId: { type: 'string' },
                totalRows: { type: 'number' },
                totalRowsWithFindings: { type: 'number' },
                total_pii_count: { type: 'number' },
                fields: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fieldName: { type: 'string' },
                      fieldType: { type: 'string' },
                      fieldCount: { type: 'number' },
                      findingCount: { type: 'number' },
                      fieldClassifications: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            rank: { type: 'string' },
                            confidence_level: { type: 'number' }
                          }
                        }
                      },
                      fieldAttribute: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            rank: { type: 'string' },
                            confidence_level: { type: 'number' }
                          },
                          additionalProperties: true
                        }
                      }
                    },
                    additionalProperties: true
                  }
                },
                childs: {
                  type: 'array',
                  description: 'Downstream datasets',
                  items: {
                    type: 'object',
                    additionalProperties: true
                  }
                },
                connection_details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      linked_collection: { type: 'string' },
                      origin_fields: { type: 'string' },
                      destination_field: { type: 'string' },
                      type: { type: 'string' },
                      is_mirror: { type: 'boolean' }
                    },
                    additionalProperties: true
                  }
                },
                links_depth: { type: 'number' }
              },
              additionalProperties: true
            }
          }
        }
      }
    }
  }
}; 