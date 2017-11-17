/**
 * Adapter for the Azure face API
 * Requires:  ENV.APP.recognition.subscriptionKey in the config/environment of your application
 */
import Ember from 'ember';
import DS from 'ember-data';
import {v0, v4} from 'ember-uuid';
export default DS.Adapter.extend({
	processData: false,
	headers: Ember.computed('config', function() {
		return {
			"Content-Type":"application/json",
			"Ocp-Apim-Subscription-Key":this.getConfig().subscriptionKey
		};
	}),
	/**
	 * Do a POST to the MCS and return the results as an facial model
	 * 
	 */
	createRecord(store, type, snapshot) {
		snapshot.id =  v4();
		var data = this.serialize(snapshot, { includeId: true });
		return this.executeQuery('POST', snapshot, data);
	},
	/**
	 * Find a record based on the 
	 */
	findRecord(store, entityType, id, snapshot) {
	    return this.executeQuery('GET', snapshot); 
	  },
	  
	 findAll(store, type, sinceToken) {
		    return this.executeQuery('GET')
	},
		  
	host: Ember.computed('config',function() {
		return this.getConfig().host;
	}),
	namespace: Ember.computed('config',function() {
		return this.getConfig().namespace;
	}),
	getConfig: function() {
		return Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition;
	}, 

	getParameters: function() { 
		// Implement in subclass as a hash of key/value pairs
		return null; 
	},
	getUrl: function() {
		var url = this.get('host') + 
		'/' + this.get('namespace') + 
		'/' + this.pathForType();
		var parameters = this.getParameters();
		if (parameters) {
			url += '?' + Ember.$.param(parameters);
		}
		return url; 
	},

	
	/**
	 * Build the jQuery call and execute
	 * Returns a promise
	 */
	executeQuery: function(type, snapshot, data) {
		var self = this;
		return new Ember.RSVP.Promise(function(resolve, reject) {
			Ember.$.ajax({	  
				type: type,
				headers: self.get('headers'),
				url: self.getUrl(),
				dataType: 'json',
				processData: self.get('processData'),
				data: data
			}).then(function(response) {
				// Check for request/response 
				if (snapshot) {
					snapshot.response=response;
					Ember.run(null, resolve, snapshot);
				} else {
					Ember.run(null, resolve, response);
				}
			}, function(jqXHR) {
				jqXHR.then = null; // tame jQuery's ill mannered promises
				Ember.run(null, reject, jqXHR);
			});
		});
	}
});
