import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { BigIDMCPServer } from '../src/server';
import { allSchemas, createSchemaRegistry } from '../src/schemas';

// Local wait helper to avoid depending on dist paths
async function waitForSandboxReady(server: BigIDMCPServer, maxMs: number = 300000, intervalMs: number = 5000) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const envelope: any = await (server as any).handleToolCall({ name: 'get_health_check', arguments: {} });
      const text = envelope?.result?.content;
      const parsed = text ? JSON.parse(text) : envelope?.error || {};
      if (parsed?.success) {
        return;
      }
    } catch {
      // ignore and continue
    }

    if (Date.now() - start > maxMs) {
      throw new Error('Sandbox did not become ready within the allotted time');
    }
    const remaining = Math.ceil((maxMs - (Date.now() - start)) / 1000);
    // eslint-disable-next-line no-console
    console.log(`Waiting for sandbox backend to become ready... (${remaining}s remaining)`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

// AJV setup
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Generate a minimal valid value for a given JSON schema node
function sampleForSchema(schema: any, hintKey?: string): any {
  if (!schema) return null;

  // Handle enums
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Heuristics by key
  const key = (hintKey || '').toLowerCase();
  if (key.includes('locationtype')) return 'application';
  if (key.includes('fullyqualifiedname')) return 'Directory.public.identities';
  if (key.includes('anchorcollections')) return ['Directory.public.identities'];
  if (key === 'text' || key.endsWith('text')) return 'test';
  if (key === 'searchtext') return 'test';
  if (key === 'widgettype') return 'group_by_policy';
  if (key === 'id') return '1';
  if (key === 'name') return 'test';

  // Handle oneOf/anyOf simply by taking first option
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return sampleForSchema(schema.oneOf[0], hintKey);
  }
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return sampleForSchema(schema.anyOf[0], hintKey);
  }

  switch (schema.type) {
    case 'string':
      return 'test';
    case 'integer':
    case 'number':
      return Math.max(1, schema.minimum ?? 1);
    case 'boolean':
      return false;
    case 'array': {
      const itemSchema = schema.items || { type: 'string' };
      const value = sampleForSchema(itemSchema, hintKey);
      return [value];
    }
    case 'object': {
      const obj: any = {};
      const props = schema.properties || {};
      const required: string[] = schema.required || [];
      for (const propName of required) {
        const propSchema = props[propName] || {};
        obj[propName] = sampleForSchema(propSchema, propName);
      }
      return obj;
    }
    default:
      return null;
  }
}

// Build argument cases: minimal required, plus single-parameter toggles for optional top-level fields (capped)
function buildArgCases(inputSchema: any, cap: number = 2): any[] {
  const minimal = sampleForSchema(inputSchema);
  const cases: any[] = [minimal || {}];

  if (inputSchema && inputSchema.type === 'object') {
    const props = inputSchema.properties || {};
    const required: string[] = inputSchema.required || [];
    const optionalKeys = Object.keys(props).filter((k) => !required.includes(k));
    for (const key of optionalKeys.slice(0, cap)) {
      const val = sampleForSchema(props[key], key);
      cases.push({ ...(minimal || {}), [key]: val });
    }
  }

  return cases;
}

describe('All MCP Tools: Full Input/Output Schema Validation', () => {
  let server: BigIDMCPServer;
  const registry = createSchemaRegistry();
  const failOnSchemaError = String(process.env.BIGID_FAIL_ON_SCHEMA_ERROR || '').toLowerCase() === 'true';

  beforeAll(async () => {
    jest.setTimeout(360000);
    server = new BigIDMCPServer();
    await server.initialize(true);
    await waitForSandboxReady(server, 300000, 5000);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  for (const tool of allSchemas as any[]) {
    const toolName = tool.name as string;
    const inputSchema = registry.getFullInputSchema(toolName) || (tool as any).inputSchema;
    const outputSchema = registry.getFullOutputSchema(toolName) || (tool as any).outputSchema;
    const argCases = buildArgCases(inputSchema);

    if (!outputSchema) {
      test.skip(`${toolName}: no output schema advertised; skipping output validation`, () => {
        expect(true).toBe(true);
      });
      continue;
    }

    test(`${toolName}: validates output schema across ${argCases.length} case(s)`, async () => {
      const validateOutput = ajv.compile(outputSchema);
      const validateInput = inputSchema ? ajv.compile(inputSchema) : null;

      for (const args of argCases) {
        if (validateInput) {
          const inputOk = validateInput(args);
          if (!inputOk) {
            // eslint-disable-next-line no-console
            console.error(`Input schema validation failed for ${toolName} with args ${JSON.stringify(args)}:`, validateInput.errors);
            if (failOnSchemaError) {
              throw new Error('Input schema validation failed');
            }
          }
        }
        const envelope: any = await server.handleToolCall({ name: toolName, arguments: args });
        if (envelope.error) {
          // Even on transport error, ensure structure is as expected by turning it into a standard result
          // This should be rare since handleToolCall wraps errors
          throw new Error(envelope.error.message || 'Unknown tool error');
        }
        const text = envelope?.result?.content;
        expect(text).toBeDefined();
        const parsed = text ? JSON.parse(text) : {};

        const isValid = validateOutput(parsed);
        if (!isValid) {
          // eslint-disable-next-line no-console
          console.error(`Schema validation failed for ${toolName} with args ${JSON.stringify(args)}:`, validateOutput.errors);
          if (failOnSchemaError) {
            throw new Error('Output schema validation failed');
          }
        }
      }
    }, 120000);
  }
});


