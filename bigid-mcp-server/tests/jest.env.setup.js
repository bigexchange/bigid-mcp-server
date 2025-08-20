// Ensure tests target the sandbox backend with a stable sample token
process.env.BIGID_DOMAIN = 'sandbox.bigid.tools';
process.env.BIGID_AUTH_TYPE = 'user_token';
process.env.BIGID_USER_TOKEN = 'SAMPLE';
// Reduce noise in test output
process.env.MCP_LOG_LEVEL = 'error';

