const axios = require('axios');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available');
}

async function testDirectUserToken() {
  console.log('Testing direct user token usage...');
  
  const domain = process.env.BIGID_DOMAIN || 'sandbox.bigiddemo.com';
  const userToken = process.env.BIGID_USER_TOKEN;
  
  if (!userToken) {
    console.error('❌ BIGID_USER_TOKEN not set');
    return;
  }
  
  console.log('Domain:', domain);
  console.log('User token length:', userToken.length);
  
  // Test using the user token directly for a health check
  const url = `https://${domain}/api/v1/metadata-search/health-check`;
  console.log('Testing URL:', url);
  
  try {
    console.log('Making request with user token directly...');
    const response = await axios.get(url, {
      headers: {
        'Authorization': userToken, // No Bearer prefix
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log('✅ Success with direct user token!');
    console.log('Status:', response.status);
    console.log('Response keys:', Object.keys(response.data));
    console.log('Success:', response.data.success);
    
  } catch (error) {
    console.error('❌ Direct user token failed');
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    
    // Try with Bearer prefix
    console.log('\nTrying with Bearer prefix...');
    try {
      const response2 = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      console.log('✅ Success with Bearer prefix!');
      console.log('Status:', response2.status);
      console.log('Response keys:', Object.keys(response2.data));
      console.log('Success:', response2.data.success);
      
    } catch (error2) {
      console.error('❌ Also failed with Bearer prefix');
      console.error('Status:', error2.response?.status);
      console.error('Response data:', error2.response?.data);
    }
  }
}

testDirectUserToken(); 