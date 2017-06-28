import org.activiti.engine.ProcessEngine;
import org.activiti.engine.ProcessEngineConfiguration;
import org.activiti.engine.ProcessEngines;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.junit.Test;

public class WorkflowClientDeploy {

	@Test
	public void deploy()
	{
		
		ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
		 // Create Activiti process engine
		 // ProcessEngine processEngine = ProcessEngineConfiguration
		 //   .createStandaloneProcessEngineConfiguration()
		 //   .buildProcessEngine();

		  // Get Activiti services
		  RepositoryService repositoryService = processEngine.getRepositoryService();
		  RuntimeService runtimeService = processEngine.getRuntimeService();

		  // Deploy the process definition
		  repositoryService.createDeployment()
		    .addClasspathResource("cocktail_production.bpmn20.xml")
		    .deploy();

		  // Start a process instance
		  //runtimeService.startProcessInstanceByKey("financialReport");
		
	}
	
	
}
