class MiniMap {
    constructor(cm) {
        this.isAttached = false;
        this.cm = cm; //The width of the current Minimap.
        this.width = undefined; //The height of the current Minimap.
        this.height = undefined; //The Minimap float Side.
        this.doc = cm.getDoc(); //The Minimap's text editor.
        this.wrap = undefined;
        this.minimap = undefined;
        this.lineTokens = {};
    }
    get node() {
        return this.cm.getWrapperElement();
    }
    get lineCount() {
        return this.cm.lineCount();
    }
    get lineHeight() {
        return cache.set("lineHeight", this.cm.display.maxLine.height);
    }
    get firstVisibleLine() {
        return Math.floor(this.scrollbar.top / this.lineHeight);
    }
    get scrollbar() {
        return this.cm.getScrollInfo()
    }
    get maxVisibleLineRange() {
        this.offsetHeight = this.node.offsetHeight
        return Math.ceil(this.node.offsetHeight / this.lineHeight);
    }
    get maxVisibleRows() {
        return Math.round(this.node.offsetHeight / 3);
    }
    get viewboxScrollRatio() {
        const viewScrollHeight = (this.lineCount - this.maxVisibleRows + 1);
        const editorScrollHeight = (this.lineCount - this.maxVisibleLineRange + 1);
        return viewScrollHeight / editorScrollHeight
    }
    get minimapScrollRatio() {
        const mapScrollHeight = (this.lineCount - this.maxVisibleRows + 1);
        const editorScrollHeight = (this.lineCount - this.maxVisibleLineRange + 1);
        return mapScrollHeight / editorScrollHeight
    }
    get scrollRatio() {
        return this.cm.getScrollInfo().clientHeight / this.cm.getScrollInfo().height
    }
    updateLines() {
        let number,
            lines = this.cm.getValue().split("\n"),
            lineCount = cache.set("lineCount", this.cm.lineCount());
        for (number = 0; number < lineCount; number++) {
            this.lineTokens[number] = this.cm.getLineTokens(number);
        }
        cache.set("lineTokens", this.lineTokens);
        cache.set("lineCount", this.lineCount)
    }
    updateBg() {
        this.minimap.setBackground(getComputedStyle(this.cm.getWrapperElement())["background-color"]);
    }
    updateSyntaxColors() {
        this.syntaxColorsTokens = {};
        for (var i = 0, len = tokenlist.length; i < len; i++) {
            var key = tokenlist[i];
            if (key == "#text") {
                this.syntaxColorsTokens[key] = colorize("rgba(255,255,255)");
            } else if (key == "#space") {
                this.syntaxColorsTokens[key] = "rgba(0,0,0,0)";
            } else {
                const span = document.createElement("span");
                span.className = "cm-" + key.replace(" ", " cm-");
                span.innerText = span;
                this.node.appendChild(span);
                this.syntaxColorsTokens[key] = colorize(getComputedStyle(span)["color"]);
                span.remove();
            }
        }
        cache.set("syntaxColorsTokens", this.syntaxColorsTokens);
    }
    updateSize() {
        const firstLine = this.firstVisibleLine;
        const lastLine = firstLine + this.maxVisibleLineRange;
        this.offsetHeight = cache.set("editorHeight", this.node.offsetHeight);
        this.offsetWidth = cache.set("editorWidth", this.node.offsetWidth);
        this.miniMapHeight = cache.set("miniMapHeight", this.offsetHeight);
        this.miniMapWidth = cache.set("miniMapWidth", this.cm.getOption("miniMapWidth"));
        this.minimap.resize(this.miniMapHeight, this.miniMapWidth);
        this.viewbox.resize(this.maxVisibleLineRange);
        this.canvas.resize(this.miniMapHeight, this.miniMapWidth);
    }
    onScroll() {
        const topRow = Math.ceil(this.firstVisibleLine * this.minimapScrollRatio);
        this.front.draw(topRow, this.lineCount);
        const factor = (this.offsetHeight - this.viewbox.height) / (this.scrollbar.height - this.offsetHeight)
        let pos = this.scrollbar.top * factor;
        this.viewbox.move(pos);
    }
    onDrag(event) {
        const offsetTop = this.minimap.node.getBoundingClientRect().top;
        if (event.which !== 1 && event.which !== 2 && !(event.touches != null)) return;
        var move = (event) => {
            var y = (event.clientY - offsetTop) / this.scrollRatio;
            this.cm.scrollTo(null, y)
        };
        var done = (event) => {
            dragSubscription();
        };
        addListener(move, done);
        var dragSubscription = () => removeListener(move, done);
    }
    refresh() {
        this.updateLines();
        this.updateSize();
        this.updateSyntaxColors();
        this.front.draw(this.firstVisibleLine, this.lineCount);
    }
    init() {
        this.minimap = new MiniMapElement(this.cm);
        this.viewbox = new ViewBoxElement(this.minimap.node);
        this.canvas = new CanvasElement(this.minimap.node);
        this.front = new Drawer(this.canvas.frontCTX);
        this.updateBg();
        this.updateSyntaxColors();
        this.refresh();
    }
}
function colorize(color) {
    color = color.replace('rgb(', 'rgba(').replace(')', `, .55)`)
    return color
}
function removeListener(mousemoveHandler, mouseupHandler) {
    document.body.removeEventListener('mousemove', mousemoveHandler);
    document.body.removeEventListener('mouseup', mouseupHandler);
    document.body.removeEventListener('touchmove', mousemoveHandler);
    document.body.removeEventListener('touchend', mouseupHandler);
}
function addListener(mousemoveHandler, mouseupHandler) {
    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
    document.body.addEventListener('touchmove', mousemoveHandler);
    document.body.addEventListener('touchend', mouseupHandler);
}