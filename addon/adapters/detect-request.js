
import AzureAdapter from '../adapters/azure-cs';
import Ember from 'ember';
export default AzureAdapter.extend({
	pathForType: function() {
		return 'detect';
	},
	headers: Ember.computed('config', function() {
		var headers= this._super(...arguments);
		headers['Content-Type']='application/octet-stream';
		return headers;
	}),
});
