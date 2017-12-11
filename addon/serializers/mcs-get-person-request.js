import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),
	
	normalize(modelClass, resourceHash) {
		var person = resourceHash.response;
		var personReference = {person: {data: person}};
		
		// Format to JSONAPI form
		delete resourceHash.response;
		var data = {
				id:            resourceHash.personId,
				type:          modelClass.modelName,
				attributes:    personReference.person.data,
		};

		return { data: data };
	}
	
});