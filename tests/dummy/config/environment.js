/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
        recognition: {
            serviceUrl: ""
        }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
      
      //May have to change the URL to use the location where you obtained your subscription keys.
      ENV.APP.recognition.serviceUrl="https://westus.api.cognitive.microsoft.com/face/v1.0";
      ENV.APP.recognition.detectUrl=ENV.APP.recognition.serviceUrl + "/detect?";
      ENV.APP.recognition.createFaceListUrl=ENV.APP.recognition.serviceUrl + "/facelists/{faceListId}?";
      ENV.APP.recognition.addFaceToListUrl=ENV.APP.recognition.serviceUrl + "/facelists/281fce7e-5b9d-446e-a30b-a73dcd8727f7/persistedFaces?"
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
