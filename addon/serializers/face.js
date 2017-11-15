import DS from 'ember-data';

export default DS.JSONSerializer.extend({
	serialize(snapshot, options) {
		snapshot.faceId = snapshot.id;
		return snapshot; 
	}, 
	normalize(modelClass, resourceHash) {
		var data = {
				id:            resourceHash.faceId,
				type:          modelClass.modelName,
				attributes:    resourceHash
		};
		return { data: data };
	}
	
});
