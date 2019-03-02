// import ext from "./utils/ext";
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

// content script - can interact with page

console.log('content script', 'setting up listener');

// Uncaught DOMException: Failed to execute 'registerElement' on 'Document': Registration failed for type 'cpr-button'. Elements cannot be registered from extensions.
class CPRButton { 
  // can't use `extends HTMLButton` like descibed here https://gist.github.com/hemanth/e6bb66141101b52a76fe
  // so we just wrap it :(
  constructor() {
    this.element = document.createElement('button');
    this.element.className = 'btn btn-primary'; // match github styles
    this.element.innerText = 'Perform CPR';
    this.element.style = 'background-color: #59f3e6; background-image: linear-gradient(-180deg,#59f3e6,#28a7a1 90%);';
    this.element.addEventListener('click', this.onCprButtonClick); //TODO: debounce
  }

  onCprButtonClick(evt) {
    evt.preventDefault(); // otherwise textarea clears <-- verify this
    let commentBox = document.querySelector('textarea#new_comment_field');
    console.log(commentBox.value);

    let div = getCprStatusDiv() || document.createElement('div');
    div.className = 'cpr-status';
    div.innerHTML = '<h2>Loading....</h2>';
    commentBox.parentNode.appendChild(div);
    console.log('appended div');
    sendToBackgroundPage(commentBox.value)
      .then((resp) => {
        updateCprStatus(resp.score);
      })
      .catch((err) => {
        updateCprStatusWithError(err);
      });
  }
}

function addButton() {
  // get the last primary button 
  // TODO: can we just get the one that says "Comment"?
  let primaryButtons = Array.from(document.querySelectorAll('button.btn-primary'));
  let commentButton = primaryButtons[primaryButtons.length - 1]; // the last primary button is Comment

  let cprButton = new CPRButton();
  commentButton.parentNode.append(cprButton.element);
}


function sendToBackgroundPage(commentText) {
  console.log('sendToBackgroundPage');

  return new Promise((resolve) => {
    console.log('sending to bg page', commentText);
    chrome.runtime.sendMessage({ commentText: commentText }, (resp) => {
      console.log('got a response!', resp)
      resolve(resp);
    });
  });
}

function updateCprStatus(score) {
  let div = getCprStatusDiv();
  let pct = (score * 100).toFixed(2);
  div.innerHTML = `<h2>Your comment is ${pct}% positive</h2>`;
}

function updateCprStatusWithError(err) {
  let div = getCprStatusDiv();
  div.innerHTML = '<h2>Got an error</h2>';
}

function getCprStatusDiv() {
  return document.querySelector('.cpr-status');
}

// via https://github.com/sindresorhus/refined-github/blob/9f9d178aceae3d8771685f5a043f8dff10033453/source/libs/dom-utils.ts
function safeElementReady(selector) {
	const waiting = elementReady(selector);

	// Don't check ad-infinitum
	// eslint-disable-next-line promise/prefer-await-to-then
	domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

	// If cancelled, return null like a regular select() would
	return waiting.catch(() => null);
};

// wait for document loaded (and other github loads... see refined-github)
safeElementReady('textarea#new_comment_field').then(addButton);