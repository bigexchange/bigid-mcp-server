#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.outputSchemas = this.loadOutputSchemas();
  }

  loadOutputSchemas() {
    // Define expected output schemas for validation
    return {
      get_health_check: {
        success: 'boolean',
        data: 'object'
      },
      get_inventory_aggregation: {
        success: 'boolean',
        data: {
          aggregations: 'array',
          aggregationType: 'string'
        }
      },
      get_catalog_objects: {
        success: 'boolean',
        data: {
          results: 'array',
          totalRowsCounter: 'number'
        }
      },
      get_catalog_count: {
        success: 'boolean',
        data: {
          count: 'number'
        }
      },
      get_data_categories: {
        success: 'boolean',
        data: 'array'
      },
      get_policies: {
        success: 'boolean',
        data: 'array'
      },
      get_security_cases: {
        success: 'boolean',
        data: {
          policies: 'array',
          totalCount: 'number'
        }
      },
      get_security_trends: {
        success: 'boolean',
        data: {
          open: 'array',
          closed: 'array'
        }
      }
    };
  }

  validateResponse(toolName, response) {
    const schema = this.outputSchemas[toolName];
    if (!schema) return true; // Skip validation if schema not defined

    try {
      const responseText = response.result?.content?.[0]?.text;
      if (!responseText) return false;

      const parsed = JSON.parse(responseText);
      
      // Check success field
      if (schema.success && typeof parsed.success !== 'boolean') {
        return false;
      }

      // Check data structure
      if (schema.data && !parsed.data) {
        return false;
      }

      // Check for non-empty data
      if (parsed.data) {
        if (Array.isArray(parsed.data)) {
          if (parsed.data.length === 0) return false;
        } else if (typeof parsed.data === 'object') {
          // Check specific fields based on schema
          if (schema.data.results && (!Array.isArray(parsed.data.results) || parsed.data.results.length === 0)) {
            return false;
          }
          if (schema.data.count !== undefined && typeof parsed.data.count !== 'number') {
            return false;
          }
          if (schema.data.totalRowsCounter !== undefined && typeof parsed.data.totalRowsCounter !== 'number') {
            return false;
          }
          if (schema.data.aggregations && (!Array.isArray(parsed.data.aggregations) || parsed.data.aggregations.length === 0)) {
            return false;
          }
          if (schema.data.policies && (!Array.isArray(parsed.data.policies) || parsed.data.policies.length === 0)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
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
      let stderrData = '';
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

      const stderrHandler = (data) => {
        stderrData += data.toString();
        // Log stderr but don't interfere with response parsing
        console.log('Server stderr:', data.toString().trim());
      };

      this.serverProcess.stdout.on('data', dataHandler);
      this.serverProcess.stderr.on('data', stderrHandler);
    });
  }

  async testHealthCheck() {
    console.log('\n=== Testing get_health_check ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_health_check",
          arguments: {}
        }
      });
      
      const isValid = this.validateResponse('get_health_check', response);
      console.log('Health check response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_health_check',
        success: response.result?.content?.[0]?.text?.includes('success') && isValid,
        response: response,
        schemaValid: isValid
      });
    } catch (error) {
      console.error('Health check failed:', error.message);
      this.testResults.push({
        tool: 'get_health_check',
        success: false,
        error: error.message
      });
    }
  }

  async testInventoryAggregation() {
    console.log('\n=== Testing get_inventory_aggregation ===');
    const testCases = [
      { aggregationType: 'tags' },
      { aggregationType: 'source' },
      { aggregationType: 'sensitivityFilter' },
      { aggregationType: 'source.type' },
      { aggregationType: 'attribute' },
      { aggregationType: 'categoryExtended' },
      { aggregationType: 'dataFormat' },
      { aggregationType: 'duplicateFiles' },
      { aggregationType: 'objectStatus' }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: {
            name: "get_inventory_aggregation",
            arguments: testCase
          }
        });
        
        const isValid = this.validateResponse('get_inventory_aggregation', response);
        console.log('Aggregation response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_inventory_aggregation',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success') && isValid,
          response: response,
          schemaValid: isValid
        });
      } catch (error) {
        console.error(`Aggregation test failed for ${testCase.aggregationType}:`, error.message);
        this.testResults.push({
          tool: 'get_inventory_aggregation',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testCatalogObjects() {
    console.log('\n=== Testing get_catalog_objects ===');
    const testCases = [
      { limit: 5 },
      { searchText: "test", limit: 3 },
      { structuredFilter: { query: "entityType = \"file\"" }, limit: 5 },
      { structuredFilter: { query: "containsPI = true" }, limit: 3 },
      { structuredFilter: { query: "fileSize > to_number(1000000)" }, limit: 3 },
      { structuredFilter: { query: "tags IN (\"PII\", \"Confidential\")" }, limit: 3 },
      { structuredFilter: { query: "lastAccessedDate < past(\"30d\")" }, limit: 3 }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "get_catalog_objects",
            arguments: testCase
          }
        });
        
        const isValid = this.validateResponse('get_catalog_objects', response);
        console.log('Catalog objects response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_catalog_objects',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success') && isValid,
          response: response,
          schemaValid: isValid
        });
      } catch (error) {
        console.error(`Catalog objects test failed for ${JSON.stringify(testCase)}:`, error.message);
        this.testResults.push({
          tool: 'get_catalog_objects',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testCatalogCount() {
    console.log('\n=== Testing get_catalog_count ===');
    const testCases = [
      {},
      { searchText: "test" },
      { structuredFilter: { query: "entityType = \"file\"" } },
      { structuredFilter: { query: "containsPI = true" } },
      { structuredFilter: { query: "fileSize > to_number(1000000)" } }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 4,
          method: "tools/call",
          params: {
            name: "get_catalog_count",
            arguments: testCase
          }
        });
        
        const isValid = this.validateResponse('get_catalog_count', response);
        console.log('Catalog count response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_catalog_count',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success') && isValid,
          response: response,
          schemaValid: isValid
        });
      } catch (error) {
        console.error(`Catalog count test failed for ${JSON.stringify(testCase)}:`, error.message);
        this.testResults.push({
          tool: 'get_catalog_count',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testDataCategories() {
    console.log('\n=== Testing get_data_categories ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "get_data_categories",
          arguments: {}
        }
      });
      
      const isValid = this.validateResponse('get_data_categories', response);
      console.log('Data categories response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_data_categories',
        success: response.result?.content?.[0]?.text?.includes('success') && isValid,
        response: response,
        schemaValid: isValid
      });
    } catch (error) {
      console.error('Data categories test failed:', error.message);
      this.testResults.push({
        tool: 'get_data_categories',
        success: false,
        error: error.message
      });
    }
  }

  async testPolicies() {
    console.log('\n=== Testing get_policies ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: {
          name: "get_policies",
          arguments: {}
        }
      });
      
      const isValid = this.validateResponse('get_policies', response);
      console.log('Policies response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_policies',
        success: response.result?.content?.[0]?.text?.includes('success') && isValid,
        response: response,
        schemaValid: isValid
      });
    } catch (error) {
      console.error('Policies test failed:', error.message);
      this.testResults.push({
        tool: 'get_policies',
        success: false,
        error: error.message
      });
    }
  }

  async testSecurityCases() {
    console.log('\n=== Testing get_security_cases ===');
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
          id: 7,
          method: "tools/call",
          params: {
            name: "get_security_cases",
            arguments: testCase
          }
        });
        
        const isValid = this.validateResponse('get_security_cases', response);
        console.log('Security cases response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_security_cases',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success') && isValid,
          response: response,
          schemaValid: isValid
        });
      } catch (error) {
        console.error(`Security cases test failed for ${JSON.stringify(testCase)}:`, error.message);
        this.testResults.push({
          tool: 'get_security_cases',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testSecurityTrends() {
    console.log('\n=== Testing get_security_trends ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 8,
        method: "tools/call",
        params: {
          name: "get_security_trends",
          arguments: {}
        }
      });
      
      const isValid = this.validateResponse('get_security_trends', response);
      console.log('Security trends response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_security_trends',
        success: response.result?.content?.[0]?.text?.includes('success') && isValid,
        response: response,
        schemaValid: isValid
      });
    } catch (error) {
      console.error('Security trends test failed:', error.message);
      this.testResults.push({
        tool: 'get_security_trends',
        success: false,
        error: error.message
      });
    }
  }

  async testObjectDetails() {
    console.log('\n=== Testing get_object_details ===');
    try {
      // First get some objects to test with
      const catalogResponse = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {
          name: "get_catalog_objects",
          arguments: { limit: 1 }
        }
      });

      const catalogData = JSON.parse(catalogResponse.result.content[0].text);
      if (catalogData.success && catalogData.data.results.length > 0) {
        const objectName = catalogData.data.results[0].fullyQualifiedName;
        
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 10,
          method: "tools/call",
          params: {
            name: "get_object_details",
            arguments: { fullyQualifiedName: objectName }
          }
        });
        
        console.log('Object details response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_object_details',
          testCase: { fullyQualifiedName: objectName },
          success: response.result?.content?.[0]?.text?.includes('success'),
          response: response
        });
      }
    } catch (error) {
      console.error('Object details test failed:', error.message);
      this.testResults.push({
        tool: 'get_object_details',
        success: false,
        error: error.message
      });
    }
  }

  async testCatalogTags() {
    console.log('\n=== Testing get_catalog_tags ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 11,
        method: "tools/call",
        params: {
          name: "get_catalog_tags",
          arguments: {}
        }
      });
      
      console.log('Catalog tags response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_catalog_tags',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Catalog tags test failed:', error.message);
      this.testResults.push({
        tool: 'get_catalog_tags',
        success: false,
        error: error.message
      });
    }
  }

  async testCatalogRules() {
    console.log('\n=== Testing get_catalog_rules ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 12,
        method: "tools/call",
        params: {
          name: "get_catalog_rules",
          arguments: {}
        }
      });
      
      console.log('Catalog rules response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_catalog_rules',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Catalog rules test failed:', error.message);
      this.testResults.push({
        tool: 'get_catalog_rules',
        success: false,
        error: error.message
      });
    }
  }

  async testLineageTree() {
    console.log('\n=== Testing get_lineage_tree ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 13,
        method: "tools/call",
        params: {
          name: "get_lineage_tree",
          arguments: {
            anchorCollections: ["test.collection"],
            anchorAttributeType: "pii_attributes"
          }
        }
      });
      
      console.log('Lineage tree response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_lineage_tree',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Lineage tree test failed:', error.message);
      this.testResults.push({
        tool: 'get_lineage_tree',
        success: false,
        error: error.message
      });
    }
  }

  async testCasesGroupByPolicy() {
    console.log('\n=== Testing get_cases_group_by_policy ===');
    const testCases = [
      { groupBy: "policy" },
      { groupBy: "severity" },
      { groupBy: "status" },
      { groupBy: "dataSource" }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 14,
          method: "tools/call",
          params: {
            name: "get_cases_group_by_policy",
            arguments: testCase
          }
        });
        
        console.log('Cases group by policy response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_cases_group_by_policy',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success'),
          response: response
        });
      } catch (error) {
        console.error(`Cases group by policy test failed for ${JSON.stringify(testCase)}:`, error.message);
        this.testResults.push({
          tool: 'get_cases_group_by_policy',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testSensitivityConfigs() {
    console.log('\n=== Testing get_sensitivity_configs ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 15,
        method: "tools/call",
        params: {
          name: "get_sensitivity_configs",
          arguments: { limit: 10 }
        }
      });
      
      console.log('Sensitivity configs response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_sensitivity_configs',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Sensitivity configs test failed:', error.message);
      this.testResults.push({
        tool: 'get_sensitivity_configs',
        success: false,
        error: error.message
      });
    }
  }

  async testTotalClassificationRatios() {
    console.log('\n=== Testing get_total_classification_ratios ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 16,
        method: "tools/call",
        params: {
          name: "get_total_classification_ratios",
          arguments: {}
        }
      });
      
      console.log('Total classification ratios response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_total_classification_ratios',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Total classification ratios test failed:', error.message);
      this.testResults.push({
        tool: 'get_total_classification_ratios',
        success: false,
        error: error.message
      });
    }
  }

  async testDashboardWidget() {
    console.log('\n=== Testing get_dashboard_widget ===');
    const testCases = [
      { widgetType: "compliance_overview" },
      { widgetType: "data_discovery" },
      { widgetType: "security_cases" }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing with: ${JSON.stringify(testCase)}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 17,
          method: "tools/call",
          params: {
            name: "get_dashboard_widget",
            arguments: testCase
          }
        });
        
        console.log('Dashboard widget response:', JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: 'get_dashboard_widget',
          testCase,
          success: response.result?.content?.[0]?.text?.includes('success'),
          response: response
        });
      } catch (error) {
        console.error(`Dashboard widget test failed for ${JSON.stringify(testCase)}:`, error.message);
        this.testResults.push({
          tool: 'get_dashboard_widget',
          testCase,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testACITools() {
    console.log('\n=== Testing ACI Tools ===');
    const aciTools = [
      'get_aci_data_manager',
      'get_aci_data_manager_permissions',
      'get_aci_groups',
      'get_aci_users'
    ];

    for (const tool of aciTools) {
      try {
        console.log(`Testing ${tool}`);
        const response = await this.sendMCPRequest({
          jsonrpc: "2.0",
          id: 18,
          method: "tools/call",
          params: {
            name: tool,
            arguments: {}
          }
        });
        
        console.log(`${tool} response:`, JSON.stringify(response, null, 2));
        this.testResults.push({
          tool: tool,
          success: response.result?.content?.[0]?.text?.includes('success'),
          response: response
        });
      } catch (error) {
        console.error(`${tool} test failed:`, error.message);
        this.testResults.push({
          tool: tool,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testLocationTools() {
    console.log('\n=== Testing Location Tools ===');
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: 19,
        method: "tools/call",
        params: {
          name: "get_locations",
          arguments: {}
        }
      });
      
      console.log('Locations response:', JSON.stringify(response, null, 2));
      this.testResults.push({
        tool: 'get_locations',
        success: response.result?.content?.[0]?.text?.includes('success'),
        response: response
      });
    } catch (error) {
      console.error('Locations test failed:', error.message);
      this.testResults.push({
        tool: 'get_locations',
        success: false,
        error: error.message
      });
    }
  }

  async testMetadataSearchTools() {
    console.log('\n=== Testing Metadata Search Tools ===');
    const metadataTools = [
      'metadata_quick_search',
      'metadata_full_search',
      'metadata_objects_search',
      'metadata_objects_count'
    ];

    const testCases = [
      { searchText: "test" },
      { searchText: "email" },
      { searchText: "customer" }
    ];

    for (const tool of metadataTools) {
      for (const testCase of testCases) {
        try {
          console.log(`Testing ${tool} with ${JSON.stringify(testCase)}`);
          const response = await this.sendMCPRequest({
            jsonrpc: "2.0",
            id: 20,
            method: "tools/call",
            params: {
              name: tool,
              arguments: testCase
            }
          });
          
          console.log(`${tool} response:`, JSON.stringify(response, null, 2));
          this.testResults.push({
            tool: tool,
            testCase,
            success: response.result?.content?.[0]?.text?.includes('success'),
            response: response
          });
        } catch (error) {
          console.error(`${tool} test failed for ${JSON.stringify(testCase)}:`, error.message);
          this.testResults.push({
            tool: tool,
            testCase,
            success: false,
            error: error.message
          });
        }
      }
    }
  }

  async runAllTests() {
    try {
      await this.startServer();
      
      // Core tools
      await this.testHealthCheck();
      await this.testInventoryAggregation();
      await this.testCatalogObjects();
      await this.testCatalogCount();
      await this.testDataCategories();
      await this.testPolicies();
      await this.testSecurityCases();
      await this.testSecurityTrends();
      
      // Additional tools
      await this.testObjectDetails();
      await this.testCatalogTags();
      await this.testCatalogRules();
      await this.testLineageTree();
      await this.testCasesGroupByPolicy();
      await this.testSensitivityConfigs();
      await this.testTotalClassificationRatios();
      await this.testDashboardWidget();
      await this.testACITools();
      await this.testLocationTools();
      await this.testMetadataSearchTools();

      console.log('\n=== Test Summary ===');
      this.testResults.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const schemaStatus = result.schemaValid !== undefined ? 
          (result.schemaValid ? '✅' : '❌') : '';
        console.log(`${status} ${result.tool} ${schemaStatus}`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
        if (result.testCase) {
          console.log(`  Test case: ${JSON.stringify(result.testCase)}`);
        }
      });

      // Summary statistics
      const totalTests = this.testResults.length;
      const passedTests = this.testResults.filter(r => r.success).length;
      const schemaValidTests = this.testResults.filter(r => r.schemaValid === true).length;
      const schemaInvalidTests = this.testResults.filter(r => r.schemaValid === false).length;

      console.log(`\n=== Summary Statistics ===`);
      console.log(`Total tests: ${totalTests}`);
      console.log(`Passed: ${passedTests}`);
      console.log(`Failed: ${totalTests - passedTests}`);
      console.log(`Schema valid: ${schemaValidTests}`);
      console.log(`Schema invalid: ${schemaInvalidTests}`);

    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }
}

// Run the tests
const tester = new MCPTester();
tester.runAllTests(); 