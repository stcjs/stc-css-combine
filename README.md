# stc-css-combin

A module for STC that combines CSS files by resolving import directives.

## Install

```sh
npm install stc-css-combine
```

## How to use

```css
@import url("a.css");
@import url("b.css");
@import url("c.css");
```

```js
var cssCombine = require('stc-css-combine');

stc.workflow({
  CSSCombine: {plugin: cssCombine, include: /\.css$/},
});
```
