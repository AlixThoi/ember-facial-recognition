
'use strict';
import Ember from 'ember';
const {
	getOwner
} = Ember;
import Webcam from 'webcamjs';
import Component from '@ember/component';
export default Component.extend({
	facialRecognition: Ember.inject.service(),
	camera: null,
	hideButton: false,
	picturePending: false,
	height: 1024, 
	width: 760,
	/**
	 * Bind the camera to this and this to the service
	 */
	didInsertElement() {
		var self = this;
		var facialRecognition = this.get('facialRecognition');
		facialRecognition.set('component', this);
		// Hack to locate the camera
		var applicationInstance = getOwner(this);
		var camera = applicationInstance.lookup('-view-registry:main')['webcam'];
		this.set('camera', camera);
		// Register for the 'live' callback 
		Webcam.set({
			dest_height: this.get('height'),
			dest_width: this.get('width')
		});
		Webcam.on('live', function() {
			// Check for a pending picture when avalable
			if (self.get('picturePending')) {
				self.snap();
			}
		});
	},

	/**
	 * Take the picture
	 */
	snap: function() {
		var camera = this.get('camera');
		if (camera) {
			this.set('picturePending', false);
			camera.snap();
		} else {
			this.set('picturePending', true);
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
