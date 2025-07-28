const { FilterConverter } = require('../dist/utils/FilterConverter');

console.log('Testing Multiple Tag Filters...\n');

// Test the exact working query format provided by the user
const testCases = [
  {
    name: 'Multiple tag filters with OR',
    input: {
      tags: [
        { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor', 'Matthew Lee', 'Danny Sparks', 'Sally Stewart', 'Ajay Vodala', 'Iris Thomas'] },
        { tagHierarchy: 'Snowflake.masked', value: 'true' }
      ]
    },
    expected: 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor","Matthew Lee","Danny Sparks","Sally Stewart","Ajay Vodala","Iris Thomas") OR catalog_tag.Snowflake.masked in ("true")'
  },
  {
    name: 'Single tag filter',
    input: {
      tags: { tagHierarchy: 'Alation Top Users', value: ['Dhairya Gandhi', 'Maor'] }
    },
    expected: 'catalog_tag.Alation Top Users in ("Dhairya Gandhi","Maor")'
  },
  {
    name: 'Simple string tags',
    input: {
      tags: ['PII', 'Confidential']
    },
    expected: 'catalog_tag.Alation Top Users in ("PII","Confidential")'
  }
];

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  try {
    console.log(`\nTesting: ${testCase.name}`);
    console.log(`Input: ${JSON.stringify(testCase.input, null, 2)}`);
    
    const result = FilterConverter.convertToBigIDQuery(testCase.input);
    console.log(`Result: ${result}`);
    
    const success = result === testCase.expected;
    
    if (success) {
      console.log(`✓ ${testCase.name}: PASS`);
      passed++;
    } else {
      console.log(`✗ ${testCase.name}: FAIL`);
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Got:      ${result}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${testCase.name}: ERROR`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tag filter tests passed!');
} else {
  console.log('❌ Some tests failed. Check the output above.');
} 