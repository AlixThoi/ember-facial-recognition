import DS from 'ember-data';

export default DS.Model.extend({
	personId:DS.attr('string'),
	name: DS.attr('string'),
	userData: DS.attr('string')
});
