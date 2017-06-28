package de.eahjena.wi.workflowmanager.events;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import de.eahjena.wi.workflowmanager.EventBusListener;
import de.eahjena.wi.workflowmanager.engineconnector.WorkflowEngineConnectorTest;
import junit.framework.TestCase;

public class EventManagerTest extends TestCase implements EventBusListener  {

	private static final Logger log = LogManager.getLogger(EventManagerTest.class);
	
	@Test
	public void test()
	{
        EventManager eventManager = new EventManager(this);
        eventManager.connect();
        eventManager.subscribe("workflow/#"); 
        eventManager.publishMessage("workflow/tasklist","Hey Nico");
        eventManager.disconnect();
	}
	
	public void messageReceived(String topic, String message)
	{
		log.debug("new message arrived: topic: '"+topic+"' message: '"+message+"'");
	}
	
	
	
}
