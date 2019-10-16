class MiniMap {
    constructor(cm) {
        this.cm = cm; //The width of the current Minimap.
        this.changed = false;
        this.lineTokens = {};
        this.minimap = new MiniMapElement(this.cm);
        this.viewbox = new ViewBoxElement(this.minimap.node);
        this.canvas = new CanvasElement(this.minimap.node);
        this.drawer = new Drawer(this.canvas.frontCTX);
        this.Binding();
        this.refresh();
    }
    get node() {
        return this.cm.getWrapperElement();
    }
    get lineCount() {
        return cache.set("lineCount", this.cm.lineCount());
    }
    get lineHeight() {
        return cache.set("lineHeight", this.cm.display.maxLine.height);
    }
    get firstVisibleLine() {
        return Math.floor(this.scrollbar.top / this.lineHeight);
    }
    get scrollbar() {
        return this.cm.getScrollInfo();
    }
    get maxVisibleLineRange() {
        return Math.ceil(this.node.offsetHeight / this.lineHeight);
    }
    get maxVisibleRows() {
        return Math.round(this.node.offsetHeight / 3);
    }
    get viewboxScrollRatio() {
        const viewScrollHeight = cache.lineCount - this.maxVisibleRows + 1;
        const editorScrollHeight = cache.lineCount - this.maxVisibleLineRange + 1;
        return viewScrollHeight / editorScrollHeight;
    }
    get minimapScrollRatio() {
        const mapScrollHeight = cache.lineCount - this.maxVisibleRows + 1;
        const editorScrollHeight = cache.lineCount - this.maxVisibleLineRange + 1;
        return mapScrollHeight / editorScrollHeight;
    }
    get scrollRatio() {
        return this.cm.getScrollInfo().clientHeight / this.cm.getScrollInfo().height;
    }
    get getInfo() {
        return {
            top: Math.ceil(this.firstVisibleLine * this.minimapScrollRatio),
            total: Math.ceil(cache.miniMapHeight / 3),
            pos: this.scrollbar.top * (this.getVieboxScrollHeight - this.viewbox.height) / (this.scrollbar.height - cache.miniMapHeight),
        };
    }
    get getVieboxPos() {
        return cache.VieboxPos = this.viewbox.node.getBoundingClientRect();
    }

    get getMinimapPos() {
        return cache.MinimapPos = this.minimap.node.getBoundingClientRect();
    }
    get getVieboxScrollHeight() {
        const totalHeight = (this.lineCount * 3);
        return totalHeight < cache.miniMapHeight ? totalHeight : cache.miniMapHeight
    }
    updateSyntaxColors() {
        syntax(this);
    }
    updateSize() {
        cache.editorOffsetWidth = cache.editorOffsetWidth = this.node.offsetWidth;
        cache.miniMapHeight = this.miniMapHeight = this.node.offsetHeight;
        cache.miniMapWidth = this.cm.getOption("miniMapWidth");
        this.minimap.resize(cache.miniMapHeight, cache.miniMapWidth);
        this.viewbox.resize(this.maxVisibleLineRange, cache.miniMapWidth);
        this.canvas.resize(cache.miniMapHeight, cache.miniMapWidth);
    }
    Resize() {
        const n = this.node;
        n.style.maxWidth = n.offsetParent.offsetWidth + "px";
        n.parentNode.style.width = n.offsetParent.offsetWidth + "px";
        n.style.width = (n.parentNode.offsetWidth - cache.miniMapWidth) + "px";
    }
    Binding() {
        if (this.side) this.side = this.cm.getOption("miniMapSide") === "left" ? "right" : "left";
        else this.side = this.cm.getOption("miniMapSide");
        this.cm.setOption("miniMapSide", this.side);
        this.minimap.setSide(this.side);
    }
    Scroll(e) {
        this.viewbox.move(this.getInfo.pos);
        if (this.lineCount * 3 < cache.miniMapHeight) return
        this.drawer.draw(this.getInfo.top, this.getInfo.top + this.getInfo.total, e);
    }
    Drag(e) {
        if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) return;
        if (e.touches) {
            e = eTouch(e);
        }
        const mapOffset = this.getMinimapPos.top;
        const vieboxOffset = e.clientY - this.getVieboxPos.top;
        var dragging = e => {
            if (e.touches) {
                e.preventDefault();
                e = e.touches[0];
            }
            var y = (e.clientY - mapOffset - vieboxOffset) / this.scrollRatio;
            this.cm.scrollTo(null, y);
        };
        var done = () => offDrag();
        var offDrag = () => removeListener(dragging, done);
        addListener(dragging, done);
    }


    ScrollTo(e) {
        const mapOffset = this.getMinimapPos.top;
        const vieboxOffset = this.getVieboxPos.top;
        if (e.touches) {
            e = eTouch(e);
        }
        var y = (e.clientY - mapOffset - this.viewbox.height / 2) / this.scrollRatio;
        this.cm.scrollTo(null, y);
    }
    updateTextLines(from, to) {
        let lineTokens = {},
            number = from || 0,
            lineCount = to || cache.set("lineCount", this.cm.lineCount());
        this.textLines = this.cm.getValue().split("\n");
        for (number; number < lineCount; number++) {
            lineTokens[number] = this.cm.getLineTokens(number);
        }
        cache.lineTokens = lineTokens;
        cache.lineCount = lineCount;
    }
    updateBg() {
        this.minimap.setBackground(getComputedStyle(this.cm.getWrapperElement())["background-color"]);
    }
    BeforeChange(change) {
        var from = this.cm.getRange({
            line: 0,
            ch: 0
        }, change.from).split("\n");
        var text = this.cm.getRange(change.from, change.to);
        var after = this.cm.getRange(change.to, {
            line: this.cm.lineCount() + 1,
            ch: 0
        }).split("\n");
        this.from = change.from.line;
        this.to = after.length;
    }
    Change() {
        this.updateTextLines();
        this.updateSize();
        cache.textLines = this.textLines;
        const total = Math.ceil(cache.miniMapHeight / 3);
        this.top = Math.ceil(this.firstVisibleLine * this.minimapScrollRatio);
        this.drawer.draw(this.top, this.from + total);
    }
    refresh() {
        this.updateBg();
        this.updateTextLines();
        this.updateSize();
        this.Resize();
        this.updateSyntaxColors();
        this.drawer.draw(0, this.lineCount);
    }
}

function eTouch(e) {
    e.preventDefault();
    e = e.touches[0];
    return e;
}

function colorize(color) {
    color = color.replace('rgb(', 'rgba(').replace(')', `, .55)`);
    return color;
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

function syntax(context) {
    context.syntaxColorsTokens = {};
    for (var i = 0, len = tokenlist.length; i < len; i++) {
        var key = tokenlist[i];
        if (key == "#text") {
            context.syntaxColorsTokens[key] = colorize("rgba(255,255,255)");
        } else if (key == "#space") {
            context.syntaxColorsTokens[key] = "rgba(0,0,0,0)";
        } else {
            const span = document.createElement("span");
            span.className = "cm-" + key.replace(" ", " cm-");
            span.innerText = span;
            context.node.appendChild(span);
            context.syntaxColorsTokens[key] = colorize(getComputedStyle(span)["color"]);
            span.remove();
        }
    }
    cache.set("syntaxColorsTokens", context.syntaxColorsTokens);
}