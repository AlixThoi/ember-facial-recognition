import DS from 'ember-data';

export default DS.Model.extend({
	personId:DS.attr('string'),
	personGroupId: DS.attr('string'),
	imageUri: DS.attr('string')
});
