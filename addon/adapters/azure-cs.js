/**
 * Adapter for the Azure face API
 * Requires:  ENV.APP.recognition.subscriptionKey in the config/environment of your application
 */
import Ember from 'ember';
import JSONAdapter from 'ember-data/adapters/json-api';
export default JSONAdapter.extend({
	init() {
		this._super(...arguments);
		this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
		this.set('subscriptionKey',  this.get('config.subscriptionKey'));
	},
	headers: Ember.computed('config', function() {
		return {
			"Content-Type":"application/json",
			"Ocp-Apim-Subscription-Key":self.get('config.subscriptionKey')
		};
	}),
	host: Ember.computed('config', function() {
		return self.get('config.host');
	}),
	namespace: Ember.computed('config', function() {
		return self.get('config.namespace');
	})
});
