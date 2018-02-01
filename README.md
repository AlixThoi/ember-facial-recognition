# ember-facial-recognition

## Installation

 ```
 git clone https://github.com/AlixThoi/ember-facial-recognition.git
 cd ember-facial-recognition
 npm install
 ```
 
## Running Demo Locally

Run ```ember serve``` and visit the demo page at http://localhost:4200/api
 
## Usage

* This add on combines 'ember-webcam' and leverages Microsoft Cognitive Services(MCS).

* Insert your subscription key
  * If you do not have one, https://azure.microsoft.com/en-us/try/cognitive-services/?api=face-api

* Paste an imageUri Or click the take a picture button to take a picture through a webcam
 
* May have to change in the config/environment.js file, recognition.host, the URL to use the location where you obtained your subscription keys.
  *	https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236
  
* Load which persongroup you want, or create a new one

* Clicking on a button starts the request and a response will be generated in the text area below

    * detect: returns back data about the user (age, emotion) and a unique FaceId which can be used for other services.
    
    * identify: returns only if that person is recognized by MCS
    
    * Get Person: returns the information associated with that specific Person Id
    
    * Create Person: Creates a Person on MCS, returns back a personID to associate with
    
    * Add Face: Adds the image to the person that was created
    
    * Train Person Group: Trains the personGroup 
    

## Dependencies

* Uses ember-webcam addon to connect to camera and take picture 
  * https://www.npmjs.com/package/ember-webcam
