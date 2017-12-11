import AzureSerializer from './azure-cs';
import Ember from 'ember';
export default AzureSerializer.extend({
	store: Ember.inject.service(),

	serialize(snapshot) {
		var json = this._super(...arguments);

		json.blob= 
			this.convertDataUriToBinary(snapshot.attr('imageUri'));
		return json;
	},
	/**
	 * Parse the response and create the faces
	 */
	normalize(modelClass, resourceHash) {
		var self = this; 
		// extract the returned faces
		var faces = resourceHash.response;
		var faceArray=[];
		var facesReference = {faces: {data: faceArray}};
		faces.forEach(function(face){
			faceArray.push({type: 'mcs-face', id: face.faceId})
			// Push to the store for later reference
			self.get('store').push({
				data:{
					id: face.faceId,
					type:'mcs-face',
					attributes: face
				}
			});
		});
		// Format to JSONAPI form
		delete resourceHash.response;
		var data = {
				id:            resourceHash.id,
				type:          modelClass.modelName,
				attributes:    resourceHash,
				relationships: facesReference
		};

		return { data: data };
	}
});
