1. Clean up console logs
2. Firefox bg page is getting called 3 times
```
  bg page plugin constructor background.js:37:8
  bg page incoming text Test123 background.js:37:8
  bg page plugin constructor background.js:37:8
  bg page incoming text Test123 background.js:37:8
  bg page plugin constructor background.js:37:8
  bg page incoming text Test123 background.js:37:8
  bg page data from POST Object { score: 0.878787 } background.js:37:8
  bg page data from POST Object { score: 0.878787 } background.js:37:8
  bg page data from POST Object { score: 0.878787 } background.js:37:8
```

​
RELATED IDEA:
-------------
A script that, given a repo, will go calculate positivity scores per person that commented on last X PRs

```
Last 100 PRs
============

username   comments  positivity score
-------------------------------------
qfewef       10          74.67%
webwebwee    66          85.21%
```