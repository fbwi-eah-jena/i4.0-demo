package de.eahjena.wi.workflowmanager;

public interface EventBusListener {

	public void messageReceived(String topic, String message);
	
}
