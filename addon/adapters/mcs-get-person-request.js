import AzureAdapter from '../adapters/azure-cs';

/**
 * Set up the addFace adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'persongroups/{personGroupId}/persons/{personId}';
	},
	/**
	 * Get the url - replacing the personGroupId
	 */
	getUrl: function(query,json) {
		var url= this._super(...arguments);
		url = url.replace('{personGroupId}', json.personGroupId);
		return url.replace('{personId}', json.personId);
		
		
	}
});
