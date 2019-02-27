import ext from "./utils/ext";

// ext.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if(request.action === "perform-save") {
//       console.log("Extension Type: ", "/* @echo extension */");
//       console.log("PERFORM AJAX", request.data);

//       sendResponse({ action: "saved" });
//     }
//   }
// );

// background script - CANNOT interact with page

console.log('hello from bg');

chrome.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    console.log('plugin constructor');
  }

  handleButtonClick() {
    let API_HOST = 'foobar.com',
      API_KEY = '123abc';

    console.log('going off to do work...');
    console.log(1, API_HOST, API_KEY);

    this.sendMessageToCurrentTab({ start: 1 })
      .then((resp) => {
        console.log("bg page has comments", resp.response);
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
          this.doPost(API_HOST, API_KEY, documents)
            .then((data) => {
              console.log('wheeeee', data);
              console.log('whooo', data.documents);
              this.sendMessageToCurrentTab({ done: data.documents });
            });
        }
      })
      .catch((resp) => {
        console.log("UH OH", resp);
      });
  }

  doPost(host, key, documents) {
    console.log('doPost!');
    let ret = {
      documents: [{
        score: .5,
        foo: 123
      },
      {
        score: .9
      }]
    };
    return Promise.resolve(ret);
    // let url = `https://${host}/text/analytics/v2.0/sentiment`;
    // return fetch(url, {
    //   method: "POST",
    //   body: JSON.stringify({ documents: documents }),
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Ocp-Apim-Subscription-Key": key
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

  sendMessageToCurrentTab(msg) {
    return new Promise((resolve) => {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, (tabs) => {
        console.log('tabsid', tabs[0].id, msg);
        chrome.tabs.sendMessage(
          tabs[0].id,
          msg,
          (response) => {
            console.log('YAY:', response);
            if (!response) {
              console.log('ERR:', chrome.runtime.lastError);
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