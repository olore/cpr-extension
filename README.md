<div align="center">
  <h1>
    Compassionate Pull Requests
  </h1>

  <p>
    <strong>An browser extension to analyze your comments on Pull Requests and Issues on github.com.
    </strong>
  </p>
</div>

## Installation
1. Clone the repository `git clone https://github.com/olore/cpr-extension`
2. Run `npm install`
3. Run `npm run build`


##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `cpr-extension/build/chrome` or (`cpr-extension/build/opera`)


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `cpr-extension/build/firefox`


## Developing
The following tasks can be used when you want to start developing the extension and want to enable live reload - 

- `npm run chrome-watch`
- `npm run opera-watch`
- `npm run firefox-watch`


## Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.

## Inspiration
https://github.com/olore/prs-a


## Thanks
* https://github.com/EmailThis/extension-boilerplate/
* Icon from http://www.iconarchive.com/show/noto-emoji-people-family-love-icons-by-google/12144-blue-heart-icon.html