package de.eahjena.wi.workflowmanager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONObject;

import de.eahjena.wi.domain.Task;
import de.eahjena.wi.domain.TaskList;
import de.eahjena.wi.workflowmanager.engineconnector.WorkflowEngineConnector;
//import de.eahjena.wi.workflowmanager.engineconnector.WorkflowEngineConnectorTest;
import de.eahjena.wi.workflowmanager.events.EventManager;

/**
 * Hello world!
 *
 */
public class App implements EventBusListener {
	private static final Logger log = LogManager.getLogger(App.class);

	public EventManager eventManager;
	WorkflowEngineConnector workflowConnector;

	public void messageReceived(String topic, String message) {

		try {

			String[] topicStringArray = topic.split("/");

			// case user tasklist request
			if (topic.startsWith("workflow/refresh/tasklist/user")) {
				// request looks like: workflow/refresh/tasklist/user/uid
				String userId = topicStringArray[topicStringArray.length - 1];
				log.debug("tasklist requested... for user: '" + userId + "'");
				refreshCandidateTaskListUser(userId);
			} else if (topic.startsWith("workflow/refresh/mytasklist/user")) {
				// request looks like: workflow/refresh/mytasklist/user/uid
				String userId = topicStringArray[topicStringArray.length - 1];
				log.debug("my tasklist requested... for user: '" + userId + "'");
				refreshAssignedTaskListUser(userId);
			} else if (topic.startsWith("workflow/claim/user")) {
				String userId = topicStringArray[topicStringArray.length - 1];
				log.debug("claim requested... for user: '" + userId + "' message: " + message);
				
				JSONObject json = new JSONObject(message);
				JSONArray claimedTasksArray = null;

				try{
					claimedTasksArray = json.getJSONArray("claimedtasks");
					log.debug("found " + claimedTasksArray.length() + " taskIds to be claimed...");
				}
				catch(Exception exc)
				{
					log.error(exc);
				}
				// claim tasks
				for (int i = 0; i < claimedTasksArray.length(); i++) {
					JSONObject thisTask = claimedTasksArray.getJSONObject(i);
					String thisTaskId = thisTask.getString("id");
					workflowConnector.claim(thisTaskId, userId);
				}
			} else if (topic.startsWith("workflow/complete/user")) {
				String userId = topicStringArray[topicStringArray.length - 1];
				log.debug("completion of a task noticed... for user: '" + userId + "' message: " + message);
				ObjectMapper mapper = new ObjectMapper();
				Task task = null;
				try {
					task = mapper.readValue(message, Task.class);
				} catch (Exception exc) {
					log.error(exc);
				}
				log.debug("parsed task.id: '" + task.getId() + "' task.name: '" + task.getName() + "'");
				// complete task
				workflowConnector.complete(task.getId());
			} else if (topic.startsWith("workflow/start")) {
				log.debug("new workflow start request noticed.... message: " + message);
				workflowConnector.startFromJSONSpecification(message);
			}
		} catch (Exception exc) {
			log.error(exc);
		}
	}

	public void run() {
		workflowConnector = new WorkflowEngineConnector();

		eventManager = new EventManager(this);
		eventManager.connect();
		eventManager.subscribe("workflow/#");

		// start as server....
		BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
		String str;

		System.out.println("WorkflowManager Service is running. Enter 'stop' to quit.");

		try {
			do {
				str = br.readLine();
				System.out.println(str);
			} while (!str.equals("stop"));
		} catch (Exception exc) {
			log.error(exc);
		}
		// eventManager.publishMessage("workflow/stop","service stopped");
		eventManager.disconnect();
		System.out.println("service stopped!");
	}

	public static void main(String[] args) {
		App a = new App();
		a.run();
	}

	private void refreshCandidateTaskListUser(String userId) {
		TaskList tasklist = workflowConnector.listCandidateGroup(userId);
		tasklist.setUserId(userId);
		String jsonStr = convertToJson(tasklist);
		// send new version of tasklist to user
		String responseTopic = "workflow/tasklist/user/" + userId;
		eventManager.publishMessage(responseTopic, jsonStr);
	}

	private void refreshAssignedTaskListUser(String userId) {
		TaskList tasklist = workflowConnector.listAssignedUser(userId);
		tasklist.setUserId(userId);
		// convert tasklist as Json Object
		String jsonStr = convertToJson(tasklist);
		// send new version of tasklist to user
		String responseTopic = "workflow/mytasklist/user/" + userId;
		eventManager.publishMessage(responseTopic, jsonStr);
	}

	private String convertToJson(TaskList tasklist) {
		ObjectMapper mapperObj = new ObjectMapper();
		String jsonStr = "";
		try {
			// get tasklist object as a json string
			jsonStr = mapperObj.writeValueAsString(tasklist);
		} catch (IOException e) {
			log.error(e);
		}
		return jsonStr;
	}
}
