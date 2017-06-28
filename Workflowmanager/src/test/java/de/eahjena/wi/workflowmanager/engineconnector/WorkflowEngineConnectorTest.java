package de.eahjena.wi.workflowmanager.engineconnector;

import static org.junit.Assert.*;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Test;

import de.eahjena.wi.domain.TaskList;
import de.eahjena.wi.workflowmanager.events.EventManager;

public class WorkflowEngineConnectorTest {
	
	private static final Logger log = LogManager.getLogger(WorkflowEngineConnectorTest.class);

	//@Test
	public void testStart() {
		
		WorkflowEngineConnector connector = new WorkflowEngineConnector();
		for(int i=0;i<6;i++)
		{
			connector.startFromJSONSpecification("{'processId':'cocktail_production', 'productId':'dummy'}");
		}
		//connector.listGroup("service");
	}
	
	//@Test
	public void claimTest() {
		
		WorkflowEngineConnector connector = new WorkflowEngineConnector();
		//connector.start("cocktail_production");
		connector.claim("28997", "nbrehm");
		
	}
	
	//@Test
	public void testDelete()
	{
		WorkflowEngineConnector connector = new WorkflowEngineConnector();
		connector.deleteProcessInstance("12501", "testing...");
	}
	
	@Test
	public void testDeleteAll()
	{
		log.debug("deleting all process instances...");
		WorkflowEngineConnector connector = new WorkflowEngineConnector();
		for(String processId : connector.getAllProcessInstanceIds("cocktail_production"))
		{
			connector.deleteProcessInstance(processId, "testing...");
		}
	}
	

}
