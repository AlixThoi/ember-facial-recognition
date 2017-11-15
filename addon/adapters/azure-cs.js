/**
 * Adapter for the Azure face API
 * Requires:  ENV.APP.recognition.subscriptionKey in the config/environment of your application
 */
import Ember from 'ember';
import DS from 'ember-data';
import {v0, v4} from 'ember-uuid';
export default DS.Adapter.extend({
	config:{},
	headers: Ember.computed('config', function() {
		var config = this.getConfig(); 
		return {
			"Content-Type":"application/json",
			"Ocp-Apim-Subscription-Key":this.getConfig().subscriptionKey
		};
	}),
	host: Ember.computed('config',function() {
		return this.getConfig().host;
	}),
	namespace: Ember.computed('config',function() {
		return this.getConfig().namespace;
	}),
	getConfig: function() {
		return Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition;
	}, 
	
	getUrl: function() {
		return this.get('host') + '/' + this.get('namespace') + '/'  + this.pathForType(); 
	},
	/**
	 * Do a POST to the MCS and return the results as an facial model
	 * 
	 */
	  createRecord(store, type, snapshot) {
	    var data = this.serialize(snapshot, { includeId: true });
	    var self = this;
	    snapshot.id =  v4();
	    return new Ember.RSVP.Promise(function(resolve, reject) {
	      Ember.$.ajax({	  
	        type: 'POST',
	        headers: self.get('headers'),
	        url: self.getUrl(),
	        dataType: 'json',
	        processData: false,
	        data: data
	      }).then(function(data) {
	    	  snapshot.response=data;
	        Ember.run(null, resolve, snapshot);
	      }, function(jqXHR) {
	        jqXHR.then = null; // tame jQuery's ill mannered promises
	        Ember.run(null, reject, jqXHR);
	      });
	    });
	  }
});
