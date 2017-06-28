const mqtt = require('mqtt')  
const client = mqtt.connect('mqtt:localhost')

client.on('connect', () => {  
  client.subscribe('workflow/#')
})

client.on('message', (topic, message) => {  
    console.log(message.toString());
    last_message = message.toString();
})

var last_message = '';


var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', last_message: last_message});
});

module.exports = router;
