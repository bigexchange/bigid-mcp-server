#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

class FilterValidationTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.responseQueue = [];
    this.rl = null;
    this.brokenParameters = [
      'system', 'fileOwner', 'fileCreator', 'encryptionStatus', 'accessLevel', 'status',
      'classification', 'scannerType', 'schemaName', 'tableName', 'columnName',
      'dataType', 'objectName', 'objectType', 'detailedObjectType'
    ];
    this.noDataParameters = [
      'riskScore', 'dataQualityScore'
    ];
    this.partiallyWorkingParameters = [
      'fileName', 'objectName'
    ];
    this.nextId = 1;
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

      // Set up readline interface for stdout
      this.rl = readline.createInterface({
        input: this.serverProcess.stdout,
        crlfDelay: Infinity
      });
      this.rl.on('line', (line) => {
        let response;
        try {
          response = JSON.parse(line);
        } catch (e) {
          response = { error: 'Malformed JSON', raw: line };
        }
        const resolver = this.responseQueue.shift();
        if (resolver) resolver(response);
      });
    });
  }

  async cleanup() {
    if (this.rl) {
      this.rl.close();
    }
    if (this.serverProcess) {
      console.log('Cleaning up server process...');
      this.serverProcess.kill();
    }
  }

  async sendMCPRequest(request, paramName) {
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
            this.serverProcess.stdout.off('data', dataHandler);
            resolve(response);
          } catch (error) {
            // Log the raw response and request for manual inspection
            const fs = require('fs');
            const logPath = `filter-validation-raw-${paramName}.log`;
            fs.writeFileSync(logPath, `Request:\n${JSON.stringify(request, null, 2)}\n\nRaw Response:\n${responseData}`);
            clearTimeout(timeout);
            this.serverProcess.stdout.off('data', dataHandler);
            resolve({ error: 'Failed to parse response', raw: responseData });
          }
        }
      };
      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  evaluateResponse(response, expectedType = 'success') {
    if (response.error) {
      return {
        status: 'error',
        message: response.error.message || response.error || 'Unknown error',
        details: response.error
      };
    }
    if (!response.result) {
      return {
        status: 'error',
        message: 'No result in response'
      };
    }
    const result = response.result;
    // Check if it's a content response
    if (result.content && Array.isArray(result.content)) {
      return {
        status: 'success',
        message: `Received ${result.content.length} catalog objects`,
        hasData: result.content.length > 0,
        dataType: 'catalog_objects'
      };
    }
    // Check if it's a health check response
    if (result.status === 'ok') {
      return {
        status: 'success',
        message: 'Health check passed',
        hasData: true,
        dataType: 'health_check'
      };
    }
    return {
      status: 'unknown',
      message: 'Unexpected response format',
      details: result
    };
  }

  async testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    const request = {
      jsonrpc: '2.0',
      id: this.nextId++,
      method: 'tools/call',
      params: {
        name: 'get_health_check',
        arguments: {}
      }
    };
    try {
      const response = await this.sendMCPRequest(request);
      const evaluation = this.evaluateResponse(response, 'health');
      console.log(`Health Check: ${evaluation.status} - ${evaluation.message}`);
      return evaluation;
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'error', message: error.message };
    }
  }

  async testCatalogObjectsWithFilter(filter, paramName) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_catalog_objects',
        arguments: {
          structuredFilter: filter
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request, paramName);
      return response;
    } catch (error) {
      return { error: error.message };
    }
  }

  async runTests() {
    try {
      await this.startServer();
      // Test health check first
      const healthResult = await this.testHealthCheck();
      this.testResults.push({ test: 'health_check', result: healthResult });
      // Test basic working filter
      const basicFilter = { entityType: 'file' };
      const basicResult = await this.testCatalogObjectsWithFilter(basicFilter, 'Basic Filter (entityType: file)');
      this.testResults.push({ test: 'basic_filter', result: basicResult });
      // Test broken parameters
      console.log('\n=== Testing Broken Parameters ===');
      for (const param of this.brokenParameters.slice(0, 3)) { // Test first 3 for speed
        const filter = { [param]: 'test' };
        const result = await this.testCatalogObjectsWithFilter(filter, `Broken Parameter: ${param}`);
        this.testResults.push({ test: `broken_${param}`, result });
      }
      // Test no data parameters
      console.log('\n=== Testing No Data Parameters ===');
      for (const param of this.noDataParameters) {
        const filter = { [param]: 'test' };
        const result = await this.testCatalogObjectsWithFilter(filter, `No Data Parameter: ${param}`);
        this.testResults.push({ test: `nodata_${param}`, result });
      }
      // Test partially working parameters
      console.log('\n=== Testing Partially Working Parameters ===');
      for (const param of this.partiallyWorkingParameters) {
        const filter = { [param]: 'test' };
        const result = await this.testCatalogObjectsWithFilter(filter, `Partially Working Parameter: ${param}`);
        this.testResults.push({ test: `partial_${param}`, result });
      }
      // Generate summary
      this.generateSummary();
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      await this.cleanup();
    }
  }

  generateSummary() {
    console.log('\n=== Test Summary ===');
    const working = this.testResults.filter(r => r.result.status === 'success' && r.result.hasData);
    const errors = this.testResults.filter(r => r.result.status === 'error');
    const noData = this.testResults.filter(r => r.result.status === 'success' && !r.result.hasData);
    console.log(`Working filters: ${working.length}`);
    console.log(`Error filters: ${errors.length}`);
    console.log(`No data filters: ${noData.length}`);
    if (errors.length > 0) {
      console.log('\nFailed tests:');
      errors.forEach(r => {
        console.log(`  - ${r.test}: ${r.result.message}`);
      });
    }
    if (noData.length > 0) {
      console.log('\nNo data tests:');
      noData.forEach(r => {
        console.log(`  - ${r.test}: ${r.result.message}`);
      });
    }
  }
}

// Run the tests
const tester = new FilterValidationTester();
tester.runTests().catch(console.error); 