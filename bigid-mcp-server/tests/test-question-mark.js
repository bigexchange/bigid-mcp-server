const { FilterConverter } = require('./dist/utils/FilterConverter');

// Debug question mark pattern conversion
console.log('Testing question mark pattern conversion...\n');

const input = { fileName: 'file?.txt' };
const result = FilterConverter.convertToBigIDQuery(input);
const expected = 'objectName=/file\\.txt/';

console.log('Input:', JSON.stringify(input));
console.log('Result:', result);
console.log('Expected:', expected);
console.log('Match:', result === expected);

// Let's trace through the conversion manually
console.log('\nManual trace:');
console.log('1. Input: file?.txt');
console.log('2. Escape dots: file\\?\\.txt');
console.log('3. Convert * to .*: file\\?\\.txt (no change)');
console.log('4. Convert ? to .: file\\.\\.txt');
console.log('5. Final: objectName=/file\\.\\.txt/');
console.log('6. Expected: objectName=/file\\.txt/'); 