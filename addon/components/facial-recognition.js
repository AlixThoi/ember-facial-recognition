/* eslint-env node */
'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
    dataUri: null,
    faceResults: null,
    config: null,
    subscriptionKey: null,
    init() {
        this._super(...arguments);
        this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
        // Replace the subscriptionKey string value with your valid subscription key (this one won't work).
        this.set('subscriptionKey',  "13hc77781f7e4b19b5fcdd72a8df7156");
        
    }, 
    
    /**
     * Convert the image into Blob to pass into Microsoft Detect/addface call
     * @params dataURL image recieved from webcam
     * 
     */
    convertDataUriToBinary(dataURL){
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) === -1) {
            var part = dataURL.split(',');
            var content = part[0].split(':')[1];
            var rawData = decodeURIComponent(part[1]);
            return new Blob([rawData], { type: content});
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;
        var uInt8Array = new Uint8Array(rawLength);
        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        var blob = new Blob([uInt8Array], { type: contentType });
        return blob;
    },

   
    /**
     * Microsoft detect call
     * @params faceUri the data of the picture that was taken
     * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
     */
    microsoftDetect(faceUri) {
        var blob = this.convertDataUriToBinary(faceUri);
        Ember.Logger.log(blob);
        var self = this;

        var params = {
                "returnFaceId": "true",     
                "returnFaceAttributes": "age,emotion"
        };

        this.set('faceResults', null);
        Ember.$.ajax({
            url: this.get('config.detectUrl') + Ember.$.param(params),
            processData: false,
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                
                //Enter your subscription key
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", self.get('subscriptionKey'));
            },
            type: "POST",
            // Request body
            data: blob
        })
        .done(function(data) {
            if(data[0] !== null) {
                Ember.Logger.log(data);
                if(data[0].faceId !== null) {
                    var emotionSet = data[0].faceAttributes.emotion;
                    var result = JSON.stringify(emotionSet);
                    Ember.Logger.log(result);
                    Ember.Logger.log(data[0].faceAttributes.age);
                    var emotionKeys = Object.keys(emotionSet);
                    var maximum = 0; 
                    var emotion = emotionKeys.reduce(function(emotion, emotionKey){
                        var emotionValue = emotionSet[emotionKey];
                        if (emotionValue >= maximum) {
                            maximum = emotionValue;
                            return emotionKey;
                        } else {
                            return emotion;
                        }
                    }, "confused");
                    Ember.Logger.log("face detected");
                    //self.addFaceToFaceList(blob);
                }
            }
            else {
                Ember.Logger.log("no face got detected");
            }

        }).fail(function() {
            Ember.Logger.error("error in face detect. Might not have a valid subscriptionKey");
        });

    },

    /**
     * calls Microsoft create faceList API
     * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
     */
    createFaceList() {
        var self = this;
        var params = {
                "faceListId": "281fce7e-5b9d-446e-a30b-a73dcd8727f7"
        };

        Ember.$.ajax({
            url: this.get('config.createFaceListUrl') + Ember.$.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                
                //Enter your subscription key
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
            },
            type: "PUT",
            // Request body
            data: '{ "name":"sample"}',
        })
        .done(function(data) {
            Ember.Logger.log("created face list");
            Ember.Logger.log(data);
        })
        .fail(function() {
            Ember.Logger.error("create face list fail");
            Ember.Logger.error("error. Might not have a valid subscriptionKey");
        });
    },

    /**
     * Calls Microsoft add face to facelist API
     * Enter your subscription key
     * May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
     */
    addFaceToFaceList(faceUri) {
        var self = this;
        var params = {
                "faceListId": "281fce7e-5b9d-446e-a30b-a73dcd8727f7",
                "userData": "",
                "targetFace": ""
        };
        Ember.$.ajax({
            url: this.get('config.addFaceToListUrl') + Ember.$.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                //Enter your subscription key
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.get('subscriptionKey'));
            },
            type: "POST",
            // Request body
            data: faceUri
        })
        .done(function(data) {
            Ember.Logger.log("added to face list");
            Ember.Logger.log(data);
            return data;
        })
        .fail(function() {
            Ember.Logger.log("add face fail");
            Ember.Logger.error("error. Might not have a valid subscriptionKey");
        });
    },

    actions: {

        /**
         * When picture is taken
         */
        didSnap(dataUri) {
            // Delivers a data URI when snapshot is taken.
            var self = this
            
            //calls microsoft detect API with the image snapped
            self.microsoftDetect(dataUri);
            
            //Converts dataUri from picture taken
            var blob = self.convertDataUriToBinary(dataUri);
            this.set('dataUri', dataUri);
            //self.createFaceList();
        },
        didError(error) {
            // Fires when a WebcamError occurs.
            Ember.Logger.log(error);
        },

    }
});
