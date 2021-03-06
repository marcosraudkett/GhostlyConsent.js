# GhostlyConsent.js

## About
GhostlyConsent.js is a lightweight customizable open source Vanilla JavaScript cookie consent that does not need any third-party components to work.

![68747470733a2f2f7777772e6d6172636f73726175646b6574742e636f6d2f6173736574732f696d616765732f70726f64756374732f67686f73746c79636f6e73656e742e706e67](https://user-images.githubusercontent.com/23305471/132923260-db791540-defe-4860-9d31-02bb6d25bbdd.png)

## Examples 
https://ghostly.marcosraudkett.com/examples/modal.html

## Installation
```
git clone https://github.com/marcosraudkett/GhostlyConsent.js.git
```
Adding it to your project:
```html
<!-- GhostlyConsent.js -->
<link rel="stylesheet" href="path/to/dist/GhostlyConsent.css">
<script src="path/to/dist/GhostlyConsent.js"></script>
```

Via CDN (Current)
```html
<!-- Using CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcosraudkett/GhostlyConsent.js@main/src/GhostlyConsent.css">
<script src="https://cdn.jsdelivr.net/gh/marcosraudkett/GhostlyConsent.js@main/src/GhostlyConsent.js"></script>
```

Via CDN - Minified (Current)
```html
<!-- CDN - Minified -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcosraudkett/GhostlyConsent.js@main/src/GhostlyConsent.min.css">
<script src="https://cdn.jsdelivr.net/gh/marcosraudkett/GhostlyConsent.js@main/src/GhostlyConsent.min.js"></script>
```


## Usage
You can use the example below in an existing file on your site. The example below loads the consent template from `templateLocation` and `useTemplate` enables the template usage.
Basic usage:
```js
// Properties
// Check src/properties.js for full list of properties.
const properties = {
    templateLocation: '../src/views/default.html',
    useTemplate: true,
    elements: {
        consentWrapper: '#gh-cookie-consent'
    },
};

// files you wish to load after accepted 
// if array is used inside "files" then set scope: permissions and use disallowed in there to set rule for all files 
// if disallowed key is not set then the default is set to true
// if type is not set then it will load the file using ajax

// Alternatively you can use events to load your files or do something when the status is changed (check below .init())
// ---///--- name, title, file & type (css/js) keys are REQUIRED! ---///---
const files = [
  {
      title: 'Google Fonts',
      name: 'font',
      file: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap',
      type: 'css',
      ajax: false,
      disallowed: false
  },
  analytics = [
        {
          scope: 'meta',
          title: 'Google Analytics',
          name: 'analytics'
        },
        {
          scope: 'permissions',
          disallowed: false
        },
        {
          file: 'https://www.googletagmanager.com/gtag/js?id=UA-44404621-1',
          type: 'js'
        },
        {
          file: '../vendor/Google-Analytics.js', // this file has the rest of the Google Analytics code
          type: 'js'
        }
    ],
];

// initialize
ghostlyConsent.init(properties, files);

// when consent status is changed
ghostlyConsent.on('status', (event) => {
  // get the whole event
  console.log(event);

  if (event.value) {
    // do something if consent is accepted
    console.log("Consent was accepted");
    // alternatively you can use this to load files:
    ghostlyConsent.addFiles([
        {
            title: 'Google Fonts',
            name: 'font',
            file: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap',
            type: 'css',
        },
        {
            title: 'Test script',
            name: 'test',
            file: '/',
            type: 'js',
        }
    ]);
    // or do something else..
  } else {
    // do something if consent is rejected
    console.log("Consent was rejected");
  }
});

// listen for file additions
ghostlyConsent.on('addFile', (event) => { 
  // get files
  const files = ghostlyConsent.getFiles();
  console.log(files); // loaded files
});
```

## Properties
Here's everything you can setup: (none of the properties are required)
<table>
  <thead>
    <th>Property</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
    <th>Required</th>
  </thead>
  <tbody>
    <!-- elements -->
    <tr>
      <td>elements</td>
      <td>Cookie elements</td>
      <td>array</td>
      <td>array (check below)</td>
      <td>No</td>
    </tr>
    <!-- texts -->
    <tr>
      <td>text</td>
      <td>Button texts</td>
      <td>array</td>
      <td>array (check below)</td>
      <td>No</td>
    </tr>
    <!-- name -->
    <tr>
      <td>name</td>
      <td>Name of the cookie</td>
      <td>string</td>
      <td>_ghostly_consent</td>
      <td>No</td>
    </tr>
    <!-- destroy -->
    <tr>
      <td>destroy</td>
      <td>Remove cookie container if cookie exists / or has been enabled/disabled</td>
      <td>boolean</td>
      <td>false</td>
      <td>No</td>
    </tr>
    <!-- domain -->
    <tr>
      <td>domain</td>
      <td>Your domain</td>
      <td>string</td>
      <td>.yourdomain.com</td>
      <td>No</td>
    </tr>
    <!-- callback -->
    <tr>
      <td>callback</td>
      <td>Callback url</td>
      <td>string</td>
      <td>null</td>
      <td>No</td>
    </tr>
    <!-- length -->
    <tr>
      <td>length</td>
      <td>Days until expiration</td>
      <td>int</td>
      <td>365</td>
      <td>No</td>
    </tr>
    <!-- debug -->
    <tr>
      <td>debug</td>
      <td>Shows errors as alerts();</td>
      <td>boolean</td>
      <td>false</td>
      <td>No</td>
    </tr>
  </tbody>
</table>

Properties.elements:
<table>
  <thead>
    <th>Property</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
    <th>Required</th>
  </thead>
  <tbody>
    <!-- consentWrapper -->
    <tr>
      <td>elements.consentWrapper</td>
      <td>The main container</td>
      <td>string</td>
      <td>#gh-cookie-consent</td>
      <td>No</td>
    </tr>
    <!-- personalizeWrapper -->
    <tr>
      <td>elements.personalizeWrapper</td>
      <td>Personalization container</td>
      <td>string</td>
      <td>#gh-cookie-personalization</td>
      <td>No</td>
    </tr>
    <!-- modalWrapper -->
    <tr>
      <td>elements.modalWrapper</td>
      <td>Modal container</td>
      <td>string</td>
      <td>#gh-modal</td>
      <td>No</td>
    </tr>
    <!-- buttonsPersonalize -->
    <tr>
      <td>elements.buttonsPersonalize</td>
      <td>Button to activate personalization container</td>
      <td>string</td>
      <td>#gh-cookie-personalize</td>
      <td>No</td>
    </tr>
    <!-- buttonsEnable -->
    <tr>
      <td>elements.buttonsEnable</td>
      <td>Accept cookies button</td>
      <td>string</td>
      <td>#gh-cookie-enable</td>
      <td>No</td>
    </tr>
    <!-- buttonsDecline -->
    <tr>
      <td>elements.buttonsDecline</td>
      <td>Decline cookies button</td>
      <td>string</td>
      <td>#gh-cookie-decline</td>
      <td>No</td>
    </tr>
  </tbody>
</table>

Properties.text:
<table>
  <thead>
    <th>Property</th>
    <th>Type</th>
    <th>Default</th>
    <th>Required</th>
  </thead>
  <tbody>
    <!-- acceptSelected -->
    <tr>
      <td>acceptSelected</td>
      <td>string</td>
      <td>Accept selected</td>
      <td>No</td>
    </tr>
    <!-- acceptAll -->
    <tr>
      <td>acceptAll</td>
      <td>string</td>
      <td>Accept all</td>
      <td>No</td>
    </tr>
    <!-- declineAll -->
    <tr>
      <td>declineAll</td>
      <td>string</td>
      <td>Decline all</td>
      <td>No</td>
    </tr>
    <!-- personalize -->
    <tr>
      <td>personalize</td>
      <td>string</td>
      <td>Personalize</td>
      <td>No</td>
    </tr>
    <!-- choose -->
    <tr>
      <td>choose</td>
      <td>string</td>
      <td>Choose the cookies you wish to accept:</td>
      <td>No</td>
    </tr>
  </tbody>
</table>

## Events
```js
ghostlyConsent.on('initialized', (event) => { console.log("initialized: "); console.log(event); });
ghostlyConsent.on('popupOpened', () => { console.log("popupOpened"); });
ghostlyConsent.on('popupClosed', () => { console.log("popupClosed"); });
ghostlyConsent.on('popup', (event) => { console.log("popup state: "+event.value); });
ghostlyConsent.on('status', (event) => { console.log("status: "+event.value); });
ghostlyConsent.on('rejected', (event) => { console.log("rejected: "+event.value); });
ghostlyConsent.on('accepted', (event) => { console.log("accepted: "+event.value); });
```
<table>
  <thead>
    <th>Event</th>
    <th>Description</th>
  </thead>
  <tbody>
    <!-- initialized -->
    <tr>
      <td>initialized</td>
      <td>-</td>
    </tr>
    <!-- status -->
    <tr>
      <td>status</td>
      <td>When cookie status is changed</td>
    </tr>
    <!-- accepted -->
    <tr>
      <td>accepted</td>
      <td>After consent is accepted</td>
    </tr>
    <!-- rejected -->
    <tr>
      <td>rejected</td>
      <td>After consent is rejected</td>
    </tr>
    <!-- popupOpened -->
    <tr>
      <td>popupOpened</td>
      <td>After consent is opened</td>
    </tr>
    <!-- popupClosed -->
    <tr>
      <td>popupClosed</td>
      <td>After consent is closed</td>
    </tr>
    <!-- personalize -->
    <tr>
      <td>personalize</td>
      <td>When personalization is triggered</td>
    </tr>
    <!-- appendFile -->
    <tr>
      <td>appendFile</td>
      <td>When a file has been appended to document</td>
    </tr>
    <!-- getFile -->
    <tr>
      <td>getFile</td>
      <td>When a file has been loaded</td>
    </tr>
    <!-- filesLoaded -->
    <tr>
      <td>filesLoaded</td>
      <td>When all files have been triggered</td>
    </tr>
  </tbody>
</table>

## API
```js
// add files after initialization
var files = []; // list of files
ghostlyConsent.addFiles(files);
// add a single file after initialization
var single = {
    title: 'Single file example',
    name: 'googl',
    file: '../',
    type: 'js',
};
ghostlyConsent.addFile(single);
```
<table>
  <thead>
    <th>Function</th>
    <th>Input/Response</th>
    <th>Description</th>
  </thead>
  <tbody>
    <!-- addFiles -->
    <tr>
      <td>addFiles</td>
      <td>array</td>
      <td>Add multiple files after initialized.</td>
    </tr>
    <!-- addFile -->
    <tr>
      <td>addFile</td>
      <td>object</td>
      <td>Add a single file after initialization.</td>
    </tr>
    <!-- getFiles -->
    <tr>
      <td>getFiles</td>
      <td>array</td>
      <td>Get the list of files</td>
    </tr>
  </tbody>
</table>

## Contributing
Feel free to help this project or if you've found a bug then feel free to visit [the issues page](https://github.com/marcosraudkett/GhostlyConsent.js/issues).