import Ember from 'ember';

export default Ember.Controller.extend({
	facialRecognition: Ember.inject.service(),
	config: {},
	imageUri: {},
	detectRequest: {},
	responseString: "",
	init() {
		this._super(...arguments);
		this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
	},
	actions: {
		loadPersonGroups: function() {
		    var self = this; 
			this.get('facialRecognition').loadPersonGroups()
			.then(function(personGroups) {
				self.set('model.personGroups', personGroups);
				self.set('model.personGroup', personGroups.objectAt(0));
			})
		},
		detect: function() {
			var self = this;
			this.get('facialRecognition').detect(this.get('imageUri'))
			.then(function(detectRequest){
				self.set('detectResponseString', JSON.stringify(detectRequest.get('faces').objectAt(0)));
				self.set('model.detectResponse', detectRequest.get('faces'));
				self.set('model.detectRequest', detectRequest);
			});
		}, 
		/**
		 * Identify a person and return the candidates
		 */
		identify: function(){
			var self = this;
			this.get('facialRecognition').identify( 
			        this.get('model.personGroup.id'), 
			        config.identificationThreshold, 
			        [this.get('model.detectResponse').objectAt(0).get('id')] )
			.then(function(identifyRequest){
				self.set('identifyResponseString', JSON.stringify(identifyRequest.get('candidates').objectAt(0)));
			});
		},
		addPerson: function() {
			var person = this.get('model.person');
			var self = this;
			this.get('facialRecognition').addPerson(
			        this.get('model.personGroup.id'), 
			        person.get('name'), 
					person.get('userData'))
			.then(function(person){
				self.set('model.person', person);
			});
		},
		addFace: function() {
			var self = this;
			var person = this.get('model.person');
			this.get('facialRecognition').addFace(
			        this.get('model.personGroup.id'), 
			        person.get('id'), 
			        this.get('model.detectRequest.imageUri')
	        )
			.then(function(addFaceResult){
				self.set('addFaceResult', JSON.stringify(addFaceResult));
			});
		},
		
		getPersonRequest: function() {	
			var self = this;
			var person = this.get('model.person');
			this.get('facialRecognition').getPerson(
			    this.get('model.personGroup.id'), 
				person.get('id')
			)
			.then(function(getPerson) {
				Ember.Logger.log("asdkjflk")
				self.set('getPersonResult', JSON.stringify(getPerson));;
			});
		},
		
		trainGroup: function() {
			var self = this;
			this.get('facialRecognition').trainGroup( this.get('model.personGroup.id'))
			.then(function(trainGroupResult){
			    // We are assuming that this works
			})
			.catch(function(e){
			    //TODO fix error thrown by jquery
				// ignore error
			});
		},
		
		
		takeAPicture: function() {
			this.get('facialRecognition').takeAPicture();
		},
		pictureTaken: function(imageUri) {
			this.set('imageUri', imageUri);
		}
	}
});
