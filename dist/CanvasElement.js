class CanvasElement {
    constructor(parent) {
        this.initCanvasLayers();
        this.initCanvasOffscreen();
        this.attachCanvasLayers(parent);
    }
    initCanvasLayers() {
        this.frontCanvasLayer = document.createElement('canvas');
        this.frontCanvasLayer.className = "front-layer";
        this.frontCTX = this.frontCanvasLayer.getContext('2d');
        this.backCanvasLayer = document.createElement('canvas');
        this.backCanvasLayer.className = "back-layer";
        this.backCTX = this.frontCanvasLayer.getContext('2d');
    }
    initCanvasOffscreen() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCTX = this.offscreenCanvas.getContext('2d');
        this.offscreenCanvas.width = 300;
        this.offscreenCanvas.height = 300;
        this.offscreenCTX.fillRect(10, 10, 280, 280);
    }
    attachCanvasLayers(parent) {
        parent.appendChild(this.frontCanvasLayer)
        parent.appendChild(this.backCanvasLayer)
    }
    copyIntoOnscreenCanvas() {
        // cut the drawn rectangle
        var image = this.offscreenCanvas.getImageData(10, 10, 280, 280);
        // copy into visual canvas at different position
        this.frontCTX.putImageData(image, 0, 0);
    }
    resize(height, width) {
        this.frontCanvasLayer.width = width || Buffer.get("miniMapWidth");
        this.frontCanvasLayer.height = height || Buffer.get("miniMapHeigh");
        this.backCanvasLayer.width = width || Buffer.get("miniMapWidth");
        this.backCanvasLayer.height = height || Buffer.get("miniMapHeight");
    }
    resizeCanvasOffscreen() {
        this.canvasOffscreen.width = this.width
        this.canvasOffscreen.height = this.height
    }
};