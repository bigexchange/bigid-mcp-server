// Test environment variable loading
console.log('Environment variable debug:');
console.log('BIGID_USER_TOKEN:', process.env.BIGID_USER_TOKEN ? 'SET' : 'NOT SET');
console.log('BIGID_DOMAIN:', process.env.BIGID_DOMAIN || 'NOT SET');
console.log('BIGID_AUTH_TYPE:', process.env.BIGID_AUTH_TYPE || 'NOT SET');

// Test dotenv loading
try {
  const dotenv = require('dotenv');
  const path = require('path');
  const fs = require('fs');
  
  const envPath = path.resolve(process.cwd(), '.env');
  console.log('Looking for .env file at:', envPath);
  console.log('.env file exists:', fs.existsSync(envPath));
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    console.log('dotenv result:', result.error ? 'ERROR' : 'SUCCESS');
    if (result.error) {
      console.log('dotenv error:', result.error.message);
    }
  }
  
  // Check again after dotenv
  console.log('\nAfter dotenv loading:');
  console.log('BIGID_USER_TOKEN:', process.env.BIGID_USER_TOKEN ? 'SET' : 'NOT SET');
  console.log('BIGID_DOMAIN:', process.env.BIGID_DOMAIN || 'NOT SET');
  console.log('BIGID_AUTH_TYPE:', process.env.BIGID_AUTH_TYPE || 'NOT SET');
  
} catch (error) {
  console.log('dotenv not available:', error.message);
}

// Test ConfigManager
try {
  const { ConfigManager } = require('../dist/config/ConfigManager');
  const configManager = new ConfigManager();
  const config = configManager.getBigIDConfig();
  
  console.log('\nConfigManager result:');
  console.log('Auth type:', config.auth.type);
  console.log('User token:', config.auth.user_token ? 'SET' : 'NOT SET');
  console.log('Domain:', config.domain);
  
} catch (error) {
  console.log('ConfigManager error:', error.message);
} 