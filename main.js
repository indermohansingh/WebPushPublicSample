/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

var urlParams = new URLSearchParams(window.location.search);

const applicationServerPublicKey = decodeURI(urlParams.get('pubK')); 
const strThisAppsIdentifierInAC = decodeURI(urlParams.get('appI'));
var bpidToUse = decodeURI(urlParams.get('bp'));


let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
	  initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
}



function initializeUI() {
    subscribeUser();

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function doMyEnc(strInput){
  var data = [];
  var val1, val2, val3 ;
  for (var i = 0; i < ~~(strInput.length/2); i++){  
      val1 = strInput.charCodeAt(2*i)%99 + 1;
      val2 = strInput.charCodeAt(2*i + 1)%99 + 1;
      val3 = val1*100 + val2 ;
      data.push(String.fromCharCode(val3) );
  }
  if (strInput.length > 2*i){
      val1 = strInput.charCodeAt(2*i)%99 + 1;
      val2 = 29;
      val3 = val1*100 + val2 ;
      data.push(String.fromCharCode(val3) );
  }
  var utf8Str = data.join("");
  var utf8StrEncoded = encodeURIComponent(utf8Str);
  return utf8StrEncoded;
}


var strTokenRegCall ;
function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    var strSubscriptionToken = JSON.stringify(subscription);
    var strSubscriptionTokenEndPoint = JSON.stringify(subscription);
    //bpidToUse = Math.floor((Math.random() * 100000) + 1); //should be BPID
    
    strSubscriptionTokenEndPoint = strSubscriptionTokenEndPoint;
    //strSubscriptionToken = "9288711" ;
    
    strTokenRegCall = decodeURI(urlParams.get('urAd') ) ;
    strTokenRegCall += "?registrationToken=" + encodeURIComponent(doMyEnc(strSubscriptionTokenEndPoint)) 
    strTokenRegCall += "&mobileAppUuid=" + strThisAppsIdentifierInAC 
    strTokenRegCall += "&userKey=" + bpidToUse;
    //strTokenRegCall += "&additionalParams=" + encodeURI('<additionalParams><param name="webRegToken" value="hello"/>' + '\n'  + '<param name="webRegToken2" value="hello2"/></additionalParams>');
    strTokenRegCall += "&additionalParams=" + encodeURI('<additionalParams><param name="webRegToken" value="' + encodeURIComponent(btoa(strSubscriptionToken)) +  '"/>' + '</additionalParams>');
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", strTokenRegCall, true);
    xhttp.send();

    if (subscription) {
      console.log('In updateSubscriptionOnServer, Subscription sent to server. ');
      console.log ( strSubscriptionToken );
    } else {
      console.log('In updateSubscriptionOnServer, No subscription available. ');
    }
  }

function regToken() {
    window.location.href = strTokenRegCall ;
} 
function updateBtn() {
    if (Notification.permission === 'denied') {
      console.log('In updateBtn, Push Messaging Blocked.') ;
      updateSubscriptionOnServer(null);
      return;
    }
  }
  
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}
