var sportshubSettings = {
	client: {
		id: 'waterrower_ansgar',
	    dbId: null
	},
	mysql: {
		host: '127.0.0.1',
		user: 'root',
		port: 8889,
		password: 'root',
		database: 'sportshub'
	},
	session: {
	    hash: 0,
	    id: null,
	    ticks: null,
	    secondsSinceStart: null,
	    speed: 0,
	    distance: 0
	},
	mqtt: {
    	//host: 'mqtt://test.mosquitto.org',
	    host: 'mqtt://192.168.1.115',
	    port: 1883,
	    username: '',
	    password: '',
    	usedTopic: '/waterrower/data',
	}	
};

module.exports = sportshubSettings;