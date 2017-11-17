import Ember from 'ember';

export default Ember.Service.extend({
	component: null,
	store: Ember.inject.service(),
	/**
	 * Take a picture using the web camera
	 * The camera will respond by sending the didSnap event. 
	 */
	takeAPicture: function() {
		var component=this.get('component');
		if (component) {
			component.snap();
		}
	}
});
