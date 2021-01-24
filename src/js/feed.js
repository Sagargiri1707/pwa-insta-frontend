var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var titleInput=document.getElementById('title')
var locationInput=document.getElementById('location')



function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function(cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  console.log(data)

  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = 'https://pwappsagargiri.herokuapp.com/posts';
var networkDataReceived = false;

fetch(url)
  .then( async function(res) {
    const data=await res.json()
      return data;
  })
  .then(function(data) {
    console.log(data,22)
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key of data) {

      dataArray.push(Object.values(key)[0]);
    }
    console.log(dataArray)
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}


function createUUID(){
   
  let dt = new Date().getTime()
  
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random()*16)%16 | 0
      dt = Math.floor(dt/16)
      return (c=='x' ? r :(r&0x3|0x8)).toString(16)
  })
  
  return uuid
}

var form=document.querySelector('form')
function sendData(){
  fetch('https://pwappsagargiri.herokuapp.com/posts',{
    method:"Post",
    headers:{
      'Content-Type':"application/json",
      'Accept':"application/json"
    },
    body:JSON.stringify({
      [createUUID()]:{
      id:new Date().toString(),
      title:titleInput.value,
      location:locationInput.value,
      image:"https://firebasestorage.googleapis.com/v0/b/pwagram-eb839.appspot.com/o/sf-boat.jpg?alt=media&token=e095d62f-79d6-47a3-b9ba-07863c7b4790"
      }
    })
  })
  .then(function(res){
    console.log('sent data',res)
    updateUI(res);

  }).catch(function(err){
    console.log(err)
  })
}

form.addEventListener('submit',function(e){
  e.preventDefault()

  if(titleInput.value.trim()===''||locationInput.value.trim()==='')
  return

  closeCreatePostModal()

  if('serviceWorker' in navigator && 'SyncManager' in window){
      navigator
      .serviceWorker
      .ready
      .then(function(sw){
        var post={
          title:titleInput.value,
          location:locationInput.value,
          id:new Date().toISOString()
        }
         writeData('sync-posts',post).then(function(){

          sw.sync.register('sync-new-posts')
      
         }).then( function(){
           var snackBarContainer=document.querySelector('#confirmation-toast')
           var data={
             message:"Your post is saved from later"
           }
           snackBarContainer.MaterialSnackbar.showSnackbar(data)
         } )
         .catch(function(Err){
           console.log(Err);
         })
        })
  }else{
    sendData()
  }
})