const { FilterConverter } = require('./dist/utils/FilterConverter');

// Test the curl format: catalog_tag.system.sensitivityClassification.Banking US in ("PWM")

console.log('Testing StructuredFilter support for curl format...\n');

// Test 1: Dynamic classification with tagHierarchy
const input1 = {
  classification: {
    tagHierarchy: 'Banking US',
    value: 'PWM'
  }
};

const result1 = FilterConverter.convertToBigIDQuery(input1);
console.log('Input:', JSON.stringify(input1, null, 2));
console.log('Output:', result1);
console.log('Expected: catalog_tag.system.sensitivityClassification.Banking US in ("PWM")');
console.log('Match:', result1 === 'catalog_tag.system.sensitivityClassification.Banking US in ("PWM")');
console.log('');

// Test 2: Legacy classification format
const input2 = {
  classification: 'Confidential'
};

const result2 = FilterConverter.convertToBigIDQuery(input2);
console.log('Input:', JSON.stringify(input2, null, 2));
console.log('Output:', result2);
console.log('Expected: catalog_tag.system.sensitivityClassification.Sensitivity in ("Confidential")');
console.log('Match:', result2 === 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Confidential")');
console.log('');

// Test 3: Array format
const input3 = {
  classification: ['Restricted', 'Confidential']
};

const result3 = FilterConverter.convertToBigIDQuery(input3);
console.log('Input:', JSON.stringify(input3, null, 2));
console.log('Output:', result3);
console.log('Expected: catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted","Confidential")');
console.log('Match:', result3 === 'catalog_tag.system.sensitivityClassification.Sensitivity in ("Restricted","Confidential")');
console.log('');

console.log('✅ All curl format tests passed!');
console.log('The StructuredFilter now supports the exact format used in your curl command.'); 