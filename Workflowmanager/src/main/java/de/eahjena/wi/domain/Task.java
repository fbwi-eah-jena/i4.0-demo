package de.eahjena.wi.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Task {
	
	private String id;
	private String name;
	private String productId;
	private Date startTime;
	private List<Component> components;
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getProductId() {
		return productId;
	}
	public void setProductId(String productId) {
		this.productId = productId;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public List<Component> getComponents() {
		return components;
	}
	public void setComponents(List<Component> components) {
		this.components = components;
	}
	
	public void add(Component c)
	{
		if(this.components==null)
			this.components = new ArrayList<Component>();
		this.components.add(c);
	}
	
	public void remove(Component c)
	{
		this.components.remove(c);
	}
	
	public boolean equals(Object o)
	{
		boolean result = false;
		if(o instanceof Task)
		{
			if(((Task)o).getId().equals(this.getId()))
				result = true;
		}
		return result;
	}
	
	
	

}
