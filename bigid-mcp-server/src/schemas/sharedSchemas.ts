// Shared schema definitions to avoid duplication across tool schemas

export const errorSchema = {
  oneOf: [
    { type: 'string' },
    { type: 'null' },
    {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        retryable: { type: 'boolean' }
      },
      additionalProperties: true
    }
  ],
  description: 'Error message if any, null if successful, or error object'
};

export const messageSchema = {
  oneOf: [
    { type: 'string' },
    { type: 'null' }
  ],
  description: 'Response message'
};

export const statusSchema = {
  type: 'string',
  description: 'Response status'
};

export const statusCodeSchema = {
  type: 'number',
  description: 'Response status code'
};

// Common response wrapper schema
export const successResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: { 
      oneOf: [
        { type: 'object' },
        { type: 'null' }
      ]
    },
    error: errorSchema,
    warnings: {
      type: 'array',
      description: 'Non-fatal validation warnings about the response structure',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } }
        },
        required: ['type']
      }
    }
  }
}; 

// Input schema for the expand_schema tool used by lazy-loading
export const expandSchemaInput = {
  type: 'object',
  properties: {
    toolName: { type: 'string', description: 'Name of the tool whose input schema to expand. Just the tool name, no prefixes' },
    path: { type: 'string', description: 'JSON Pointer path into the input schema (e.g., /properties/structuredFilter) or empty for root' },
    schemaType: { type: 'string', enum: ['input', 'output'], description: 'Which schema to expand. Defaults to input.', default: 'input' }
  },
  required: ['toolName'],
};
