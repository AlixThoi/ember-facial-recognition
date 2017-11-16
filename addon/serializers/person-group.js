import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),
	
	serialize(requestHash) {
		requestHash.personGroupId = requestHash.id; 
		delete requestHash.id; 
		return requestHash; 
	},
	/**
	 * Parse the response and create the groups
	 */
	normalize(modelClass, resourceHash) {
		var data = {
				id:            resourceHash.personGroupId,
				type:          modelClass.modelName,
				attributes:    resourceHash
		};
		return { data: data };
	}
});
