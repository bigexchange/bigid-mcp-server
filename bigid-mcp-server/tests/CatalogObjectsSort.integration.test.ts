import { BigIDMCPServer } from '../dist/server';

const isSandboxSample =
  process.env.BIGID_DOMAIN === 'sandbox.bigid.tools' ||
  process.env.BIGID_USER_TOKEN === 'SAMPLE';

describe('Integration: get_catalog_objects without sort (sort removed)', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    jest.setTimeout(90000);
    server = new BigIDMCPServer();
    await server.initialize(true);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  (isSandboxSample ? test : test.skip)('succeeds without sort field', async () => {
    const args = { limit: 5, structuredFilter: { entityType: 'file' } } as any;
    const envelope: any = await (server as any).handleToolCall({ name: 'get_catalog_objects', arguments: args });
    const text = envelope?.result?.content;
    const parsed = text ? JSON.parse(text) : envelope?.error || {};
    expect(parsed).toBeDefined();
    expect(parsed.success).toBe(true);
    if (parsed?.data?.status && String(parsed.data.status).toLowerCase() === 'error') {
      throw new Error(`Backend returned error status: ${parsed.data.statusCode} ${parsed.data.message || ''}`);
    }
    expect(parsed.error).toBeUndefined();
  });
});


