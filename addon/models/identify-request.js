import DS from 'ember-data';

export default DS.Model.extend({
	faceIds: DS.sttr('string'),
	personGroupId: DS.attr('string'),
	maxNumOfCandidatesReturned: DS.attr('number'),
	confidenceThreshold:DS.attr('number'),
	candidates: DS.hasMany('candidate')
});
