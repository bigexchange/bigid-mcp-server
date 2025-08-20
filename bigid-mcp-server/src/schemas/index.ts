// Import shared schemas
// Importing module solely for re-export, so convert to type-only re-exports below

// Import all tool schemas
import { inventoryAggregationSchema } from './inventoryAggregationSchema';
import { healthCheckSchema } from './healthCheckSchema';
import { catalogObjectsSchema } from './catalogObjectsSchema';
import { objectDetailsSchema } from './objectDetailsSchema';
import { catalogTagsSchema } from './catalogTagsSchema';
import { catalogRulesSchema } from './catalogRulesSchema';
import { catalogCountSchema } from './catalogCountSchema';
import { lineageTreeSchema } from './lineageTreeSchema';
import { securityCasesSchema } from './securityCasesSchema';
import { securityTrendsSchema } from './securityTrendsSchema';
import { casesGroupByPolicySchema } from './casesGroupByPolicySchema';
import { dataCategoriesSchema } from './dataCategoriesSchema';
import { sensitivityConfigsSchema } from './sensitivityConfigsSchema';
import { sensitivityConfigByIdSchema } from './sensitivityConfigByIdSchema';
import { totalClassificationRatiosSchema } from './totalClassificationRatiosSchema';
import { classificationRatioByNameSchema } from './classificationRatioByNameSchema';
import { classificationRatioByIdSchema } from './classificationRatioByIdSchema';
import { policiesSchema } from './policiesSchema';
import { dashboardWidgetSchema } from './dashboardWidgetSchema';
import { aciDataManagerSchema } from './aciDataManagerSchema';
import { aciDataManagerPermissionsSchema } from './aciDataManagerPermissionsSchema';
import { aciGroupsSchema } from './aciGroupsSchema';
import { aciUsersSchema } from './aciUsersSchema';
import { locationsSchema } from './locationsSchema';
import { metadataQuickSearchSchema } from './metadataQuickSearchSchema';
import { metadataFullSearchSchema } from './metadataFullSearchSchema';
import { metadataObjectsSearchSchema } from './metadataObjectsSearchSchema';
import { metadataObjectsCountSchema } from './metadataObjectsCountSchema';
import { piiRecordsSchema } from './piiRecordsSchema';
import { SchemaRegistry, ToolSchemaDescriptor } from '../utils/SchemaRegistry';
import { expandSchemaToolSchema } from './expandSchema';

// Re-export shared schemas (remove unused local import)
export { errorSchema, messageSchema, statusSchema, statusCodeSchema, successResponseSchema, expandSchemaInput } from './sharedSchemas';

// Re-export all tool schemas
export { inventoryAggregationSchema } from './inventoryAggregationSchema';
export { healthCheckSchema } from './healthCheckSchema';
export { catalogObjectsSchema } from './catalogObjectsSchema';
export { objectDetailsSchema } from './objectDetailsSchema';
export { catalogTagsSchema } from './catalogTagsSchema';
export { catalogRulesSchema } from './catalogRulesSchema';
export { catalogCountSchema } from './catalogCountSchema';
export { lineageTreeSchema } from './lineageTreeSchema';
export { securityCasesSchema } from './securityCasesSchema';
export { securityTrendsSchema } from './securityTrendsSchema';
export { casesGroupByPolicySchema } from './casesGroupByPolicySchema';
export { dataCategoriesSchema } from './dataCategoriesSchema';
export { sensitivityConfigsSchema } from './sensitivityConfigsSchema';
export { sensitivityConfigByIdSchema } from './sensitivityConfigByIdSchema';
export { totalClassificationRatiosSchema } from './totalClassificationRatiosSchema';
export { classificationRatioByNameSchema } from './classificationRatioByNameSchema';
export { classificationRatioByIdSchema } from './classificationRatioByIdSchema';
export { policiesSchema } from './policiesSchema';
export { dashboardWidgetSchema } from './dashboardWidgetSchema';
export { aciDataManagerSchema } from './aciDataManagerSchema';
export { aciDataManagerPermissionsSchema } from './aciDataManagerPermissionsSchema';
export { aciGroupsSchema } from './aciGroupsSchema';
export { aciUsersSchema } from './aciUsersSchema';
export { locationsSchema } from './locationsSchema';
export { metadataQuickSearchSchema } from './metadataQuickSearchSchema';
export { metadataFullSearchSchema } from './metadataFullSearchSchema';
export { metadataObjectsSearchSchema } from './metadataObjectsSearchSchema';
export { metadataObjectsCountSchema } from './metadataObjectsCountSchema';
export { piiRecordsSchema } from './piiRecordsSchema';

// Export all schemas as an array for easy registration
export const allSchemas = [
  inventoryAggregationSchema,
  healthCheckSchema,
  catalogObjectsSchema,
  objectDetailsSchema,
  catalogTagsSchema,
  catalogRulesSchema,
  catalogCountSchema,
  lineageTreeSchema,
  securityCasesSchema,
  securityTrendsSchema,
  casesGroupByPolicySchema,
  dataCategoriesSchema,
  sensitivityConfigsSchema,
  sensitivityConfigByIdSchema,
  totalClassificationRatiosSchema,
  classificationRatioByNameSchema,
  classificationRatioByIdSchema,
  policiesSchema,
  dashboardWidgetSchema,
  aciDataManagerSchema,
  aciDataManagerPermissionsSchema,
  aciGroupsSchema,
  aciUsersSchema,
  locationsSchema,
  metadataQuickSearchSchema,
  metadataFullSearchSchema,
  metadataObjectsSearchSchema,
  metadataObjectsCountSchema,
  piiRecordsSchema,
  expandSchemaToolSchema,
];

/**
 * Build a registry-aware list of tool schemas to advertise to the MCP client.
 * - When lazyInput=true, input schemas are truncated to top-level depth and examples stripped
 * - When hideOutput=true, output schemas are removed from the advertised tool list
 */
export function buildAdvertisedSchemas(lazyInput: boolean, hideOutput: boolean) {
  const registryInput: ToolSchemaDescriptor[] = allSchemas.map((t: any) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    outputSchema: t.outputSchema,
  }));
  const registry = new SchemaRegistry(registryInput);

  return allSchemas.map((tool: any) => {
    let inputSchema = tool.inputSchema;

    if (lazyInput && tool.inputSchema) {
      inputSchema = registry.createTruncatedInputSchema(tool.inputSchema, 1);
      // Also strip heavy example arrays under lazy mode to save tokens
      const stripExamples = (node: any) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node.examples)) {
          delete node.examples;
        }
        for (const key of Object.keys(node)) {
          const val = (node as any)[key];
          if (val && typeof val === 'object') stripExamples(val);
        }
      };
      stripExamples(inputSchema);
    }

    // Append target requirement hint
    let description = tool.description as string;
    try {
      const required: string[] | undefined = tool.inputSchema?.required;
      if (required && required.length > 0) {
        const targetFields = required.filter((f: string) => /fullyQualifiedName|objectId|anchorCollections|itemPath/i.test(f));
        if (targetFields.length > 0) {
          description = `${description} (Requires target: ${targetFields.join(', ')})`;
        }
      }
    } catch {}

    const advertised: any = { ...tool, description };
    if (inputSchema) advertised.inputSchema = inputSchema;
    if (hideOutput && advertised.outputSchema) delete advertised.outputSchema;
    return advertised;
  });
}

export function createSchemaRegistry() {
  const registryInput: ToolSchemaDescriptor[] = allSchemas.map((t: any) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    outputSchema: t.outputSchema,
  }));
  return new SchemaRegistry(registryInput);
}