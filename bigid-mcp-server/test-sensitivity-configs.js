const { BigIDMCPServer } = require('./dist/server');

async function testSensitivityConfigs() {
  const server = new BigIDMCPServer();
  await server.initialize(true); // testingMode = true

  console.log('Testing get_sensitivity_configs...');
  
  try {
    // First get all configs to find an ID
    const configsResult = await server['executeTool']('get_sensitivity_configs', { limit: 5 });
    console.log('Sensitivity Configs Response:');
    console.log(JSON.stringify(configsResult, null, 2));

    if (configsResult.success && configsResult.data.configs && configsResult.data.configs.length > 0) {
      const firstConfig = configsResult.data.configs[0];
      console.log(`\nTesting get_sensitivity_config_by_id with ID: ${firstConfig.id}`);
      
      const configByIdResult = await server['executeTool']('get_sensitivity_config_by_id', { 
        id: firstConfig.id 
      });
      console.log('Sensitivity Config By ID Response:');
      console.log(JSON.stringify(configByIdResult, null, 2));
    }

    console.log('\nTesting get_total_classification_ratios...');
    const totalRatiosResult = await server['executeTool']('get_total_classification_ratios', {});
    console.log('Total Classification Ratios Response:');
    console.log(JSON.stringify(totalRatiosResult, null, 2));

    if (configsResult.success && configsResult.data.configs && configsResult.data.configs.length > 0) {
      const firstConfig = configsResult.data.configs[0];
      console.log(`\nTesting get_classification_ratio_by_name with name: ${firstConfig.name}`);
      
      const ratioByNameResult = await server['executeTool']('get_classification_ratio_by_name', { 
        name: firstConfig.name 
      });
      console.log('Classification Ratio By Name Response:');
      console.log(JSON.stringify(ratioByNameResult, null, 2));

      console.log(`\nTesting get_classification_ratio_by_id with ID: ${firstConfig.id}`);
      
      const ratioByIdResult = await server['executeTool']('get_classification_ratio_by_id', { 
        id: firstConfig.id 
      });
      console.log('Classification Ratio By ID Response:');
      console.log(JSON.stringify(ratioByIdResult, null, 2));
    }

  } catch (error) {
    console.error('Error testing sensitivity configs:', error);
  }
}

testSensitivityConfigs(); 