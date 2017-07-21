Module.register("MMM-pushbullet-notifications", {

	start: function (){
	
		var self = this;
		
		// create connection to server role to receive gesture events
		var connection = new WebSocket('wss://stream.pushbullet.com/websocket/' + this.config.access_token);
		
		// send message from client to server to test connection to server
		connection.onopen = function () {
			// Nothing
		};

		// On error log error and try to reconnect after 5s
		connection.onerror = function (error) {
		  console.error('Connection to gesture server was errored.');
		  console.info('Will reconnect to WebSocket in 5s.');
			setTimeout(function(){self.init()}, 5000);
			
		};
		
		// On connection close log error and try to reconnect after 5s
		connection.onclose = function () {
		  console.error('Connection to WebSocket was closed.');
		  console.info('Will reconnect to WebSocket in 5s.');
		  setTimeout(function(){self.init()}, 5000);
		  
		};

		// On message received from gesture server forward message to other modules
		// and hide / show compliment module
		connection.onmessage = function(e) {

			message = JSON.parse(e.data); 
			console.log(message);
			// TODO: Save the message and listen for dismissal events
			if (self.notificationFilter(message)) {
				console.info("Alerting nofitication");
				self.sendNotification("SHOW_ALERT", self.notificationTranslator(message));
			}
		};
	},

	notificationReceived: function(notification, payload, sender) {

	},

	getDom: function() {
		return document.createElement("div");
	},

	// Helpers
	notificationFilter: function(message) {
		return "type" in message && message['type'] == "push" && 
			   "push" in message && message['push']['type'] == "sms_changed" && 
			   "notifications" in message['push'] && message['push']['notifications'].length > 0;
	},

	notificationTranslator: function(message) {
		var notif = message['push']['notifications'][0];
		return {
			"title": notif['title'],
			"message": notif['body'],
			"timer": 10000
		}
	}

});