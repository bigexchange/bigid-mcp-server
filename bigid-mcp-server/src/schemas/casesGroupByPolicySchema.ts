export const casesGroupByPolicySchema = {
  name: 'get_cases_group_by_policy',
  description: 'Get grouped security cases by policy for compliance reporting',
  inputSchema: {
    type: 'object',
    properties: {
      groupBy: {
        type: 'string',
        enum: ['policy', 'severity', 'status', 'dataSource'],
        description: 'How to group the cases'
      },
      filter: { 
        type: 'string', 
        description: 'Filter criteria for cases'
      },
      limit: { 
        type: 'number', 
        description: 'Number of cases to return'
      },
      skip: { 
        type: 'number', 
        description: 'Number of cases to skip'
      },
      requireTotalCount: { 
        type: 'boolean', 
        description: 'Whether to include total count in response'
      }
    }
  }
}; 