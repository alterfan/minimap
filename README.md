# cm-minimap-addon

# MiniMap

MiniMap is addon for CodeMirror.

# About


* `Variable width`.
* `Show MiniMAp on "focus"`.
* `Autoupdate size,content`.


# Usage

you will need to paste:
`<link rel="stylesheet" href="cm-addon-minimap.css">`
and
`<script type="text/javascript" src="cm-addon-minimap.js"></script>`
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
