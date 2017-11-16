import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';
/**
 * Set up the adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'identify';
	}
});