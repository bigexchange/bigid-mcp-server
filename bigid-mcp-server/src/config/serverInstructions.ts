export const SERVER_INSTRUCTIONS = `# BigID MCP Server - Strategic Usage Guide

## 🎯 Core Strategy

**Progressive Discovery**: Start with metadata_quick_search for discovery, then get_catalog_objects for analysis, use get_catalog_count to scope large queries.

**Performance First**: Limit results (5-50 for interactive, max 200), use structured filters over text search, start broad then narrow.

## 🔍 Key Workflows

### **Data Discovery**
1. metadata_quick_search({text: "customer", top: 10}) - Initial exploration
2. get_catalog_count({structuredFilter: {entityType: ["file"]}}) - Scope results  
3. get_catalog_objects({structuredFilter: {entityType: ["file"], containsPI: true}, limit: 50}) - Detailed analysis

### **Security Investigation**
1. get_security_cases({filter: [{"field":"severity","value":"HIGH"}]}) - High-risk issues
2. get_policies({}) - Policy context
3. get_dashboard_widget({widgetType: "group_by_policy"}) - Compliance overview

### **Risk Assessment**
1. get_inventory_aggregation({aggregationType: "sensitivityFilter"}) - Sensitivity distribution
2. get_aci_data_manager({}) - External access exposure
3. get_lineage_tree({anchorCollections: ["critical.table"]}) - Impact analysis

## ⚡ Performance Tips

- Use structured filters for complex criteria (PII, sensitivity, dates)
- Start with counts before detailed queries
- Cache common search patterns
- Apply filters early to reduce data transfer

## Inventory Aggregations (get_inventory_aggregation)

### Data Discovery & Mapping:
- Start with source aggregation to map data landscape and identify largest repositories
- Use source.type to understand technology stack distribution (s3-v2, smb, mysql, etc.)
- Apply dataFormat aggregation to analyze file type distributions and storage patterns

### Compliance & Risk Assessment:
- Use sensitivityFilter to identify high-risk data concentrations by classification levels
- Apply categoryExtended for detailed PII breakdown grouped by data categories
- Leverage tags aggregation to analyze retention policies and system-applied classifications

### Data Quality & Management:
- Use duplicateFiles to identify data redundancy and storage optimization opportunities
- Apply objectStatus to monitor data processing and scanning coverage
- Combine attribute aggregation with other filters for field-level analysis

### Performance Optimization:
- Set limit to 5-20 for dashboard views to prevent overwhelming responses
- Always sort by docCount DESC to prioritize high-impact data repositories
- Use paging for large datasets to manage API response times

## Dashboard Widgets (get_dashboard_widget)

### Executive Reporting:
- Use group_by_framework for comprehensive compliance posture dashboards
- Apply group_by_data_source_type to show risk profiles by system technology
- Leverage group_by_policy for violation trending and remediation priority

### Operational Management:
- Combine group_by_control with inventory aggregations for detailed audit trails
- Use framework widgets to identify control gaps requiring immediate attention
- Apply data source type grouping to allocate security resources effectively

### Integration Patterns:
- Start with dashboard widgets for executive summary, then drill down with inventory aggregations
- Use framework compliance data to prioritize which data sources need detailed inventory analysis
- Combine sensitivity aggregations with compliance widgets for complete governance view

## ⚠️ Critical Guidelines

- NEVER estimate - always page through large result sets for exact information
- Use widget and inventory tools for dashboard/report creation
- Tool failures often indicate no matching data, not system errors
- Validate object existence before detail queries`; 