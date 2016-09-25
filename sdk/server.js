var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');
var usedTopic = 'waterrower';

function random (low, high) {
    return Math.round(Math.random() * (high - low) + low);
}

function getNewSessionTime()
{
  return random (20, 30);
}

client.on('connect', function () {

  //ticks;secondssincestart;meterprosec*100;strecke*100m
  var ticks = 0;
  var secondssincestart = 0;
  var startTime = Math.floor(Date.now() / 1000);
  var speed = 0;
  var distance = 0;
  var message = '';
  var randomGain = 0;

  var sessionLength = getNewSessionTime();
  var waitTillNextSession = null;

  setInterval(function(){
    if (waitTillNextSession === null) {
      secondssincestart += parseInt((Math.floor(Date.now() / 1000)) - startTime, 10);
      if(secondssincestart > sessionLength) {
        console.log('slowing down ..');
        randomGain = randomGain - Math.round((secondssincestart-sessionLength)/30);
      } else {
        randomGain = random(40,50);
      }

      if(randomGain <= 0) {
        waitTillNextSession = random(10, 30);
        startTime = Math.floor(Date.now() / 1000);
        console.log('Ending Session. New Session in '+waitTillNextSession+ ' Seconds.');
      } else {
        ticks += randomGain; //4,805 = 1m
        speed = random(40,50)*100;
        distance += Math.round((ticks/4.805)*100);
        message = ticks + ';' + secondssincestart + ';' + speed + ';' + distance;
        
        console.log('published:', message, ' - Random Gain:' + randomGain+ ' / sessionLength: ' + sessionLength);
        client.publish(usedTopic, message);
      }
    } else if ( ( (Math.floor( Date.now() / 1000 ) ) - startTime) > waitTillNextSession ){
      secondssincestart = 0;
      ticks = 0;
      distance = 0;
      waitTillNextSession = null;
      startTime = Math.floor(Date.now() / 1000);
    } else {
      console.log('Next Session in '+( waitTillNextSession - (Math.floor( Date.now() / 1000 ) - startTime) )+ ' Seconds. Waiting '+waitTillNextSession+' overall.');
    }

  }, 400);


});


