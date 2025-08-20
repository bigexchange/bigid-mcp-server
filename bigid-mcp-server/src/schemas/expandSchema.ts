import { expandSchemaInput } from './sharedSchemas';

export const expandSchemaToolSchema = {
  name: 'expand_schema',
  description: 'Expand a tool\'s input schema at a given JSON Pointer path. Always available to fetch deeper, lazily-loaded schema parts.',
  inputSchema: expandSchemaInput,
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          toolName: { type: 'string' },
          path: { oneOf: [{ type: 'string' }, { type: 'null' }] },
          schemaType: { type: 'string', enum: ['input', 'output'] },
          schema: { type: 'object' }
        },
        required: ['toolName', 'schema']
      },
      error: {
        oneOf: [
          { type: 'string' },
          { type: 'null' }
        ]
      }
    },
    required: ['success']
  }
};


