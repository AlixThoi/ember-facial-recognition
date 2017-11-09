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
		if(this.get('config.subscriptionKey') === "") {
			var subscriptionKey = prompt("Please enter a valid subscriptionKey");   
			this.set('subscriptionKey', subscriptionKey);
		}
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

		var params = {
				"returnFaceId": "true",     
				"returnFaceAttributes": "age,emotion"
		};

		this.set('faceResults', null);
		var promise =  new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
			url: self.get('config.detectUrl') + Ember.$.param(params),
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
					resolve(data);
				} else {
					reject("Failed to detect a face");
				}
			}).fail(function() {
				reject("error in face detect. Might not have a valid subscriptionKey");
			});
		});
		return promise;
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
			url: self.get('config.createFaceListUrl') + Ember.$.param(params),
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
			url: self.get('config.addFaceToListUrl') + Ember.$.param(params),
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

	identify(faceList) {
		var self = this;
		var params = {
				// Request parameters
				"faceIds": faceList,
				"personGroupId": this.get('personGroupId'),
				"confidenceThreshhold": .5
		};

		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: self.get("config.serviceUrl") + "/identify",
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Content-Type","application/json");
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
				},
				type: "POST",
				// Request body
				data: JSON.stringify(params),
			})
			.done(function(candidates) {
				
				if(candidates === []) {
					reject("No candidates found");
				} else {
					resolve(candidates);
				}
			})
			.fail(function() {
				reject("error identify");
			});
		});
	},

	createPersonGroup() {
		var self = this;
		var body = {"name":this.get('personGroupName')}
		return new Ember.RSVP.Promise(function(resolve, reject) { 

			Ember.$.ajax({
				url: self.get("config.serviceUrl") + "/persongroups/" + this.get('personGroupId'),
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
				resolve(data);
			})
			.fail(function() {
				reject("create person group error");
			});
		});

	},

	getListOfPersonGroup() {
		var self = this;

		return new Ember.RSVP.Promise(function(resolve, reject) { 
		Ember.$.ajax({
				url: self.get("config.serviceUrl") + "/persongroups",
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
				},
				type: "GET",
				// Request body
				data: "",
			})
			.done(function(data) {
				resolve(data);
			})
			.fail(function() {
				reject("Person group List error");
			});
		});
	},

	createPerson() {
		var body = {"name":"Alix"}
		var self = this;
		var params = {
				"personGroupId": this.get('personGroupId'),
		};

		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: self.get("config.serviceUrl") + "/persongroups/" + self.get('personGroupId') + "/persons",
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Content-Type","application/json");
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
				},
				type: "POST",
				// Request body
				data: JSON.stringify(body),
			})
			.done(function(person) {
				resolve(person);
			})
			.fail(function() {
				reject("create person error");
			});
		});
	},

	actions: {

		/**
		 * When picture is taken
		 */
		didSnap(dataUri) {
			// Delivers a data URI when snapshot is taken.
			var self = this;
			var faceList = [];

			//calls microsoft detect API with the image snapped
			self.microsoftDetect(dataUri)
			.then (function(data){
					Ember.Logger.log(data);
					var firstFace = data[0];
					var faceId = firstFace.faceId; 
					if(faceId !== null) {
						var emotionSet = firstFace.faceAttributes.emotion;
						var result = JSON.stringify(emotionSet);
						Ember.Logger.log(result);
						Ember.Logger.log(firstFace.faceAttributes.age);
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
						faceList.push(firstFace.faceId);
						self.set('detectedFace', faceList);
						Ember.Logger.log("face id" + self.get('detectedFace'));

						return self.identify(faceList);
					}
			
			})
			.then (function(candidates){
				
				Ember.Logger.log(candidates);
				var firstCandidate = candidates[0];
				if (firstCandidate.confidence < this.get('confidenceLevel')) {
					return self.createPerson();
				} else {
					return firstCandidate;
				}
			})
			.then(function(person){
				Ember.Logger.log("Found: ", person);
			})
			.catch(function(e){
				Ember.Logger.error("Failed to identify due to: " + e);
			});

		},
		didError(error) {
			// Fires when a WebcamError occurs.
			Ember.Logger.log(error);
		},

	}
});
