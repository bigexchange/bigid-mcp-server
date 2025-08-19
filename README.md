# BigID MCP Server

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=bigid&config=eyJjb21tYW5kIjoibnB4IGJpZ2lkLW1jcC1zZXJ2ZXIiLCJlbnYiOnsiQklHSURfVVNFUl9UT0tFTiI6IllPVVJfQklHSURfVVNFUl9UT0tFTiIsIkJJR0lEX0RPTUFJTiI6IllPVVJfQklHSURfRE9NQUlOIiwiQklHSURfQVVUSF9UWVBFIjoidXNlcl90b2tlbiIsIkJJR0lEX1RJTUVPVVQiOiIzMDAwMCIsIkJJR0lEX1JFVFJZX0FUVEVNUFRTIjoiMyIsIkJJR0lEX01DUF9MT0dfTEVWRUwiOiJpbmZvIn0sInRyYW5zcG9ydFR5cGUiOiJzdGRpbyJ9)

This MCP Server provides tools to interact with the BigID API, allowing AI agents to access data discovery, catalog, and security features.

## Installation and Setup

This server can be used with any DXT-compatible application or configured to run directly in your preferred IDE (Cursor, Cline, etc).

### DXT Installation (Recommended)

1.  Go to the [releases page](https://github.com/bigexchange/bigid-mcp-server/releases) for this repository.
2.  Download the latest `.dxt` file from the assets section.
3.  Open the downloaded `.dxt` file in a DXT-compatible application like Claude Desktop. This will start the installation process.
4.  You will be prompted to configure the required environment variables (`BIGID_USER_TOKEN`, `BIGID_DOMAIN`, etc.) during setup.

### Manual Setup (using NPX)

The following sections describe how to set up the server manually using `npx`.

#### For Cline Desktop

You can configure the server to run directly with `npx` in Cline Desktop's MCP settings. There are two ways to do this:

#### Option 1: Using the Cline Desktop UI

1.  **Open Cline Desktop's settings.**
2.  Navigate to the **MCP (Model Context Protocol)** section.
3.  Click **"Add Server"** and configure it as follows:

    *   **Server Name:** `BigID MCP Server` (or any name you prefer)
    *   **Command:** `npx`
    *   **Arguments:** `bigid-mcp-server`
    *   **Environment Variables:**
        *   `BIGID_USER_TOKEN`: Your BigID user token.
        *   `BIGID_DOMAIN`: Your BigID domain.
        *   `BIGID_AUTH_TYPE`: `user_token` (recommended) or `session`.
        *   `BIGID_TIMEOUT`: (Optional) API timeout in milliseconds (default: 30000).
        *   `BIGID_RETRY_ATTEMPTS`: (Optional) Number of retry attempts (default: 3).
        *   `BIGID_MCP_LOG_LEVEL`: (Optional) Logging level (e.g., 'info', 'debug').

4.  **Save the settings and restart Cline.**

The server will now be managed by Cline and will start automatically.

#### Option 2: Manual JSON Configuration

Alternatively, you can add the following JSON object to your `cline_mcp_settings.json` file:

```json
{
  "mcpServers": {
    "bigid": {
      "command": "npx",
      "args": [
        "bigid-mcp-server"
      ],
      "env": {
        "BIGID_USER_TOKEN": "YOUR_BIGID_USER_TOKEN",
        "BIGID_DOMAIN": "YOUR_BIGID_DOMAIN",
        "BIGID_AUTH_TYPE": "user_token",
        "BIGID_TIMEOUT": "30000",
        "BIGID_RETRY_ATTEMPTS": "3",
        "BIGID_MCP_LOG_LEVEL": "info"
      },
      "transportType": "stdio"
    }
  }
}
```

Replace `"YOUR_BIGID_USER_TOKEN"` and `"YOUR_BIGID_DOMAIN"` with your actual credentials.

#### For Cursor

Add the following to your `mcp_servers.json` file:

```json
{
"bigid": {
  "command": "npx",
  "args": [
    "bigid-mcp-server"
  ],
  "env": {
    "BIGID_USER_TOKEN": "YOUR_BIGID_USER_TOKEN",
    "BIGID_DOMAIN": "YOUR_BIGID_DOMAIN",
    "BIGID_AUTH_TYPE": "user_token",
    "BIGID_TIMEOUT": "30000",
    "BIGID_RETRY_ATTEMPTS": "3",
    "BIGID_MCP_LOG_LEVEL": "info"
  }
}}
```

Replace `"YOUR_BIGID_USER_TOKEN"` and `"YOUR_BIGID_DOMAIN"` with your actual credentials.

## Usage

The server provides over 28 tools for interacting with BigID. Here are a few examples:

### `get_catalog_objects(filter: string)`

This tool searches for data objects in the BigID catalog.

*   `filter`: A structured filter to apply to the search.

**Example:**

```
get_catalog_objects(
  filter: "type='table' and sensitivity='highly-sensitive'"
)
```

### `get_security_cases(status: string)`

This tool retrieves security cases from BigID.

*   `status`: The status of the cases to retrieve (e.g., 'open', 'closed').

**Example:**

```
get_security_cases(
  status: "open"
)
```

## Available Tools

### ACI Tools
- `getDataManager`
- `getDataManagerPermissions`
- `getGroups`
- `getUsers`

### Catalog Tools
- `getCatalogObjectsPost`
- `getObjectDetails`
- `getTags`
- `getRules`
- `getCatalogCount`

### Data Categories Tools
- `getDataCategories`
- `createDataCategory`

### DSPM Tools
- `getSecurityCases`
- `getSecurityTrends`
- `getCasesGroupByPolicy`

### Inventory Tools
- `getInventoryAggregation`

### Lineage Tools
- `getLineageTree`

### Location Tools
- `getLocations`

### Metadata Search Tools
- `quickSearch`
- `fullSearch`
- `objectsSearch`
- `objectsCount`

### PII Tools
- `getPiiRecords`

### Policies Tools
- `getPolicies`

### Sensitivity Classification Tools
- `getScConfigs`
- `getScConfigById`
- `getTotalClassificationRatios`
- `getClassificationRatioByName`
- `getClassificationRatioById`

### Widget Tools
- `getDashboardWidget`

## Development

### Prerequisites

*   Node.js >= 18.0.0
*   npm

### Setup

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Server

To run the MCP server directly for testing, you can use `npm start` or `npx`:

```bash
npm start
```

Or, if you want to run it without cloning the repository:

```bash
npx bigid-mcp-server

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BIGID_USER_TOKEN` | Your BigID user token | Yes | - |
| `BIGID_DOMAIN` | Your BigID domain | Yes | - |
| `BIGID_AUTH_TYPE` | Authentication type (`user_token` or `session`) | Yes | `user_token` |
| `BIGID_TIMEOUT` | API timeout in milliseconds | No | `30000` |
| `BIGID_RETRY_ATTEMPTS` | Number of retry attempts on failure | No | `3` |
| `NODE_ENV` | Node.js environment | No | `production` |
| `BIGID_MCP_LOG_LEVEL` | Logging level for the server | No | `info` |
