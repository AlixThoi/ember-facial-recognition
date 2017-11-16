import Ember from 'ember';

// app/routes/api.js
export default Ember.Route.extend({

	model: function() {
		return {
			detectRequest: this.store.createRecord('mcsDetectRequest')
		};
	}
});
