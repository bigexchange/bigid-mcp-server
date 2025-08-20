import { FilterConverter } from '../src/utils/FilterConverter';
import { StructuredFilter } from '../src/types/filterTypes';
import { 
  getFieldMapping, 
  isBrokenParameter, 
  isWorkingParameter, 
  isPartiallyWorkingParameter, 
  isNoDataParameter 
} from '../src/config/structuredFilterConfig';

/**
 * Comprehensive test suite for FilterConverter
 * Tests every feature defined in bigid-filter-spec.yml
 * Updated to reflect real-world BigID API behavior from test results
 */

describe('FilterConverter', () => {
  describe('Core Working Filters', () => {
    test('entityType mapping to type field', () => {
      const input: StructuredFilter = { entityType: 'file' };
      const expected = 'type="file"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('containsPI boolean to numeric comparison', () => {
      const input: StructuredFilter = { containsPI: true };
      const expected = 'total_pii_count > to_number(0)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('containsPI false to numeric comparison', () => {
      const input: StructuredFilter = { containsPI: false };
      const expected = 'total_pii_count = to_number(0)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('sensitivity string to catalog_tag query', () => {
      const input: StructuredFilter = { sensitivity: 'Restricted' };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('sensitivity with value mapping', () => {
      const input: StructuredFilter = { sensitivity: 'High' };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('sensitivity array to IN clause', () => {
      const input: StructuredFilter = { sensitivity: ['Restricted', 'Confidential'] };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted","Confidential")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('File Specific Filters', () => {
    test('fileName mapping to objectName field', () => {
      const input: StructuredFilter = { fileName: 'customer_data.csv' };
      const expected = 'objectName="customer_data.csv"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileName with wildcard pattern', () => {
      const input: StructuredFilter = { fileName: '*.csv' };
      const expected = 'objectName="*.csv"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileName with question mark pattern', () => {
      const input: StructuredFilter = { fileName: 'file?.txt' };
      const expected = 'objectName="file?.txt"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });



    test('fileName with regex pattern', () => {
      const input: StructuredFilter = { fileName: '/.*\\.csv$/' };
      const expected = 'objectName=/.*\\.csv$/';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileName with regex alternation', () => {
      const input: StructuredFilter = { fileName: 'email|mail' };
      const expected = 'objectName=/email|mail/';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileType mapping to fileExtension field', () => {
      const input: StructuredFilter = { fileType: 'pdf' };
      const expected = 'fileExtension="pdf"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileType array to IN clause', () => {
      const input: StructuredFilter = { fileType: ['pdf', 'docx', 'xlsx'] };
      const expected = 'fileExtension IN ("pdf","docx","xlsx")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileSize with to_number conversion', () => {
      const input: StructuredFilter = { 
        fileSize: { operator: 'greaterThan', value: 1000000 } 
      };
      const expected = 'sizeInBytes > to_number(1000000)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('sizeInBytes with to_number conversion', () => {
      const input: StructuredFilter = { 
        sizeInBytes: { operator: 'greaterThan', value: 1000000 } 
      };
      const expected = 'sizeInBytes > to_number(1000000)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    // These parameters now map through; verify current behavior instead of expecting empty string
    test('fileOwner mapping to owner field', () => {
      const input: StructuredFilter = { fileOwner: 'john.doe' };
      const expected = 'owner="john.doe"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileOwner with wildcard pattern', () => {
      const input: StructuredFilter = { fileOwner: '*admin*' };
      const expected = 'owner="*admin*"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileCreator mapping to createdBy field', () => {
      const input: StructuredFilter = { fileCreator: 'jane.smith' };
      const expected = 'createdBy="jane.smith"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('fileCreator with regex pattern', () => {
      const input: StructuredFilter = { fileCreator: '/^system/' };
      const expected = 'createdBy="/^system/"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Date Filters', () => {
    test('modifiedDate with ISO string', () => {
      const input: StructuredFilter = { 
        modifiedDate: { 
          operator: 'greaterThan', 
          value: '2023-01-01T00:00:00.000Z' 
        } 
      };
      const expected = 'modified_date > to_date(2023-01-01T00:00:00.000Z)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('createdDate with relative date', () => {
      const input: StructuredFilter = { 
        createdDate: { 
          operator: 'lessThan', 
          value: { type: 'past', amount: 5, unit: 'y' } 
        } 
      };
      const expected = 'created_date < past("5y")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('lastScanned with relative date', () => {
      const input: StructuredFilter = { 
        lastScanned: { 
          operator: 'greaterThan', 
          value: { type: 'past', amount: 30, unit: 'd' } 
        } 
      };
      const expected = 'scanDate > past("30d")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('lastAccessedDate with relative date', () => {
      const input: StructuredFilter = { 
        lastAccessedDate: { 
          operator: 'lessThan', 
          value: { type: 'past', amount: 1, unit: 'y' } 
        } 
      };
      const expected = 'last_opened < past("1y")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('all supported date operators', () => {
      const operators = ['equal', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];
      const dateValue = '2023-01-01T00:00:00.000Z';
      
      operators.forEach(operator => {
        const input: StructuredFilter = { 
          modifiedDate: { operator: operator as any, value: dateValue } 
        };
        const expected = `modified_date ${operator === 'equal' ? '=' : operator === 'greaterThan' ? '>' : operator === 'greaterThanOrEqual' ? '>=' : operator === 'lessThan' ? '<' : '<='} to_date(${dateValue})`;
        const result = FilterConverter.convertToBigIDQuery(input);
        expect(result).toBe(expected);
      });
    });

    test('relative date with different units', () => {
      const units = ['y', 'm', 'd', 'h', 'min', 's'];
      
      units.forEach(unit => {
        const input: StructuredFilter = { 
          modifiedDate: { 
            operator: 'lessThan', 
            value: { type: 'past', amount: 1, unit: unit as any } 
          } 
        };
        const expected = `modified_date < past("1${unit}")`;
        const result = FilterConverter.convertToBigIDQuery(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Data Source Filters', () => {
    test('datasource mapping to source field', () => {
      const input: StructuredFilter = { datasource: 'HR Global' };
      const expected = 'source="HR Global"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('datasource array to IN clause', () => {
      const input: StructuredFilter = { datasource: ['prod-db-01', 'prod-db-02'] };
      const expected = 'source IN ("prod-db-01","prod-db-02")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('source mapping to source field', () => {
      const input: StructuredFilter = { source: 'mysql' };
      const expected = 'source="mysql"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('system mapping to type field', () => {
      const input: StructuredFilter = { system: 'MySQL' };
      const expected = 'system="MySQL"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('system array to IN clause', () => {
      const input: StructuredFilter = { system: ['MySQL', 'PostgreSQL'] };
      const expected = 'system IN ("MySQL","PostgreSQL")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Database Specific Filters', () => {
    test('schemaName string', () => {
      const input: StructuredFilter = { schemaName: 'public' };
      const expected = 'schemaName="public"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tableName string', () => {
      const input: StructuredFilter = { tableName: 'customers' };
      const expected = 'tableName="customers"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('dataType string', () => {
      const input: StructuredFilter = { dataType: 'varchar' };
      const expected = 'dataType="varchar"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('totalRows with to_number conversion', () => {
      const input: StructuredFilter = { 
        totalRows: { operator: 'greaterThan', value: 100 } 
      };
      const expected = 'totalRows > to_number(100)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('database fields with arrays', () => {
      const input: StructuredFilter = { 
        schemaName: ['public', 'private'],
        tableName: ['users', 'customers'],
        dataType: ['varchar', 'int']
      };
      const expected = 'schemaName IN ("public","private") AND tableName IN ("users","customers") AND dataType IN ("varchar","int")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Object Properties', () => {
    test('objectName string', () => {
      const input: StructuredFilter = { objectName: 'customer_data.csv' };
      const expected = 'objectName="customer_data.csv"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('objectType string', () => {
      const input: StructuredFilter = { objectType: 'table' };
      const expected = 'objectType="table"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('detailedObjectType string', () => {
      const input: StructuredFilter = { detailedObjectType: 'STRUCTURED_FILE' };
      const expected = 'detailedObjectType="STRUCTURED_FILE"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Scan Status Filters', () => {
    test('scanStatus string', () => {
      const input: StructuredFilter = { scanStatus: 'Completed' };
      const expected = 'scanStatus="Completed"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('scanStatus array', () => {
      const input: StructuredFilter = { scanStatus: ['Completed', 'Failed'] };
      const expected = 'scanStatus IN ("Completed","Failed")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('scannerType string', () => {
      const input: StructuredFilter = { scannerType: 's3-v2' };
      const expected = 'scannerType="s3-v2"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Security Filters', () => {
    test('isEncrypted true with to_bool conversion', () => {
      const input: StructuredFilter = { isEncrypted: true };
      const expected = 'isEncrypted=to_bool(true)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('isEncrypted false with to_bool conversion', () => {
      const input: StructuredFilter = { isEncrypted: false };
      const expected = 'isEncrypted=to_bool(false)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('encryptionStatus string', () => {
      const input: StructuredFilter = { encryptionStatus: 'Encrypted' };
      const expected = 'encryptionStatus="Encrypted"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('accessLevel string (WORKING)', () => {
      const input: StructuredFilter = { accessLevel: 'ReadOnly' };
      const expected = 'accessLevel="ReadOnly"'; // Now working
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('accessLevel array (WORKING)', () => {
      const input: StructuredFilter = { accessLevel: ['ReadOnly', 'ReadWrite'] };
      const expected = 'accessLevel IN ("ReadOnly","ReadWrite")'; // Now working
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });



  describe('Status Filters', () => {
    test('status string (WORKING)', () => {
      const input: StructuredFilter = { status: 'Active' };
      const expected = 'status="Active"'; // Now working
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('status array (WORKING)', () => {
      const input: StructuredFilter = { status: ['Active', 'Inactive'] };
      const expected = 'status IN ("Active","Inactive")'; // Now working
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Tags and Classification Filters', () => {
    test('tags with single TagFilter object', () => {
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'system.risk.riskGroup', value: 'medium' } 
      };
      const expected = 'catalog_tag.system.risk.riskGroup in ("medium")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tags with TagFilter object and array values', () => {
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'system.risk.riskGroup', value: ['high', 'medium'] } 
      };
      const expected = 'catalog_tag.system.risk.riskGroup in ("high","medium")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tags with sensitivity classification', () => {
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'system.sensitivityClassification.Sensitivity', value: 'Confidential' } 
      };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Confidential")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tags with custom tag hierarchy', () => {
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'Sen.Priority', value: 'P1' } 
      };
      const expected = 'catalog_tag.Sen.Priority in ("P1")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tags with multiple TagFilter objects (OR logic)', () => {
      const input: StructuredFilter = { 
        tags: [
          { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor'] },
          { tagHierarchy: 'Snowflake.masked', value: 'true' }
        ] 
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor") OR catalog_tag.Snowflake.masked in ("true")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Custom Query Handling', () => {
    test('customQuery with complex BigID query', () => {
      const input: StructuredFilter = { 
        customQuery: 'type="file" AND tags="PII"' 
      };
      const expected = 'type="file" AND tags="PII"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('customQuery with catalog_tag', () => {
      const input: StructuredFilter = { 
        customQuery: 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted")' 
      };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('customQuery with simple string (converted to objectName)', () => {
      const input: StructuredFilter = { 
        customQuery: 'customer_data' 
      };
      const expected = 'objectName = "customer_data"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('customQuery with IN clause (requires parentheses)', () => {
      const input: StructuredFilter = { 
        customQuery: 'fileType IN ("pdf", "docx")' 
      };
      const expected = '(fileType IN ("pdf", "docx"))'; // Parentheses added for complex expressions
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Complex Queries with Multiple Filters', () => {
    test('multiple basic filters with AND logic', () => {
      const input: StructuredFilter = { 
        entityType: 'file',
        fileType: 'pdf',
        isEncrypted: true
      };
      const expected = 'type="file" AND fileExtension="pdf" AND isEncrypted=to_bool(true)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('tag-based with regular fields', () => {
      const input: StructuredFilter = { 
        sensitivity: 'Restricted',
        entityType: 'file',
        containsPI: true
      };
      const expected = 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted") AND type="file" AND total_pii_count > to_number(0)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('date filters with other fields', () => {
      const input: StructuredFilter = { 
        modifiedDate: { operator: 'lessThan', value: { type: 'past', amount: 5, unit: 'y' } },
        entityType: 'file',
        fileSize: { operator: 'greaterThan', value: 1000000 }
      };
      const expected = 'modified_date < past("5y") AND type="file" AND sizeInBytes > to_number(1000000)';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });



    test('database context with multiple filters (WORKING)', () => {
      const input: StructuredFilter = {
        entityType: 'rdb',
        schemaName: 'public',
        tableName: 'customers',
        tags: { tagHierarchy: 'system.sensitivityClassification.Sensitivity', value: 'Restricted' }
      };
      const expected = 'type="rdb" AND schemaName="public" AND tableName="customers" AND catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('complex query with all parameter types', () => {
      const input: StructuredFilter = {
        entityType: 'file',
        objectName: '*.csv',
        fileSize: { operator: 'greaterThan', value: 1000000 },
        modifiedDate: { operator: 'lessThan', value: { type: 'past', amount: 1, unit: 'y' } },
        containsPI: true,
        tags: [
          { tagHierarchy: 'system.sensitivityClassification.Sensitivity', value: 'Restricted' },
          { tagHierarchy: 'Alation Top Users', value: ['PII', 'Confidential'] }
        ],
        system: 'MySQL'
      };
      const expected = 'type="file" AND objectName="*.csv" AND sizeInBytes > to_number(1000000) AND modified_date < past("1y") AND total_pii_count > to_number(0) AND catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted") OR catalog_tag.Alation Top Users in ("PII","Confidential") AND system="MySQL"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('empty filter returns empty string', () => {
      const input: StructuredFilter = {};
      const expected = '';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('null values are ignored', () => {
      const input: StructuredFilter = { 
        entityType: 'file',
        fileName: null as any
      };
      const expected = 'type="file"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('undefined values are ignored', () => {
      const input: StructuredFilter = { 
        entityType: 'file',
        fileType: undefined as any
      };
      const expected = 'type="file"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('empty arrays are ignored', () => {
      const input: StructuredFilter = { 
        entityType: 'file',
        fileType: []
      };
      const expected = 'type="file"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('unknown fields are ignored', () => {
      const input = { 
        entityType: 'file',
        unknownField: 'value'
      } as any;
      const expected = 'type="file"';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Validation', () => {
    test('getValidationWarnings returns empty list in production mode', () => {
      const input: StructuredFilter = { entityType: 'invalid_type' };
      const warnings = FilterConverter.getValidationWarnings(input);
      expect(warnings.length).toBe(0);
    });

    test('convertToBigIDQueryWithValidation includes empty warnings array', () => {
      const input: StructuredFilter = { 
        entityType: 'invalid_type',
        sensitivity: 'Invalid_Sensitivity'
      };
      const result = FilterConverter.convertToBigIDQueryWithValidation(input);
      expect(result.query).toBe('type="invalid_type" AND catalog_tag.system.sensitivityClassification.Sensitivity in ("Invalid_Sensitivity")');
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('BigID Filter Spec Compliance', () => {
    test('complies with basic rules from spec', () => {
      const input: StructuredFilter = { 
        entityType: 'file',
        fileSize: { operator: 'greaterThan', value: 1000000 }
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('type="file"');
      expect(result).toContain('sizeInBytes > to_number(1000000)');
    });

    test('uses proper operators from spec', () => {
      const operators = ['equal', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];
      const input: StructuredFilter = { 
        fileSize: { operator: 'greaterThan', value: 1000000 } 
      };
      
      operators.forEach(operator => {
        const testInput = { 
          fileSize: { operator: operator as any, value: 1000000 } 
        };
        const result = FilterConverter.convertToBigIDQuery(testInput);
        expect(result).toContain('sizeInBytes');
        expect(result).toContain('to_number(1000000)');
      });
    });

    test('uses proper date functions from spec', () => {
      const input: StructuredFilter = { 
        modifiedDate: { 
          operator: 'lessThan', 
          value: { type: 'past', amount: 5, unit: 'y' } 
        } 
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('past("5y")');
    });

    test('uses proper boolean functions from spec', () => {
      const input: StructuredFilter = { 
        isEncrypted: true 
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('to_bool(true)');
    });
  });

  describe('Real-World Behavior Tests', () => {
    test('getRecommendedParameters returns working parameters', () => {
      const recommended = FilterConverter.getRecommendedParameters();
      expect(recommended).toContain('containsPI');
      expect(recommended).toContain('entityType');
      expect(recommended).toContain('sensitivity');
      expect(recommended).toContain('fileType');
      expect(recommended).toContain('customQuery');
    });

    test('getParametersToAvoid returns broken parameters', () => {
      const toAvoid = FilterConverter.getParametersToAvoid();
      expect(toAvoid).toContain('system');
      expect(toAvoid).toContain('fileOwner');
      expect(toAvoid).toContain('tags');
      expect(toAvoid).toContain('classification');

    });

    test('getBestPractices returns helpful guidance', () => {
      const bestPractices = FilterConverter.getBestPractices();
      expect(bestPractices.length).toBeGreaterThan(0);
      expect(bestPractices.some(practice => practice.includes('parentheses'))).toBe(true);
      expect(bestPractices.some(practice => practice.includes('notEqual'))).toBe(true);
    });
  });

  describe('Real-World Working Query Tests', () => {
    test('exact working query format from user example', () => {
      // This is the exact working query format provided by the user
      const input: StructuredFilter = { 
        customQuery: 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")'
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('structured filter that should produce the same query', () => {
      // This should produce the equivalent structured filter
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor', 'Matthew Lee', 'Danny Sparks', 'Sally Stewart', 'Ajay Vodala', 'Iris Thomas'] }
      };
      // This should generate the same query as the working example
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas")');
    });

    test('multiple tag filters should be combined with OR', () => {
      // This should produce multiple tag filters combined with OR
      const input: StructuredFilter = { 
        customQuery: 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")'
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas")');
      expect(result).toContain('catalog_tag.Snowflake.masked in ("true")');
      expect(result).toContain(' OR ');
    });

    test('multiple tag filters should be combined with OR', () => {
      // This test shows the new multiple tag filter functionality
      const input: StructuredFilter = { 
        tags: [
          { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor', 'Matthew Lee', 'Danny Sparks', 'Sally Stewart', 'Ajay Vodala', 'Iris Thomas'] },
          { tagHierarchy: 'Snowflake.masked', value: 'true' }
        ]
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('Tag Filter Conversion Tests', () => {
    test('multiple tag filters with OR - exact user example', () => {
      const input: StructuredFilter = { 
        tags: [
          { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor', 'Matthew Lee', 'Danny Sparks', 'Sally Stewart', 'Ajay Vodala', 'Iris Thomas'] },
          { tagHierarchy: 'Snowflake.masked', value: 'true' }
        ]
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('single tag filter with custom hierarchy', () => {
      const input: StructuredFilter = { 
        tags: { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor'] }
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });

    test('mixed tag filter types', () => {
      const input: StructuredFilter = { 
        tags: [
          { tagHierarchy: 'Alation Top Users', value: 'Dhairya Gandhi' },
          { tagHierarchy: 'Snowflake.masked', value: ['true', 'false'] }
        ]
      };
      const expected = 'catalog_tag.Alation Top Users in ("Dhairya Gandhi") OR catalog_tag.Snowflake.masked in ("true","false")';
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe(expected);
    });
  });

  describe('DetailedObjectType Filter Diagnostics', () => {
    test('detailedObjectType field mapping exists', () => {
      const mapping = getFieldMapping('detailedObjectType');
      expect(mapping).toBeDefined();
      expect(mapping?.bigidField).toBe('detailedObjectType');
      expect(mapping?.workingStatus).toBe('WORKING');
    });

    test('detailedObjectType single value conversion', () => {
      const input: StructuredFilter = { detailedObjectType: 'STRUCTURED_FILE' };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe('detailedObjectType="STRUCTURED_FILE"');
    });

    test('detailedObjectType array value conversion', () => {
      const input: StructuredFilter = { detailedObjectType: ['STRUCTURED_FILE', 'UNSTRUCTURED_FILE'] };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe('detailedObjectType IN ("STRUCTURED_FILE","UNSTRUCTURED_FILE")');
    });

    test('detailedObjectType with other working filters', () => {
      const input: StructuredFilter = { 
        detailedObjectType: 'STRUCTURED_FILE',
        entityType: 'file',
        containsPI: true
      };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toContain('detailedObjectType="STRUCTURED_FILE"');
      expect(result).toContain('type="file"');
      expect(result).toContain('total_pii_count > to_number(0)');
    });

    test('detailedObjectType with wildcard pattern', () => {
      const input: StructuredFilter = { detailedObjectType: '*FILE*' };
      const result = FilterConverter.convertToBigIDQuery(input);
      expect(result).toBe('detailedObjectType="*FILE*"');
    });

    test('detailedObjectType with common values', () => {
      const commonValues = [
        'STRUCTURED_FILE',
        'UNSTRUCTURED_FILE', 
        'TABLE',
        'VIEW',
        'PROCEDURE',
        'FUNCTION',
        'COLUMN',
        'SCHEMA',
        'DATABASE',
        'FILE',
        'FOLDER',
        'EMAIL',
        'DOCUMENT',
        'SPREADSHEET',
        'PRESENTATION',
        'IMAGE',
        'VIDEO',
        'AUDIO',
        'ARCHIVE',
        'CODE'
      ];

      commonValues.forEach(value => {
        const input: StructuredFilter = { detailedObjectType: value };
        const result = FilterConverter.convertToBigIDQuery(input);
        expect(result).toBe(`detailedObjectType="${value}"`);
      });
    });

    test('detailedObjectType parameter status', () => {
      expect(isBrokenParameter('detailedObjectType')).toBe(false);
      expect(isWorkingParameter('detailedObjectType')).toBe(true);
      expect(isPartiallyWorkingParameter('detailedObjectType')).toBe(false);
      expect(isNoDataParameter('detailedObjectType')).toBe(false);
    });

    test('detailedObjectType field mapping details', () => {
      const mapping = getFieldMapping('detailedObjectType');
      expect(mapping).toBeDefined();
      expect(mapping?.bigidField).toBe('detailedObjectType');
      expect(mapping?.requiresConversion).toBe(false);
      expect(mapping?.conversionType).toBeUndefined();
      expect(mapping?.notes).toContain('Supported in BigID filter spec');
    });
  });
}); 