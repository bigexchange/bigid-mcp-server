/// <reference types="jest" />
// Declare Jest globals to satisfy TypeScript in isolated linting
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const beforeAll: any;
declare const afterAll: any;
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { piiRecordsSchema } from '../src/schemas/piiRecordsSchema';
import { TEST_CONFIG } from './TestConfig';
import { BigIDMCPServer } from '../src/server';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
// Load .env from likely locations (server dir, repo root)
(() => {
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
})();

describe('PII Records Tool Schema Validation', () => {
  let server: any;

  const validateSchema = (result: any) => {
    const validate = ajv.compile(piiRecordsSchema.outputSchema);
    const isValid = validate(result);
    if (!isValid) {
      // eslint-disable-next-line no-console
      console.error('Schema validation failed for get_pii_records:', validate.errors);
      // eslint-disable-next-line no-console
      console.error('Result:', JSON.stringify(result, null, 2));
    }
    return isValid;
  };

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true);
  }, TEST_CONFIG.timeouts.initialization);

  afterAll(async () => {
    if (server) {
      await server.cleanup();
    }
  });

  test('get_pii_records should validate output schema (success or well-formed error)', async () => {
    try {
      const response = await server.handleToolCall({ name: 'get_pii_records', arguments: {} });
      const content = response.result?.content;
      const contentStr: string = typeof content === 'string' ? content : (() => { throw new Error('No content in response'); })();
      const parsed = JSON.parse(contentStr);
      expect(validateSchema(parsed)).toBe(true);
    } catch (error: any) {
      if (TEST_CONFIG.errorHandling.failOnApiError) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.log('API error for get_pii_records:', error.message);
    }
  }, TEST_CONFIG.timeouts.apiCall);

  test('get_pii_records error path should match errorSchema', async () => {
    // Simulate an internal error without changing the schema or server by temporarily patching the client
    const piiTools: any = (server as any)['piiTools'];
    const piiClient: any = piiTools['piiClient'];
    const originalGet = piiClient.getPiiRecords.bind(piiClient);
    try {
      // Clear any cached data to ensure the error path is exercised
      await (server as any)['cacheManager'].delete('pii_records');
      piiClient.getPiiRecords = async () => { throw new Error('Injected test error'); };
      const response = await server.handleToolCall({ name: 'get_pii_records', arguments: {} });
      const content = response.result?.content;
      const contentStr: string = typeof content === 'string' ? content : (() => { throw new Error('No content in response'); })();
      const parsed = JSON.parse(contentStr);
      expect(validateSchema(parsed)).toBe(true);
      expect(parsed.success).toBe(false);
      expect(parsed.error === null || typeof parsed.error === 'string' || typeof parsed.error === 'object').toBe(true);
    } finally {
      piiClient.getPiiRecords = originalGet;
    }
  }, TEST_CONFIG.timeouts.apiCall);
});


