# MiniMap for CodeMirror

[![N|Solid](https://badrams.ru/minimap/sreenshot.png)](https://nodesource.com/products/nsolid)

**MiniMap** for CodeMirror is a addon for CodeMirror's based editors.

-   Change map width
-   Can be used as alternative for standard CodeMirror add-on simplescroll.js

#### New Features!

-   Added scrollbar functionality
-   Fixed some bugs

#### How to install:

To use MiniMap is to simply load the script after all CodeMirror .js files:

```html
    <script src="./dist/helpers.js" type="text/javascript"></script>
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
git remote set-url [--push] minimap https://github.com/alterfan/MiniMap-CodeMirror.git [https://github.com/alterfan/cm-minimap-addon.git]