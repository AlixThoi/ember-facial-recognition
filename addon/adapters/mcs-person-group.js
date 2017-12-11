// addon/adapters/person-group.js
import AzureAdapter from '../adapters/azure-cs';
import {v4} from 'ember-uuid';

/**
 * Set up the adapter 
 */
export default AzureAdapter.extend({
	pathForType: function() {
		return 'persongroups';
	},
	/**
	 * Do a PUT to the MCS and return the results as an facial model
	 * 
	 */
	createRecord(store, type, snapshot) {
		snapshot.id =  v4();
		var data = this.serialize(snapshot, { includeId: true });
		return this.executeQuery('PUT', snapshot, data);
	},
});
