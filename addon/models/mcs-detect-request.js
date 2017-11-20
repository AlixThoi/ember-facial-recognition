// addon/models/detect-request.js
import DS from 'ember-data';
/*
 * The base for all entities
 */
export default DS.Model.extend({
	imageUri: DS.attr('string'),
	returnFaceId: DS.attr('boolean'),
	returnFaceLandmarks: DS.attr('boolean'),
	returnFaceAttributes: DS.attr('raw'),
	faces: DS.hasMany('mcsFace')
});