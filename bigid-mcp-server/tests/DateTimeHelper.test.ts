import { DateTimeHelper } from '../src/utils/DateTimeHelper';

describe('DateTimeHelper', () => {
  describe('toISO8601', () => {
    test('should return null for null input', () => {
      const result = DateTimeHelper.toISO8601(null);
      expect(result).toBeNull();
    });

    test('should return undefined for undefined input', () => {
      const result = DateTimeHelper.toISO8601(undefined);
      expect(result).toBeUndefined();
    });

    test('should return ISO 8601 string for Date object', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = DateTimeHelper.toISO8601(date);
      expect(result).toBe('2023-12-25T10:30:00.000Z');
    });

    test('should return ISO 8601 string for timestamp number', () => {
      const timestamp = 1703508600000; // 2023-12-25T10:30:00Z
      const result = DateTimeHelper.toISO8601(timestamp);
      // Check that it's a valid ISO 8601 string for the expected date
      expect(result).toMatch(/^2023-12-25T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should return original string if not a date', () => {
      const result = DateTimeHelper.toISO8601('not a date');
      expect(result).toBe('not a date');
    });

    test('should convert YYYY-MM-DD format', () => {
      const result = DateTimeHelper.toISO8601('2023-12-25');
      expect(result).toBe('2023-12-25T00:00:00.000Z');
    });

    test('should convert MM/DD/YYYY format', () => {
      const result = DateTimeHelper.toISO8601('12/25/2023');
      // Check that it's a valid ISO 8601 string for the expected date
      expect(result).toMatch(/^2023-12-25T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should convert MM-DD-YYYY format', () => {
      const result = DateTimeHelper.toISO8601('12-25-2023');
      // Check that it's a valid ISO 8601 string for the expected date
      expect(result).toMatch(/^2023-12-25T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should return original if already ISO 8601', () => {
      const isoString = '2023-12-25T10:30:00.000Z';
      const result = DateTimeHelper.toISO8601(isoString);
      expect(result).toBe(isoString);
    });

    test('should handle ISO 8601 without milliseconds', () => {
      const isoString = '2023-12-25T10:30:00Z';
      const result = DateTimeHelper.toISO8601(isoString);
      expect(result).toBe(isoString);
    });
  });

  describe('processFilters', () => {
    test('should process DATE fieldType filters', () => {
      const filters = [
        {
          field: '_es_scanDate',
          operator: 'greaterThan',
          value: '2023-12-25',
          fieldType: 'DATE'
        }
      ];

      const result = DateTimeHelper.processFilters(filters);
      expect(result[0].value).toBe('2023-12-25T00:00:00.000Z');
    });

    test('should not process non-DATE fieldType filters', () => {
      const filters = [
        {
          field: 'source',
          operator: 'equal',
          value: 'database',
          fieldType: 'STRING'
        }
      ];

      const result = DateTimeHelper.processFilters(filters);
      expect(result[0].value).toBe('database');
    });

    test('should handle array values for DATE fieldType', () => {
      const filters = [
        {
          field: '_es_scanDate',
          operator: 'in',
          value: ['2023-12-25', '2023-12-26'],
          fieldType: 'DATE'
        }
      ];

      const result = DateTimeHelper.processFilters(filters);
      expect(result[0].value).toEqual([
        '2023-12-25T00:00:00.000Z',
        '2023-12-26T00:00:00.000Z'
      ]);
    });

    test('should handle mixed array values', () => {
      const filters = [
        {
          field: '_es_scanDate',
          operator: 'in',
          value: ['2023-12-25', 'not-a-date'],
          fieldType: 'DATE'
        }
      ];

      const result = DateTimeHelper.processFilters(filters);
      expect(result[0].value).toEqual([
        '2023-12-25T00:00:00.000Z',
        'not-a-date'
      ]);
    });

    test('should return original array if not an array', () => {
      const result = DateTimeHelper.processFilters('not an array' as any);
      expect(result).toBe('not an array');
    });
  });

  describe('processMetadataSearchRequest', () => {
    test('should process filters in metadata search request', () => {
      const request = {
        text: 'test',
        filter: [
          {
            field: '_es_scanDate',
            operator: 'greaterThan',
            value: '2023-12-25',
            fieldType: 'DATE'
          }
        ]
      };

      const result = DateTimeHelper.processMetadataSearchRequest(request);
      expect(result.filter[0].value).toBe('2023-12-25T00:00:00.000Z');
    });

    test('should not modify request without filters', () => {
      const request = {
        text: 'test'
      };

      const result = DateTimeHelper.processMetadataSearchRequest(request);
      expect(result).toEqual(request);
    });

    test('should handle null/undefined request', () => {
      expect(DateTimeHelper.processMetadataSearchRequest(null)).toBeNull();
      expect(DateTimeHelper.processMetadataSearchRequest(undefined)).toBeUndefined();
    });

    test('should handle non-object request', () => {
      expect(DateTimeHelper.processMetadataSearchRequest('string')).toBe('string');
    });
  });
}); 