(function (mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("codemirror"))
	else if (typeof define == "function" && define.amd) // AMD
		define(["codemirror"], mod)
	else // Plain browser env
		mod(CodeMirror)
})((CodeMirror) => {
	"use strict";
	class MiniMap {
		constructor() {
			this.scrollBar;
			this.scroll;
			this.width;
			this.factor;
			this.hFactor;
			this.isMaxTop;
			this.sFactor;
			this.mm;
			this.mm_cmScroll;
			this.mm_cmScrollBar;
			this.mmBar;
			this.mapScroll;
			this.clientHeight;
			this.height;
			this.pos = 0;
			this.old
		}
		init(cm, map) {
			this.cm = cm; //current active CodeMirror
			this.scrollBar = cm.getScrollerElement();
			this.scroll = this.cm.getScrollInfo();
			this.render(cm);
			this.update(cm);
			this.events(cm);
		}
		render(cm) {
			this.mm = document.createElement("div");
			this.mm.className = "mm";
			this.old = this.mm;
			this.mapScrollBar = document.createElement("div");
			this.mapScrollBar.className = "mm_scrollbar";
			this.mapScroll = document.createElement("div");
			this.mapScroll.className = "mm_scroll";
			this.mmBar = document.createElement("div");
			this.mmBar.className = "mm_bar";
			this.scrollBar.parentNode.insertBefore(this.mm, this.scrollBar);
			this.mm.appendChild(this.mmBar);
			this.mm.appendChild(this.mapScroll);
			this.mm_cm = CodeMirror(this.mm, {
				mode: cm.getOption('mode'),
				theme: cm.getOption('theme'),
				readOnly: true,
				lineWrapping: false,
				scrollbarStyle: null
			});
		}
		update(cm) {
			// mm_scrollbar.innerHTML = mm_cm.getWrapperElement().querySelector('.CodeMirror-lines').cloneNode(true).innerHTML;
			this.mm_cm.setValue(cm.getValue());
			this.mm_cm.refresh();
			this.mm_cmScroll = this.mm_cm.getScrollInfo();
			this.mm_cmScrollBar = this.mm_cm.getScrollerElement();
			this.resize(cm)
		}
		resize(cm) {
			var mmBarMaxTop, maxScrollTop;
			this.scroll = this.cm.getScrollInfo();
			this.height = this.scroll.height;
			//this.mm.style.right = getStyle('.CodeMirror-simplescroll-vertical', "width");
			this.mm.style.top = this.scrollBar.offsetTop;
			this.mm.style.width = cm.getOption("miniMapWidth");
			this.isMaxTop = this.mm_cmScroll.height > this.scroll.clientHeight;
			this.mmBar.style.height = this.mm_cmScroll.height / (this.scroll.height / this.scroll.clientHeight);
			if (this.isMaxTop) {
				this.mm.style.height = this.scroll.clientHeight
				mmBarMaxTop = getStyle(this.mm_cmScrollBar, "height") - getStyle(this.mmBar, "height");
			} else {
				this.mm.style.height = "auto";
				mmBarMaxTop = getStyle(this.mm, "height") - getStyle(this.mmBar, "height");
			}
			this.mmBar.style.height = this.mm_cmScroll.height / (this.scroll.height / this.scroll.clientHeight);
			maxScrollTop = this.scroll.height - this.scroll.clientHeight;
			this.factor = mmBarMaxTop / maxScrollTop;
		}
		clear(cm) {
			if (this.old) {
				this.old.remove()
			}
			cm.focus();
		}
		events(cm) {
			var self = this;
			CodeMirror.on(cm, "refresh", (cm) => {
				self.resize(cm);
			});
			CodeMirror.on(cm, "change", (cm) => {
				self.update(cm)
			});
			cm.on("scroll", function (cm) {
				self.scrollTo(self.scrollBar.scrollTop)
			});
			self.onWheel(cm);
			self.onDrag(self.mmBar, self.mm, self.scrollBar, cm);
		}
		scrollPos(pos, force) {
			if (pos < 0) pos = 0;
			if (pos > this.scroll.height - this.scroll.clientHeight) pos = this.scroll.height - this.scroll.clientHeight;
			if (!force && pos == this.pos) return false;
			this.pos = pos;
			this.mmBar.style.top = Math.ceil(pos * this.factor) + "px";
			var isMax = Math.ceil(getStyle(this.mm, "height") - (getStyle(this.mmBar, "height") + getStyle(this.mmBar, "top")));
			isMax = isMax > 0 ? isMax : 0;
			if (this.isMaxTop) {
				this.mm_cmScrollBar.scrollTop = getStyle(this.mmBar, "top") * this.factor;
			}
			return true
		}
		scrollTo(pos) {
			if (this.scrollPos(pos)) this.scrollBar.scrollTop = pos;
		}
		onWheel() {
			let self = this;
			return addWheelListener(self.mm, function (e) {
				var oldPos = self.pos;
				self.scrollTo(self.pos + e.deltaY * self.sFactor);
				if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
			});
		}
		onDrag(miniMapBar, miniMap, scrollbar, cm) {
			let self = this;
			CodeMirror.on(self.mmBar, "mousedown", function (e) {
				var start = e.pageY,
					startpos = self.pos;
				function done() {
					CodeMirror.off(document, "mousemove", move);
					CodeMirror.off(document, "mouseup", done);
				}
				function move(e) {
					self.scrollTo(startpos + (e.pageY - start) / self.factor);
				}
				CodeMirror.on(document, "mousemove", move);
				CodeMirror.on(document, "mouseup", done);
			});
		}
	};
	/*======  Helper functions  ======*/
	function getStyle(elem, styleName) {
		let el = typeof elem == "string" ? document.querySelector(elem) : elem,
			value;
		if (isNaN(parseFloat(getComputedStyle(el)[styleName])) === true) {
			value = getComputedStyle(el)[styleName]
		} else {
			value = parseFloat(getComputedStyle(el)[styleName])
		}
		return typeof elem === "string" ? value : Math.ceil(value)
	}
	/**
	 * mouse wheel event handle
	 * getting from https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	 */
	(function () {
		var prefix = "",
			_addEventListener, support;
		// detect event model
		if (window.addEventListener) {
			_addEventListener = "addEventListener";
		} else {
			_addEventListener = "attachEvent";
			prefix = "on";
		}
		// detect available wheel event
		support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
			document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
			"DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
		window.addWheelListener = function (elem, callback, useCapture) {
			_addWheelListener(elem, support, callback, useCapture);
			// handle MozMousePixelScroll in older Firefox
			if (support == "DOMMouseScroll") {
				_addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
			}
		};
		function _addWheelListener(elem, eventName, callback, useCapture) {
			elem[_addEventListener](prefix + eventName, support == "wheel" ? callback : function (originalEvent) {
				!originalEvent && (originalEvent = window.event);
				// create a normalized event object
				var event = {
					// keep a ref to the original event object
					originalEvent: originalEvent,
					target: originalEvent.target || originalEvent.srcElement,
					type: "wheel",
					deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
					deltaX: 0,
					deltaY: 0,
					deltaZ: 0,
					preventDefault: function () {
						originalEvent.preventDefault ?
							originalEvent.preventDefault() :
							originalEvent.returnValue = false;
					}
				};
				// calculate deltaY (and deltaX) according to the event
				if (support == "mousewheel") {
					event.deltaY = -1 / 40 * originalEvent.wheelDelta;
					// Webkit also support wheelDeltaX
					originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
				} else {
					event.deltaY = originalEvent.deltaY || originalEvent.detail;
				}
				// it's time to fire the callback
				return callback(event);
			}, useCapture || false);
		}
	})();
	/*======  End Helper functions  ======*/
	var minimap = new MiniMap();
	CodeMirror.defineOption("miniMapWidth", 60);
	CodeMirror.defineOption("miniMap", false, function (cm, val, old) {
		if (old && old != CodeMirror.Init) {
			return
		}
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) return;
		if (val) {
			CodeMirror.on(cm, "focus", (cm) => {
				if (minimap.cm != cm) {
					minimap.clear(cm)
					minimap.init(cm, minimap.mm);
				}
			});
		}
	});
})