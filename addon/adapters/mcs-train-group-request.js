import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';

/**
 * Set up the addFace adapter 
 */
export default AzureAdapter.extend({
	processData: false,
	pathForType: function() {
		return 'persongroups/{personGroupId}/train';
	},
	/**
	 * Get the url - replacing the personGroupId
	 */
	getUrl: function(addFaceRequest) {
		var url= this._super(...arguments);
		return url.replace('{personGroupId}', addFaceRequest.personGroupId);
		
		
	}
	
});
