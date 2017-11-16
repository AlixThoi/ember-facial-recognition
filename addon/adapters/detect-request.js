// addon/adapters/detect-request.js
import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';
/**
 * Set up the adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'detect';
	},
	/**
	 * Override the content type
	 */
	headers: Ember.computed('config', function() {
		var headers= this._super(...arguments);
		headers['Content-Type']='application/octet-stream';
		return headers;
	}),
	getParameters: function() {
		return {
				"returnFaceId": "true",     
				"returnFaceAttributes": "age,emotion"
		}
	}
});
