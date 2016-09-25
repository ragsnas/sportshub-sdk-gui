var mqtt = require('mqtt');
var sportshubSettings = require('./sportshubSettings.js');
var mqttClient = mqtt.connect(sportshubSettings.mqtt.host);


// Error handling
mqttClient.on('connect', function () {
    console.log('connected to the server (' + sportshubSettings.mqtt.host + ')');
});
mqttClient.on("error", function(error) {
    console.log("ERROR: ", error);
});
mqttClient.on('offline', function() {
    console.log("service went offline");
});
mqttClient.on('reconnect', function() {
    console.log("reconnecting to server");
});


module.exports = mqttClient;