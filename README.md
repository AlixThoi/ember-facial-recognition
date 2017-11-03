# ember-facial-recognition

## Installation

 ```
 git clone https://github.com/AlixThoi/ember-facial-recognition.git
 cd ember-facial-recognition
 npm install
 ```
 
## Running Demo Locally

Run ```ember serve``` and visit the demo page at http://localhost:4200
 
## Usage

* This add on combines 'ember-webcam' and leverages Microsoft Cognitive Services.
    - detect: returns back data about the user (age, emotion) and a unique FaceId which can be used for other services.
    
    - recognition: WIP

* Replace the subscriptionKey string value with your valid subscription key
    * https://azure.microsoft.com/en-us/try/cognitive-services/?api=face-api
 
* May have to change in the config/environment.js file, the URL to use the location where you obtained your subscription keys.
  * https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236

## Contributors

* Uses ember-webcam addon to connect to camera and take picture 
  * https://www.npmjs.com/package/ember-webcam
