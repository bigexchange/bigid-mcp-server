#!/usr/bin/env node

const { spawn } = require('child_process');

class BasicValidationTester {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting MCP server...');
      this.serverProcess = spawn('node', ['dist/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server is now running') || output.includes('ready to receive')) {
          serverReady = true;
          clearTimeout(timeout);
          console.log('Server started successfully');
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error('Server startup error:', error);
        reject(error);
      });
    });
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('Cleaning up server process...');
      this.serverProcess.kill();
    }
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 15000);

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
            // Continue collecting data if parsing fails
          }
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  evaluateResponse(response, testName) {
    if (response.error) {
      return {
        status: 'error',
        message: response.error.message || 'Unknown error',
        test: testName
      };
    }

    if (!response.result) {
      return {
        status: 'error',
        message: 'No result in response',
        test: testName
      };
    }

    const result = response.result;
    
    // Check if it's a content response
    if (result.content && Array.isArray(result.content)) {
      return {
        status: 'success',
        message: `Received ${result.content.length} catalog objects`,
        hasData: result.content.length > 0,
        dataType: 'catalog_objects',
        test: testName
      };
    }

    // Check if it's a health check response
    if (result.status === 'ok') {
      return {
        status: 'success',
        message: 'Health check passed',
        hasData: true,
        dataType: 'health_check',
        test: testName
      };
    }

    return {
      status: 'unknown',
      message: 'Unexpected response format',
      details: result,
      test: testName
    };
  }

  async testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_health_check',
        arguments: {}
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      const evaluation = this.evaluateResponse(response, 'Health Check');
      console.log(`Health Check: ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'error', message: error.message, test: 'Health Check' };
    }
  }

  async testWorkingFilter() {
    console.log('\n=== Testing Working Filter ===');
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: {
            entityType: 'file'
          }
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      const evaluation = this.evaluateResponse(response, 'Working Filter');
      console.log(`Working Filter: ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error('Working filter error:', error);
      return { status: 'error', message: error.message, test: 'Working Filter' };
    }
  }

  async testBrokenParameter(parameter) {
    console.log(`\n=== Testing Broken Parameter: ${parameter} ===`);
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: {
            [parameter]: 'test'
          }
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      const evaluation = this.evaluateResponse(response, `Broken Parameter: ${parameter}`);
      console.log(`${parameter}: ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error(`${parameter} error:`, error);
      return { status: 'error', message: error.message, test: `Broken Parameter: ${parameter}` };
    }
  }

  async runTests() {
    try {
      await this.startServer();

      const results = [];
      
      // Test health check
      const healthResult = await this.testHealthCheck();
      results.push(healthResult);

      // Test working filter
      const workingResult = await this.testWorkingFilter();
      results.push(workingResult);

      // Test a few broken parameters
      const brokenParams = ['system', 'fileOwner', 'encryptionStatus'];
      for (const param of brokenParams) {
        const result = await this.testBrokenParameter(param);
        results.push(result);
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate summary
      this.generateSummary(results);

    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      await this.cleanup();
    }
  }

  generateSummary(results) {
    console.log('\n=== Test Summary ===');
    
    const working = results.filter(r => r.status === 'success' && r.hasData);
    const errors = results.filter(r => r.status === 'error');
    const noData = results.filter(r => r.status === 'success' && !r.hasData);

    console.log(`Working tests: ${working.length}`);
    console.log(`Error tests: ${errors.length}`);
    console.log(`No data tests: ${noData.length}`);

    if (working.length > 0) {
      console.log('\nSuccessful tests:');
      working.forEach(r => {
        console.log(`  ✓ ${r.test}: ${r.message}`);
      });
    }

    if (errors.length > 0) {
      console.log('\nFailed tests:');
      errors.forEach(r => {
        console.log(`  ✗ ${r.test}: ${r.message}`);
      });
    }

    if (noData.length > 0) {
      console.log('\nNo data tests:');
      noData.forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
    }
  }
}

// Run the tests
const tester = new BasicValidationTester();
tester.runTests().catch(console.error); 