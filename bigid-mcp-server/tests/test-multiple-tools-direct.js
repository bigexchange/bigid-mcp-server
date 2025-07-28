#!/usr/bin/env node

const { BigIDMCPServer } = require('../dist/server.js');

class MultiToolTester {
  constructor() {
    this.server = null;
    this.results = {
      working: [],
      broken: [],
      noData: [],
      partiallyWorking: []
    };
  }

  async initializeServer() {
    console.log('Initializing BigID MCP Server...');
    this.server = new BigIDMCPServer();
    
    // Initialize the server in testing mode (no transport)
    await this.server.initialize(true);
    console.log('Server initialized successfully');
  }

  analyzeResponse(response, toolName) {
    if (response.error) {
      return { status: 'error', error: response.error };
    }

    try {
      const result = JSON.parse(response.result.content);
      
      if (!result.success) {
        return { status: 'error', error: result.error || 'Request failed' };
      }

      const data = result.data;
      
      // Analyze based on tool type and output schema
      switch (toolName) {
        case 'get_catalog_objects':
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            const totalCount = data.totalRowsCounter || count;
            const hasResults = count > 0;
            
            return {
              status: hasResults ? 'working' : 'noData',
              stats: {
                resultCount: count,
                totalCount: totalCount,
                hasResults: hasResults
              }
            };
          }
          break;

        case 'get_catalog_count':
          if (data.count !== undefined) {
            return {
              status: data.count > 0 ? 'working' : 'noData',
              stats: {
                count: data.count
              }
            };
          }
          break;

        case 'get_inventory_aggregation':
          if (data.aggregations && Array.isArray(data.aggregations)) {
            const aggCount = data.aggregations.length;
            const totalItems = data.aggregations.reduce((sum, agg) => sum + (agg.aggData?.length || 0), 0);
            
            return {
              status: totalItems > 0 ? 'working' : 'noData',
              stats: {
                aggregationCount: aggCount,
                totalItems: totalItems,
                aggregationType: data.aggregationType
              }
            };
          }
          break;

        case 'get_security_cases':
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            return {
              status: count > 0 ? 'working' : 'noData',
              stats: {
                caseCount: count
              }
            };
          }
          break;

        case 'get_policies':
          // Policies can be either an array or object with results array
          if (Array.isArray(data)) {
            return {
              status: data.length > 0 ? 'working' : 'noData',
              stats: {
                policyCount: data.length
              }
            };
          } else if (data.results && Array.isArray(data.results)) {
            return {
              status: data.results.length > 0 ? 'working' : 'noData',
              stats: {
                policyCount: data.results.length
              }
            };
          }
          break;

        case 'get_aci_data_manager':
          // ACI data manager returns { status, statusCode, data: [...] }
          if (data.data && Array.isArray(data.data)) {
            return {
              status: data.data.length > 0 ? 'working' : 'noData',
              stats: {
                itemCount: data.data.length
              }
            };
          }
          break;

        case 'get_aci_users':
          // ACI users returns { status, statusCode, data: { users: [...] } }
          if (data.data && data.data.users && Array.isArray(data.data.users)) {
            return {
              status: data.data.users.length > 0 ? 'working' : 'noData',
              stats: {
                userCount: data.data.users.length
              }
            };
          }
          break;

        case 'get_aci_groups':
          // ACI groups returns { status, statusCode, data: { groups: [...] } }
          if (data.data && data.data.groups && Array.isArray(data.data.groups)) {
            return {
              status: data.data.groups.length > 0 ? 'working' : 'noData',
              stats: {
                groupCount: data.data.groups.length
              }
            };
          }
          break;

        case 'get_locations':
          if (data.system_locations && Array.isArray(data.system_locations)) {
            return {
              status: data.system_locations.length > 0 ? 'working' : 'noData',
              stats: {
                locationCount: data.system_locations.length
              }
            };
          }
          break;

        case 'get_health_check':
          if (data.status === 'OK' || data.response === 'OK') {
            return {
              status: 'working',
              stats: {
                healthStatus: data.response || data.status
              }
            };
          }
          break;

        case 'get_data_categories':
          if (Array.isArray(data)) {
            return {
              status: data.length > 0 ? 'working' : 'noData',
              stats: {
                categoryCount: data.length
              }
            };
          }
          break;

        case 'get_sensitivity_configs':
          // Sensitivity configs returns { status, statusCode, data: { scConfigs: [...] } }
          if (data.data && data.data.scConfigs && Array.isArray(data.data.scConfigs)) {
            return {
              status: data.data.scConfigs.length > 0 ? 'working' : 'noData',
              stats: {
                configCount: data.data.scConfigs.length
              }
            };
          }
          break;

        case 'get_catalog_tags':
          // Catalog tags returns { status, statusCode, data: { data: [...] } }
          if (data.data && data.data.data && Array.isArray(data.data.data)) {
            return {
              status: data.data.data.length > 0 ? 'working' : 'noData',
              stats: {
                tagCount: data.data.data.length
              }
            };
          }
          break;

        case 'get_security_cases':
          // Security cases returns { status, statusCode, data: { policies: [...] } }
          if (data.data && data.data.policies && Array.isArray(data.data.policies)) {
            return {
              status: data.data.policies.length > 0 ? 'working' : 'noData',
              stats: {
                policyCount: data.data.policies.length
              }
            };
          }
          break;

        default:
          // Generic analysis for other tools
          if (data && typeof data === 'object') {
            const keys = Object.keys(data);
            const hasResults = keys.some(key => {
              const value = data[key];
              return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
            });
            
            return {
              status: hasResults ? 'working' : 'noData',
              stats: {
                dataKeys: keys,
                hasData: hasResults
              }
            };
          }
      }

      return { status: 'unknown', stats: { message: 'Unable to analyze response structure' } };
    } catch (error) {
      return { status: 'error', error: `Failed to parse response: ${error.message}` };
    }
  }

  async testTool(toolName, args = {}) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    try {
      const response = await this.server.handleToolCall(request.params);
      const analysis = this.analyzeResponse(response, toolName);
      
      return {
        status: analysis.status,
        stats: analysis.stats,
        error: analysis.error
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testStructuredFilter(toolName, filterParams) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          structuredFilter: filterParams,
          limit: 5
        }
      }
    };

    try {
      const response = await this.server.handleToolCall(request.params);
      const analysis = this.analyzeResponse(response, toolName);
      
      return {
        status: analysis.status,
        stats: analysis.stats,
        error: analysis.error
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async runMultiToolTests() {
    console.log('=== Multi-Tool Validation Tests ===\n');

    const testCases = [
      { name: 'get_health_check', args: {}, description: 'Health check' },
      { name: 'get_catalog_objects', args: { limit: 5 }, description: 'Catalog objects (limited)' },
      { name: 'get_catalog_count', args: {}, description: 'Catalog count' },
      { name: 'get_inventory_aggregation', args: { aggregationType: 'tags' }, description: 'Inventory aggregation by tags' },
      { name: 'get_security_cases', args: { limit: 5 }, description: 'Security cases (limited)' },
      { name: 'get_policies', args: {}, description: 'Policies' },
      { name: 'get_aci_data_manager', args: { limit: 5 }, description: 'ACI data manager (limited)' },
      { name: 'get_aci_users', args: { limit: 5 }, description: 'ACI users (limited)' },
      { name: 'get_aci_groups', args: { limit: 5 }, description: 'ACI groups (limited)' },
      { name: 'get_locations', args: { locationType: 'system' }, description: 'System locations' },
      { name: 'get_data_categories', args: {}, description: 'Data categories' },
      { name: 'get_sensitivity_configs', args: {}, description: 'Sensitivity configs' },
      { name: 'get_catalog_tags', args: {}, description: 'Catalog tags' }
    ];

    for (const testCase of testCases) {
      const result = await this.testTool(testCase.name, testCase.args);
      
      // Print status with relevant stats
      const statusIcon = result.status === 'working' ? '✓' : 
                        result.status === 'noData' ? '⚠' : 
                        result.status === 'error' ? '✗' : '?';
      
      console.log(`${statusIcon} ${testCase.name}: ${result.status}`);
      console.log(`    Description: ${testCase.description}`);
      
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      } else if (result.stats) {
        const statsStr = Object.entries(result.stats)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(`    Stats: ${statsStr}`);
      }
      
      // Categorize the result
      if (result.status === 'working') {
        this.results.working.push(testCase.name);
      } else if (result.status === 'noData') {
        this.results.noData.push(testCase.name);
      } else if (result.status === 'error') {
        this.results.broken.push(testCase.name);
      } else {
        this.results.partiallyWorking.push(testCase.name);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n=== Structured Filter Tests ===\n');

    const structuredFilterTests = [
      { 
        name: 'get_catalog_objects', 
        filter: { entityType: 'file' }, 
        description: 'Files only' 
      },
      { 
        name: 'get_catalog_objects', 
        filter: { objectType: 'table' }, 
        description: 'Tables only' 
      },
      { 
        name: 'get_catalog_objects', 
        filter: { fileName: '*.txt' }, 
        description: 'Text files' 
      },
      { 
        name: 'get_catalog_objects', 
        filter: { system: 'database' }, 
        description: 'Database system' 
      },
      { 
        name: 'get_catalog_count', 
        filter: { entityType: 'file' }, 
        description: 'Count files' 
      },
      { 
        name: 'get_catalog_count', 
        filter: { objectType: 'table' }, 
        description: 'Count tables' 
      }
    ];

    for (const testCase of structuredFilterTests) {
      const result = await this.testStructuredFilter(testCase.name, testCase.filter);
      
      // Print status with relevant stats
      const statusIcon = result.status === 'working' ? '✓' : 
                        result.status === 'noData' ? '⚠' : 
                        result.status === 'error' ? '✗' : '?';
      
      console.log(`${statusIcon} ${testCase.name} (${testCase.description}): ${result.status}`);
      
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      } else if (result.stats) {
        const statsStr = Object.entries(result.stats)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(`    Stats: ${statsStr}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.printResults();
  }

  printResults() {
    console.log('\n=== MULTI-TOOL VALIDATION RESULTS ===');
    console.log('\nWorking Tools:');
    this.results.working.forEach(tool => console.log(`  ✓ ${tool}`));
    
    console.log('\nNo Data Tools:');
    this.results.noData.forEach(tool => console.log(`  ⚠ ${tool}`));
    
    console.log('\nBroken Tools:');
    this.results.broken.forEach(tool => console.log(`  ✗ ${tool}`));
    
    console.log('\nPartially Working Tools:');
    this.results.partiallyWorking.forEach(tool => console.log(`  ? ${tool}`));
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('multi-tool-validation-results.json', JSON.stringify(this.results, null, 2));
    console.log('\nResults saved to multi-tool-validation-results.json');
  }

  async cleanup() {
    if (this.server) {
      console.log('Cleaning up server...');
      try {
        await this.server.cleanup();
        console.log('Server cleanup completed');
      } catch (error) {
        console.error('Error during server cleanup:', error);
      }
    }
  }
}

async function main() {
  const tester = new MultiToolTester();
  
  try {
    await tester.initializeServer();
    await tester.runMultiToolTests();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main(); 