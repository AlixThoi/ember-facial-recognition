import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),
	
//	serialize(snapshot) {
//		var json = this._super(...arguments);
//		return {
//			personGroupId: json.personGroupId,
//			id: json.id,
//		};
//	},
	
	normalize(modelClass, resourceHash) {
		var self = this; 
		// Format to JSONAPI form
		delete resourceHash.response;
		var data = {
				id:            resourceHash.id,
				type:          modelClass.modelName,
				attributes:    resourceHash,
		};

		return { data: data };
	}
	
});