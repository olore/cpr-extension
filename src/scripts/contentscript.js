import ext from "./utils/ext";

// content script - can interact with page

console.log('content script', 'setting up listener');

// wait for document loaded (and other github loads... see refined-github)
addButton();

function addButton() {
  // get the last primary button (can we just get the one that says "Comment"?)
  let primaryButtons = Array.from(document.querySelectorAll('button.btn-primary'));
  let commentButton = primaryButtons[primaryButtons.length - 1]; // the last primary button is Comment

  let cprButton = createCprButton();
  cprButton.addEventListener('click', onCprButtonClick); //TODO: debounce
  commentButton.parentNode.append(cprButton);
}

function createCprButton() {
  let cprButton = document.createElement('button');
  cprButton.className = 'btn btn-primary form-actions'; // match github styles
  cprButton.innerText = 'Perform CPR';
  cprButton.style = 'float: right; padding-right: 10px';
  return cprButton;
}

function onCprButtonClick(evt) {
  evt.preventDefault(); // otherwise textarea clears <-- verify this
  let commentBox = document.querySelector('textarea#new_comment_field');
  console.log(commentBox.value);

  let div = document.createElement('div');
  div.class = 'cpr-status';
  div.innerHTML = '<h2>Loading....</h2>';
  commentBox.parentNode.appendChild(div);

  doPost(commentBox.value)
    .then((resp) => {
      updateCprStatus(resp.score);
    })
    .catch((err) => {
      updateCprStatusWithError(err);
    });
}

function doPost(commentText) {
  return Promise.resolve({score: 0.98765});
  // let url = `http://localhost/cpr/score`;
  // return fetch(url, {
  //   method: "POST",
  //   body: JSON.stringify({ 
  //     text: commentText,
  //     user: 'foo' // get github user id for tracking.. maybe allow "5 req per user per day" before message about $$
  //  }),
  //   headers: {
  //     "Content-Type": "application/json",
  //   }
  // })
  // .then((foo) => {
  //   return foo.json();
  // })
  // .catch((err) => {
  //   console.log(`error calling ${url}`, err );
  //   return Promise.reject(err);
  // })
}

function updateCprStatus(score) {
  let div = getCprStatusDiv();
  div.innerHTML = '<h2>Got: ' + score + '</h2>';
}

function updateCprStatusWithError(err) {
  let div = getCprStatusDiv();
  div.innerHTML = '<h2>Got an error</h2>';
}

function getCprStatusDiv() {
  return document.querySelector('.cpr-status');
}