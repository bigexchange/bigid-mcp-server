export interface ToolSchemaDescriptor {
  name: string;
  description?: string;
  inputSchema?: any;
  outputSchema?: any;
}

/**
 * Central registry for original (full) tool input schemas and helpers
 * to generate truncated, token-efficient variants plus targeted expansions.
 */
export class SchemaRegistry {
  private toolNameToFullInputSchema: Map<string, any> = new Map();
  private toolNameToFullOutputSchema: Map<string, any> = new Map();

  constructor(toolSchemas: ToolSchemaDescriptor[]) {
    for (const tool of toolSchemas) {
      if (tool && tool.name && tool.inputSchema) {
        // Store a deep clone to avoid accidental in-place mutations
        this.toolNameToFullInputSchema.set(tool.name, SchemaRegistry.deepClone(tool.inputSchema));
      }
      if (tool && tool.name && tool.outputSchema) {
        this.toolNameToFullOutputSchema.set(tool.name, SchemaRegistry.deepClone(tool.outputSchema));
      }
    }
  }

  static deepClone<T>(value: T): T {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  getFullInputSchema(toolName: string): any | undefined {
    const schema = this.toolNameToFullInputSchema.get(toolName);
    return schema ? SchemaRegistry.deepClone(schema) : undefined;
  }

  getFullOutputSchema(toolName: string): any | undefined {
    const schema = this.toolNameToFullOutputSchema.get(toolName);
    return schema ? SchemaRegistry.deepClone(schema) : undefined;
  }

  /**
   * Produce a lazy/truncated version of an input schema.
   * - Keeps top-level shape
   * - Replaces nested objects/arrays with a shallow placeholder
   */
  createTruncatedInputSchema(fullSchema: any, maxDepth: number = 1): any {
    const clone = SchemaRegistry.deepClone(fullSchema);
    return this.truncateSchema(clone, 0, maxDepth);
  }

  /**
   * Expand and return a sub-schema for a given tool and JSON Pointer path.
   * If path is empty or '/', the full input schema is returned.
   */
  expand(toolName: string, jsonPointer: string = '', maxDepth: number = Infinity, schemaType: 'input' | 'output' = 'input'): any {
    const full = schemaType === 'output' ? this.getFullOutputSchema(toolName) : this.getFullInputSchema(toolName);
    if (!full) {
      throw new Error(`No ${schemaType} schema found for tool '${toolName}'`);
    }
    const target = this.resolveJsonPointer(full, jsonPointer);
    // Provide a deep clone and optionally truncate to requested depth starting from target
    const expanded = SchemaRegistry.deepClone(target);
    return this.truncateSchema(expanded, 0, Math.max(0, maxDepth));
  }

  /**
   * Minimal JSON Pointer resolver per RFC 6901.
   */
  private resolveJsonPointer(root: any, pointer: string): any {
    if (!pointer || pointer === '/') {
      return root;
    }
    if (pointer[0] !== '/') {
      // Accept property-style short path e.g. properties/structuredFilter
      pointer = '/' + pointer;
    }
    const segments = pointer
      .split('/')
      .slice(1)
      .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));

    let current: any = root;
    for (const segment of segments) {
      if (current == null) {
        throw new Error(`Invalid JSON Pointer. Segment '${segment}' not found.`);
      }
      if (Array.isArray(current)) {
        const index = segment === '-' ? current.length : parseInt(segment, 10);
        if (Number.isNaN(index) || index < 0 || index >= current.length) {
          throw new Error(`Array index '${segment}' out of bounds`);
        }
        current = current[index];
      } else if (typeof current === 'object') {
        if (!(segment in current)) {
          throw new Error(`Property '${segment}' not found in object`);
        }
        current = current[segment];
      } else {
        throw new Error(`Cannot traverse into non-object at segment '${segment}'`);
      }
    }
    return current;
  }

  /**
   * Recursively truncate a schema to a maximum depth.
   * - At depth >= maxDepth, strip nested properties/items and mark as expandable
   */
  private truncateSchema(node: any, depth: number, maxDepth: number): any {
    if (node == null || typeof node !== 'object') {
      return node;
    }

    // Preserve primitive or simple types untouched at shallow depth
    const type = node.type;
    if (depth >= maxDepth) {
      // Replace nested objects/arrays with shallow placeholders
      if (type === 'object') {
        const placeholder: any = { type: 'object' };
        if (node.description) {
          placeholder.description = `${node.description} (expandable; use expand_schema to load nested properties)`;
        } else {
          placeholder.description = 'Expandable object; use expand_schema to load nested properties';
        }
        return placeholder;
      }
      if (type === 'array') {
        const placeholder: any = { type: 'array' };
        if (node.description) {
          placeholder.description = `${node.description} (items expandable; use expand_schema to load item schema)`;
        } else {
          placeholder.description = 'Expandable array; use expand_schema to load item schema';
        }
        return placeholder;
      }
      // For unions/oneOf/allOf, collapse to a generic note
      if (node.oneOf || node.anyOf || node.allOf) {
        const placeholder: any = { description: 'Expandable composite schema; use expand_schema for details' };
        if (type) placeholder.type = type;
        return placeholder;
      }
      return node;
    }

    // Below maxDepth: recursively process common JSON Schema keywords
    const result: any = Array.isArray(node) ? [] : {};
    for (const key of Object.keys(node)) {
      switch (key) {
        case 'properties':
          result.properties = {};
          for (const propName of Object.keys(node.properties)) {
            result.properties[propName] = this.truncateSchema(node.properties[propName], depth + 1, maxDepth);
          }
          break;
        case 'items':
          result.items = this.truncateSchema(node.items, depth + 1, maxDepth);
          break;
        case 'oneOf':
        case 'anyOf':
        case 'allOf':
          result[key] = (node[key] as any[]).map((sub) => this.truncateSchema(sub, depth + 1, maxDepth));
          break;
        case 'definitions':
        case '$defs':
          result[key] = {};
          for (const defName of Object.keys(node[key])) {
            result[key][defName] = this.truncateSchema(node[key][defName], depth + 1, maxDepth);
          }
          break;
        default:
          result[key] = node[key];
      }
    }
    return result;
  }
}


