#!/usr/bin/env node

/**
 * Module dependencies.
 */
const conf = require('../config.json');
const fs = require('fs');
const mysql = require('mysql');

var db = mysql.createConnection({
    host     : conf.orderdb.host,
    user     : conf.orderdb.user,
    password : conf.orderdb.password,
    database : conf.orderdb.db
});
console.log("connecting to order_db on..."+conf.orderdb.host);
db.connect(function(error){
    if(error)
    {
        console.log("db connection failed... "+error);
    }
    else
    {
        console.log("db connection established");
    }
});

//Start MQTT Broker connection
const mqtt = require('mqtt'); 
console.log("connecting to mqttbroker at "+conf.mqttbroker);
const mqttClient = mqtt.connect(conf.mqttbroker);
//End MQTT Broker connection

mqttClient.on('connect', () => {  
    console.log('connected to mqtt broker...');
    mqttClient.subscribe('order/#')
})

mqttClient.on('message', (topic, message) => {  
    console.log("received message with topic: '"+topic);
    console.log("mqtt_message: "+message.toString());
    if(topic == "order/new")
    {
        console.log("new order received...");
        console.log("sending order to db...");
        let dbValues = {"id":null, "json":message.toString()};
        db.query('INSERT INTO customer_order SET ?',dbValues, function(err, result) 
        {
          if (!err)
          {
            let orderId = result.insertId;
            console.log('New order stored... OrderID is '+ orderId);
            let orderData = JSON.parse(message.toString());
            var mapping = JSON.parse(fs.readFileSync('../product_mappings/simple_cocktails_mapping.json', 'utf8'));
            let processData = new Object;
            processData.productId = ""+orderId;
            processData.processId = mapping.processId;
            processData.taskData = buildTaskData(mapping, orderData);
            console.log("publishing workflow start message..."+JSON.stringify(processData));
            mqttClient.publish("workflow/start", JSON.stringify(processData));
            mqttClient.publish("order/accept","{\"token\":\""+orderData.token+"\", \"orderId\":\""+orderId+"\"}");
          }
          else
            console.log('Error while performing database Query...');
            console.log(err);
        });
    }
})

function buildTaskData(productMapping, orderData)
{
    let taskDataArrayToBeReturned = [];
    for(task of productMapping.taskComponentMappings)
    {
        let taskData = new Object;
        taskData.taskId = task.taskId;
        taskData.components = [];
        for(component of task.components)
        {
            taskData.components.push(getProductComponentData(component.id, orderData));
        }
        taskDataArrayToBeReturned.push(taskData);
    }
    return taskDataArrayToBeReturned;
}

function getProductComponentData(componentId, orderData)
{
    let componentDataToBeReturned = null;
    for(component of orderData.components)
    {
        if(component.id == componentId)
        {
            componentDataToBeReturned = component;
            break;
        }
    }
    return componentDataToBeReturned;
}
