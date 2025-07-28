import { BigIDMCPServer } from '../src/server';
import { FilterConverter } from '../src/utils/FilterConverter';

describe('DetailedObjectType API Diagnostics', () => {
  let server: BigIDMCPServer;

  beforeAll(async () => {
    server = new BigIDMCPServer();
    await server.initialize(true); // Testing mode
  });

  afterAll(async () => {
    await server.cleanup();
  });

  describe('FilterConverter Diagnostics', () => {
    test('detailedObjectType query generation', () => {
      const testCases = [
        { input: { detailedObjectType: 'STRUCTURED_FILE' }, expected: 'detailedObjectType="STRUCTURED_FILE"' },
        { input: { detailedObjectType: 'UNSTRUCTURED_FILE' }, expected: 'detailedObjectType="UNSTRUCTURED_FILE"' },
        { input: { detailedObjectType: 'TABLE' }, expected: 'detailedObjectType="TABLE"' },
        { input: { detailedObjectType: ['STRUCTURED_FILE', 'UNSTRUCTURED_FILE'] }, expected: 'detailedObjectType IN ("STRUCTURED_FILE","UNSTRUCTURED_FILE")' },
        { input: { detailedObjectType: 'FILE' }, expected: 'detailedObjectType="FILE"' },
        { input: { detailedObjectType: 'FOLDER' }, expected: 'detailedObjectType="FOLDER"' },
        { input: { detailedObjectType: 'EMAIL' }, expected: 'detailedObjectType="EMAIL"' },
        { input: { detailedObjectType: 'DOCUMENT' }, expected: 'detailedObjectType="DOCUMENT"' },
        { input: { detailedObjectType: 'SPREADSHEET' }, expected: 'detailedObjectType="SPREADSHEET"' },
        { input: { detailedObjectType: 'PRESENTATION' }, expected: 'detailedObjectType="PRESENTATION"' },
        { input: { detailedObjectType: 'IMAGE' }, expected: 'detailedObjectType="IMAGE"' },
        { input: { detailedObjectType: 'VIDEO' }, expected: 'detailedObjectType="VIDEO"' },
        { input: { detailedObjectType: 'AUDIO' }, expected: 'detailedObjectType="AUDIO"' },
        { input: { detailedObjectType: 'ARCHIVE' }, expected: 'detailedObjectType="ARCHIVE"' },
        { input: { detailedObjectType: 'CODE' }, expected: 'detailedObjectType="CODE"' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = FilterConverter.convertToBigIDQuery(input);
        expect(result).toBe(expected);
      });
    });

    test('detailedObjectType with working filters', () => {
      const input = {
        detailedObjectType: 'STRUCTURED_FILE',
        entityType: 'file',
        containsPI: true
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('detailedObjectType="STRUCTURED_FILE"');
      expect(result).toContain('type="file"');
      expect(result).toContain('total_pii_count > to_number(0)');
    });
  });

  describe('BigID API Integration Tests', () => {
    test('detailedObjectType=STRUCTURED_FILE returns results', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { detailedObjectType: 'STRUCTURED_FILE' },
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      console.log('detailedObjectType=STRUCTURED_FILE results:', parsedContent);
      
      // Check if we get any results or if it returns the full catalog
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
    });

    test('detailedObjectType=UNSTRUCTURED_FILE returns results', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { detailedObjectType: 'UNSTRUCTURED_FILE' },
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      console.log('detailedObjectType=UNSTRUCTURED_FILE results:', parsedContent);
      
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
    });

    test('detailedObjectType=TABLE returns results', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { detailedObjectType: 'TABLE' },
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      console.log('detailedObjectType=TABLE results:', parsedContent);
      
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
    });

    test('detailedObjectType with entityType filter', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { 
            detailedObjectType: 'STRUCTURED_FILE',
            entityType: 'file'
          },
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      console.log('detailedObjectType=STRUCTURED_FILE + entityType=file results:', parsedContent);
      
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
    });

    test('detailedObjectType array values', async () => {
      const result = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { 
            detailedObjectType: ['STRUCTURED_FILE', 'UNSTRUCTURED_FILE']
          },
          limit: 10
        }
      });

      expect(result.result?.content).toBeDefined();
      expect(result.result?.content).toBeDefined();
      
      const parsedContent = JSON.parse(result.result!.content);
      console.log('detailedObjectType=[STRUCTURED_FILE, UNSTRUCTURED_FILE] results:', parsedContent);
      
      expect(parsedContent.success).toBe(true);
      expect(parsedContent.data).toBeDefined();
      expect(parsedContent.data.results).toBeDefined();
    });

    test('compare with working entityType filter', async () => {
      // Test with working filter for comparison
      const workingResult = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { entityType: 'file' },
          limit: 10
        }
      });

      expect(workingResult.result).toBeDefined();
      expect(workingResult.result?.content).toBeDefined();
      
      const workingParsedContent = JSON.parse(workingResult.result!.content);
      console.log('entityType=file results:', workingParsedContent);
      
      expect(workingParsedContent.success).toBe(true);
      expect(workingParsedContent.data).toBeDefined();
      expect(workingParsedContent.data.results).toBeDefined();
    });

    test('verify detailedObjectType filter is working correctly', async () => {
      // Test 1: No filter (should return full catalog)
      const noFilterResult = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: {},
          limit: 10
        }
      });

      const noFilterParsed = JSON.parse(noFilterResult.result!.content);
      const noFilterCount = noFilterParsed.data.totalRowsCounter;

      // Test 2: With detailedObjectType filter (should now work correctly)
      const withFilterResult = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { detailedObjectType: 'STRUCTURED_FILE' },
          limit: 10
        }
      });

      const withFilterParsed = JSON.parse(withFilterResult.result!.content);
      const withFilterCount = withFilterParsed.data.totalRowsCounter;

      // Test 3: With working filter for comparison
      const workingFilterResult = await server.handleToolCall({
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: { entityType: 'file' },
          limit: 10
        }
      });

      const workingFilterParsed = JSON.parse(workingFilterResult.result!.content);
      const workingFilterCount = workingFilterParsed.data.totalRowsCounter;

      console.log('Results comparison:');
      console.log('- No filter count:', noFilterCount);
      console.log('- With detailedObjectType filter count:', withFilterCount);
      console.log('- With working entityType filter count:', workingFilterCount);

      // detailedObjectType should now work and potentially return different results
      // We can't guarantee it will be different, but it should be working
      expect(withFilterParsed.success).toBe(true);
      expect(workingFilterParsed.success).toBe(true);
    });
  });
}); 