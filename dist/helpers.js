/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish  http://paulirish.com/
 */
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}
var ChangedRange = /** @class */ (function() {
    function ChangedRange(fromA, toA, fromB, toB) {
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    ChangedRange.prototype.join = function(other) {
        return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    };
    ChangedRange.prototype.addToSet = function(set) {
        var i = set.length,
            me = this;
        for (; i > 0; i--) {
            var range = set[i - 1];
            if (range.fromA > me.toA)
                continue;
            if (range.toA < me.fromA)
                break;
            me = me.join(range);
            set.splice(i - 1, 1);
        }
        set.splice(i, 0, me);
    };
    return ChangedRange;
}());
var colorize = function colorize(color) {
    color = color.replace('rgb(', 'rgba(').replace(')', `, .55)`)
    return color
}
function removeListener(mousemoveHandler, mouseupHandler) {
    document.body.removeEventListener('mousemove', mousemoveHandler);
    document.body.removeEventListener('mouseup', mouseupHandler);
    document.body.removeEventListener('mouseleave', mouseupHandler);
    document.body.removeEventListener('touchmove', mousemoveHandler);
    document.body.removeEventListener('touchend', mouseupHandler);
}
function addListener(mousemoveHandler, mouseupHandler) {
    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
    document.body.addEventListener('mouseleave', mouseupHandler);
    document.body.addEventListener('touchmove', mousemoveHandler);
    document.body.addEventListener('touchend', mouseupHandler);
}
var jscode = `const HIGHLIGHT_COLORS = {
    "#text": "#fff",
    "#space": "rgba(0,0,0,0)",
    "comment": null,
    "string": null,
    "string-2": null,
    "number": null,
    "variable": null,
    "variable-2": null,
    "def": null,
    "operator": null,
    "keyword": null,
    "atom": null,
    "meta": null,
    "tag": null,
    "tag bracket": null,
    "attribute": null,
    "qualifier": null,
    "property": null,
    "builtin": null,
    "variable-3": null,
    "type": null,
    "string property": null,
    "tab": null
};
const SETTINGS_DEFAULT = {
    width: 1,
    fontSize: 2,
    simpleMode: false,
    debug: false,
    cm: null
};
var Cache = new class {
    constructor() {
        this.buffer = undefined
    }
    getBuffer() {
        this.buffer = this.buffer || {}
        return this.buffer;
    }
    getCachedTarget(target) {
        var cachedTarget = this.cached()[target] || {}
        return cachedTarget
    };
    getCachedTarget(target, property) {
        var cachedTarget = this.getCachedTarget(target)[property] || {}
        return this.getCachedTarget(target)[property]
    };
    setBuffer(target, property, data) {
        this.buffer[target][property] = data;
    };
}
var updateSyntaxColor = function updateSyntaxColor(wrapper, defaultSyntaxColors) {
    var newSyntaxColors = {};
    for (const key in defaultSyntaxColors) {
        if (key == "#text") {
            newSyntaxColors[key] = colorize("rgba(255,255,255)");
        } else if (key == "#space") {
            newSyntaxColors[key] = "rgba(0,0,0,0)";
        } else {
            const span = document.createElement("span");
            span.className = "cm-" + key.replace(" ", " cm-");
            span.innerText = span;
            wrapper.appendChild(span);
            newSyntaxColors[key] = colorize(getComputedStyle(span)["color"]);
            span.remove();
        }
    }
    return newSyntaxColors
}
function lineHeight(editor) {
    return editor.getScrollerElement().querySelector(".CodeMirror-line").offsetHeight;
}
var requestAnimFrame = () => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
};
class Drag {
    static context(context) {
        this.dragSubscription = undefined
        this.movementX = undefined
        this.context = context
    }
    static start(e) {
        if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) return;
        this.startX = e.clientX;
        this.startY = e.clientY;
        let move = (e) => this.moving(e);
        let done = (e) => this.done(e);
        addListener(move, done);
        this.dragSubscription = () => removeListener(move, done)
    }
    static moving(e) {
        var valX = e.clientX - this.startX;
        var valY = e.clientY - this.startY;
        valX = valX < 0 ? -valX : valX;
        valY = valY < 0 ? -valY : valY;
        this.axis = valX > valY ? "x" : "y";
        if (this.axis == "x" && valX > e.target.offsetWidth * 3) {
            this.context.reFloat((e.movementX) < 0 ? "left" : "right")
        }
    }
    static done(e) {
        this.dragSubscription();
    }
}
function removeListener(mousemoveHandler, mouseupHandler) {
    document.body.removeEventListener('mousemove', mousemoveHandler);
    document.body.removeEventListener('mouseup', mouseupHandler);
    document.body.removeEventListener('mouseleave', mouseupHandler);
    document.body.removeEventListener('touchmove', mousemoveHandler);
    document.body.removeEventListener('touchend', mouseupHandler);
}
function addListener(mousemoveHandler, mouseupHandler) {
    document.body.addEventListener('mousemove', mousemoveHandler);
    document.body.addEventListener('mouseup', mouseupHandler);
    document.body.addEventListener('mouseleave', mouseupHandler);
    document.body.addEventListener('touchmove', mousemoveHandler);
    document.body.addEventListener('touchend', mouseupHandler);
}`
