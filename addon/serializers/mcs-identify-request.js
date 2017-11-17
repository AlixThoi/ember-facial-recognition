import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),
	serialize(snapshot) {
		return {faceIds: snapshot.attr('faceIds'),
			personGroupId: snapshot.attr('personGroupId')
		};
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
			candidateArray.push({type: 'mcsCandidate', id: candidate.personId})
			// Push to the store for later reference
			self.get('store').push({
				data:{
					id: candidate.personId,
					type:'mcsCandidate',
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
