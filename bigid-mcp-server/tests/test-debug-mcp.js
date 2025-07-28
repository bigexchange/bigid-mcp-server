#!/usr/bin/env node

const { spawn } = require('child_process');

class DebugMCPTester {
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

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Server stdout:', output);
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('Server stderr:', output);
        if (output.includes('Server is now running') || output.includes('ready to receive')) {
          serverReady = true;
          clearTimeout(timeout);
          console.log('Server started successfully');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('Server stderr:', output);
      });

      this.serverProcess.on('error', (error) => {
        console.error('Server error:', error);
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
      }, 10000);

      console.log('Sending request:', JSON.stringify(request, null, 2));
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      let responseData = '';
      const dataHandler = (data) => {
        responseData += data.toString();
        console.log('Raw response data:', responseData);
        
        if (responseData.includes('"jsonrpc"')) {
          try {
            const lines = responseData.split('\n');
            for (const line of lines) {
              if (line.trim() && line.includes('"jsonrpc"')) {
                const response = JSON.parse(line.trim());
                clearTimeout(timeout);
                console.log('Parsed response:', JSON.stringify(response, null, 2));
                resolve(response);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to parse response:', error);
            reject(error);
          }
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  async testSimpleRequest() {
    console.log('\n=== Testing Simple Request ===');
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
      console.log('Response received successfully');
      return response;
    } catch (error) {
      console.error('Request error:', error);
      return { error: error.message };
    }
  }

  async runTest() {
    try {
      await this.startServer();
      await this.testSimpleRequest();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test
const tester = new DebugMCPTester();
tester.runTest(); 