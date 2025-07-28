import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Simple test MCP server
class TestMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'test-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
        instructions: 'Test MCP server for debugging',
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Register a simple test tool
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_tool',
            description: 'A simple test tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'A test message'
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === 'test_tool') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Test tool called with: ${args.message || 'no message'}`
              })
            }
          ]
        };
      }
      
      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async start() {
    try {
      console.error('Starting test MCP server...');
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('Test MCP server started successfully');
    } catch (error) {
      console.error('Failed to start test MCP server:', error);
      process.exit(1);
    }
  }
}

// Start the test server
const server = new TestMCPServer();
server.start().catch((error) => {
  console.error('Test server startup failed:', error);
  process.exit(1);
}); 