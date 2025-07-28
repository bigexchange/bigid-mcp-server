# BigID MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to BigID's data discovery, catalog, and security APIs. This server enables Claude and other AI assistants to search metadata, explore data catalogs, and monitor security posture across BigID environments.

## Overview

The BigID MCP Server provides 28+ tools for interacting with BigID APIs, including:

- **Data Catalog**: Search and explore data objects, tables, files, and databases
- **Security Monitoring**: Find security issues and compliance violations  
- **Metadata Search**: Advanced search across all data assets
- **Inventory Management**: Get aggregated inventory data and analytics
- **Access Control**: Manage users, groups, and permissions
- **Data Lineage**: Track relationships between data sources

## Prerequisites

- macOS (tested on macOS 14.4+)
- Node.js 18+ (will be installed if missing)
- BigID user token and domain
- Chrome browser (for viewing setup guide)

## Quick Installation

1. **Extract the package**:
   ```bash
   tar -xzf bigid-mcp-server-*.tar.gz
   cd bigid-mcp-server-*
   ```

2. **Run the install script**:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Configure Claude Desktop** (see Configuration section below)

The install script will automatically:
- Install Homebrew and Node.js if missing
- Install all required dependencies
- Build the TypeScript application
- Create a Claude Desktop configuration template
- Open the setup guide in Chrome

## Configuration

### Claude Desktop Setup

1. **Open Claude Desktop Settings**:
   - Click **Claude** in the menu bar
   - Select **Settings**
   - Navigate to the **Developer** tab
   - Click **Edit Config**

2. **Add MCP Server Configuration**:
   ```json
   {
     "mcpServers": {
       "bigid-mcp-server": {
         "command": "node",
         "args": ["/path/to/bigid-mcp-server/dist/server.js"],
         "env": {
           "BIGID_USER_TOKEN": "your-actual-user-token-here",
           "BIGID_DOMAIN": "your-bigid-domain.com",
           "BIGID_AUTH_TYPE": "user_token",
           "BIGID_TIMEOUT": "30000",
           "BIGID_RETRY_ATTEMPTS": "3",
           "NODE_ENV": "production",
           "BIGID_MCP_LOG_LEVEL": "info"
         },
         "description": "BigID data discovery, catalog, and security monitoring"
       }
     }
   }
   ```

3. **Replace the following values**:
   - `/path/to/bigid-mcp-server` with the actual path to your installation
   - `your-actual-user-token-here` with your BigID user token
   - `your-bigid-domain.com` with your BigID server domain

### Getting Your BigID User Token

1. **Go to Your BigID Instance**: Visit your BigID domain
2. **Sign In**: Use your credentials to authenticate
3. **Open Chrome DevTools**: Press `F12` or `Cmd+Option+I`
4. **Go to Network Tab**: Click on the "Network" tab
5. **Refresh the Page**: Press `F5` or `Cmd+R`
6. **Find API Requests**: Look for requests to your BigID domain
7. **Check Authorization Header**: Click on any request, then look in "Request Headers" for "Authorization"
8. **Copy the Token**: Copy the entire Authorization header value

**Important Notes**:
- Tokens typically expire and need to be replaced periodically
- BigID tokens are domain-specific (not cross-domain)
- Keep your tokens secure and don't share them
- Always restart Claude Desktop after changing the config

## Available Tools

### Data Catalog Tools
- `get_catalog_objects` - Search data objects with advanced filtering
- `get_object_details` - Get detailed information about specific objects
- `get_catalog_tags` - Retrieve data catalog tags
- `get_catalog_rules` - Access catalog rules
- `get_catalog_count` - Count objects matching criteria

### Security Tools
- `get_security_cases` - Find security issues and compliance violations
- `get_security_trends` - Monitor security trends and analytics
- `update_case_status` - Update case status (open, closed, ignored)

### Metadata Search Tools
- `metadata_quick_search` - Quick search across metadata
- `metadata_full_search` - Advanced metadata search with comprehensive filtering
- `metadata_objects_search` - Search for specific metadata objects
- `metadata_objects_count` - Count metadata objects

### Inventory Tools
- `get_inventory_aggregation` - Get aggregated inventory data
- `get_entity_types` - Discover available data entity types

### Access Control Tools
- `get_aci_users` - Get users with filtering and pagination
- `get_aci_groups` - Get groups with filtering and pagination
- `get_aci_data_manager` - Get data manager items
- `get_aci_data_manager_permissions` - Get permissions for data manager items

### Additional Tools
- `get_lineage_tree` - Get lineage tree for data relationships
- `get_data_categories` - Get all data categories
- `get_sensitivity_configs` - Get sensitivity classification configurations
- `get_policies` - Get all policies
- `get_dashboard_widget` - Get dashboard widget data
- `get_locations` - Get location data for applications and systems

## Usage Examples

Once configured, you can ask Claude questions like:

- "Find all databases containing PII data"
- "Show me security cases with high severity"
- "What are the most recent data catalog updates?"
- "Find files larger than 1MB that contain sensitive information"
- "Show me the lineage tree for customer data"

## Troubleshooting

### Common Issues

- **MCP Server Not Starting**: Check that Node.js is installed and the server path is correct
- **Authentication Errors**: Verify your BigID user token in the configuration
- **Connection Issues**: Check your network connection and BigID server accessibility
- **Token Expired**: Replace your user token if it has expired

### Security Warning

**Always validate MCP tool queries and results**:
- Inspect tool queries before execution
- Cross-reference Claude's analysis against raw data
- Verify accuracy and permissions
- Don't rely solely on Claude's interpretation

## Manual Installation

If you prefer to install manually:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Configure Claude Desktop** using the configuration example above

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BIGID_USER_TOKEN` | Your BigID user token | Yes | - |
| `BIGID_DOMAIN` | Your BigID domain | Yes | - |
| `BIGID_AUTH_TYPE` | Authentication type | Yes | `user_token` |
| `BIGID_TIMEOUT` | API timeout in milliseconds | No | `30000` |
| `BIGID_RETRY_ATTEMPTS` | Number of retry attempts | No | `3` |
| `NODE_ENV` | Environment | No | `production` |
| `BIGID_MCP_LOG_LEVEL` | Logging level | No | `info` |

## Support

For detailed setup instructions and troubleshooting, see the HTML setup guide that opens automatically during installation, or refer to the `docs/` directory.

---

**Note**: This package contains TypeScript source code that will be compiled during installation. The install script handles all build steps automatically.