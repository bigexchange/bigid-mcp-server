#!/usr/bin/env node

const { BigIDMCPServer } = require('../dist/server.js');

class StructuredFilterTester {
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
      
      // Analyze based on tool type
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

        default:
          // Generic analysis
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

  async testStructuredFilter(toolName, filterParams, description) {
    // Convert structured filter to BigID query format
    let filter = '';
    if (filterParams) {
      const conditions = [];
      for (const [key, value] of Object.entries(filterParams)) {
        if (key.startsWith('catalog_tag.')) {
          // Handle tag filters: catalog_tag.tagName in ("value")
          const tagName = key.replace('catalog_tag.', '');
          conditions.push(`catalog_tag.${tagName} in ("${value}")`);
        } else {
          // Handle other filters
          conditions.push(`${key} = "${value}"`);
        }
      }
      if (conditions.length > 0) {
        filter = conditions.join(' OR ');
      }
    }

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          filter: filter,
          limit: 10
        }
      }
    };

    try {
      const response = await this.server.handleToolCall(request.params);
      const analysis = this.analyzeResponse(response, toolName);
      
      return {
        status: analysis.status,
        stats: analysis.stats,
        error: analysis.error,
        description: description
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message,
        description: description
      };
    }
  }

  async runStructuredFilterTests() {
    console.log('=== Structured Filter Validation Tests ===\n');

    const testCases = [
      // Basic entity type filters
      { 
        tool: 'get_catalog_objects', 
        filter: { entityType: 'file' }, 
        description: 'Files only' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { entityType: 'database' }, 
        description: 'Databases only' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { entityType: 'table' }, 
        description: 'Tables only' 
      },

      // Object type filters
      { 
        tool: 'get_catalog_objects', 
        filter: { objectType: 'file' }, 
        description: 'Object type: file' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { objectType: 'table' }, 
        description: 'Object type: table' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { objectType: 'column' }, 
        description: 'Object type: column' 
      },

      // File name patterns
      { 
        tool: 'get_catalog_objects', 
        filter: { fileName: '*.txt' }, 
        description: 'Text files' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { fileName: '*.csv' }, 
        description: 'CSV files' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { fileName: '*.json' }, 
        description: 'JSON files' 
      },

      // Object name patterns
      { 
        tool: 'get_catalog_objects', 
        filter: { objectName: 'user*' }, 
        description: 'Objects starting with "user"' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { objectName: '*password*' }, 
        description: 'Objects containing "password"' 
      },

      // System filters
      { 
        tool: 'get_catalog_objects', 
        filter: { system: 'database' }, 
        description: 'Database system' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { system: 'file' }, 
        description: 'File system' 
      },

      // Schema and table filters
      { 
        tool: 'get_catalog_objects', 
        filter: { schemaName: 'public' }, 
        description: 'Public schema' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { tableName: 'users' }, 
        description: 'Users table' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { columnName: 'email' }, 
        description: 'Email columns' 
      },

      // Data type filters
      { 
        tool: 'get_catalog_objects', 
        filter: { dataType: 'string' }, 
        description: 'String data type' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { dataType: 'integer' }, 
        description: 'Integer data type' 
      },

      // Status and classification filters
      { 
        tool: 'get_catalog_objects', 
        filter: { status: 'active' }, 
        description: 'Active status' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { classification: 'public' }, 
        description: 'Public classification' 
      },

      // Access level filters
      { 
        tool: 'get_catalog_objects', 
        filter: { accessLevel: 'public' }, 
        description: 'Public access' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { accessLevel: 'private' }, 
        description: 'Private access' 
      },

      // Scanner type filters
      { 
        tool: 'get_catalog_objects', 
        filter: { scannerType: 'regex' }, 
        description: 'Regex scanner' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { scannerType: 'ml' }, 
        description: 'ML scanner' 
      },

      // Encryption status filters
      { 
        tool: 'get_catalog_objects', 
        filter: { encryptionStatus: 'encrypted' }, 
        description: 'Encrypted files' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { encryptionStatus: 'unencrypted' }, 
        description: 'Unencrypted files' 
      },

      // Risk and quality score filters
      { 
        tool: 'get_catalog_objects', 
        filter: { riskScore: 5 }, 
        description: 'Risk score 5' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { dataQualityScore: 8 }, 
        description: 'Quality score 8' 
      },

      // File owner filters
      { 
        tool: 'get_catalog_objects', 
        filter: { fileOwner: 'admin' }, 
        description: 'Admin owned files' 
      },

      // Detailed object type filters
      { 
        tool: 'get_catalog_objects', 
        filter: { detailedObjectType: 'table' }, 
        description: 'Detailed object type: table' 
      },

      // Count tests with structured filters
      { 
        tool: 'get_catalog_count', 
        filter: { entityType: 'file' }, 
        description: 'Count files' 
      },
      { 
        tool: 'get_catalog_count', 
        filter: { objectType: 'table' }, 
        description: 'Count tables' 
      },
      { 
        tool: 'get_catalog_count', 
        filter: { fileName: '*.txt' }, 
        description: 'Count text files' 
      },

      // Tags tests
      { 
        tool: 'get_catalog_objects', 
        filter: { 'catalog_tag.Sen.Priority': 'P1' }, 
        description: 'Objects with Sen.Priority = P1' 
      },
      { 
        tool: 'get_catalog_objects', 
        filter: { 'catalog_tag.Retention.Policy': 'file destruction policy' }, 
        description: 'Objects with Retention.Policy = file destruction policy' 
      },

      // Security cases with structured filters
      { 
        tool: 'get_security_cases', 
        filter: { severity: 'HIGH' }, 
        description: 'High severity cases' 
      },
      { 
        tool: 'get_security_cases', 
        filter: { caseStatus: 'OPEN' }, 
        description: 'Open cases' 
      }
    ];

    for (const testCase of testCases) {
      const result = await this.testStructuredFilter(testCase.tool, testCase.filter, testCase.description);
      
      // Print status with relevant stats
      const statusIcon = result.status === 'working' ? '✓' : 
                        result.status === 'noData' ? '⚠' : 
                        result.status === 'error' ? '✗' : '?';
      
      console.log(`${statusIcon} ${testCase.tool} (${testCase.description}): ${result.status}`);
      
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
        this.results.working.push(`${testCase.tool}: ${testCase.description}`);
      } else if (result.status === 'noData') {
        this.results.noData.push(`${testCase.tool}: ${testCase.description}`);
      } else if (result.status === 'error') {
        this.results.broken.push(`${testCase.tool}: ${testCase.description}`);
      } else {
        this.results.partiallyWorking.push(`${testCase.tool}: ${testCase.description}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.printResults();
  }

  printResults() {
    console.log('\n=== STRUCTURED FILTER VALIDATION RESULTS ===');
    console.log('\nWorking Filters:');
    this.results.working.forEach(filter => console.log(`  ✓ ${filter}`));
    
    console.log('\nNo Data Filters:');
    this.results.noData.forEach(filter => console.log(`  ⚠ ${filter}`));
    
    console.log('\nBroken Filters:');
    this.results.broken.forEach(filter => console.log(`  ✗ ${filter}`));
    
    console.log('\nPartially Working Filters:');
    this.results.partiallyWorking.forEach(filter => console.log(`  ? ${filter}`));
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('structured-filter-validation-results.json', JSON.stringify(this.results, null, 2));
    console.log('\nResults saved to structured-filter-validation-results.json');
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
  const tester = new StructuredFilterTester();
  
  try {
    await tester.initializeServer();
    await tester.runStructuredFilterTests();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main(); 