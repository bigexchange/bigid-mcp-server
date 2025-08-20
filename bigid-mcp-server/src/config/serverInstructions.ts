export const SERVER_INSTRUCTIONS = `# BigID MCP Server

## Core Strategy
- Start with metadata_quick_search for discovery, then get_catalog_objects for analysis
- Use structured filters over text search for better performance
- Limit results (5-50 for interactive, max 200)
- Use get_catalog_count to scope large queries before detailed analysis

## Lazy Schema Expansion
- Input schemas are advertised in a token-efficient, top-level form. Nested fields are expandable on demand.
- Output schemas are hidden by default to reduce context size. Use expand_schema with schemaType=output when you need them.
- When you need parameter details for any tool input, call the expand_schema tool:
  - toolName: the target tool name (e.g., get_catalog_objects)
  - path: JSON Pointer to the node to expand (e.g., /properties/structuredFilter). Empty or '/' returns the full schema.
- To fetch an output schema (hidden by default), call expand_schema with: { toolName, schemaType: 'output', path: '' }
- Expand only what you intend to use. Example: before using structuredFilter sub-fields, expand /properties/structuredFilter.

## Key Workflows
**Data Discovery**: metadata_quick_search → get_catalog_count → get_catalog_objects
**Security Investigation**: get_security_cases → get_policies → get_dashboard_widget
**Risk Assessment**: get_inventory_aggregation → get_aci_data_manager → get_lineage_tree

## Inventory Aggregations (get_inventory_aggregation)
**Data Discovery**: Use source aggregation to map data landscape, identify largest repositories
**Compliance**: Use sensitivityFilter for high-risk data concentrations, categoryExtended for PII breakdown
**Performance**: Set limit to 5-20 for dashboards, sort by docCount DESC for high-impact repositories

## Dashboard Widgets (get_dashboard_widget)
**Executive Reporting**: Use group_by_framework for compliance posture, group_by_policy for violation trending
**Operational**: Combine group_by_control with inventory aggregations for audit trails
**Integration**: Start with dashboard widgets for summary, then drill down with inventory aggregations

## ACI Tools
- get_aci_data_manager: Browse data with access summaries
- get_aci_data_manager_permissions: Granular permissions for specific objects
- get_aci_groups: Group analysis and RBAC assessment
- get_aci_users: User access patterns and risk identification

## PII Records (get_pii_records)
- Use to quickly retrieve recent PII findings across sources when validating detections or triaging identity-related incidents

## Performance
- Use structured filters for complex criteria (PII, sensitivity, dates)
- Start with counts before detailed queries
- Apply filters early to reduce data transfer`; 