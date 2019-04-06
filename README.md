# cm-addon-minimap

MiniMap is addon for CodeMirror.

# Usage

You will need include set of the stylesheet and script tags below in your document:

```html
<link rel="stylesheet" href="cm-addon-minimap.css" />
<script type="text/javascript" src="cm-addon-minimap.js"></script>
```

Then set CodeMirror option "miniMap" : `true/false`

```javascript
var editor = CodeMirror("#editor", {
	mode: html,
	miniMap: true
});
```

and "miniMapWidth" : `number>50` use "px"

```javascript
var editor = CodeMirror("#editor", {
	mode: html,
	miniMapWidth: 80
});
```

or

```javascript
var editor = CodeMirror("#editor");
editor.setOption("miniMap", true);
editor.setOption("miniMapWidth", 80);
```
