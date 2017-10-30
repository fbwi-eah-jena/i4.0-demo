var hid = require('node-hid');
var decache = require('decache');
var config_mqtt = require('../config_mqtt.json');
var config_scale = require('../config_scale.json');
var mqtt = require('mqtt');
var fs = require('fs'); // File System

var vid = 0x922, // vid = 2338,
  pid = 0x8003, // pid = 32771,
  staticCounter = 10,
  lastGrams = 1;

//Start MQTT Broker connection
console.log("connecting to mqttbroker at " + config_mqtt.mqttbroker);
var mqttClient = mqtt.connect(config_mqtt.mqttbroker);
mqttClient.on('connect', () => {
  console.log("connected to mqttbroker at " + config_mqtt.mqttbroker);
})
//End MQTT Broker connection

mqttClient.subscribe('initscale');

// get Event from MQTT Broker
mqttClient.on('message', (topic, message) => {
  console.log("received message with topic: '" + topic);
  console.log("mqtt_message: " + message.toString());
  if (topic == "initscale") {
    // parse JSON
    var initscale = JSON.parse(message);
    var scaleId = initscale.scaleId.toString();
    var productId = initscale.productId.toString();
    var weight = parseInt(initscale.productWeight);

    if (scaleId == config_scale.scale.id) { // check scaleId for init
      // read config.json
      console.log("new init");
      fs.readFile('../config_scale.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          var obj = JSON.parse(data); //parse data to a JSON object
          obj.scale.productId = productId; // add productId to JSON Object
          obj.scale.productWeight = weight; // add productWeight to JSON Object
          // console.log(obj);
          json = JSON.stringify(obj); //convert it back to JSON
          fs.writeFile('../config_scale.json', json, 'utf8', function(err) { // write config.json
            if (err) { throw err; }
          });
        }
      });
    }
  }
})

try {
  console.log("connecting to scale");
  var device = new hid.HID(vid, pid);
  console.log("waiting for scale ...");
  device.on('data', function(data) {
    decache('../config_scale.json'); // delete cached File
    config_scale = require('../config_scale.json'); // reload File
    var config_scale = require('../config_scale.json');
    var buf = new Buffer(data);
    var grams = buf[4] + (256 * buf[5]); // grams in buf[4]; if bigger than one byte, the weight is split on two bytes (buf[4] and buf[5])

    if (grams > 0 && buf[2] === 11) {
      console.log('Please switch to gram');
      return;
    }
    if (lastGrams != grams) { // return the staticCounter if the weight on the scale is changed
      staticCounter = 10;
    } else if (lastGrams == grams && lastGrams > 0 && staticCounter != 0) { // if lastgrams and grams have the same value count down the staticCounter
      staticCounter--;
    }

    if (staticCounter === 1) { // if the staticCounter === 1 count down staticCounter and publish productJSON
      staticCounter--;
      if (config_scale.scale.productId == "" || config_scale.scale.productWeight == "") { // throw error, if scale is not initialized
        console.log("ERROR No product initialized");
      } else {
        var productCount = parseInt(grams) / parseInt(config_scale.scale.productWeight); // calculate the count of the product
        // create JSON Object
        let productJSON = new Object;
        productJSON.scaleId = config_scale.scale.id;
        productJSON.productId = config_scale.scale.productId;
        productJSON.productSingleWeight = config_scale.scale.productWeight;
        productJSON.productWeight = parseInt(grams);
        productJSON.productCount = parseInt(productCount);

        console.log("publishing message: " + JSON.stringify(productJSON));
        mqttClient.publish("product", JSON.stringify(productJSON)); // publish productJSON
      }
    }
    lastGrams = grams; // save the last scale measure

  });

  device.on('error', function(err) {
    console.log("ERROR");
    if (!/could not read from HID device/.test(err.message)) {
      console.log(err);
    }
    reading = false;
  });

} catch (err) {
  console.log('Devices:')
  if (err.message.toString() == "cannot open device with vendor id 0x922 and product id 0x8003") {
    console.log("Scale is offline. Switch scale on and start again.");
    process.exit();
  } else {
    console.log(err.message);
    process.exit();
  }
}
