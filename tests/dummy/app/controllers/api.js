import Ember from 'ember';
import Controller from '@ember/controller';

export default Controller.extend({
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
		}
	}
});
