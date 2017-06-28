package de.eahjena.wi.workflowmanager.events;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import de.eahjena.wi.workflowmanager.EventBusListener;

import org.apache.logging.log4j.*;

public class EventManager implements MqttCallback {

	private static final Logger log = LogManager.getLogger(EventManager.class);
	
	int qos             = 2;
    boolean	retained	= true;
    public String brokerUrl = "tcp://localhost:1883";
    public String clientId  = "NicoEclipseTest";
    MemoryPersistence persistence = new MemoryPersistence();
    MqttClient mqttClient = null;
	
    EventBusListener listener = null;
	
	public EventManager(EventBusListener listener)
	{
		this.listener = listener;
		init();
	}
	
	private void init()
	{
		//TODO: read global config from file later...
		
	}
	
	public void connect()
	{
		try {
	        mqttClient = new MqttClient(brokerUrl, clientId, persistence);
	        MqttConnectOptions connOpts = new MqttConnectOptions();
	        connOpts.setCleanSession(true);
	        mqttClient.setTimeToWait(100);//time for each thread
	        log.debug("Connecting to broker: "+brokerUrl);
	        mqttClient.connect(connOpts);
	        log.debug("Connected");
	    } catch(MqttException me) {
	    	log.error(me);
	    }
	}
	
	public void publishMessage(String topic, String message)
	{
		try
		{
			log.debug("Publishing message: topic:'"+topic+"' message:'"+message+"'");
	        MqttMessage mqttMessage = new MqttMessage(message.getBytes());
	        mqttMessage.setQos(qos);
	        mqttMessage.setRetained(retained);
	        mqttClient.publish(topic, mqttMessage);
	        log.debug("Message published");
		}
		catch (MqttException me)
		{
			log.error(me);
		}
	}
	
	public void subscribe (String topic)
	{
		try
		{
			log.debug("subscribing topic: '"+topic+"'");
			mqttClient.setCallback(this);
			mqttClient.subscribe(topic);
		}
		catch (MqttException me)
		{
			log.error(me);
		}
	}
	
	public void connectionLost(Throwable cause) {
	    // TODO Auto-generated method stub
		log.error("Connection to MQTT Broker lost...");
		log.error(cause);
	}
	
	public void messageArrived(String topic, MqttMessage message)
	        throws Exception {
		log.debug("Message arrived... topic:'"+topic+"' message:'"+message+"'");
		String messageToForward = "";
		if(message!=null)
			messageToForward=message.toString();
		listener.messageReceived(topic, messageToForward);
	}

	public void deliveryComplete(IMqttDeliveryToken token) {
	    // TODO Auto-generated method stub
	
	}
	
	public void disconnect()
	{
		try
		{
			mqttClient.disconnect();
			log.debug("Disconnected");
		} catch(MqttException me) {
			log.error(me);
	    }
	}
	
	
	
}
