import Ember from 'ember';

export default Ember.Service.extend({
	component: null,
	store: Ember.inject.service(),

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
	 * Take a picture using the web camera
	 * The camera will respond by sending the didSnap event. 
	 */
	takeAPicture: function() {
		var component=this.get('component');
		if (component) {
			component.snap();
		}
	},
	/**
	 * Microsoft detect call
	 * @params faceUri the data of the picture that was taken
	 * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
	 */
	detect(faceUri) {
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
// TODO: move this to a function so that it can be reused
// Perhaps with a flag: returnEmotionSummary that would activate this
					var emotionSet = data[0].faceAttributes.emotion;
					var result = JSON.stringify(emotionSet);
					//Ember.Logger.log(result);
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
				reject("adsfs");
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
				Ember.Logger.log("created person: " + person.personId);
				self.set('personId', person.personId);
			})
			.then(function(person) {
				self.addFaceToPerson()
			})
			.then(function(person) {
				resolve(person);
			})
			.fail(function(e) {
				reject("create person error" + e);
			});
		});
	},

	trainPersonGroup() {
		var self = this;
		var params = {
				// Request parameters
				"personGroupId": self.get('personGroupId'),
		};
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
		var params = {
				// Request parameters
				"personGroupId": self.get('personGroupId'),
		};

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

			Ember.Logger.log(" status group success: " + JSON.stringify(data));

		})
		.fail(function() {
			Ember.Logger.log("status fail")
		});
	},

	addFaceToPerson() {
		var self = this;
		var facePic = this.get('facePicture');

		// Ember.Logger.log("uri data picture: " + this.get('facePicture'));
		var blob = this.convertDataUriToBinary(self.get('facePicture'));
		var params = {
				// Request parameters
				//"userData": "{string}",
				// "targetFace": "{string}",
		};

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
		})
		.fail(function() {
			Ember.Logger.error("add face to person error");
		});
	}
});
