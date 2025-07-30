const axios = require('axios');

async function debugRefreshResponse() {
  console.log('Debugging refresh endpoint response...');
  
  const domain = process.env.BIGID_DOMAIN || 'sandbox.bigiddemo.com';
  const userToken = process.env.BIGID_USER_TOKEN;
  
  if (!userToken) {
    console.error('❌ BIGID_USER_TOKEN environment variable not set');
    return;
  }
  
  console.log('Domain:', domain);
  console.log('User token length:', userToken.length);
  
  try {
    const response = await axios.post(`https://${domain}/api/v1/refresh-access-token`, {}, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log('✅ Response received');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Check for different possible field names
    console.log('\nField analysis:');
    console.log('success:', response.data.success);
    console.log('systemToken:', response.data.systemToken);
    console.log('token:', response.data.token);
    console.log('auth_token:', response.data.auth_token);
    console.log('system_token:', response.data.system_token);
    
  } catch (error) {
    console.error('❌ Request failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

debugRefreshResponse(); 