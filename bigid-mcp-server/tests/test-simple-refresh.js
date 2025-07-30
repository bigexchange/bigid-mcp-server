const axios = require('axios');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available');
}

async function testSimpleRefresh() {
  console.log('Testing simple refresh API call...');
  
  const domain = process.env.BIGID_DOMAIN || 'sandbox.bigiddemo.com';
  const userToken = process.env.BIGID_USER_TOKEN;
  
  if (!userToken) {
    console.error('❌ BIGID_USER_TOKEN not set');
    return;
  }
  
  console.log('Domain:', domain);
  console.log('User token length:', userToken.length);
  console.log('User token starts with:', userToken.substring(0, 20) + '...');
  
  const url = `https://${domain}/api/v1/refresh-access-token`;
  console.log('URL:', url);
  
  try {
    console.log('Making request...');
    const response = await axios.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response keys:', Object.keys(response.data));
    console.log('Success:', response.data.success);
    console.log('Has systemToken:', !!response.data.systemToken);
    
  } catch (error) {
    console.error('❌ Request failed');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Response data:', error.response?.data);
    console.error('Error message:', error.message);
    
    // Try without Bearer prefix
    console.log('\nTrying without Bearer prefix...');
    try {
      const response2 = await axios.post(url, {}, {
        headers: {
          'Authorization': userToken,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      console.log('✅ Success without Bearer!');
      console.log('Status:', response2.status);
      console.log('Response keys:', Object.keys(response2.data));
      console.log('Success:', response2.data.success);
      console.log('Has systemToken:', !!response2.data.systemToken);
      
    } catch (error2) {
      console.error('❌ Also failed without Bearer');
      console.error('Status:', error2.response?.status);
      console.error('Response data:', error2.response?.data);
    }
  }
}

testSimpleRefresh(); 