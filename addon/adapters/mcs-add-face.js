import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';

/**
 * Set up the addFace adapter 
 */
export default AzureAdapter.extend({
	processData: false,
	pathForType: function() {
		return 'persongroups/{personGroupId}/persons/{personId}/persistedFaces';
	},
	/**
	 * Get the url - replacing the personGroupId
	 */
	getUrl: function(addFaceRequest,json) {
		var url= this._super(...arguments);
		url = url.replace('{personGroupId}', json.personGroupId);
		return url.replace('{personId}', json.personId);
		
		
	},
	headers: Ember.computed('config', function() {
		var headers= this._super(...arguments);
		headers['Content-Type']='application/octet-stream';
		return headers;
	}),
	
});
