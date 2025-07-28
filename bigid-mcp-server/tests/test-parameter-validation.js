#!/usr/bin/env node

const { spawn } = require('child_process');

class ParameterValidationTester {
  constructor() {
    this.serverProcess = null;
    this.results = {
      working: [],
      broken: [],
      noData: [],
      partiallyWorking: []
    };
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting MCP server...');
      this.serverProcess = spawn('node', ['dist/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      setTimeout(() => {
        console.log('Server started successfully');
        resolve();
      }, 3000);

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server is now running')) {
          console.log('Server detected as running');
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      let responseData = '';
      const dataHandler = (data) => {
        responseData += data.toString();
        if (responseData.includes('\n')) {
          try {
            const response = JSON.parse(responseData.trim());
            clearTimeout(timeout);
            resolve(response);
          } catch (error) {
            // If JSON parsing fails, it might be because the response contains BigID data
            // Let's try to extract the JSON part
            const jsonMatch = responseData.match(/\{[^}]*"jsonrpc"[^}]*\}/);
            if (jsonMatch) {
              try {
                const response = JSON.parse(jsonMatch[0]);
                clearTimeout(timeout);
                resolve(response);
              } catch (e) {
                clearTimeout(timeout);
                resolve({ error: 'Failed to parse response', raw: responseData.substring(0, 200) });
              }
            } else {
              clearTimeout(timeout);
              resolve({ error: 'Failed to parse response', raw: responseData.substring(0, 200) });
            }
          }
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  analyzeResponse(response, toolName) {
    if (response.error) {
      return { status: 'error', error: response.error };
    }

    try {
      const result = response.result;
      if (!result || !result.content) {
        return { status: 'error', error: 'No content in response' };
      }

      const parsedResult = JSON.parse(result.content);
      
      if (!parsedResult.success) {
        return { status: 'error', error: parsedResult.error || 'Request failed' };
      }

      const data = parsedResult.data;
      
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
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            return {
              status: count > 0 ? 'working' : 'noData',
              stats: {
                policyCount: count
              }
            };
          }
          break;

        case 'get_aci_data_manager':
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            return {
              status: count > 0 ? 'working' : 'noData',
              stats: {
                itemCount: count
              }
            };
          }
          break;

        case 'get_aci_users':
        case 'get_aci_groups':
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            return {
              status: count > 0 ? 'working' : 'noData',
              stats: {
                count: count
              }
            };
          }
          break;

        case 'get_locations':
          if (data.results && Array.isArray(data.results)) {
            const count = data.results.length;
            return {
              status: count > 0 ? 'working' : 'noData',
              stats: {
                locationCount: count,
                locationType: data.locationType
              }
            };
          }
          break;

        case 'get_health_check':
          if (data.response) {
            return {
              status: 'working',
              stats: {
                healthStatus: data.response
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

  async testParameter(parameterName, filterValue) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: {
            [parameterName]: filterValue
          },
          limit: 10
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      const analysis = this.analyzeResponse(response, 'get_catalog_objects');
      
      return {
        status: analysis.status,
        stats: analysis.stats,
        error: analysis.error
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async runParameterTests() {
    console.log('=== Parameter Validation Tests (stdio) ===\n');

    // Test parameters that were flagged as potentially problematic
    const testParameters = [
      { name: 'entityType', value: 'file' },
      { name: 'fileName', value: 'test.txt' },
      { name: 'fileOwner', value: 'testuser' },
      { name: 'system', value: 'test-system' },
      { name: 'encryptionStatus', value: 'encrypted' },
      { name: 'accessLevel', value: 'public' },
      { name: 'status', value: 'active' },
      { name: 'classification', value: 'public' },
      { name: 'scannerType', value: 'regex' },
      { name: 'schemaName', value: 'test_schema' },
      { name: 'tableName', value: 'test_table' },
      { name: 'columnName', value: 'test_column' },
      { name: 'dataType', value: 'string' },
      { name: 'objectName', value: 'test_object' },
      { name: 'objectType', value: 'table' },
      { name: 'detailedObjectType', value: 'table' },
      { name: 'riskScore', value: 5 },
      { name: 'dataQualityScore', value: 8 }
    ];

    for (const param of testParameters) {
      const result = await this.testParameter(param.name, param.value);
      
      // Print status with relevant stats
      const statusIcon = result.status === 'working' ? '✓' : 
                        result.status === 'noData' ? '⚠' : 
                        result.status === 'error' ? '✗' : '?';
      
      console.log(`${statusIcon} ${param.name}: ${result.status}`);
      
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
        this.results.working.push(param.name);
      } else if (result.status === 'noData') {
        this.results.noData.push(param.name);
      } else if (result.status === 'error') {
        this.results.broken.push(param.name);
      } else {
        this.results.partiallyWorking.push(param.name);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.printResults();
  }

  printResults() {
    console.log('\n=== VALIDATION RESULTS ===');
    console.log('\nWorking Parameters:');
    this.results.working.forEach(param => console.log(`  ✓ ${param}`));
    
    console.log('\nNo Data Parameters:');
    this.results.noData.forEach(param => console.log(`  ⚠ ${param}`));
    
    console.log('\nBroken Parameters:');
    this.results.broken.forEach(param => console.log(`  ✗ ${param}`));
    
    console.log('\nPartially Working Parameters:');
    this.results.partiallyWorking.forEach(param => console.log(`  ? ${param}`));
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('parameter-validation-results.json', JSON.stringify(this.results, null, 2));
    console.log('\nResults saved to parameter-validation-results.json');
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('Cleaning up server process...');
      try {
        // Send SIGTERM for graceful shutdown
        this.serverProcess.kill('SIGTERM');
        
        // Wait a bit for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Force kill if still running
        if (!this.serverProcess.killed) {
          this.serverProcess.kill('SIGKILL');
        }
        
        console.log('Server process cleanup completed');
      } catch (error) {
        console.error('Error during server process cleanup:', error);
      }
    }
  }
}

async function main() {
  const tester = new ParameterValidationTester();
  
  try {
    await tester.startServer();
    await tester.runParameterTests();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main(); 