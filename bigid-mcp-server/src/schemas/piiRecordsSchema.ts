import { errorSchema } from './sharedSchemas';
export const piiRecordsSchema = {
  name: 'get_pii_records',
  description: 'Retrieve recent PII records detected across sources',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          pii_records: {
            type: 'array',
            description: 'List of PII record findings',
            items: {
              type: 'object',
              description: 'Single PII finding with linkage back to underlying object and identity',
              properties: {
                _id: { type: 'string', description: 'Unique identifier of the PII record' },
                detected_at: { type: 'string', description: 'Detection timestamp (ISO-8601)' },
                value: { type: 'string', description: 'Detected (masked/encrypted) PII value' },
                correlation_status: { type: 'string', description: 'Correlation status, e.g., sure_match' },
                data_link: {
                  type: 'object',
                  description: 'Technical pointer to the exact field/row/document location of the finding',
                  properties: {
                    position: { type: 'number', description: 'Start position (for string findings)' },
                    length: { type: 'number', description: 'Match length (for string findings)' },
                    proximityId: { type: 'string', description: 'Identifier tying finding to a specific object instance' },
                    dataLinkType: { type: 'string', description: 'e.g., rdb, mongodb' },
                    rowIdentifierValue: { type: 'string', description: 'Stable row/document identifier value' },
                    rowIdentifierExpression: { type: 'string', description: 'Expression used to compute row identifier (RDB)' },
                    shortFieldName: { type: 'string', description: 'Field short name' },
                    fullFieldName: { type: 'string', description: 'Fully qualified field name' },
                    metaDataFieldName: { type: 'string', description: 'Fully qualified metadata field (RDB)' },
                    metadataFieldName: { type: 'string', description: 'Fully qualified metadata field (MongoDB)' },
                    endIndex: { type: 'number', description: 'End position index (for string findings)' },
                    numRepeated: { type: 'number', description: 'Number of repeated occurrences' },
                    dataSourceName: { type: 'string', description: 'Logical data source name (aligns with catalog source)' },
                    containerName: { type: 'string', description: 'High-level container (e.g., database/bucket)' },
                    schemaName: { type: 'string', description: 'Schema/namespace (structured)' },
                    tableName: { type: 'string', description: 'Table/collection alias (structured)' },
                    objectName: { type: 'string', description: 'Object within container (e.g., table/collection)' },
                    dbName: { type: 'string', description: 'Database name (MongoDB)' },
                    collectionName: { type: 'string', description: 'Collection name (MongoDB)' },
                    fieldName: { type: 'string', description: 'Field path (MongoDB)' },
                    documentId: { type: 'string', description: 'Document identifier (MongoDB)' },
                    fullCollectionName: { type: 'string', description: 'container.objectName or db.collection (matches catalog FQN parts)' },
                    fieldType: { type: 'string', description: 'Field type when available' }
                  },
                  additionalProperties: true
                },
                identity_unique_id: { type: 'string', description: 'Stable identity reference for correlation across findings' },
                identity_name: { type: 'string', description: 'Masked identity display name' },
                attribute: { type: 'string', description: 'Attribute name detected (e.g., SongID, UserID)' },
                attr_original_name: { type: 'string', description: 'Original attribute name in the source' },
                attribute_rank: { type: 'number', description: 'Classifier rank/priority for this attribute' },
                scanner_type: { type: 'string', description: 'Scanner type (e.g., rdb-mysql, mongodb, file)' },
                source: { type: 'string', description: 'Source system; aligns with catalog `source` and inventory aggregations' },
                fullCollectionName: { type: 'string', description: 'Fully qualified object identifier components; can be mapped to catalog FQNs' },
                country: { oneOf: [{ type: 'string' }, { type: 'null' }], description: 'Inferred residency/geo when available' },
                system_location: { type: 'string', description: 'Physical/system location context when available' },
                id_source: { type: 'string', description: 'Identity source (e.g., Users)' },
                finding_bigid: { type: 'string', description: 'BigID finding identifier; can be used for deep linking or auditing' },
                scan_id: { type: 'string', description: 'Scan job identifier' },
                org_scan_id: { type: 'string', description: 'Original scan identifier within the org' },
                pii_record_hash: { type: 'string', description: 'Hash of the PII record for deduplication/correlation' },
                confidenceHash: { type: 'string', description: 'Hash used for confidence/correlation' },
                isFullMatch: { type: 'boolean', description: 'True when full value match was detected' },
                record_multi_value_index: { type: 'number', description: 'Index for multi-value fields' },
                risk: { type: 'number', description: 'Risk score associated with this finding' },
                mailId: { oneOf: [{ type: 'string' }, { type: 'null' }], description: 'Mail identifier if email scanner' },
                id: { type: 'string', description: 'Duplicate of _id for convenience' }
              },
              additionalProperties: true
            }
          }
        }
      },
      error: errorSchema
    }
  }
};


