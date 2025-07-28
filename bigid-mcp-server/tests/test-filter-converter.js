// Simple test script for FilterConverter
const { FilterConverter } = require('../dist/utils/FilterConverter');

// Test cases based on the feedback
const testCases = [
  {
    name: 'entityType mapping',
    input: { entityType: 'smb' },
    expected: 'type="smb"'
  },
  {
    name: 'datasource mapping',
    input: { datasource: 'HR Global' },
    expected: 'source="HR Global"'
  },
  {
    name: 'sensitivity tag query',
    input: { sensitivity: 'Restricted' },
    expected: 'tags="system.sensitivityClassification.Sensitivity" AND tagValue="Restricted"'
  },
  {
    name: 'riskScore tag query',
    input: { riskScore: { operator: 'greaterThan', value: 50 } },
    expected: 'tags="system.risk.riskScore" AND tagValue>to_number(50)'
  },
  {
    name: 'tags array',
    input: { tags: ['Sen.Priority'] },
    expected: 'tags IN ("Sen.Priority")'
  },
  {
    name: 'containsPI boolean',
    input: { containsPI: true },
    expected: 'total_pii_count > to_number(0)'
  },
  {
    name: 'fileType mapping',
    input: { fileType: 'pdf' },
    expected: 'fileExtension="pdf"'
  },
  {
    name: 'sizeInBytes numeric',
    input: { sizeInBytes: { operator: 'greaterThan', value: 50000 } },
    expected: 'sizeInBytes > to_number(50000)'
  }
];

console.log('Testing FilterConverter...');

testCases.forEach((testCase, index) => {
  try {
    const result = FilterConverter.convertToBigIDQuery(testCase.input);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1} (${testCase.name}): ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) {
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Got: ${result}`);
    }
  } catch (error) {
    console.log(`Test ${index + 1} (${testCase.name}): ERROR`);
    console.log(`  Error: ${error.message}`);
  }
}); 