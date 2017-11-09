/* eslint-env node */
'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
	dataUri: null,
	faceResults: null,
	config: null,
	subscriptionKey: null,
	detectedFace: null,
	personGroupId: null,
	personGroupName: null,
	init() {
		this._super(...arguments);
		this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
		// Replace the subscriptionKey string value with your valid subscription key (this one won't work).
		this.set('subscriptionKey',  this.get('config.subscriptionKey'));
		this.set('personGroupId', "24f6bc52-2e38-4e81-ba60-c1d81d8bd324");
		this.set('personGroupName', "SD County DCSS");

	}, 

	/**
	 * Convert the image into Blob to pass into Microsoft Detect/addface call
	 * @params dataURL image recieved from webcam
	 * 
	 */
	convertDataUriToBinary(dataURL){
		var BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			var part = dataURL.split(',');
			var content = part[0].split(':')[1];
			var rawData = decodeURIComponent(part[1]);
			return new Blob([rawData], { type: content});
		}
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
		var uInt8Array = new Uint8Array(rawLength);
		for (var i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		var blob = new Blob([uInt8Array], { type: contentType });
		return blob;
	},


	/**
	 * Microsoft detect call
	 * @params faceUri the data of the picture that was taken
	 * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
	 */
	microsoftDetect(faceUri) {
		var blob = this.convertDataUriToBinary(faceUri);
		Ember.Logger.log(blob);
		var self = this;
		var faceList = [];

		var params = {
				"returnFaceId": "true",     
				"returnFaceAttributes": "age,emotion"
		};

		this.set('faceResults', null);
		Ember.$.ajax({
			url: this.get('config.detectUrl') + Ember.$.param(params),
			processData: false,
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/octet-stream");

				//Enter your subscription key
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
			},
			type: "POST",
			// Request body
			data: blob
		})
		.done(function(data) {
			if(data[0] !== null) {
				Ember.Logger.log(data);
				if(data[0].faceId !== null) {
					var personGroup = self.getListOfPersonGroup();
					var emotionSet = data[0].faceAttributes.emotion;
					var result = JSON.stringify(emotionSet);
					Ember.Logger.log(result);
					Ember.Logger.log(data[0].faceAttributes.age);
					var emotionKeys = Object.keys(emotionSet);
					var maximum = 0; 
					var emotion = emotionKeys.reduce(function(emotion, emotionKey){
						var emotionValue = emotionSet[emotionKey];
						if (emotionValue >= maximum) {
							maximum = emotionValue;
							return emotionKey;
						} else {
							return emotion;
						}
					}, "confused");
					Ember.Logger.log("face detected");
					faceList.push(data[0].faceId);
					self.set('detectedFace', faceList);
					Ember.Logger.log("face id" + self.get('detectedFace'));

					if(personGroup === []) {
						self.createPersonGroup();
					}
					var candidates = self.identify();
					if(candidates === []) {
						Ember.Logger.log("no candidates");
					}
					else {
						Ember.Logger.log(candidates);
					}
					self.createPerson();
				}
			}
			else {
				Ember.Logger.log("no face got detected");
			}

		}).fail(function() {
			Ember.Logger.error("error in face detect. Might not have a valid subscriptionKey");
		});

	},

	/**
	 * calls Microsoft create faceList API
	 * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
	 */
	createFaceList() {
		var self = this;
		var params = {
				"faceListId": "281fce7e-5b9d-446e-a30b-a73dcd8727f7"
		};

		Ember.$.ajax({
			url: this.get('config.createFaceListUrl') + Ember.$.param(params),
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/json");

				//Enter your subscription key
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
			},
			type: "PUT",
			// Request body
			data: '{ "name":"sample"}',
		})
		.done(function(data) {
			Ember.Logger.log("created face list");
			Ember.Logger.log(data);
		})
		.fail(function() {
			Ember.Logger.error("create face list fail");
			Ember.Logger.error("error. Might not have a valid subscriptionKey");
		});
	},

	/**
	 * Calls Microsoft add face to facelist API
	 * Enter your subscription key
	 * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
	 */
	addFaceToFaceList(faceUri) {
		var self = this;
		var params = {
				"faceListId": "281fce7e-5b9d-446e-a30b-a73dcd8727f7",
				"userData": "",
				"targetFace": ""
		};
		Ember.$.ajax({
			url: this.get('config.addFaceToListUrl') + Ember.$.param(params),
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/octet-stream");
				//Enter your subscription key
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
			},
			type: "POST",
			// Request body
			data: faceUri
		})
		.done(function(data) {
			Ember.Logger.log("added to face list");
			Ember.Logger.log(data);
			return data;
		})
		.fail(function() {
			Ember.Logger.log("add face fail");
			Ember.Logger.error("error. Might not have a valid subscriptionKey");
		});
	},

	identify() {
		var self = this;
		var params = {
				// Request parameters
				"faceIds": self.get('detectedFace'),
				"personGroupId": "54f6bc52-2e38-4e81-ba60-c1d81d8bd324",
				"confidenceThreshhold": .5
		};

		$.ajax({
			url: "https://westus.api.cognitive.microsoft.com/face/v1.0/identify",
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/json");
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
			},
			type: "POST",
			// Request body
			data: JSON.stringify(params),
		})
		.done(function(data) {
			Ember.Logger.log("success identify");
			return data;
		})
		.fail(function() {
			Ember.Logger.log("error identify");
		});
	},

	createPersonGroup() {
		var self = this;
		var body = {"name":this.get('personGroupName')}
		var params = {
				// Request params
				"personGroupId": this.get('personGroupId'),
		};

		$.ajax({
			url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + this.get('personGroupId'),
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/json");
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
			},
			type: "PUT",
			// Request body
			data: JSON.stringify(body),
		})
		.done(function(data) {
			Ember.Logger.log("create person group success");
		})
		.fail(function() {
			Ember.Logger.log("create person group error");
		});

	},

	getListOfPersonGroup() {
		var self = this;
		var params = {
				// Request parameters
		};

		$.ajax({
			url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups" + $.param(params),
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
			},
			type: "GET",
			// Request body
			data: "",
		})
		.done(function(data) {
			Ember.Logger.log("Got person group list success");
		})
		.fail(function() {
			Ember.Logger.log("Person group List error");
		});
	},

	createPerson() {
		var body = {"name":"Alix"}
		var self = this;
		var params = {
				"personGroupId": this.get('personGroupId'),
		};

		$.ajax({
			url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + self.get('personGroupId') + "/persons",
			beforeSend: function(xhrObj){
				// Request headers
				xhrObj.setRequestHeader("Content-Type","application/json");
				xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
			},
			type: "POST",
			// Request body
			data: JSON.stringify(body),
		})
		.done(function(data) {
			Ember.Logger.log("create person success");
		})
		.fail(function() {
			Ember.Logger.error("create person error");
		});
	},

	actions: {

		/**
		 * When picture is taken
		 */
		didSnap(dataUri) {
			// Delivers a data URI when snapshot is taken.
			var self = this
			if(this.get('config.subscriptionKey') === "") {
				var subscriptionKey = prompt("Please enter a valid subscriptionKey");   
				this.set('subscriptionKey', subscriptionKey);
			}

			//calls microsoft detect API with the image snapped
			self.microsoftDetect(dataUri);


			//Converts dataUri from picture taken
			var blob = self.convertDataUriToBinary(dataUri);
			this.set('dataUri', dataUri);
			//self.createFaceList();
		},
		didError(error) {
			// Fires when a WebcamError occurs.
			Ember.Logger.log(error);
		},

	}
});
