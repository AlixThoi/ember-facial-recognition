/* eslint-env node */
'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
	dataUri: null,
	facePicture: null,
	faceResults: null,
	config: null,
	subscriptionKey: null,
	detectedFace: null,
	personGroupId: null,
	personGroupName: null,
	personId: null,
	highestEmotion: null,
	personName: null,

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
		//Ember.Logger.log(blob);
		var self = this;
		this.set('facePicture', faceUri);


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
					var emotionSet = data[0].faceAttributes.emotion;
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
					self.set('highestEmotion', emotion);
					Ember.Logger.log("Emotion: " + emotion);
					//Ember.Logger.log("Happy: " + data[0].faceAttributes.emotion.happiness);
					//self.set('happyEmotion',data[0].faceAttributes.emotion.happiness);
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

		return new Ember.RSVP.Promise(function(resolve) { 
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
				Ember.Logger.log("candidates = " + JSON.stringify(candidates));
				if(candidates === null || candidates[0].candidates.length == 0) {
					resolve(null);
				} 
				else {
					resolve(candidates);
					Ember.Logger.log("identify sucess: " + candidates)

				}
			})
			.fail(function(candidates) {
				Ember.Logger.log("identify fail: " + JSON.stringify(candidates));
				//self.trainPersonGroup()
				resolve(null);
			});
		});
	},

	createPersonGroup() {
		var self = this;
		var body = {"name":this.get('personGroupName')}
		return new Ember.RSVP.Promise(function(resolve, reject) { 

			Ember.$.ajax({
				url: self.get("config.serviceUrl") + "/persongroups/" + self.get('personGroupId'),
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
				Ember.Logger.log("creating person group");
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
				Ember.Logger.log("getting list of people group: " + data);
				Ember.Logger.log(data);
				resolve(data);
			})
			.fail(function() {
				reject("Person group List error");
			});
		});
	},

	createPerson(name) {
		var body = {"name":name}
		var self = this;
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
			.done(function(data) {
				Ember.Logger.log("created person: " + data.personId);
				self.set('personId', data.personId);
				resolve(data)
			})
			.fail(function(e) {
				reject("create person error" + e);
			});
		});
	},

	trainPersonGroup() {
		var self = this;
		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + self.get('personGroupId') 
				+ "/train",
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
				},
				type: "POST",
				// Request body
				data: "",
			})
			.done(function(data) {
				Ember.Logger.log("training person group success");
				resolve(data);
			})
			.fail(function() {
				reject("training person group error");
			});
		});
	},

	personGroupTrainingStatus() {
		var self = this;
		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + self.get('personGroupId') 
				+ "/training",
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
				},
				type: "GET",
				// Request body
				data: "",
			})
			.done(function(data) {
				resolve(data);
				Ember.Logger.log(" status group success: " + JSON.stringify(data));

			})
			.fail(function() {
				reject("status fail")
			});
		});
	},

	addFaceToPerson() {
		var self = this;

		// Ember.Logger.log("uri data picture: " + this.get('facePicture'));
		var blob = this.convertDataUriToBinary(self.get('facePicture'));
		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" + self.get('personGroupId')
				+"/persons/" + self.get('personId') +"/persistedFaces",
				processData: false,
				beforeSend: function(xhrObj){
					// Request headers
					xhrObj.setRequestHeader("Content-Type","application/octet-stream");
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
				},
				type: "POST",
				// Request body
				data: blob,
			})
			.done(function(data) {
				Ember.Logger.log("add face to person success");
				resolve(data);
			})
			.fail(function() {
				reject("add face to person error");
			});
		});
	},

	getPerson() {
		var self = this;
		
		return new Ember.RSVP.Promise(function(resolve, reject) { 
			Ember.$.ajax({
				url: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/" 
					+ self.get('personGroupId') + "/persons/" + self.get('personId'),
					beforeSend: function(xhrObj){
						// Request headers
						xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
					},
					type: "GET",
					// Request body
					data: "",
			})
			.done(function(data) {
				Ember.Logger.log("got person " + data.name);
				self.set('personName', data.name);
				resolve(data);
			})
			.fail(function() {
				reject("error getting Person");
			})
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
			this.set('dataUri', dataUri);
			//calls microsoft detect API with the image snapped
			self.microsoftDetect(dataUri)
			.then (function(data){
				Ember.Logger.log(data);
				var firstFace = data[0];
				var faceId = firstFace.faceId; 
				if(faceId !== null) {
					Ember.Logger.log("face detected");
					faceList.push(firstFace.faceId);

					self.set('detectedFace', faceList);
					Ember.Logger.log("face id" + self.get('detectedFace'));
					Ember.Logger.log('face groupd id is: ' + self.get('personGroupId'));
					//self.personGroupTrainingStatus();
					//return self.trainPersonGroup();
					return self.getListOfPersonGroup()
				}
			})
			.then(function(listOfPersonGroup) {
				Ember.Logger.log(listOfPersonGroup + "this is #");
				if (listOfPersonGroup.length == 0) {
					Ember.Logger.log("create eprson group");
					self.createPersonGroup();
				}
			})
			.then(function() {
				//self.personGroupTrainingStatus();
				return self.identify(self.get('detectedFace'));
			})
			.then (function(identified){
				Ember.Logger.log("IN HERE" + identified);
				if(identified === null || identified === undefined || identified[0].candidates.length == 0) {
					Ember.Logger.log("no candidates.. creating new person");
					var name = prompt("We don't recognize you, what's your name?");
					var notFound = document.getElementById('not-found');
					Ember.$(notFound).show();
					Ember.$(intro).hide();
					setTimeout(function(){ Ember.$(notFound).hide(); }, 5000);
					setTimeout(function(){Ember.$(intro).show(); }, 5000);
					return self.createPerson(name)
					.then(function() {
						return self.addFaceToPerson()
					})
					.then(function() {
						return self.trainPersonGroup()
					})
					.then(function() {
						return self.personGroupTrainingStatus()
					});
				} 
				else {
					self.set('personId', identified[0].candidates[0].personId);
					self.addFaceToPerson()
					.then(function(identified) {
						return Ember.RSVP.hash({person: self.getPerson(), identified: identified});
					})
					.then(function(hash) {
						Ember.Logger.log("PERSON: " + JSON.stringify(hash.person));
						Ember.Logger.log("found candidate!");
						Ember.Logger.log(hash.identified);
						Ember.Logger.log("this is the candidate: " + hash.identified.candidates)
						var intro = document.getElementById('intro');
						var found = document.getElementById('found');
						var emotionBubble = document.getElementById('emotionBubble');
						emotionBubble.innerHTML = "You are showing... " + self.get('highestEmotion');
						Ember.$(emotionBubble).show();
						setTimeout(function(){ Ember.$(emotionBubble).hide(); }, 5000);
						Ember.$(intro).hide();
						Ember.$(found).show();
						found.innerHTML = "We recognized you, " + self.get('personName');
						setTimeout(function(){ Ember.$(found).hide(); }, 5000);
						setTimeout(function(){Ember.$(intro).show(); }, 5000);
						return hash;
					})
					.then(function(hash){
						//Ember.Logger.log("From? " + person.from);
						Ember.Logger.log("this is person: " + JSON.stringify(hash.person));
						Ember.Logger.log(hash.person.persistedFaceIds.length);
						self.trainPersonGroup(); 
					})
					.catch(function(e){
						Ember.Logger.error("Failed to identify due to: " + e);
					});
				}
			});
//			.then(function(identified) {
//			return Ember.RSVP.hash({person: self.getPerson(), identified: identified});
//			})
//			.then(function(hash) {
//			Ember.Logger.log("PERSON: " + JSON.stringify(hash.person));
//			Ember.Logger.log("found candidate!");
//			Ember.Logger.log(hash.identified);
//			Ember.Logger.log("this is the candidate: " + hash.identified.candidates)
//			var firstCandidate = hash.identified[0];
//			var intro = document.getElementById('intro');
//			var found = document.getElementById('found');
//			var emotionBubble = document.getElementById('emotionBubble');
//			Ember.$(intro).hide();
//			emotionBubble.innerHTML = "You are showing... " + self.get('highestEmotion');
//			Ember.$(emotionBubble).show();
//			setTimeout(function(){ Ember.$(emotionBubble).hide(); }, 5000);
//			Ember.$(found).show();
//			found.innerHTML = "We recognized you, " + self.get('personName');
//			setTimeout(function(){ Ember.$(found).hide(); }, 5000);
//			Ember.$(intro).show();
//			return hash;
//			})
//			.then(function(hash){
//			//Ember.Logger.log("From? " + person.from);
//			Ember.Logger.log("this is person: " + JSON.stringify(hash.person));
//			Ember.Logger.log('Found: ' + JSON.stringify(hash.person));
//			self.trainPersonGroup(); 
//			})
//			.catch(function(e){
//			Ember.Logger.error("Failed to identify due to: " + e);
//			});



//			.then(function() {
//			return self.trainPersonGroup();
//			})
//			.then(function() {
//			Ember.Logger.log("person group id: " + self.get('personGroupId'));
//			self.personGroupTrainingStatus();
//			return self.identify(self.get('detectedFace'));
//			})


		},
		didError(error) {
			// Fires when a WebcamError occurs.
			Ember.Logger.log(error);
		},

	}
});
