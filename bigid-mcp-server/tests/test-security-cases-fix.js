#!/usr/bin/env node

const { spawn } = require('child_process');

class SecurityCasesTester {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    console.log('Starting MCP server...');
    this.serverProcess = spawn('node', ['dist/server.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Server started');
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const requestStr = JSON.stringify(request) + '\n';
      this.serverProcess.stdin.write(requestStr);
      
      let response = '';
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 15000);

      const dataHandler = (data) => {
        response += data.toString();
        // Look for complete JSON response
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.trim() && line.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(line.trim());
              clearTimeout(timeout);
              resolve(parsed);
              return;
            } catch (e) {
              // Continue looking for valid JSON
            }
          }
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  async testSecurityCases() {
    console.log('\n=== Testing Security Cases Fix ===');
    const testCases = [
      {},
      { limit: 5 },
      { caseStatus: "open", limit: 3 },
      { severity: "critical", limit: 3 },
      { structuredFilter: { query: "containsPI = true" }, limit: 3 }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "get_security_cases",
            arguments: testCase
          }
        });
        
        console.log('Security cases response:', JSON.stringify(response, null, 2));
        
        // Check if response contains success
        const responseText = response.result?.content?.[0]?.text;
        const success = responseText && responseText.includes('success');
        console.log(`Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
        
      } catch (error) {
        console.error(`Security cases test failed for ${JSON.stringify(testCase)}:`, error.message);
      }
    }
  }

  async runTest() {
    try {
      await this.startServer();
      await this.testSecurityCases();
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }
}

// Run the test
const tester = new SecurityCasesTester();
tester.runTest(); 