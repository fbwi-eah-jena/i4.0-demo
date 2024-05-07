package de.eahjena.wi.workflowmanager.engineconnector;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.naming.OperationNotSupportedException;

import org.activiti.engine.ProcessEngine;
import org.activiti.engine.ProcessEngineConfiguration;
import org.activiti.engine.ProcessEngines;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.runtime.ProcessInstanceQuery;
import org.activiti.engine.repository.ProcessDefinition;
import org.activiti.engine.repository.Deployment;
import org.activiti.engine.task.Task;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import de.eahjena.wi.domain.Component;
import de.eahjena.wi.domain.TaskList; 


public class WorkflowEngineConnector {

	private static final Logger log = LogManager.getLogger(WorkflowEngineConnector.class);
	
	ProcessEngine processEngine = null;
	RepositoryService repositoryService = null;
	RuntimeService runtimeService = null;
	TaskService taskService = null;
	
	public WorkflowEngineConnector()
	{
		init();
	}
	
	private void init()
	{
		// Create Activiti process engine
		
		processEngine = ProcessEngines.getDefaultProcessEngine();
		/**
		processEngine = ProcessEngineConfiguration
		    .createStandaloneProcessEngineConfiguration()
		    .buildProcessEngine();
		**/

		  // Get Activiti services
		  repositoryService = processEngine.getRepositoryService();
		  runtimeService = processEngine.getRuntimeService();
		  taskService = processEngine.getTaskService();

		  Deployment deployment = repositoryService.createDeployment()
		    .addClasspathResource("simple_cocktail_production.bpmn20.xml")
		    .deploy();
	}
	
	public void start(String processId)
	{
		// Start a process instance
		  log.debug("Starting process instance '"+processId+"'...");
		  runtimeService.startProcessInstanceByKey(processId);
		  log.debug("process '"+processId+"' started...");
	}
	
	public void startFromJSONSpecification(String jsonSpecification)
	{
		// Start a process instance with order data
		log.debug("Trying to start process from JSON specification...");
		JSONObject json = new JSONObject(jsonSpecification);
		String processId = null;
		String productId = null;
		try{
			processId = json.getString("processId");
			productId = json.getString("productId");
		}
		catch(Exception exc)
		{
			log.error(exc);
		}
		if(processId!=null && productId!=null)
		{
			HashMap<String, Object> variables = new HashMap<String, Object> ();
			variables.put("productId", productId);
			variables.put("orderData", jsonSpecification);
			ProcessInstance instance = runtimeService.startProcessInstanceByKey(processId, variables);
			log.debug("process '"+processId+"' started... oder Data set");
		}
		else
		{
			log.error("process could not be started becuase of unknown parameters in json specification");
			log.error("processId: "+processId);
			log.error("productId: "+productId);
		}
	}
	
	public TaskList listCandidateGroup(String groupId)
	{
		TaskList tasklist = new TaskList();
		tasklist.setGroupId(groupId);
		log.debug("fetching tasks for group: '"+groupId+"'");
		List<Task> tasks = taskService.createTaskQuery().taskCandidateGroup(groupId).list();
		fillTaskList(tasklist, tasks);
		return tasklist;

	}
	
	public TaskList listCandidateUser(String userId)
	{
		TaskList tasklist = new TaskList();
		tasklist.setUserId(userId);
		log.debug("fetching tasks for user: '"+userId+"'");
		List<Task> tasks = taskService.createTaskQuery().taskCandidateUser(userId).list();
		fillTaskList(tasklist, tasks);
		return tasklist;
	}
	
	public TaskList listAssignedUser(String userId)
	{
		TaskList tasklist = new TaskList();
		tasklist.setUserId(userId);
		log.debug("fetching assigned tasks for user: '"+userId+"'");
		List<Task> tasks = taskService.createTaskQuery().taskAssignee(userId).list();
		fillTaskList(tasklist, tasks);
		return tasklist;
	}
	
	public void claim (String taskId, String userId)
	{
		log.debug("claiming task '"+taskId+"' for user '"+userId+"'");
		taskService.claim(taskId, userId);
		log.debug("task '"+taskId+"' claimed for user '"+userId+"'");
	}
	
	public void complete(String taskId)
	{
		log.debug("completing task '"+taskId+"'");
		taskService.complete(taskId);
		log.debug(" task '"+taskId+"' completed");
	}
	
	public List<String> getAllProcessInstanceIds(String processId)
	{
		log.debug("getting list pf process instances for process id "+processId);
		List<String> result = new ArrayList<String>();
		ProcessInstanceQuery query = runtimeService.createProcessInstanceQuery().processDefinitionKey(processId);
		for(ProcessInstance p : query.list())
		{
			result.add(p.getId());
		}
		log.debug("number of process instances... "+result.size());
		return result;
	}

	
	public void deleteProcessInstance(String processInstanceId, String deleteReason)
	{
		log.debug("deleting process instance with id: "+processInstanceId+" reason: "+deleteReason);
		try
		{
			runtimeService.deleteProcessInstance(processInstanceId, deleteReason);
		}
		catch(Exception exc)
		{
			log.error("process instance could not be deleted: "+exc.getMessage());
		}
	}
	
	
	private void fillTaskList(TaskList tList, List<Task> tasks)
	{
		for(Task thisTask : tasks)
		  {
			log.debug("Task found: " + thisTask.getName());
			//create task for external listings
			de.eahjena.wi.domain.Task t = new de.eahjena.wi.domain.Task();
			t.setId(thisTask.getId());
			t.setName(thisTask.getName());
			t.setStartTime(thisTask.getCreateTime());
			
			//get process variables
			Map<String,Object> variables = runtimeService.getVariables(thisTask.getProcessInstanceId());
			t.setProductId((String)variables.get("productId"));
			
			//process json data...
			String jsonSpecification = (String)variables.get("orderData");
			log.debug("jsonSpecification: "+jsonSpecification);
			JSONObject json = new JSONObject(jsonSpecification);
			//read taskData
			//example: {"productId":"42","processId":"cocktail_production","taskData":[{"taskId":"Prepare cup task","components":[{"id":"1","name":"Fruit juice","options":[{"id":"7","name":"Tomato juice"}]},{"id":"2","name":"Fruit puree","options":[{"id":"2","name":"Kiwi puree"}]}]},{"taskId":"fillInPieces","components":[{"id":"2","name":"Fruit puree","options":[{"id":"2","name":"Kiwi puree"}]}]}]}
			JSONArray tasksJSONArray = new JSONArray(json.get("taskData").toString());
			for (int i=0; i<tasksJSONArray.length(); i++) {
			    JSONObject taskItem = tasksJSONArray.getJSONObject(i);
			    String taskId = taskItem.getString("taskId");
			    log.debug("task data found for task: "+taskId);
			    log.debug("current workflow task name: "+thisTask.getName());
			    if(thisTask.getName().equals(taskId))//found data for this task
			    {
			    	JSONArray componentsJSONArray = taskItem.getJSONArray("components");
			    	log.debug("task description found... taskId: "+taskId+" componentsLength: "+componentsJSONArray.length());
			    	for(int j=0; j<componentsJSONArray.length();j++)
			    	{
					    JSONObject componentItem = componentsJSONArray.getJSONObject(j);
			    		String componentId = componentItem.optString("id").toString();
			    		String componentName = componentItem.optString("name").toString();
			    		log.debug("component data found for task... componentId: "+componentId+" componentName:"+componentName);
			    		JSONArray optionsJSONArray = componentItem.getJSONArray("options");
			    		for(int k=0; k<optionsJSONArray.length(); k++)
			    		{
			    			JSONObject optionItem = optionsJSONArray.getJSONObject(k);
			    			String optionId = optionItem.getString("id");
			    			String optionName = optionItem.getString("name");
			    			log.debug("option found for component... optionId:"+optionId+" optionName:"+optionName);
			    			//create new component data for task
			    			Component c = new Component();
			    			c.setId(componentId);
			    			c.setName(componentName);
			    			c.setValue(optionName);
			    			t.add(c);
			    		}
			    		
			    	}
			    }
			}
			tList.add(t);
		  }
	}
	
	
	
}
