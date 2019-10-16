# MiniMap for CodeMirror

**MiniMap** for CodeMirror is a addon for CodeMirror's based editors.
##### Demo: http://badrams.ru/cm-minimap/
#####       https://alterfan.github.io/minimap/


#### New Features!
-   Mouse Double-click change MiniMap side attach.
-   Work with touch devices side attach.
#### How to install:

To use MiniMap is to simply load the script after all CodeMirror .js files:

```html
    <script src="./dist/cache.js" type="text/javascript"></script>
    <script src="./dist/drawer.js" type="text/javascript"></script>
    <script src="./dist/elements.js" type="text/javascript"></script>
    <script src="./dist/minimap.js" type="text/javascript"></script>
    <script src="./dist/extension.js" type="text/javascript"></script>
```

#### How to use:

Defines an `miniMap` option in CodeMirror configuration to show MiniMap:

```javascript
var editor = CodeMirror("#editor", {
	miniMap: true
});
```

Defines an `miniMapWidth` option in CodeMirror configuration to set MiniMap width. This option use `px` as measure unit:

```javascript
var editor = CodeMirror("#editor", {
	miniMapWidth: 64
});
`
Defines an `miniMapSide` option in CodeMirror configuration to set MiniMap side. This option use `left/right` :

```javascript
var editor = CodeMirror("#editor", {
	miniMapSide: "left"
});
```

## License

MIT
git remote set-url [--push] minimap https://github.com/alterfan/minimap.git [https://github.com/alterfan/minimap.git]