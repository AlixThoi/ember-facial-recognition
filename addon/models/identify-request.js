import DS from 'ember-data';

export default DS.Model.extend({
	imageUri: DS.attr('string'),
	face: DS.belongsTo('face'),
	personGroup: DS.belongsTo('personGroup'),
	maxNumOfCandidatesReturned: DS.attr('number'),
	confidenceThreshold:DS.attr('number'),
	candidates: DS.hasMany('candidate')
});
