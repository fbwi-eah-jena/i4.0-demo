package de.eahjena.wi.domain;

import java.util.ArrayList;
import java.util.List;

public class TaskList {

	private String userId;
	private String groupId;
	private List<Task> tasks;
	
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	
	
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	public List<Task> getTasks() {
		return tasks;
	}
	public void setTasks(List<Task> tasks) {
		this.tasks = tasks;
	}
	
	public void add(Task t)
	{
		if(this.tasks==null)
			this.tasks = new ArrayList<Task>();
		tasks.add(t);
	}
	
	public void remove(Task t)
	{
		this.tasks.remove(t);
	}
	
	
	
}
