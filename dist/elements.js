class ViewBoxElement {
    constructor(parent) {
        this.node = document.createElement('div');
        this.attach(parent);
        this.applyStyle(viewboxStyle);
    }
    move(scrollPos) {
        scrollPos = Math.round(scrollPos)
        this.node.style.transform = "translateY(" + (scrollPos) + "px)";

    }
    hide() {
        this.node.style.opacity = 0
    }
    show() {
        this.node.style.opacity = 1
    }
    applyStyle(cssObject) {
        for (var prop in cssObject) {
            this.node.style[prop] = cssObject[prop]
        }
    }
    resize(visibleLines) {
        this.height = visibleLines * 3;
        this.node.style.width = cache.get("miniMapWidth") + "px";
        this.node.style.height = this.height + "px";
    }
    attach(parent) {
        parent.appendChild(this.node);
    }
}
class CanvasElement {
    constructor(parent) {
        this.initCanvasLayer();
        this.attachCanvasLayers(parent);
    }
    initCanvasLayer() {
        this.frontCanvasLayer = document.createElement('canvas');
        this.frontCanvasLayer.className = "front-layer";
        this.frontCanvasLayer.style.zIndex = "0";
        this.frontCTX = this.frontCanvasLayer.getContext('2d');
    }
    attachCanvasLayers(parent) {
        parent.appendChild(this.frontCanvasLayer)
    }
    resize(height, width) {
        if (width != this.frontCanvasLayer.width) this.frontCanvasLayer.width = width;
        if (height != this.frontCanvasLayer.height) this.frontCanvasLayer.height = height;
    }
};
class MiniMapElement {
    constructor(cm) {
        this.cm = undefined;
        this.width = undefined;
        this.height = undefined;
        this.attached = false;
        this.cm = cm;
        this.attach();
        this.float();
    }
    attach() {
        this.node = document.createElement('div');
        this.node.className = 'minimap';
        var width = this.cm.getWrapperElement().offsetWidth;
        this.cm.addPanel(this.node, {
            //  position: "after-top",
            stable: true
        });
        this.cm.getWrapperElement().style.width = width - this.cm.getOption("miniMapWidth") + "px";
    }
    resize(height, width) {
        if (width != this.width) this.node.style.width = width + "px";
        if (height != this.height) this.node.style.height = height + "px";
        this.width = width;
        this.height = height
    }
    setBackground(bg) {
        this.node.style.backgroundColor = bg;
    }
    float() {
        if (this.side) this.side = this.cm.getOption("miniMapSide") === "left" ? "right" : "left";
        if (!this.side) this.side = this.cm.getOption("miniMapSide");
        this.cm.setOption("miniMapSide", this.side);
        this.node.style.float = this.side;
    }
}