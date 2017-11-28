import Ember from 'ember';
/**
 * The common service for facial recognition
 * Use: 
 * export default Ember.Controller ({
 *     facialRecognition: Ember.inject.service(),
 * ...
 *
    detectAndIdentify: function() {
        var self = this;
        this.get('facialRecognition').detect(personGroup)
        .then(function(detectRequest){
            // detected a face - attempt the identify with the first record
            self.identifyAndRoute(detectRequest.get('faces').objectAt(0).get('faceId'));
         });
    }, 
 *  
 */
export default Ember.Service.extend({
    component: null,
    store: Ember.inject.service(),
    picturePending: false, 
    /**
     * Take a picture using the web camera The camera will respond by sending
     * the didSnap event.
     */
    takeAPicture: function() {
        var component=this.get('component');
        if (component) {
            component.snap();
        } else {
            // Wait for the component rendering
            this.set('picturePending', true);
        }
    },
    /**
     * Set the facial recognition component - called form didInsertElement() on components/facial-recognition
     */
    componentSet: function(component) {
        if (this.get('picturePending')) {
            this.set('picturePending', false);
            this.takeAPicture();
        }
    },
    /**
     * Configure the service and set up observers 
     */
    init() {
        this._super(...arguments);
        this.set('config', Ember.getOwner(this).resolveRegistration('config:environment').APP.recognition);
        // Set up the observer to take a picture when the component is ready
        this.addObserver('component', this, this.componentSet);
    },
    /**
     * Load the person groups for later use
     * Assign the default group to the first one. 
     */
    loadPersonGroups: function() {
        var self = this;
        return this.get('store').findAll('mcsPersonGroup')
        .then(function(personGroups) {
            return personGroups;
        })
    },
    /**
     * Detect the face and return the promise
     * 
     */
    detect: function(imageUri) {
        var self = this;
        var detectRequest = this.get('store').createRecord('mcsDetectRequest', {imageUri: imageUri});
        return detectRequest.save()
        .then(function(detectRequest){
            Ember.Logger.log('Found ' + detectRequest.get('faces.length') + ' faces');
            Ember.Logger.log(detectRequest);
            Ember.Logger.log(JSON.stringify(detectRequest));
            return detectRequest; 
        })
        .catch(function(e){
            var errorMessage = 'Failed to detect a face: ' + e;
            Ember.Logger.error(errorMessage);
            self.set('detectResponseString',errorMessage);
        });
    }, 
    /**
     * Identify a person and return the candidates
     */
    identify: function(personGroupId, threshold, faceIds){
        var self = this;
        var identifyRequest = this.get('store').createRecord('mcsIdentifyRequest', {
            personGroupId: personGroupId, 
            confidenceThreshold: threshold, 
            faceIds :faceIds 
        });

        return identifyRequest.save()
        .then(function(identifyRequest){
            Ember.Logger.log('Found ' + identifyRequest.get('candidates.length') + ' candidates');
            return identifyRequest;
        })
        .catch(function(e){
            Ember.Logger.error('Failed to detect any candidates: ' + e);
        });
    },
    /**
     * Add the person to the default person group
     */
    addPerson: function(personGroupId, name, userData) {
        var person = this.get('model.person');
        var self = this;
        person = this.get('store').createRecord('mcsPerson', {
            personGroupId: personGroupId ,
            name: name, 
            userData: userData,
            personId: person.get('id'),
        });
        return person.save()
        .then(function(person){
             Ember.Logger.log('Created person: ' + person.get('id'));
             return person;
        })
        .catch(function(e){
            Ember.Logger.error('Failed to create a person: ' + e);
        });
    },
    /**
     * Add the face to the personGroup
     */
    addFace: function(personGroupId, personId, imageUri) {
        var self = this;
        var person = this.get('model.person');
        var addFace = this.get('store').createRecord('mcsAddFace', {
            personGroupId: personGroupId, 
            personId: personId,
            imageUri: imageUri
        });
        return addFace.save()
        .then(function(addFaceResult){
            Ember.Logger.log('Created FACE: ' + addFaceResult.get('id'));
            self.set('addFaceResult', JSON.stringify(addFaceResult));
            return addFaceResult;
        })
        .catch(function(e){
            Ember.Logger.error('Failed to add face: ' + e);
        });
    },

    /**
     * Look up a person using the id and the  personGroup
     */
    getPerson: function(personGroup, id) {  
        var self = this;
        var person = this.get('model.person');
        return this.get('store').queryRecord('mcsGetPersonRequest', {
            personGroupId: personGroup, 
            personId: id
        })
        .then(function(getPerson) {
            Ember.Logger.log("Found " + getPerson.get('id'));
            return getPerson;
        })
    },

    /**
     * Train the group with the loaded pictures
     */
    trainGroup: function(personGroupId) {
        var self = this;
        var trainGroup = this.get('store').createRecord('mcsTrainGroupRequest', {
            personGroupId: personGroupId 
        });
        return trainGroup.save()
        .then(function(trainGroupResult){
            Ember.Logger.log('Trained group');
        })
        .catch(function(e){
            Ember.Logger.log('Responded with blank - OK');
        });
    }
});
