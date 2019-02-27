import ext from "./utils/ext";

// content script - can interact with page

console.log('content script', 'setting up listener');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let csh = new ContentScriptHandler();
  csh.handleIncomingMessage(request)
    .then((resp) => {
      console.log('content script', 'sending response', resp);
      sendResponse(resp);
    });
  return true;
});

class ContentScriptHandler {

  constructor() {
    this.MESSAGE_CLASS = 'prs-a-message';
  }

  log() {
    console.log('content script', arguments)
  }

  handleIncomingMessage(request) {
    this.log('handleIncomingMessage');
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
      // Step 1: send array of comments to background script
      this.log('request.start is 1', commentTexts);
      return Promise.resolve({response: commentTexts});
    } else {
      // Step 2: receive array of comments & scores from background script
      //         and update the DOM using contentNode (since returned array only has text)
      this.log('Received message from the background script', request.done);
      commentTexts.forEach((c, i) => {
        const score = request.done[i].score,
          commentNode = commentNodes[i],
          html = this.generateHtmlNode(score);

        commentNode.appendChild(html);
      });
      // Step 2.5: tell the background script we're all done
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
