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
		detect: function() {
			var self = this;
			var detectRequest = this.store.createRecord('detectRequest', {imageUri: this.get('imageUri')});
			detectRequest.save()
			.then(function(detectRequest){
				Ember.Logger.log('Found ' + detectRequest.get('faces.length') + ' faces');
			})
			.catch(function(e){
				Ember.Logger.error('Failed to detect a face: ' + e);
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
