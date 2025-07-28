// Test script for real-world BigID system issues
const { FilterConverter } = require('./dist/utils/FilterConverter');

console.log('🔍 Testing Real-World BigID System Issues\n');

// Test cases based on Claude's feedback
const realWorldTestCases = [
  {
    name: 'Sensitivity Enum Values Issue',
    description: 'System uses different values than documented',
    input: { sensitivity: ['High', 'Medium'] },
    expectedIssue: 'Invalid sensitivity values: High, Medium. Valid: Restricted, Confidential, Internal Use, Public'
  },
  {
    name: 'Tag Filtering Issue',
    description: 'Requires tag ID lookup, not tag name',
    input: { tags: ['GDPR'] },
    expectedIssue: 'Tag filtering requires tag ID lookup. Use get_catalog_tags to get valid tag IDs for: GDPR'
  },
  {
    name: 'System Type Filtering Issue',
    description: 'No database systems in current environment',
    input: { system: ['MySQL', 'PostgreSQL'] },
    expectedIssue: 'Unsupported entity types: MySQL, PostgreSQL. Supported types: file, database, table, column, email, document'
  },
  {
    name: 'Risk Score Combination Issue',
    description: 'Risk scoring may not be configured',
    input: { 
      riskScore: { operator: 'greaterThan', value: 50 },
      containsPI: true 
    },
    expectedIssue: 'riskScore requires tag ID lookup. Use get_catalog_tags to get valid tag IDs.'
  },
  {
    name: 'Entity Type Variations Issue',
    description: 'Environment primarily contains file-based data sources',
    input: { entityType: ['rdb', 'APP', 'kafka', 'salesforce'] },
    expectedIssue: 'Unsupported entity types: rdb, APP, kafka, salesforce. Supported types: file, database, table, column, email, document'
  },
  {
    name: 'Working Example - File Type',
    description: 'This should work correctly',
    input: { fileType: 'pdf' },
    expectedIssue: null
  },
  {
    name: 'Working Example - Contains PI',
    description: 'Boolean filters work correctly',
    input: { containsPI: true },
    expectedIssue: null
  },
  {
    name: 'Working Example - Correct Sensitivity',
    description: 'Using actual system values',
    input: { sensitivity: 'Restricted' },
    expectedIssue: null
  }
];

console.log('📋 Running Real-World Issue Tests:\n');

realWorldTestCases.forEach((testCase, index) => {
  console.log(`🧪 Test ${index + 1}: ${testCase.name}`);
  console.log(`📝 Description: ${testCase.description}`);
  console.log(`📥 Input: ${JSON.stringify(testCase.input)}`);
  
  try {
    const result = FilterConverter.convertToBigIDQueryWithValidation(testCase.input);
    
    console.log(`🔍 Query: ${result.query}`);
    
    if (result.warnings.length > 0) {
      console.log(`⚠️  Warnings:`);
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    } else {
      console.log(`✅ No warnings - query should work`);
    }
    
    if (testCase.expectedIssue) {
      const hasExpectedWarning = result.warnings.some(warning => 
        warning.includes(testCase.expectedIssue.split(':')[0])
      );
      console.log(`🎯 Expected Issue Detected: ${hasExpectedWarning ? '✅ YES' : '❌ NO'}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('---\n');
});

console.log('💡 Solutions for Real-World Issues:\n');

console.log('1. 🔧 Tag ID Lookup Required:');
console.log('   - Use get_catalog_tags tool to get valid tag IDs');
console.log('   - Replace tag names with tag IDs in queries');
console.log('   - Example: tags: ["GDPR"] → tags: ["tag_id_123"]\n');

console.log('2. 🏷️ Sensitivity Values:');
console.log('   - Use actual system values: ["Restricted", "Confidential", "Internal Use", "Public"]');
console.log('   - Avoid documented but incorrect values: ["High", "Medium", "Low"]\n');

console.log('3. 🗄️ Entity Types:');
console.log('   - Use supported types: ["file", "database", "table", "column", "email", "document"]');
console.log('   - Check environment-specific supported types\n');

console.log('4. ⚙️ System Configuration:');
console.log('   - Risk scoring may need to be enabled');
console.log('   - Database systems may not be present in file-based environments');
console.log('   - Use environment-appropriate entity types\n');

console.log('5. 🔍 Validation Features:');
console.log('   - FilterConverter now provides warnings for unsupported values');
console.log('   - Use convertToBigIDQueryWithValidation() for detailed feedback');
console.log('   - Check warnings before executing queries\n');

console.log('✅ Updated FilterConverter handles these issues by:');
console.log('   - Providing clear warnings about unsupported values');
console.log('   - Indicating when tag ID lookups are required');
console.log('   - Validating against actual system configurations');
console.log('   - Offering guidance on correct usage patterns'); 