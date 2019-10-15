class MiniMap {
    constructor(cm) {
        this.cm = cm; //The width of the current Minimap.
        this.changed = false;
        this.lineTokens = {};

        this.minimap = new MiniMapElement(this.cm);
        this.viewbox = new ViewBoxElement(this.minimap.node);
        this.canvas = new CanvasElement(this.minimap.node);
        this.drawer = new Drawer(this.canvas.frontCTX);
        this.updateDirection();
        this.refresh()
    }
    get node() {
        return this.cm.getWrapperElement();
    }
    get lineCount() {
        return cache.set("lineCount", this.cm.lineCount())
    }
    get lineHeight() {
        return cache.set("lineHeight", this.cm.display.maxLine.height);
    }
    get firstVisibleLine() {
        console.log('this.scrollbar.top: ', this.scrollbar.top,this.lineHeight);
        return Math.floor(this.scrollbar.top / this.lineHeight);
        
    }
    get scrollbar() {
        return this.cm.getScrollInfo()
    }
    get maxVisibleLineRange() {
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
        this.offsetHeight = cache.set("editorHeight", this.node.offsetHeight);
        this.offsetWidth = cache.set("editorWidth", this.node.offsetWidth);
        this.miniMapHeight = cache.set("miniMapHeight", this.offsetHeight);
        this.miniMapWidth = cache.set("miniMapWidth", this.cm.getOption("miniMapWidth"));
        this.minimap.resize(this.miniMapHeight, this.miniMapWidth);
        this.viewbox.resize(this.maxVisibleLineRange, this.miniMapWidth);
        this.canvas.resize(this.miniMapHeight, this.miniMapWidth);
        this.baseWidth = this.changed ? this.baseWidth : this.node.offsetWidth;
        this.node.parentNode.style.width = this.baseWidth + "px"
        this.newWidth = this.node.parentNode.offsetWidth - this.cm.getOption("miniMapWidth");
        this.node.parentNode.style.width = "";
        this.cm.setSize(this.newWidth, null);
        this.node.style.maxWidth = this.node.offsetParent.offsetWidth - this.cm.getOption("miniMapWidth") + "px";
        this.baseWidth = this.newWidth + this.cm.getOption("miniMapWidth");
        this.changed = true;
    }
    updateDirection() {
        if (this.side)
            this.side = this.cm.getOption("miniMapSide") === "left" ? "right" : "left";
        else
            this.side = this.cm.getOption("miniMapSide");
        this.cm.setOption("miniMapSide", this.side);
        this.minimap.setSide(this.side);
    }
    onScroll() {
        const top = Math.ceil(this.firstVisibleLine * this.minimapScrollRatio);
        const factor = (this.offsetHeight - this.viewbox.height) / (this.scrollbar.height - this.offsetHeight)
        const pos = this.scrollbar.top * factor;
        this.viewbox.move(pos);
        this.drawer.draw(top, this.lineCount);
    }
    onDrag(e) {
        if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) return;
        if (e.touches) {
            e.preventDefault()
            e = e.touches[0]
        }
        const mapOffset = this.minimap.node.getBoundingClientRect().top;
        const vieboxOffset = e.clientY - this.viewbox.node.getBoundingClientRect().top;
        var dragging = (e) => {
            if (e.touches) {
                e.preventDefault()
                e.clientY = e.touches[0].clientY
            }
            var y = (e.clientY - mapOffset - vieboxOffset) / this.scrollRatio;
            this.cm.scrollTo(null, y)
        };
        var done = () => offDrag()
        var offDrag = () => removeListener(dragging, done);
        addListener(dragging, done);
    }
    refresh() {
        const top = Math.ceil(this.firstVisibleLine * this.minimapScrollRatio);
        this.updateBg();
        this.updateLines();
        this.updateSize();
        this.updateSyntaxColors();
        this.drawer.draw(top, this.lineCount);
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