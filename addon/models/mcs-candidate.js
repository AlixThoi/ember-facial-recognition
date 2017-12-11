import DS from 'ember-data';

export default DS.Model.extend({
    personId: DS.attr('string'),
	confidence: DS.attr('number')
});
