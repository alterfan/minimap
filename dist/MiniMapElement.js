class MiniMapElement {
    constructor(editor) {
        this.editor = undefined;
        this.cacheUpdated = undefined;
        this.width = undefined;
        this.height = undefined;
        this.attached = false;
        this.editor = editor;
        this.attach();
    }
    /**
     * Create minimap elements:
     */
    attach() {
        this.node = document.createElement('div');
        this.node.className = 'minimap';
        this.viewBoxElement = document.createElement('div');
        this.viewBoxElement.style.position="absolute"
        this.viewBoxElement.style.background = "rgba(255,255,255,0.5)"
        this.node.appendChild(this.viewBoxElement);
        this.float()
        this.editor.addPanel(this.node, {
            position: "after-top",
            stable: true
        });

    }
    /**
     * Resize minimap elements:
     */
    resize(height, width) {
        this.resizeMinimap(height, width);
    }
    resizeMinimap() {
        this.node.style.width = Buffer.get("miniMapWidth") + "px";
        this.node.style.height = Buffer.get("miniMapHeight") + "px";
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
    float() {
        let side = this.editor.getOption("miniMapSide");
        if (side == "left") this.node.style.float = "left"
        if (side == "right") this.node.style.float = "right"
    }

}


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