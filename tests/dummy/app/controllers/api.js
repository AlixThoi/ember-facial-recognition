import Ember from 'ember';
import Controller from '@ember/controller';

export default Controller.extend({
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
			this.store.findAll('mcsPersonGroup')
			.then(function(personGroups) {
				self.set('model.personGroups', personGroups);
				self.set('model.personGroup', personGroups.objectAt(0));
			})
		},
		detect: function() {
			var self = this;
			var detectRequest = this.store.createRecord('mcsDetectRequest', {imageUri: this.get('imageUri')});
			detectRequest.save()
			.then(function(detectRequest){
				Ember.Logger.log('Found ' + detectRequest.get('faces.length') + ' faces');
				self.set('detectResponseString', JSON.stringify(detectRequest.get('faces').objectAt(0)));
				self.set('model.detectResponse', detectRequest.get('faces'));
				self.set('model.detectRequest', detectRequest);
			})
			
			.catch(function(e){
				var errorMessage = 'Failed to detect a face: ' + e;
				Ember.Logger.error(errorMessage);
				self.set('detectResponseString',errorMessage);
			});
		}, 
		/**
		 * Identify a person and return the candidates
		 */
		identify: function(){
			var self = this;
			var identifyRequest = this.store.createRecord('mcsIdentifyRequest', {
				personGroupId: this.get('model.personGroup.id'), 
				confidenceThreshold: .5, 
				faceIds :[this.get('model.detectResponse').objectAt(0).get('id')] 
			});
			
			identifyRequest.save()
			.then(function(identifyRequest){
				Ember.Logger.log('Found ' + identifyRequest.get('candidates.length') + ' candidates');
				self.set('identifyResponseString', JSON.stringify(identifyRequest.get('candidates').objectAt(0)));
			})
			.catch(function(e){
				Ember.Logger.error('Failed to detect any candidates: ' + e);
			});
		},
		addPerson: function() {
			var person = this.get('model.person');
			var self = this;
			person = this.store.createRecord('mcsPerson', {name: person.get('name'), 
					userData: person.get('userData'),
					personGroupId: this.get('model.personGroup.id')
			});
			person.save()
			.then(function(person){
				self.set('model.person', person);
				Ember.Logger.log('Created person: ' + person.get('id'));
			})
			.catch(function(e){
				Ember.Logger.error('Failed to create a person: ' + e);
			});
		},
		addFace: function() {
			var self = this;
			var person = this.get('model.person');
			var addFace = this.store.createRecord('mcsAddFace', {
				personGroupId: this.get('model.personGroup.id'), 
				personId: person.get('id'), imageUri: this.get('model.detectRequest.imageUri')
			});
			addFace.save()
			.then(function(addFaceResult){
				Ember.Logger.log('Created FACE: ' + addFaceResult.get('id'));
				self.set('addFaceResult', JSON.stringify(addFaceResult));
			})
			.catch(function(e){
				Ember.Logger.error('Failed to add face: ' + e);
			});
		},
		
		getPersonRequest: function() {	
			var self = this;
			var person = this.get('model.person');
			var getPerson = this.store.queryRecord('mcsGetPersonRequest', {
				personGroupId: this.get('model.personGroup.id'), 
				personId: person.get('id')
			})
			.then(function(getPerson) {
				Ember.Logger.log("asdkjflk")
				self.set('getPersonResult', JSON.stringify(getPerson));;
			})
		},
		
		trainGroup: function() {
			var self = this;
			var trainGroup = this.store.createRecord('mcsTrainGroupRequest', {
				personGroupId: this.get('model.personGroup.id') 
			});
			trainGroup.save()
			.then(function(trainGroupResult){
				Ember.Logger.log('trained group');
			})
			.catch(function(e){
				Ember.Logger.log('respond with blank');
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
