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
			this.set('model.personGroups', this.store.findAll('mcsPersonGroup'));
		},
		detect: function() {
			var self = this;
			var detectRequest = this.store.createRecord('mcsDetectRequest', {imageUri: this.get('imageUri')});
			detectRequest.save()
			.then(function(detectRequest){
				Ember.Logger.log('Found ' + detectRequest.get('faces.length') + ' faces');
				self.set('detectResponseString', JSON.stringify(detectRequest.get('faces').objectAt(0)));
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
			var identifyRequest = this.store.createRecord('mcsIdentifyRequest', {personGroupId: this.get('model.personGroup.id')});
			identifyRequest.save()
			.then(function(identifyRequest){
				Ember.Logger.log('Found ' + identifyRequest.get('candidates.length') + ' candidates');
				self.set('identifyResponseString', JSON.stringify(identifyRequest.get('candidates').objectAt(0)));
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
