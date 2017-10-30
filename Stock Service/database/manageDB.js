const conf_db = require('../config_db.json');
const config_mqtt = require('../config_mqtt.json');
const mysql = require('mysql');
const mqtt = require('mqtt');

// settings for database connection
var db = mysql.createConnection({
  host: conf_db.product_db.host,
  user: conf_db.product_db.user,
  password: conf_db.product_db.password,
  database: conf_db.product_db.db
});

//Start MQTT Broker connection

console.log("connecting to mqttbroker at " + config_mqtt.mqttbroker);
const mqttClient = mqtt.connect(config_mqtt.mqttbroker);
mqttClient.on('connect', () => {
  console.log("connected to mqttbroker at " + config_mqtt.mqttbroker);
  mqttClient.subscribe('product') // get events with topic "product"
})
//End MQTT Broker connection

// get Event from MQTT Broker
mqttClient.on('message', (topic, message) => {
  console.log("received message with topic: '" + topic);
  console.log("mqtt_message: " + message.toString());
  if (topic == "product") {
    console.log("new product received...");
    console.log("sending product to db...");
    // parse JSON
    var productData = JSON.parse(message);
    var productId = parseInt(productData.productId);
    var productSingleWeight = parseInt(productData.productSingleWeight);
    var productWeight = parseInt(productData.productWeight);
    var productCount = parseInt(productData.productCount);

    let dbValues = {
      "productId": productId,
      "productSingleWeight": productSingleWeight,
      "productWeight": productWeight,
      "productCount": productCount
    };

    console.log(dbValues);

    // check if product already exists in table "products"
    db.query('SELECT * FROM products WHERE productId= ?', productId, function(err, result) {
      if (!err) {
        if (result.length == 0) { // product does not exists in table "products"
          db.query('INSERT INTO products SET ?', dbValues, function(err, result) {
            if (!err) {
              console.log("1 new product saved");
            } else {
              console.log('Error while performing database Query...');
              console.log(err);
            }
          });
        } else { // product exists in table "products" and have to be updated
          db.query('UPDATE products SET productSingleWeight = ?, productWeight = ?, productCount = ? WHERE productId = ?',
          [productSingleWeight, productWeight, productCount, productId], function(err, result) {
            if (!err) {
              console.log("1 new product updated");
            } else {
              console.log('Error while performing database Query...');
              console.log(err);
            }
          });
        }
      } else {
        console.log('Error while performing database Query...');
        console.log(err);
      }
    });
  }
})
