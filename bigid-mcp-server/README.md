# BigID MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to BigID's data discovery, catalog, and security APIs. This server enables Claude and other AI assistants to search metadata, explore data catalogs, and monitor security posture across BigID environments.

## Features

### 🔍 **Metadata Search API**
- **Entity Types**: Discover available data entity types
- **Inventory Aggregations**: Get aggregated inventory data

### 📊 **Data Catalog API**
- **Object Discovery**: Find and explore data objects, tables, files, and databases
- **Object Details**: Get detailed information about specific catalog objects
- **Tag Management**: Retrieve and manage data catalog tags
- **Rule Management**: Access and manage catalog rules
- **Advanced Filtering**: Use BigID query language for precise filtering

### 🛡️ **DSPM (Data Security Posture Management) API**
- **Security Cases**: Find security issues and compliance violations
- **Security Trends**: Monitor security trends and analytics
- **Case Management**: Update case status (open, closed, ignored)

### 📚 **API Documentation**
- **Built-in Documentation**: Access detailed API documentation and examples
- **Usage Examples**: Real-world examples for each tool
- **Query Language Guide**: BigID query syntax and operators

## Installation

### Prerequisites
- macOS (tested on macOS 14.4+)
- Node.js 18+ 
- npm or yarn

### Quick Install

1. **Run the install script**:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

2. **Configure Claude Desktop** (see Claude Desktop Configuration section below)

3. **Test the server** (optional):
   ```bash
   # For testing only - set environment variables temporarily
   export BIGID_USER_TOKEN="your-user-token-here"
   export BIGID_DOMAIN="your-bigid-domain.com"
   export BIGID_AUTH_TYPE="user_token"
   node dist/server.js
   ```

### Manual Installation

If you prefer to install manually:

1. **Install Node.js** (if not already installed):
   ```bash
   # Using Homebrew
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BIGID_USER_TOKEN` | Your BigID user token | Yes | - |
| `BIGID_DOMAIN` | Your BigID domain (e.g., sandbox.bigiddemo.com) | Yes | - |
| `BIGID_AUTH_TYPE` | Authentication type: `user_token` or `session` | Yes | `user_token` |
| `BIGID_USERNAME` | Username (for session auth) | No* | - |
| `BIGID_PASSWORD` | Password (for session auth) | No* | - |
| `BIGID_TIMEOUT` | API timeout in milliseconds | No | `30000` |
| `BIGID_RETRY_ATTEMPTS` | Number of retry attempts | No | `3` |
| `NODE_ENV` | Environment (production/development) | No | `production` |
| `BIGID_MCP_LOG_LEVEL` | Logging level | No | `info` |

*Required for session authentication

### Authentication Methods

For Claude Desktop usage, authentication is configured directly in the MCP configuration (see Claude Desktop Configuration section above).

For local testing, you can use environment variables:

#### User Token Authentication (Recommended)
```bash
export BIGID_USER_TOKEN="your-user-token"
export BIGID_DOMAIN="your-bigid-domain.com"
export BIGID_AUTH_TYPE="user_token"
```

#### Session Authentication
```bash
export BIGID_USERNAME="your-username"
export BIGID_PASSWORD="your-password"
export BIGID_DOMAIN="your-bigid-domain.com"
export BIGID_AUTH_TYPE="session"
```

## Claude Desktop Configuration

Add this configuration to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "bigid-mcp-server": {
      "command": "node",
      "args": [
        "/path/to/your/bigid-mcp-server/dist/server.js"
      ],
      "env": {
        "BIGID_USER_TOKEN": "your-actual-user-token-here",
        "BIGID_DOMAIN": "your-bigid-domain.com",
        "BIGID_AUTH_TYPE": "user_token",
        "BIGID_TIMEOUT": "30000",
        "BIGID_RETRY_ATTEMPTS": "3",
        "NODE_ENV": "production",
        "BIGID_MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Configuration Notes:
- Replace `/path/to/your/bigid-mcp-server/dist/server.js` with the actual full path to the server.js file
- Replace `your-bigid-domain.com` with your BigID domain
- **Replace `your-actual-user-token-here` with your actual BigID user token**
- **No environment variables need to be set** - everything is configured in the MCP config
- **The install.sh script automatically generates a personalized configuration** with the correct full path when run from the project directory

## Available Tools

The server provides 53 MCP tools for interacting with BigID APIs:

## Available Resources

The server also provides 1 MCP resource for accessing comprehensive documentation and specifications:

- `bigid://filter-spec` - BigID Filter Query Language specification and examples (YAML format, generated dynamically using BIGID_DOMAIN environment variable)

This resource combines API documentation, query specifications, and sample queries into a single comprehensive reference that can be accessed by Claude Desktop or any MCP client without needing to make API calls.

### Metadata Search Tools

- `get_entity_types` - Get list of available entity types
- `get_inventory_aggregation` - Get inventory aggregation data (consolidated tool for tags, sources, attributes, categories, etc.)
- `export_data` - Export data for analysis
- `get_index_status` - Get the status of the index
- `get_health_check` - Get elastic-search health

### Data Catalog Tools

- `get_catalog_objects` - Primary tool for data discovery with **structured filtering**. Filter all data objects (files, tables, etc.) using intuitive JSON filters that are automatically converted to BigID query language.
- `get_object_details` - Get detailed information about catalog objects
- `get_catalog_tags` - Get all tags from the data catalog
- `get_catalog_rules` - Get all rules from the data catalog
- `get_catalog_count` - Get count of catalog objects with **structured filtering**. Count objects without retrieving full data using intuitive JSON filters.

- `count_catalog_objects_advanced` - Count catalog objects using data-explorer with BigID custom query language

**Structured Filter Examples** (Based on Testing):

**High Confidence (Tested & Working):**
```json
{
  "structuredFilter": {
    "containsPI": true,
    "tags": ["PII", "Confidential"],
    "fileType": ["xlsx", "pdf", "csv"],
    "fileName": "*.csv",
    "sizeInBytes": {
      "value": 1000000,
      "operator": "greaterThan"
    },
    "scannerType": "sharepoint-online-v2",
    "scanStatus": "Completed"
  }
}
```

**Medium Confidence (Partially Tested):**
```json
{
  "structuredFilter": {
    "totalRows": {
      "value": 1000,
      "operator": "greaterThan"
    },
    "riskScore": {
      "value": 75,
      "operator": "greaterThan"
    }
  }
}
```

**Known Limitations:**
- `entityType`, `objectType`, `system`, `datasource`: Field mappings need validation
- Date filters: Need format verification
- Regex patterns: Use wildcards (*) only, no regex syntax
- File owner/creator: Limited pattern support

### Lineage Tools
- `get_lineage_tree` - Get lineage tree with multiple anchor collections to establish relationships between fields in different data sources

### Metadata Search Tools
- `metadata_quick_search` - Perform a quick search across metadata with advanced filtering capabilities. Supports wildcard searches and filters by entity type, source, PII count, scan status, etc. Returns highlighted results grouped by entity type with configurable result limits (1-100 per type).
- `metadata_full_search` - Perform advanced metadata search with comprehensive filtering, sorting, and pagination across BigID catalog. Supports 40+ field filters, 16 sortable fields, and wildcard text search. Returns complete object metadata.
- `metadata_objects_search` - Search for objects in the data explorer using aggregated results. Returns rich object data with pagination support.
- `metadata_objects_count` - Count objects in the data explorer using aggregated results. Returns total count only.

**Key Output Patterns:**
- **Highlighting**: `highlightedValue` fields contain `<em>` tags around search matches
- **Metadata**: `assets` objects contain detailed technical properties  
- **Pagination**: `offset.offsetKey` arrays enable result continuation
- **Entity Types**: All tools include `type` and `id` for object identification
- **Flexibility**: `data` objects vary by entity type but include core identification fields

### BigID Filter Query Language

BigID uses a custom query language for filtering data across all tools. Most tools now support **structured filtering** which automatically converts to BigID query language, making it much easier to use.

**Two approaches available:**
1. **Structured Filters** (Recommended) - Use intuitive JSON objects that convert automatically
2. **Raw BigID Query Language** - Direct query language for advanced use cases

### Filter Reliability Guide

Based on extensive testing, structured filters have varying reliability:

**🟢 High Confidence (Reliable):**
- `containsPI`: Boolean PII detection
- `fileType`: File extension filtering (xlsx, pdf, csv)
- `fileName`: Wildcard patterns (*.csv, *report*)
- `sizeInBytes`: Numeric size comparisons
- `scannerType`: Scanner type filtering
- `scanStatus`: Scan status filtering

**🟡 Medium Confidence (Partially Tested):**
- `tags`: System tag filtering
- `totalRows`: Row count filtering
- `riskScore`: Risk score comparisons
- `isEncrypted`: Encryption status

**🔴 Low Confidence (Needs Validation):**
- `entityType`, `objectType`: Field mapping unclear
- `system`, `datasource`: Field name confusion
- Date filters: Format verification needed
- `fileOwner`, `fileCreator`: Limited pattern support

**Pattern Support:**
- ✅ Wildcards: `*.csv`, `*substring*`, `prefix*`
- ✅ Full Regex: `/.*pattern.*/`, `/^admin$/`, `email|mail` (alternation)
- ✅ Pre-formatted Regex: `/\.xlsx$/` (already wrapped in slashes)
- ✅ Auto-detection: Patterns with `|^$+{}()[]\\` automatically treated as regex

The complete specification is documented in:
- **YAML Spec**: `bigid-filter-spec.yml` - Human-readable specification with examples
- **JSON Schema**: `bigid_filter_schema.json` - Machine-readable schema for validation

**Key Query Language Features:**
- **Operators**: `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT IN`, `LIKE`, `NOT LIKE`, `AND`, `OR`, `NOT`
- **Functions**: `to_date()`, `to_number()`, `to_bool()`, `past()`, `elementmatch()`
- **Field Types**: String, Number, Boolean, Date, Array, Object fields
- **Pattern Matching**: Regex patterns with `/pattern/` syntax
- **Examples**: 
  - `entityType = "database"`
  - `tags IN ("PII", "Confidential")`  
  - `fileSize > to_number(1000000) AND lastAccessedDate < past("30d")`
  - `columnOrFieldOccurrencesCounter = elementmatch(fieldName=/Email|email/)`

### DSPM Tools
- `get_security_cases` - Get security cases with **structured filtering**. Filter by severity, caseStatus, and use advanced structured filters for complex queries alongside searchText, skip, and limit parameters.
- `get_security_trends` - Get security trends and analytics
- `get_critical_cases` - Get count of security issue cases by severity
- `update_case_status` - Update the status of a security case

### Quick Search Tools


### Data Categories Tools
- `get_data_categories` - Get all data categories
- `create_data_category` - Create a new data category

### Sensitivity Classification Tools
- `get_sensitivity_configs` - Get all sensitivity classification configurations
- `create_sensitivity_config` - Create a new sensitivity classification configuration
- `get_sensitivity_config_by_id` - Get a specific sensitivity configuration by ID
- `update_sensitivity_config` - Update an existing sensitivity configuration
- `delete_sensitivity_config` - Delete a sensitivity configuration
- `get_total_classification_ratios` - Get total classification ratios
- `get_classification_ratio_by_name` - Get classification ratio by name
- `get_classification_ratio_by_id` - Get classification ratio by ID

### Policies Tools
- `get_policies` - Get all policies
- `create_policy` - Create a new policy
- `get_policy` - Get a specific policy by ID
- `update_policy` - Update an existing policy
- `delete_policy` - Delete a policy
- `test_policy` - Test a policy

### Inventory Aggregation Tools
- `get_inventory_aggregation` - Get inventory aggregation data (consolidated tool for tags, sources, attributes, categories, etc.)

### Dashboard Widget Tools
- `get_dashboard_widget` - Get dashboard widget data for compliance reporting and analytics (consolidated tool for frameworks, controls, policies, data source types)

### ACI (Access Control & Identity) Tools
- `get_aci_data_manager` - Get data manager items with optional filtering and pagination
- `get_aci_data_manager_permissions` - Get permissions for a specific data manager item
- `get_aci_groups` - Get groups with optional filtering and pagination
- `get_aci_users` - Get users with optional filtering and pagination

### Actionable Insights Tools
- `get_actionable_insights_cases` - Get cases grouped by policy with optional filtering and pagination

### Activity Highlights Tools
- `get_activity_highlights_snapshots` - Get activity highlights snapshots
- `get_activity_highlights_current` - Get current activity highlights

### Location Tools
- `get_locations` - Get location data for applications, identities, or systems (consolidated tool)

### Data Catalog Additional Tools
- `get_catalog_all_tag_pairs` - Get all tag pairs from the data catalog

### Documentation Tool
- `get_api_documentation` - Get detailed API documentation and examples


## Usage Examples

### Getting Started
1. **Install and configure** the server using the install script
2. **Add the MCP configuration** to Claude Desktop with your BigID token
3. **Get API documentation**:
   ```
   Use the get_api_documentation tool to see detailed examples and usage patterns
   ```

4. **Simple search**:
   ```
   Search for users named "john" using get_catalog_objects_post
   ```

5. **Find data assets**:
   ```
   Use get_catalog_objects_post to discover databases and tables
   ```

6. **Monitor security**:
   ```
   Use get_security_cases to find compliance violations
   ```

### Security Cases Filtering

The `get_security_cases` tool supports multiple filtering options:

1. **Using built-in parameters**:
   - `severity`: "critical", "high", "medium", "low" (automatically converted to uppercase)
   - `caseStatus`: "open", "closed", "ignored"

2. **Using structured filtering** (Recommended):
   - `structuredFilter`: Use intuitive JSON objects that automatically convert to BigID query language
   ```json
   {
     "structuredFilter": {
       "tags": ["PII", "Sensitive"],
       "containsPI": true,
       "system": ["MySQL", "PostgreSQL"],
       "lastAccessedDate": {
         "value": {
           "type": "past",
           "amount": 7,
           "unit": "d"
         },
         "operator": "lessThan"
       }
     }
   }
   ```

**Note**: The tool uses the `/cases-group-by-policy` endpoint as intended. Structured filters provide more intuitive querying than raw BigID query language.

### Query Language Examples

BigID uses a custom query language for filtering:

- `entityType=database` - Find all databases
- `tags=PII`