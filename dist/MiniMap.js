class MiniMap {
    constructor(editor) {
        this.isAttached = false;
        if (!editor) {
            throw new Error('Cannot create a minimap without an editor');
        } //The Minimap's text editor.
        this.editor = editor; //The width of the current Minimap.
        this.width = undefined; //The height of the current Minimap.
        this.height = undefined; //The Minimap float Side.
        this.floatSide = undefined; //The Minimap's text editor.
        this.wrap = undefined;
        this.minimap = undefined;
        this.linesText = {};
        this.linesTokens = {};
    }
    get editorElement() {
        return this.editor.getWrapperElement();
    }
    get linesCount() {
        return this.editor.lineCount();
    }
    get lineHeight() {
        return Buffer.set("lineHeight", this.editor.display.cachedTextHeight);
    }
    get firstVisibleLine() {
        return Math.floor(this.scrollbar.pos / this.lineHeight);
    }
    get scrollbar() {
        return this.editor.display.scrollbars.vert
    }
    get maxVisibleLineRange() {
        this.offsetHeight = this.editorElement.offsetHeight
        const range = Math.ceil(this.editorElement.offsetHeight / this.lineHeight);
        return range;
    }
    get maxVisibleRows() {
        return Math.round(this.editorElement.offsetHeight / 3);
    }
    updateLines() {
        let number,
            lines = this.editor.getValue().split("\n"),
            lineCount = Buffer.set("lineCount", this.editor.lineCount());
        for (number = 0; number < lineCount; number++) {
            this.linesTokens[number] = this.editor.getLineTokens(number);
            this.linesText[number] = lines[number];
        }
        Buffer.set("linesTokens", this.linesTokens);
        Buffer.set("linesText", this.linesText);
        Buffer.set("linesCount", this.linesCount)
    }
    updateBg() {
        this.background = getComputedStyle(this.editor.getWrapperElement())["background-color"];
        this.minimap.Background = this.background;
    }
    updateSyntaxColors() {
        let tokens = ["#text", "#space", "comment", "string", "string-2", "number", "variable", "variable-2", "def", "operator", "keyword", "atom", "meta", "tag", "tag bracket", "attribute", "qualifier", "property", "builtin", "variable-3", "type", "string property", "tab"];
        this.syntaxColorsTokens = {};
        for (var i = 0, len = tokens.length; i < len; i++) {
            var key = tokens[i];
            if (key == "#text") {
                this.syntaxColorsTokens[key] = colorize("rgba(255,255,255)");
            } else if (key == "#space") {
                this.syntaxColorsTokens[key] = "rgba(0,0,0,0)";
            } else {
                const span = document.createElement("span");
                span.className = "cm-" + key.replace(" ", " cm-");
                span.innerText = span;
                this.editorElement.appendChild(span);
                this.syntaxColorsTokens[key] = colorize(getComputedStyle(span)["color"]);
                span.remove();
            }
        }
        Buffer.set("syntaxColorsTokens", this.syntaxColorsTokens);
    }
    updateSize() {
        const height = this.editorElement.offsetHeight;
        const width = this.editorElement.offsetWidth;
        Buffer.set("editorHeight", this.offsetHeight = height);
        Buffer.set("editorWidth", this.offsetWidth = width);
        Buffer.set("miniMapHeight", height);
        this.miniMapWidth = Buffer.set("miniMapWidth", this.editor.getOption("miniMapWidth"));
        const firstLine = this.firstVisibleLine;
        const lastLine = firstLine + this.maxVisibleLineRange;
        this.minimap.resize(height, this.miniMapWidth);
        this.minimap.resizeViewBox(this.maxVisibleLineRange);
        this.canvas.resize(height, this.miniMapWidth);
    }
    updateFloatSide(side) {
        if (side == undefined) side = this.floatSide == "left" ? "right" : "left";
        if (side == "left") this.minimap.floatLeft();
        if (side == "right") this.minimap.floatRight();
        this.floatSide = side;
        localStorage.setItem("floatSide", this.floatSide);
    }
    refresh() {
        this.updateLines();
        this.updateSize();
        this.updateFloatSide(localStorage.getItem("floatSide"));
        this.front.draw(this.firstVisibleLine, this.firstVisibleLine + this.maxVisibleRows);
    }
    scrollTop() {
        const topRow = Math.ceil(this.firstVisibleLine * this.scrollScaleRatio);
        this.front.draw(topRow, this.linesCount);
        const factor = (this.offsetHeight - this.minimap.viewBoxHeight) / (this.scrollbar.total - this.offsetHeight)
        let pos = this.scrollbar.pos * factor;
        this.minimap.moveViewBox(pos);
    }
    get viewScaleRatio() {
        const viewScrollHeight = (this.linesCount - this.maxVisibleRows + 1);
        const editorScrollHeight = (this.linesCount - this.maxVisibleLineRange + 1);
        return viewScrollHeight / editorScrollHeight
    }
    get scrollScaleRatio() {
        const mapScrollHeight = (this.linesCount - this.maxVisibleRows + 1);
        const editorScrollHeight = (this.linesCount - this.maxVisibleLineRange + 1);
        return mapScrollHeight / editorScrollHeight
    }
    init() {
        this.minimap = new MiniMapElement(this.editor);
        this.canvas = new CanvasElement(this.minimap.node);
        this.front = new Drawer(this.canvas.frontCTX);
        this.back = new Drawer(this.canvas.backCTX);
        this.updateBg();
        this.updateSyntaxColors();
        this.refresh();
    }
}
