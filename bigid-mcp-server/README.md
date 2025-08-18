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
   ./install.sh
   ```

3. **Configure your MCP client** (see Configuration section below)

The install script will automatically:
- Install Homebrew and Node.js if missing
- Install all required dependencies
- Build the TypeScript application
- Create MCP client configuration templates
- Open the setup guide in Chrome

## Configuration

### Authentication

The BigID MCP Server supports two authentication methods:

1. **User Token Authentication (Recommended)**: 
   - Uses the BigID refresh endpoint to exchange a user token for a system token
   - System tokens are automatically cached and refreshed when needed
   - More secure and follows BigID best practices
   - Set `BIGID_AUTH_TYPE=user_token` and provide `BIGID_USER_TOKEN`

2. **Session Authentication**:
   - Uses username/password to create a session token
   - Set `BIGID_AUTH_TYPE=session` and provide `BIGID_USERNAME`/`BIGID_PASSWORD`

### MCP Client Setup

#### Claude Desktop

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

#### Gemini CLI

**Option 1: Google Account Authentication (Recommended)**
1. **Install Gemini CLI** (if not already installed):
   ```bash
   brew install gemini-cli
   ```

2. **Create Gemini Configuration**:
   Create `~/.gemini/settings.json` or `.gemini/settings.json` in your working directory:
   ```json
   {
     "mcpServers": {
       "bigid-mcp": {
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
         "timeout": 30000
       }
     }
   }
   ```

3. **Start Gemini CLI and authenticate**:
   ```bash
   gemini
   ```
   When you first launch Gemini CLI, you'll be prompted to choose your authentication method. Select Google account authentication for the simplest setup.

**Option 2: API Key Authentication**
1. **Set your Gemini API key** (if desired):
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
   Or add it to your shell config file (`~/.zshrc` or `~/.bashrc`):
   ```bash
   echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Follow the same configuration steps as Option 1**

### Getting Your BigID User Token

1. **Go to Your BigID Instance**: Visit your BigID domain
2. **Sign In**: Use your credentials to authenticate
3. **Navigate to Access Management**: Go to the Access Management section in your BigID instance
4. **Generate API Token**: Look for the option to generate Tokens
5. **GENERATE a Token**: Click the GENERATE button
6. **Set Expiry**: Configure the token expiry period as needed
7. **Copy the Token**: Copy the generated token value
8. **SAVE your Changes**: Click SAVE
9. **Add your token to the config**: Paste your token into the BIGID_USER_TOKEN value

**Important Notes**:
- The MCP server supports both access tokens and refresh tokens automatically
- Access tokens are used directly for API calls
- Refresh tokens are exchanged for system tokens using the refresh endpoint
- System tokens are cached for 1 hour and automatically refreshed when needed
- Tokens typically expire and need to be replaced periodically
- BigID tokens are domain-specific (not cross-domain)
- Keep your tokens secure and don't share them
- Always restart your MCP client after changing the config

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

Once configured, you can ask your AI assistant questions like:

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
- **Gemini CLI Issues**: Ensure you're authenticated with `gemini auth login` or have set your API key

### Security Warning

**Always validate MCP tool queries and results**:
- Inspect tool queries before execution
- Cross-reference AI analysis against raw data
- Verify accuracy and permissions
- Don't rely solely on AI interpretation

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

3. **Configure your MCP client** using the configuration examples above

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