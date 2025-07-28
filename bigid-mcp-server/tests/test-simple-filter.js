#!/usr/bin/env node

const { spawn } = require('child_process');

class SimpleFilterTester {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting MCP server in background...');
      this.serverProcess = spawn('node', ['dist/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });



      this.serverProcess.on('error', (error) => {
        console.error('Server startup error:', error);
        reject(error);
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server is now running') || output.includes('ready to receive')) {
          console.log('Server started successfully');
          resolve();
        } else if (output.includes('error') || output.includes('Error')) {
          console.error('Server stderr:', output);
        }
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
            // If we can't parse as JSON, it might be a partial response
            // Continue collecting data
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

  async testCatalogObjectsWithSimpleFilter() {
    console.log('\n=== Testing Catalog Objects (Simple Filter) ===');
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
      const evaluation = this.evaluateResponse(response, 'Catalog Objects with Filter');
      console.log(`Catalog Objects: ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error('Catalog objects with filter error:', error);
      return { status: 'error', message: error.message, test: 'Catalog Objects with Filter' };
    }
  }

  async testCatalogObjectsWithoutFilter() {
    console.log('\n=== Testing Catalog Objects (No Filter) ===');
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_catalog_objects',
        arguments: {}
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      const evaluation = this.evaluateResponse(response, 'Catalog Objects without Filter');
      console.log(`Catalog Objects (no filter): ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error('Catalog objects without filter error:', error);
      return { status: 'error', message: error.message, test: 'Catalog Objects without Filter' };
    }
  }

  async runTests() {
    try {
      await this.startServer();

      const results = [];
      
      // Test health check
      const healthResult = await this.testHealthCheck();
      results.push(healthResult);

      // Test catalog objects without filter
      const noFilterResult = await this.testCatalogObjectsWithoutFilter();
      results.push(noFilterResult);

      // Test catalog objects with simple filter
      const filterResult = await this.testCatalogObjectsWithSimpleFilter();
      results.push(filterResult);

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
const tester = new SimpleFilterTester();
tester.runTests().catch(console.error); 