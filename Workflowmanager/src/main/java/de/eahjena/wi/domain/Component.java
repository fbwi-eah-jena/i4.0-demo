package de.eahjena.wi.domain;

public class Component {
	
	private String id;
	private String name;
	private String value;
	
	
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
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	
	public boolean equals(Object o)
	{
		boolean result = false;
		if(o instanceof Component)
		{
			if(((Component)o).getId().equals(this.getId()))
				result = true;
		}
		return result;
	}
	
	

}
