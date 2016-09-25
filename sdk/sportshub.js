var crypto = require('crypto');
var mysqlConnection = require('./mysqlConnection.js');
var mqttClient  = require('./mqttClient.js');

// sportsHub mqtt service
var sportshub = {
	writeMessage: function(sportshubSettings, receivedMessageItems) {
		sportshubSettings.session.ticks=receivedMessageItems[0];
		sportshubSettings.session.secondsSinceStart=receivedMessageItems[1];
		sportshubSettings.session.speed=receivedMessageItems[2];
		sportshubSettings.session.distance=receivedMessageItems[3];
		console.log(
			'time: ', sportshubSettings.session.secondsSinceStart 
			+ ' / ticks: ', sportshubSettings.session.ticks 
			+ ' / sportshubSettings.session.speed: ', sportshubSettings.session.speed 
			+ ' / distance: ', sportshubSettings.session.distance 
			+ ' / databaseClientId: ', sportshubSettings.client.dbId);
		mysqlConnection.query(
			"INSERT INTO `sportshub`.`session_message` "
			+"(`ticks`, `seconds`, `speed`, `distance`, `session_id`) "
			+"VALUES ('"+sportshubSettings.session.ticks+"', '"+sportshubSettings.session.secondsSinceStart+"', '"+sportshubSettings.session.speed+"', '"+sportshubSettings.session.distance+"', '"+sportshubSettings.session.id+"');");  
	},
	createNewSession: function (sportshubSettings) {
	    sportshubSettings.session.hash = this.createNewHash(sportshubSettings.client.id);
	    var sessionStartDateTimeString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	    mysqlConnection.query(
	    	"INSERT INTO `sportshub`.`session` "
	    	+"(`id`, `sessionHash`, `client_id`, `start`) "
	    	+"VALUES (NULL, '"+sportshubSettings.session.hash+"', '"+sportshubSettings.client.dbId+"', '"+sessionStartDateTimeString+"');", function(err, rows, fields) {
	      if(err) {
	        console.error('Problems with MySQL. Error:', err);
	        process.exit();
	      } else {
	        sportshubSettings.session.id = rows.insertId;
	        console.log('---- New Session created (hash: '+sportshubSettings.session.hash+' / id: '+sportshubSettings.session.id+').');
	        return sportshubSettings.session.id;
	      }
	    });
	},

	createNewHash: function(clientId) {
	    var current_date = (new Date()).valueOf().toString();
	    var random = Math.random().toString();
	    return crypto.createHash('sha1').update(current_date + random + clientId).digest('hex');
	},

	checkClientId: function (sportshubSettings) {
		// checking Client Id
		mysqlConnection.query(
		     'SELECT client.id AS id FROM client '
		    +'WHERE client.clientId = "'+sportshubSettings.client.id+'"', function(err, rows, fields) {
		  if(err) {
		    console.log('Problems with MySQL. Error:', err);
		    process.exit();
		  }
		  else if (rows.length > 0){
		    sportshubSettings.client.dbId = rows[0].id;
		    console.log('Your ClientID <'+sportshubSettings.client.id+'> was found in the Database.');
		  } else {
		    console.log('Your ClientID <'+sportshubSettings.client.id+'> is not in the Database.');
		    process.exit();
		  }
		});	
	}
};

module.exports = sportshub;