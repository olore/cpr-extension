import ext from "./utils/ext";

// background script - CANNOT interact with page
console.log('bg page', 'initializing');


ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // TODO: try using sender.tab to send message instead of seearching for active
  let bw = new BackgroundWorker();
  bw.handleIncomingMessage(request)
    .then(sendResponse);
  return true; // Make it async so channel stays open for us to call sendResponse
});

class BackgroundWorker {

  constructor() {
    this.log('plugin constructor');
  }

  log() {
    // TODO check log level or something
    console.log('bg page', ...arguments);
  }

  handleIncomingMessage(request) {
    if (request.commentText.length > 0) {
      this.log('incoming text', request.commentText);
      return this.doPost(request.commentText)
        .then((data) => {
          this.log('data from POST', data);
          return data;
        })
        .catch((resp) => {
          this.log('doPost failed', resp);
          return { error: 123 };
        });
    } else {
      this.log('no commentText, sending back empty array');
      return Promise.resolve({ done: 123  });
    }
  }

  doPost(commentText) {
    return Promise.resolve({score: 0.878787});
    // let url = `http://localhost/cpr/score`;
    // return fetch(url, {
    //   method: "POST",
    //   body: JSON.stringify({ 
    //     text: commentText,
    //     user: 'foo' // get github user id for tracking.. maybe allow "5 req per user per day" before message about $$
    //   }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     }
    //   })
    //   .then((foo) => {
    //     return foo.json();
    //   })
    //   .catch((err) => {
    //     console.log(`error calling ${url}`, err );
    //     return Promise.reject(err);
    //   })
  }

};


// // In Chrome, the page action button display logic happens here instead of manifest.json
// var matchingRule = {
//   conditions: [
//     new chrome.declarativeContent.PageStateMatcher({
//       pageUrl: { 
//         urlMatches: '.*\/pull\/.*'
//       },
//     }),
//     new chrome.declarativeContent.PageStateMatcher({
//       pageUrl: { 
//         urlMatches: '.*\/pull-requests\/.*'
//       },
//     })
//   ],
//   actions: [ new chrome.declarativeContent.ShowPageAction() ]
// };

// chrome.runtime.onInstalled.addListener((details) => {
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//     chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
//   });
// });