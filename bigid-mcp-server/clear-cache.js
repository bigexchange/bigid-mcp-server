#!/usr/bin/env node

/**
 * BigID MCP Server Cache Clearing Utility
 * 
 * This script helps clear cached data when switching between BigID domains.
 * Run this script after changing your BIGID_DOMAIN environment variable.
 */

const { CacheManager } = require('./dist/cache/CacheManager');

console.log('🔧 BigID MCP Server Cache Clearing Utility');
console.log('==========================================');

// Get domain from environment
const domain = process.env.BIGID_DOMAIN;
if (!domain) {
  console.log('❌ No BIGID_DOMAIN environment variable found.');
  console.log('   Please set your domain: export BIGID_DOMAIN=your-domain.com');
  process.exit(1);
}

console.log(`📡 Domain: ${domain}`);

// Create cache manager and clear domain-specific caches
const cacheManager = new CacheManager();

console.log('🧹 Clearing domain-specific caches...');
cacheManager.clearDomainCaches(domain);

console.log('✅ Cache cleared successfully!');
console.log('');
console.log('💡 Tip: Restart your MCP server to ensure fresh connections.');
console.log('   If you\'re still seeing old data, try restarting Claude Desktop as well.'); 