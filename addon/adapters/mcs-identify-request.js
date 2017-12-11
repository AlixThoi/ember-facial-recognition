import AzureAdapter from '../adapters/azure-cs';
/**
 * Set up the adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'identify';
	}
});