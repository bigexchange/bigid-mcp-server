import { BigIDMCPServer } from '../dist/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { metadataQuickSearchSchema } from '../src/schemas/metadataQuickSearchSchema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Metadata Quick Search Schema', () => {
  test('should validate schema with various originalField values', () => {
    const validate = ajv.compile(metadataQuickSearchSchema.outputSchema);
    
    // Test with different originalField values that might be returned by the API
    const testCases = [
      {
        success: true,
        data: {
          typeResults: [
            {
              type: 'file',
              count: 2,
              results: [
                {
                  primary: [
                    {
                      name: 'type',
                      value: 'file',
                      highlightedValue: null,
                      originalField: '_es_entityType' // string
                    },
                    {
                      name: 'id',
                      value: '12345',
                      highlightedValue: null,
                      originalField: '_id' // string
                    },
                    {
                      name: 'container',
                      value: 'Test Container',
                      highlightedValue: null,
                      originalField: 'containerName' // string
                    },
                    {
                      name: 'subContainerName',
                      value: null,
                      highlightedValue: null,
                      originalField: null // null value
                    },
                    {
                      name: 'application',
                      value: [['App1', 'App2']],
                      highlightedValue: null,
                      originalField: null // null value
                    }
                  ],
                  assets: [
                    {
                      name: 'source',
                      value: 'Test Source'
                    }
                  ],
                  type: 'file',
                  id: '12345'
                }
              ]
            }
          ]
        }
      },
      {
        success: true,
        data: {
          typeResults: [
            {
              type: 'rdb',
              count: 1,
              results: [
                {
                  primary: [
                    {
                      name: 'type',
                      value: 'rdb',
                      highlightedValue: null,
                      originalField: '_es_entityType'
                    },
                    {
                      name: 'description',
                      value: null,
                      highlightedValue: null,
                      originalField: 'description.value' // string with dot notation
                    },
                    {
                      name: 'displayName',
                      value: null,
                      highlightedValue: null,
                      originalField: 'displayName.value' // string with dot notation
                    }
                  ],
                  assets: [],
                  type: 'rdb',
                  id: '67890'
                }
              ]
            }
          ]
        }
      },
      {
        success: false,
        data: {
          typeResults: []
        },
        error: {
          code: 'SEARCH_ERROR',
          message: 'Search failed',
          retryable: true
        }
      }
    ];

    for (const testCase of testCases) {
      const isValid = validate(testCase);
      if (!isValid) {
        console.error('Schema validation failed:', validate.errors);
        console.error('Test case:', JSON.stringify(testCase, null, 2));
      }
      expect(isValid).toBe(true);
    }
  });

  test('should handle real-world response structure', () => {
    const validate = ajv.compile(metadataQuickSearchSchema.outputSchema);
    
    // Test with a structure similar to what we saw in the debug output
    const testCase = {
      success: true,
      data: {
        typeResults: [
          {
            type: 'othercatalog',
            count: 2,
            results: [
              {
                primary: [
                  {
                    name: 'type',
                    value: 'othercatalog',
                    highlightedValue: null,
                    originalField: '_es_entityType'
                  },
                  {
                    name: 'id',
                    value: '9bd5102b-dc8f-3465-bd37-2dce59b13bd8',
                    highlightedValue: null,
                    originalField: '_id'
                  },
                  {
                    name: 'container',
                    value: 'Sales Engineering',
                    highlightedValue: null,
                    originalField: 'containerName'
                  },
                  {
                    name: 'entityId',
                    value: 'Confluence.Sales Engineering/Making a Copy of the BigID Demo Environment for Testing and Customer Workshops',
                    highlightedValue: 'Confluence.Sales Engineering/Making a Copy of the BigID Demo Environment for <em>Test</em>ing and Customer Workshops',
                    originalField: 'fullyQualifiedName'
                  },
                  {
                    name: 'subContainerName',
                    value: null,
                    highlightedValue: null,
                    originalField: null
                  },
                  {
                    name: 'application',
                    value: [['Mail Communication']],
                    highlightedValue: null,
                    originalField: null
                  }
                ],
                assets: [
                  {
                    name: 'source',
                    value: 'Confluence'
                  }
                ],
                type: 'othercatalog',
                id: '9bd5102b-dc8f-3465-bd37-2dce59b13bd8'
              }
            ]
          }
        ]
      }
    };

    const isValid = validate(testCase);
    if (!isValid) {
      console.error('Schema validation failed:', validate.errors);
      console.error('Test case:', JSON.stringify(testCase, null, 2));
    }
    expect(isValid).toBe(true);
  });
}); 