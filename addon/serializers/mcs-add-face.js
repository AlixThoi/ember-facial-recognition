import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),
	
	serialize(snapshot) {
		var json = this._super(...arguments);
		json.blob = this.convertDataUriToBinary(json.imageUri);
		return {
			personGroupId: json.personGroupId,
			personId: json.personId,
			id: json.id,
			blob: json.blob
			
		};
	},
	
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