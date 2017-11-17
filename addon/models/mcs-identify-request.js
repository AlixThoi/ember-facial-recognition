import DS from 'ember-data';

export default DS.Model.extend({
	faceIds: DS.attr('array'),
	personGroupId: DS.attr('string'),
	maxNumOfCandidatesReturned: DS.attr('number'),
	confidenceThreshold:DS.attr('number'),
	candidates: DS.hasMany('mcsCandidate')
});
