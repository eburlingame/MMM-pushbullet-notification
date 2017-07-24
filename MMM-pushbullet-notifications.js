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
			
			if (self.isNotification(message)) {
				console.info("Alerting nofitication");
				self.sendNotification("SHOW_ALERT", self.notificationTranslator(message));
			}

			if (self.isDismissal(message)) {
				console.info("Dismissing notification");
				var notif = this.findNotification(message);
				if (notif != null) {
					self.sendNotification("HIDE_ALERT", notif);
				}
			}
		};

		this.savedNotifications = {};
	},

	notificationReceived: function(notification, payload, sender) {

	},

	getDom: function() {
		return document.createElement("div");
	},

	// Helpers
	isNotification: function(message) {
		return "type" in message && message['type'] == "push" && 
			   "push" in message && message['push']['type'] == "sms_changed" && 
			   "notifications" in message['push'] && message['push']['notifications'].length > 0;
	},

	isDismissal: function(message) {
		return "type" in message && message['type'] == "push" && 
		   "push" in message && message['push']['type'] == "dismissal" && 
		   "package_name" in message['push'];
	},

	notificationTranslator: function(message) {
		var notif = message['push']['notifications'][0];
		return {
			"title": notif['title'],
			"message": notif['body'],
			"timer": 30000
		}
	},

	findNotification: function(message) {
		return this.savedNotifications[this.getNotificationId(message)];
	},

	saveNotification: function(message) {
		this.savedNotifications[this.getNotificationId(message)] = message;
	},

	getNotificationId: function(message) {
		var notificationId = message['push']['notification_id'];
		var package_name = message['push']['package_name'];
		return package_name + "_" + notificationId;
	}

});