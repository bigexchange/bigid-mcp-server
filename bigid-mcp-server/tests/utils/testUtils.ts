import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { BigIDMCPServer } from '../../dist/server';

export const createAjv = () => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  return ajv;
};

export async function waitForSandboxReady(server: BigIDMCPServer, maxMs: number = 300000, intervalMs: number = 5000) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const envelope: any = await (server as any).handleToolCall({ name: 'get_health_check', arguments: {} });
      const text = envelope?.result?.content;
      const parsed = text ? JSON.parse(text) : envelope?.error || {};
      if (parsed?.success) {
        // Consider healthy if no explicit error status
        return;
      }
    } catch (e) {
      // ignore and continue waiting
    }

    if (Date.now() - start > maxMs) {
      throw new Error('Sandbox did not become ready within the allotted time');
    }
    const remaining = Math.ceil((maxMs - (Date.now() - start)) / 1000);
    // Informative status log for long spin-ups
    // eslint-disable-next-line no-console
    console.log(`Waiting for sandbox backend to become ready... (${remaining}s remaining)`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}


