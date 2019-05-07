(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("codemirror"))
    else if (typeof define == "function" && define.amd) // AMD
        define(["codemirror"], mod)
    else // Plain browser env
        mod(CodeMirror)
})((CodeMirror) => {
    'use strict';
    var _cm, _mm, isVisible, counter;
    class MiniMap {
        constructor(cm) {
            this.screen = this.size = this.total = 1;
            this.pos = 0;


        }
        get doc() {
            if (this.cm !== null) return this.cm.getDoc();
        }
        get getEditorViewHeight() {
            return this.cm.getScrollInfo().clientHeight;
        }
        get getMapHeight() {
            if (this.map__cm) return this.map__cm.getDoc().lineCount() * this.map__cm.defaultTextHeight();
        }
        get getEditorHeight() {
            if (this.cm) return this.cm.getDoc().lineCount() * this.cm.defaultTextHeight();
        }
        get getEditorViewRatio() {
            return this.scrollInfo.clientHeight / this.scrollBar.scrollHeight;
        }
        get getScrollRatio() {
            return this.scrollBar.offsetHeight / this.scrollBar.scrollHeight;
        }
        init(cm) {
            this.cm = _cm = cm;
            this.scrollBar = cm.getScrollerElement();
            this.scrollInfo = cm.getScrollInfo();
            this.getWrapper = cm.getWrapperElement();

        }

        render(cm) {
            var self = this;
            self.map = dom.create("div", "map transition ");
            self.map__view = dom.create("div", "map__view-area");
            self.map__container = dom.create("div", "map__container");
            self.map__scrollbar = dom.create("div", {
                height: "100%",
                width: "100%",
                zIndex: 1060,
                background: "none",
                top: 0,
                position: "absolute"
            });
            self.getWrapper.insertBefore(self.map, cm.getWrapperElement().firstChild);
            self.map.appendChild(self.map__container);
            self.map__cm = CodeMirror(self.map__container, {
                mode: cm.getOption("mode"),
                scrollbarStyle: null,
                theme: cm.getOption("theme"),
                lineWrapping: false
            });
            self.map__container.appendChild(self.map__scrollbar);
            self.map__container.appendChild(self.map__view);

            self.render(cm);
            self.update(cm);
            self.apply(cm);
            self.events(cm);

        }
        update(cm) {
            return this.map__cm.setValue(cm.getValue());
        }
        apply(cm) {
            var self = this;
            var miniMapWidth = cm.getOption("miniMapWidth");
            self.map.style.width = miniMapWidth;
            for (var i = 1; i < cm.getWrapperElement().childNodes.length; i++) {
                cm.getWrapperElement().childNodes[i].style.marginLeft = miniMapWidth
            }
            cm.getScrollerElement().style.width = "100%";
            cm.getScrollerElement().style.top = 0;
            cm.getScrollerElement().style.position = "absolute";
            self.map.classList.remove('fade');
        }
        refresh(cm, self) {
            var self = this;
            var viewheight, mapViewHeight;

            viewheight = cm.getScrollInfo().clientHeight;
            if (self.getMapHeight > viewheight) {
                self.factor = self.cm.getScrollerElement().offsetHeight / cm.getScrollInfo().height;
                self.maxscroll = cm.getScrollInfo().height - viewheight;

            } else {
                self.factor = self.getMapHeight / self.getEditorHeight;
                self.maxscroll = 0;
            }
            mapViewHeight = cm.getScrollInfo().clientHeight * self.factor;
            console.log('mapViewHeight: ', mapViewHeight);
            self.scrollFactor = (self.map__cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) / self.maxscroll;
            self.map__view.style.height = mapViewHeight;
        }

        scrollTo(pos) {
            if (this.scrollPos(pos)) {
                this.scrollBar.scrollTop = pos;
            }
        }
        scrollPos(pos, force) {
            var max = this.cm.getScrollInfo().height - this.cm.getScrollInfo().clientHeight;

            if (pos < 0) pos = 0;
            if (pos > max) pos = max;
            if (!force && pos == this.pos) return false;
            this.pos = pos;
            this.map__view.style.top = (pos * this.factor) > max ? max : pos * this.factor;
            this.map__container.style.bottom = this.maxscroll > 0 ? pos * this.scrollFactor : 0;
            return true
        }
        onWheel(cm) {
            let self = this;
            return addWheelListener(self.map, function(e) {
                var oldPos = self.pos;
                self.scrollTo(cm, self.pos + e.deltaY * self.factor);
                if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
            });
        }
        onDrag(cm) {
            let self = this;
            CodeMirror.on(self.map__view, "mousedown", function(e) {
                var start = e.pageY,
                    startpos = self.pos;

                function done() {
                    CodeMirror.off(document, "mousemove", move);
                    CodeMirror.off(document, "mouseup", done);
                }

                function move(e) {
                    var p = startpos + (e.pageY - start) / self.factor
                    self.scrollTo((p > cm.getScrollInfo().height ? cm.getScrollInfo().height : p < 0 ? 0 : p));
                }
                CodeMirror.on(document, "mousemove", move);
                CodeMirror.on(document, "mouseup", done);
            });
        }
        onClick(cm) {
            let self = this;
            CodeMirror.on(self.map__scrollbar, "mousedown", function(e) {
                var start = e.pageY,
                    startpos = self.pos;

                function done() {
                    CodeMirror.off(document, "mouseup", done);
                }
                var newPos = (e.pageY - start - dom.getstyle(self.map__view, "height")) / self.factor
                self.pos = startpos - newPos < 0 ? startpos - newPos : startpos + newPos;
                self.pos = self.pos < 0 ? 0 : self.pos;
                self.scrollTo((self.pos > cm.getScrollInfo().height ? cm.getScrollInfo().height : self.pos));
            });
        }
        events(cm) {
            var self = this;
            CodeMirror.on(cm, "change", (cm) => {
                self.update(cm);
            });
            CodeMirror.on(cm, "scroll", function(cm) {
                self.scrollTo(self.scrollBar.scrollTop);
            });
            self.onWheel(cm);
            self.onDrag(cm);
            self.onClick(cm);
        }
    };
    var minimap = new MiniMap();
    CodeMirror.defineOption("miniMap", false, function(cm, val, old) {
        if (old && old != CodeMirror.Init) {
            return
        }
        if (old == CodeMirror.Init) old = false;
        if (!old == !val) return;
        if (val) {
            minimap.init(cm);

            CodeMirror.on(cm, "refresh", function(cm) {
                minimap.refresh(cm);
            });
        }
    });
    CodeMirror.defineOption("miniMapWidth", 64);
    var dom = {
        getstyle: function(elem, prop) {
            var styles, el;
            el = typeof elem === "string" ? document.querySelector(elem) : elem;
            styles = getComputedStyle(el);
            if (prop !== undefined && prop !== null) {
                styles = styles[prop];
                if (parseFloat(styles) === false) {
                    styles = styles;
                } else {
                    styles = parseFloat(styles);
                }
            } else {
                styles = styles;
            }
            return styles;
        },
        create: function(tag, className, id, styles) {
            var element = document.createElement(tag);
            var attr = className || id || styles;
            if (attr !== undefined && attr !== null) {
                if (typeof attr == "object") {
                    var styleName = attr;
                    for (var key in attr) {
                        element.style[key] = styleName[key]
                    }
                } else {
                    attr = [className, id]
                    if (className !== undefined) element.className = attr[0];
                    if (id !== undefined) element.id = attr[1];
                }
            }
            return element;
        }
    };
    /*======  Helper functions  ======*/
    /**
     *
     *
     * @param {*} tag string
     * @param {*} className string
     * @param {*} id string
     * @returns created element
     */

})