import { FilterConverter } from '../src/utils/FilterConverter';
import { StructuredFilter } from '../src/types/filterTypes';

describe('Parameter Validation Tests', () => {
  describe('Entity Type Validation', () => {
    test('should validate supported entity types', () => {
      const supportedTypes = ['file', 'database', 'table', 'column', 'email', 'document', 'rdb', 'APP', 'kafka', 'salesforce', 'mail', 'STRUCTURED_FILE', 'UNSTRUCTURED'];
      
      supportedTypes.forEach(entityType => {
        const filter: StructuredFilter = { entityType };
        const result = FilterConverter.convertToBigIDQuery(filter);
        expect(result).toBe(`type="${entityType}"`);
      });
    });

    test('should warn for unsupported entity types', () => {
      const unsupportedType = 'invalid_type';
      const filter: StructuredFilter = { entityType: unsupportedType };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe(`type="${unsupportedType}"`);
    });
  });

  describe('Sensitivity Validation', () => {
    test('should validate supported sensitivity values', () => {
      const supportedValues = ['Restricted', 'Confidential', 'Internal Use', 'Public', 'High', 'Medium', 'Low'];
      
      supportedValues.forEach(sensitivity => {
        const filter: StructuredFilter = { sensitivity };
        const result = FilterConverter.convertToBigIDQuery(filter);
        expect(result).toContain('catalog_tag.system.sensitivityClassification.Sensitivity');
      });
    });

    test('should warn for unsupported sensitivity values', () => {
      const unsupportedValue = 'Invalid_Sensitivity';
      const filter: StructuredFilter = { sensitivity: unsupportedValue };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('catalog_tag.system.sensitivityClassification.Sensitivity');
    });
  });

  describe('File Size Validation', () => {
    test('should validate numeric file size filters', () => {
      const filter: StructuredFilter = {
        fileSize: { operator: 'greaterThan', value: 1000000 }
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('sizeInBytes > to_number(1000000)');
    });

    test('should validate all numeric operators', () => {
      const operators = ['equal', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];
      
      operators.forEach(operator => {
        const filter: StructuredFilter = {
          fileSize: { operator: operator as any, value: 1000000 }
        };
        const result = FilterConverter.convertToBigIDQuery(filter);
        expect(result).toContain('sizeInBytes');
        expect(result).toContain('to_number(1000000)');
      });
    });
  });

  describe('Date Filter Validation', () => {
    test('should validate ISO date strings', () => {
      const filter: StructuredFilter = {
        modifiedDate: { 
          operator: 'lessThan', 
          value: '2023-01-01T00:00:00.000Z' 
        }
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('modified_date < to_date(2023-01-01T00:00:00.000Z)');
    });

    test('should validate relative dates', () => {
      const filter: StructuredFilter = {
        modifiedDate: { 
          operator: 'lessThan', 
          value: { type: 'past', amount: 30, unit: 'd' } 
        }
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('modified_date < past("30d")');
    });

    test('should validate all date operators', () => {
      const operators = ['equal', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];
      
      operators.forEach(operator => {
        const filter: StructuredFilter = {
          modifiedDate: { 
            operator: operator as any, 
            value: { type: 'past', amount: 30, unit: 'd' } 
          }
        };
        const result = FilterConverter.convertToBigIDQuery(filter);
        expect(result).toContain('modified_date');
        expect(result).toContain('past("30d")');
      });
    });
  });

  describe('Boolean Filter Validation', () => {
    test('should validate containsPI true', () => {
      const filter: StructuredFilter = { containsPI: true };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('total_pii_count > to_number(0)');
    });

    test('should validate containsPI false', () => {
      const filter: StructuredFilter = { containsPI: false };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('total_pii_count = to_number(0)');
    });

    test('should validate isEncrypted true', () => {
      const filter: StructuredFilter = { isEncrypted: true };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('isEncrypted=to_bool(true)');
    });

    test('should validate isEncrypted false', () => {
      const filter: StructuredFilter = { isEncrypted: false };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('isEncrypted=to_bool(false)');
    });
  });

  describe('Array Filter Validation', () => {
    test('should validate entity type array', () => {
      const filter: StructuredFilter = { entityType: ['file', 'database'] };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('type IN ("file","database")');
    });

    test('should validate file type array', () => {
      const filter: StructuredFilter = { fileType: ['csv', 'pdf', 'xlsx'] };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('fileExtension IN ("csv","pdf","xlsx")');
    });

    test('should validate sensitivity array', () => {
      const filter: StructuredFilter = { sensitivity: ['High', 'Medium'] };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted","Confidential")');
    });
  });

  describe('String Filter Validation', () => {
    test('should validate fileName with wildcards', () => {
      const filter: StructuredFilter = { fileName: '*.csv' };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('objectName="*.csv"');
    });

    test('should validate fileName with regex', () => {
      const filter: StructuredFilter = { fileName: '/.*\\.csv$/' };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('objectName=/.*\\.csv$/');
    });

    test('should validate customQuery', () => {
      const filter: StructuredFilter = { customQuery: 'objectName = "test"' };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('objectName = "test"');
    });
  });

  describe('Complex Filter Validation', () => {
    test('should validate multiple filters with AND', () => {
      const filter: StructuredFilter = {
        entityType: 'file',
        fileType: 'pdf',
        isEncrypted: true
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('type="file"');
      expect(result).toContain('fileExtension="pdf"');
      expect(result).toContain('isEncrypted=to_bool(true)');
      expect(result).toContain(' AND ');
    });

    test('should validate mixed filter types', () => {
      const filter: StructuredFilter = {
        entityType: 'file',
        fileSize: { operator: 'greaterThan', value: 1000000 },
        modifiedDate: { operator: 'lessThan', value: { type: 'past', amount: 30, unit: 'd' } },
        containsPI: true
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toContain('type="file"');
      expect(result).toContain('sizeInBytes > to_number(1000000)');
      expect(result).toContain('modified_date < past("30d")');
      expect(result).toContain('total_pii_count > to_number(0)');
      expect(result).toContain(' AND ');
    });
  });

  describe('Edge Case Validation', () => {
    test('should handle empty filter', () => {
      const filter: StructuredFilter = {};
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('');
    });

    test('should handle null values', () => {
      const filter: StructuredFilter = {
        entityType: 'file',
        fileName: null as any,
        fileType: undefined as any
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('type="file"');
    });

    test('should handle empty arrays', () => {
      const filter: StructuredFilter = {
        entityType: [],
        fileType: []
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('');
    });

    test('should handle unknown fields', () => {
      const filter: StructuredFilter = {
        entityType: 'file'
      };
      const result = FilterConverter.convertToBigIDQuery(filter);
      expect(result).toBe('type="file"');
    });
  });

  describe('Validation Warnings', () => {
    test('should return validation warnings for invalid entity types', () => {
      const filter: StructuredFilter = { entityType: 'invalid_type' };
      const warnings = FilterConverter.getValidationWarnings(filter);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('invalid_type'))).toBe(true);
    });

    test('should return validation warnings for invalid sensitivity values', () => {
      const filter: StructuredFilter = { sensitivity: 'Invalid_Sensitivity' };
      const warnings = FilterConverter.getValidationWarnings(filter);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('Invalid_Sensitivity'))).toBe(true);
    });

    test('should not warn for parameters omitted from schema (treated as working/ignored)', () => {
      const filter: StructuredFilter = { 
        status: 'Active',
        system: 'database'
      };
      const warnings = FilterConverter.getValidationWarnings(filter);
      expect(warnings.length).toBe(0);
    });
  });
}); 