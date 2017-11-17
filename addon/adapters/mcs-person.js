import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';

/**
 * Set up the person adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'persongroups/{personGroupId}/persons';
	},
	/**
	 * Get the url - replacing the personGroupId
	 */
	getUrl: function(person) {
		var url= this._super(...arguments);
		return url.replace('{personGroupId}', person.record.get('personGroupId'));
	}
});
