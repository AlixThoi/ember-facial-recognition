import AzureAdapter from '../adapters/azure-cs';


/**
 * Set up the addFace adapter 
 */
export default AzureAdapter.extend({
	processData: false,
	dataType: 'text',
	pathForType: function() {
		return 'persongroups/{personGroupId}/train';
	},
	/**
	 * Get the url - replacing the personGroupId
	 */
	getUrl: function(type, addFaceRequest) {
		var url= this._super(...arguments);
		return url.replace('{personGroupId}', addFaceRequest.personGroupId);
		
		
	}
	
});
