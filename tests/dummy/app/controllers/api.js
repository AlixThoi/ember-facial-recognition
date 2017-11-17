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
			person.set('personGroupId', this.get('model.personGroup.id'));
			person.save()
			.then(function(person){
				Ember.Logger.log('Created person: ' + person.get('id'));
			})
			.catch(function(e){
				Ember.Logger.error('Failed to detect any candidates: ' + e);
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
