
var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

 
var enableNotifButoon=document.querySelectorAll('.enable-notifications')

function displayConfirmNotification(){
  if('serviceWorker' in navigator){
    var options={
      body:"Subscrbed to sagar Giri",
      icon:"/src/images/icons/app-icon-96x96.png",
      image:"/src/images/sf-boat.jpg",
      dir:'ltr',
      lang:'en-us',
      vibrate:[100,50,200],
      badge:"/src/images/icons/app-icon-96x96.png",
      tag:"confirm-notification",
      renotify:false,
      actions:[{
        action:'confirm',title:'conform',icon:'/src/images/icons/app-icon-96x96.png'
      },{
        action:'confirm2',title:'not conform',icon:'/src/images/icons/app-icon-96x96.png'
      } ]
    }
    navigator
    .serviceWorker
    .ready
    .then(function(swreg){
    
      swreg.showNotification('Successfull from s' ,options)
    })
    
   }
  
}


function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function configurePubSub(){
  var reg
  if('serviceWorker' in navigator){
      navigator
      .serviceWorker
      .ready
      .then(function(swreg){
        reg=swreg
       return swreg.pushManager.getSubscription()
      })
      .then(function(sub){
        if(sub===null){
          var vapidKey="BL1a7NhacI24dK5D52jRu6LH3gOKhsorDCR8I8uZUa54CHIdrCJ8j7nZX5x0930TK_vnx2giOZ0CGQfsNwsmpwE"
          var vapidConverted=urlBase64ToUint8Array(vapidKey)

          return reg.pushManager.subscribe({
            userVisibleOnly:true,
            applicationServerKey:vapidConverted
          })
        }else{

        }
      }).then(function(newSub){
        return fetch('https://pwappsagargiri.herokuapp.com/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSub)
        })
      })  .then(function(res) {
        if (res.ok) {
          displayConfirmNotification();
        }
      })
      .catch(function(err) {
        console.log(err);
      });
  }else{
    return
  }
}

function askNotifPermission(){
   Notification.requestPermission(function(result){
    console.log('l',result)
    if(result!=='granted'){
    
    }else{
      configurePubSub()
      //displayConfirmNotification()
       for(var i=0 ;i<enableNotifButoon.length;i++){
         enableNotifButoon[i].style.display='none';
       }
    }
  })
}
if('Notification' in window){
  
  for(var i=0 ;i<enableNotifButoon.length;i++){
    enableNotifButoon[i].style.display='inline-block';
    enableNotifButoon[i].addEventListener('click',askNotifPermission)
  }
 
}