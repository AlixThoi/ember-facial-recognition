
'use strict';
import Ember from 'ember';
const {
    Component,
    computed,
    getOwner
  } = Ember;
export default Ember.Component.extend({
	facialRecognition: Ember.inject.service(),
	camera: null, 

	/**
	 * Bind the camera to this and this to the service
	 */
	didInsertElement() {
		var facialRecognition = this.get('facialRecognition');
		facialRecognition.set('component', this);
		// Hack to locate the camera
		var app = window.APP || window.Dummy; 
		 var applicationInstance = getOwner(this);
		var camera = applicationInstance.lookup('-view-registry:main')['webcam'];
		this.set('camera', camera);
	},
	
	/**
	 * Take the picture
	 */
	snap: function() {
		var camera = this .get('camera');
		if (camera) {
			camera.snap();
		}
	},


	actions: {

		/**
		 * When picture is taken
		 */
		didSnap(dataUri) {
			// Delivers a data URI when snapshot is taken.
			this.get('pictureTaken')(dataUri);
		},
		didError(error) {
			// Fires when a WebcamError occurs.
			Ember.Logger.log(error);
		},
		
		registerCamera: function(camera) {
			this.set('camera', camera);
		}
	}
});
