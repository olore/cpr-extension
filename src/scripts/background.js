import ext from "./utils/ext";

// background script - CANNOT interact with page
console.log('bg page', 'initializing');

chrome.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    this.log('plugin constructor');
  }

  log() {
    // TODO check log level or something
    console.log('bg page', arguments);
  }

  handleButtonClick() {
    this.sendMessageToCurrentTab({ start: 1 })
      .then((resp) => {
        this.log("has comments", resp.response);
        var documents = resp.response.map((comment, idx) => {
          return {
            "language": "en",
            "id": idx,
            "text": comment
          };
        });
        return documents;
      })
      .then((documents) => {
        if (documents.length > 0) {
          this.doPost(documents)
            .then((data) => {
              this.log('data from POST', data);
              this.sendMessageToCurrentTab({ done: data.documents });
            });
        }
      })
      .catch((resp) => {
        this.log("UH OH", resp);
      });
  }

  doPost(host, key, documents) {
    this.log('doPost!');
    let ret = {
      documents: [{
        score: .5,
      },
      {
        score: .9
      }]
    };
    return Promise.resolve(ret);
  }

  sendMessageToCurrentTab(msg) {
    return new Promise((resolve) => {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          msg,
          (response) => {
            this.log('tab sendMessage response', response);
            if (!response) {
              this.log('tab sendMessage error', chrome.runtime.lastError);
            }
            resolve(response);
          });
      });
    });
  } 

};


// In Chrome, the page action button display logic happens here instead of manifest.json
var matchingRule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { 
        urlMatches: '.*\/pull\/.*'
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { 
        urlMatches: '.*\/pull-requests\/.*'
      },
    })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
  });
});