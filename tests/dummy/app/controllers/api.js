import Ember from 'ember';
import Controller from '@ember/controller';

export default Controller.extend({
	facialRecognition: Ember.inject.service(),
	config: {},
	imageUri: {},
	detectRequest: {},
	init() {
		this._super(...arguments);
		this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
	},
	actions: {
		detect: function() {
			var detectRequest = this.get('model.detectRequest');
			detectRequest.set('imageUri', this.get('imageUri'));
			detectRequest.save();
		}, 
		takeAPicture: function() {
			this.get('facialRecognition').takeAPicture();
		},
		didSnap: function(imageUri) {
			this.set('imageUri', imageUri);
		}
	}
});
