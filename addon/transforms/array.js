import Ember from 'ember';
import Transform from 'ember-data/transform';

export default Transform.extend({
	toArray: function(data){
		switch (Ember.typeOf(data)) {
		case 'array':
			return data;
		case 'string':
			return JSON.parse(data);
		default: 
			return [];
		}
	},
	deserialize(serialized) {
		return this.toArray(serialized);
	},

	serialize(deserialized) {
		return this.toArray(deserialized);
	}
});
