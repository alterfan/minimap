class MiniMapElement {
    constructor(editor) {
        this.editor = undefined;
        this.cacheUpdated = undefined;
        this.width = undefined;
        this.height = undefined;
        this.attached = false;
        this.attach(editor);
    }
    /**
     * Create minimap elements:
     */
    attach(editor) {
        this.editor = editor;
        this.node = document.createElement('div');
        this.node.className = 'minimap';
        this.viewBoxElement = document.createElement('div');
        this.viewBoxElement.classList.add('viewbox');
        this.node.appendChild(this.viewBoxElement);
        this.editor.addPanel(this.node);
        this.editor.setSize(null, null);
        if (this.editor.state.panels.wrapper) {
            this.editor.state.panels.wrapper.style["display"] = "inline-flex";
            this.node.style["flex"] = "1 0 auto";
            this.editor.getWrapperElement().style["flex"] = "1 1 auto";
        }
    }
    /**
     * Resize minimap elements:
     */
    fullHeight() {
        return this.editor.lineCount() * Buffer.get("lineHeight");
    }
    resize(height, width) {
        this.resizeMinimap(height, width);
    }
    resizeMinimap(height, width) {
        this.node.style.width = width || Buffer.get("miniMapWidth") + "px";
        this.node.style.height = height || Buffer.get("miniMapHeight", height) + "px";
    }
    resizeViewBox(visibleLines) {
        this.viewBoxHeight = visibleLines * 3;
        this.viewBoxElement.style.width = Buffer.get("miniMapWidth") + "px";
        this.viewBoxElement.style.height = Buffer.set("viewBoxHeight", this.viewBoxHeight) + "px";
    }
    moveViewBox(scrollPos) {
        this.viewBoxElement.style.transform = "translateY(" + (scrollPos + 1) + "px)";
    }
    hidden() {
        this.viewBoxElement.classList.remove("visible");
    }
    visible() {
        this.viewBoxElement.classList.add("visible");
    }
    set Background(bg) {
        this.node.style.backgroundColor = bg;
    }
    floatRight() {
        this.editor.state.panels.wrapper.style["flex-direction"] = "row-reverse";
        this.node.style.boxShadow = "-1px -1px 5px -1px rgba(0,0,0,.5)";
    }
    floatLeft() {
        this.editor.state.panels.wrapper.style["flex-direction"] = "row-reverse";
        this.node.style.boxShadow = "1px -1px 5px -1px rgba(0,0,0,.5)";
    }
}
var Move = {
    vertical: element => {
        element.style.transform = "translateY(" + (pos + 1) + "px)";
    }
};
function start(e) {
    if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) return;
    startX = e.clientX;
    startY = e.clientY;
    addListener(move, done);
    dragSubscription = () => removeListener(move, done);
}
let move = function moving(e) {
    var valX = e.clientX - this.startX;
    var valY = e.clientY - this.startY;
    valX = valX < 0 ? -valX : valX;
    valY = valY < 0 ? -valY : valY;
    axis = valX > valY ? "x" : "y";
    if (axis == "x" && valX > e.target.offsetWidth * 3) {
        context.reFloat(e.movementX < 0 ? "left" : "right");
    }
};
let done = function done(e) {
    dragSubscription();
};
