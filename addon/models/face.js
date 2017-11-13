import DS from 'ember-data';
/*
 * The base for all entities
 */
export default DS.Model.extend({
	faceRectange: DS.attr('raw'),
	faceAttributes: DS.attr('raw')
});
