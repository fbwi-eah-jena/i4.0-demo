var conf_mqtt = require('../config_mqtt.json');
var mqtt = require('mqtt');

var stdin = process.stdin,
  count = 0,
  productId = "",
  scale = "",
  weight = "";

//Start MQTT Broker connection
console.log("connecting to mqttbroker at " + conf_mqtt.mqttbroker);
var mqttClient = mqtt.connect(conf_mqtt.mqttbroker);
mqttClient.on('connect', () => {
  console.log("connected to mqttbroker at " + conf_mqtt.mqttbroker);
})

try {
  stdin.setRawMode(true); // get stream without press "Enter"
  stdin.resume();
  stdin.setEncoding('utf8'); // set Encoding to "UTF8"

  console.log("waiting for barcode ...");
  // on any data into stdin
  stdin.on('data', function(key) {

      // ctrl-c ( end of text )
      if (key === '\u0003') { // Unicode for "End of text"
        process.exit();
      }

      if (key.toString().length > 1) { // if key is more than one char
        var arr = key.split("");
        for (var i = 0; i < key.toString().length; i++) {
          scale += arr[i];
          count++;
        }
      } else if (count < 4) { // 4 numberrs for scale ID
        scale += key;
        count++;
      } else if (count < 10) { // 6 numbers for product ID
        productId += key;
        count++;
      } else if (count < 15) { // 5  numbers for product weigth
        weight += key;
        count++;
      }

      if (count === 15) {
        // create JSON Object
        let scaleInit = new Object;
        scaleInit.scaleId = scale;
        scaleInit.productId = productId;
        scaleInit.productWeight = parseInt(weight);

        console.log("publishing message: " + JSON.stringify(scaleInit));
        mqttClient.publish("initscale", JSON.stringify(scaleInit));
        count = 0;
        productId = "";
        scale = "";
        weight = "";
      }
  });
} catch (err) {
  console.log(err);
}
