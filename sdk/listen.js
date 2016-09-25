var crypto = require('crypto');
var sportshubSettings = require('./sportshubSettings.js');
var mysqlConnection = require('./mysqlConnection.js');
var mqttClient  = require('./mqttClient.js');
var sportshub = require('./sportshub.js');

var listeningSince = Math.floor(Date.now() / 1000),
    sessionStartDateTimeString = null;

sportshub.checkClientId(sportshubSettings);

// Subscribing to mqTT Broadcast
mqttClient.subscribe(sportshubSettings.mqtt.usedTopic);

// listening for broadcast
mqttClient.on('message', function (topic, message) {
  var receivedMessageItems = message.toString().split(';');
  console.log('received:', receivedMessageItems);
  // if no session active yet or timer resets, a new session will be created
  if( sportshubSettings.session.id === null || parseInt(receivedMessageItems[1], 10) < parseInt(sportshubSettings.session.secondsSinceStart, 10) ) {
      sportshub.createNewSession(sportshubSettings);
  }
  // write received data
  sportshub.writeMessage(sportshubSettings, receivedMessageItems);
});

setInterval(function(){
    diff = (Math.floor(Date.now() / 1000)) - listeningSince;
    console.log('listening for ' + diff + ' seconds now.');
}, 3000);

