import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),

	serialize(snapshot) {
		
		return snapshot;
	
	},
	/**
	 * Parse the response and create the candidates
	 */
	normalize(modelClass, resourceHash) {
		var self = this; 
		// extract the returned faces
		var candidates = resourceHash.response;
		var candidateArray=[];
		var candidateReference = {candidates: {data: candidateArray}};
		candidates.forEach(function(candidate){
			candidateArray.push({type: 'candidate', id: candidate.personId})
			// Push to the store for later reference
			self.get('store').push({
				data:{
					id: candidate.personId,
					type:'candidate',
					attributes: candidate
				}
			});
		});
		// Format to JSONAPI form
		delete resourceHash.response;
		var data = {
				id:            resourceHash.id,
				type:          modelClass.modelName,
				attributes:    resourceHash,
				relationships: candidateReference
		};

		return { data: data };
	}
});
