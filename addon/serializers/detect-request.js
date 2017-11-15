import DS from 'ember-data';

export default DS.JSONSerializer.extend({
	store: Ember.inject.service(),
	/**
	 * Convert the image into Blob to pass into Microsoft Detect/addface call
	 * @params dataURL image recieved from webcam
	 * 
	 */
	convertDataUriToBinary(dataURL){
		var BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			var part = dataURL.split(',');
			var content = part[0].split(':')[1];
			var rawData = decodeURIComponent(part[1]);
			return new Blob([rawData], { type: content});
		}
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
		var uInt8Array = new Uint8Array(rawLength);
		for (var i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		var blob = new Blob([uInt8Array], { type: contentType });
		return blob;
	},
	serialize(snapshot, options) {
		var json = 
			this.convertDataUriToBinary(snapshot.attr('imageUri'));
		return json;
	},
	/**
	 * Parse the response and create the faces
	 */
	normalize(modelClass, resourceHash) {
		var store = this.get('store');
		var self = this; 
		var faces = resourceHash.response;
		var facesReference = [];
		faces.forEach(function(face){
			facesReference.push({id: face.faceId})
			self.store.push({
				data:{
					id: face.faceId,
					type:'face',
					attributes: face
				}
			});
		});
		resourceHash.faces=facesReference; 
		delete resourceHash.response;
		var data = {
				id:            resourceHash.id,
				type:          modelClass.modelName,
				attributes:    resourceHash
		};

		return { data: data };
	}
});
