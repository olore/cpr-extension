import ext from "./utils/ext";

// var extractTags = () => {
//   var url = document.location.href;
//   if(!url || !url.match(/^http/)) return;

//   var data = {
//     title: "",
//     description: "",
//     url: document.location.href
//   }

//   var ogTitle = document.querySelector("meta[property='og:title']");
//   if(ogTitle) {
//     data.title = ogTitle.getAttribute("content")
//   } else {
//     data.title = document.title
//   }

//   var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
//   if(descriptionTag) {
//     data.description = descriptionTag.getAttribute("content")
//   }

//   return data;
// }

// function onRequest(request, sender, sendResponse) {
//   if (request.action === 'process-page') {
//     sendResponse(extractTags())
//   }
// }

// ext.runtime.onMessage.addListener(onRequest);

// content script - can interact with page

console.log('setting up listener');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let csh = new ContentScriptHandler();
  csh.handleIncomingMessage(request)
    .then((resp) => {
      console.log('sending response', resp);
      sendResponse(resp);
    });
  return true;
});

class ContentScriptHandler {

  constructor() {
    this.MESSAGE_CLASS = 'prs-a-message';
  }

  handleIncomingMessage(request) {
    console.log('contentscript:handleIncomingMessage');
    let commentNodes = Array.from(document.querySelectorAll('.comment-body:not(.p-0):not(.js-preview-body)')); // github
    let bitBucketCommentNodes = document.querySelectorAll('.comment-content'); // bitbucket.org
    let hostedBitBucketCommentNodes = document.querySelectorAll('.message.markup'); // hosted bitbucket

    if (bitBucketCommentNodes.length > 0) {
      commentNodes = Array.from(bitBucketCommentNodes);
    }
    if (hostedBitBucketCommentNodes.length > 0) {
      commentNodes = Array.from(hostedBitBucketCommentNodes);
    }
    let commentTexts = this.getCommentsFromPage(commentNodes);

    if (request.start === 1) {
      // return array of comment strings to background script
      console.log('request.start is 1', commentTexts);
      return Promise.resolve({response: commentTexts});
    } else {
      // receive array of comment strings & scores from background script
      console.log('Received message from the background script', request.done);
      commentTexts.forEach((c, i) => {
        console.log(i, request.done[i]);
        let score = request.done[i].score,
          commentNode = commentNodes[i],
          html = this.generateHtmlNode(score);

          commentNode.appendChild(html);
        });
        return Promise.resolve({response: 'Hi from content script - I\'m all done!'});
    }
  }

  getCommentsFromPage(commentNodes) {
    let unScoredComments = commentNodes.filter(comment => {
      return comment.querySelectorAll('div.' + this.MESSAGE_CLASS).length === 0;
    });
    
    let commentTexts = unScoredComments.map(comment => {
      return comment.innerText.trim();
    });

    return commentTexts;
  }

  generateHtmlNode(score) {
    let html = `
      <div class="${this.MESSAGE_CLASS}">
        <span style="transform: rotate(${180 * (1 - score)}deg); width: 25px; height: 25px; padding: 2px;">
          👍
        </span>
        ${(score * 100).toFixed(2)}% positive
      </div>
    `;

    let div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }
}
