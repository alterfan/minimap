(function (mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("codemirror"))
	else if (typeof define == "function" && define.amd) // AMD
		define(["codemirror"], mod)
	else // Plain browser env
		mod(CodeMirror)
})((CodeMirror) => {
	"use strict";
	/*======  Global  ======*/
	// Create the event.
	var ready = new Event("ready"),
		active = null,
		//.miniMap
		mm,
		//.mm_scrollbar
		mm_scrollbar,
		//.miniMapBar
		mm_bar,
		//.miniMap .CodeMirror
		mm_cm;
	/*=====  End of Global  ======*/
	class MiniMap {
		constructor(cm, width) {
			this.ratio;
			this.scrollBar;
			this.wrapper;
			this.scroll;
			this.width = width;
			this.hFactor;
			this.sFactor;
			this.isReady = false;
		}
		init(cm) {
			mm = document.createElement("div");
			mm.className = "mm transition";
			mm_scrollbar = document.createElement("div");
			mm_scrollbar.className = "mm_scrollbar";
			mm_bar = document.createElement("div");
			mm_bar.className = "mm_bar";
			this.scrollBar = cm.getScrollerElement();
			this.wrapper = cm.getWrapperElement();
			this.scroll = cm.getScrollInfo();
			console.warn(this.scroll.clientHeight)
			this.render(cm);
			this.update(cm);
			this.events(cm);
		}
		render(cm) {
			this.wrapper.insertBefore(mm, this.scrollBar.nextSibling);
			mm.appendChild(mm_scrollbar);
			mm_cm = CodeMirror(mm_scrollbar, {
				mode: cm.getOption('mode'),
				theme: cm.getOption('theme'),
				readOnly: true,
				lineWrapping: false,
				scrollbarStyle: "simple"
			});
			mm.appendChild(mm_bar);
		}
		update(cm) {
			// mm_scrollbar.innerHTML = mm_cm.getWrapperElement().querySelector('.CodeMirror-lines').cloneNode(true).innerHTML;
			mm_cm.setValue(cm.getValue());
			mm_cm.refresh();
			this._setSize(cm)
		}
		_setSize(cm) {
			mm.style.width = cm.getOption("miniMapWidth");
			mm_scrollbar.style.maxHeight = this.scroll.clientHeight;
			let factor_fontSize = getStyle(mm_scrollbar, "fontSize") / getStyle(this.wrapper, "fontSize");
			this.hFactor = this.scroll.height / this.scroll.clientHeight;
			if (mm_cm.getScrollInfo().height <= this.scroll.clientHeight) {
				this.sFactor = this.scroll.height / mm_cm.getScrollInfo().height;
			} else {
				this.sFactor = this.hFactor;
			}
			mm_bar.style.height = mm_cm.getScrollInfo().height / this.hFactor;
		}
		remove(cm) {
			if (mm != undefined) {
				mm.remove()
				mm_bar.remove()
			}
			cm.focus()
		}
		scrolling(mm, mm_bar, cm_scrollBar) {
			var self = this;
			let st = cm_scrollBar.scrollTop
			var max = (getStyle(mm_bar, "height") + getStyle(mm_bar, "top")),
				maxTop = getStyle(mm_scrollbar, "height") - getStyle(mm_bar, "height"),
				isCan = getStyle(mm_scrollbar, "height") - max;
			if (isCan >= 0) {
				mm_bar.style.top = st / this.sFactor;
				mm_scrollbar.scrollTop = st / this.sFactor;
			} else {
				mm_bar.style.top = maxTop;
				mm_scrollbar.scrollTop = maxTop;
			}
		};
		wheeling() {
			let self = this;
			return addWheelListener(mm, function (e) {
				var i = 5;
				self.scrollBar.scrollTop += (e.deltaY * i++);
			});
		}
		dragging(miniMapBar, miniMap, scrollbar, cm) {
			let self = this;
			miniMapBar.onmousedown = function (e) {
				let mmTop = e.pageY - miniMap.offsetParent.offsetTop,
					mm_barTop = miniMapBar.offsetTop,
					sbTop = scrollbar.scrollTop;
				var scroll = function (e) {
					self.hFactor = self.hFactor;
					if (mm_barTop >= 0) {
						scrollbar.scrollTop = sbTop / self.hFactor + ((e.pageY * self.hFactor - miniMap.offsetParent.offsetTop * self.hFactor - sbTop / self.hFactor) - (mmTop * self.hFactor - mm_barTop * self.hFactor));
					}
				};
				document.onmousemove = function (event) {
					scroll(event)
				};
				document.onmouseup = function () {
					document.onmousemove = function () {
						return
					};
				};
			};
		}
		events(cm) {
			var self = this;
			cm.on("refresh", (cm) => {
				self.scroll = cm.getScrollInfo();
				console.warn(self.scroll.clientHeight)
				self._setSize(cm);
			});
			cm.on("change", (cm) => {
				self.update(cm)
			});
			cm.on("scroll", function (cm) {
				self.scrolling(mm, mm_bar, self.scrollBar, self.hFactor, cm)
				self.wheeling();
			});
			self.dragging(mm_bar, mm, self.scrollBar, cm);
		}
	};
	/*======  Helper functions  ======*/
	function getStyle(elem, styleName) {
		let val = getComputedStyle(elem)[styleName]
		if (isNaN(parseInt(val)) === true) {
			return getComputedStyle(elem)[styleName]
		} else {
			return parseInt(getComputedStyle(elem)[styleName])
		}
	}
	function throttle(fn, context) {
		var result;
		return function () {
			if (fn) {
				result = fn.apply(context || this, arguments);
				fn = null;
			}
			setTimeout(() => {
				return result;
			}, 300);
		};
	}
	function round(num) {
		return Math.round(num * 100) / 100;
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
	CodeMirror.defineOption("miniMapWidth", 60);
	CodeMirror.defineOption("miniMap", false, function (cm, val, old) {
		var minimap = new MiniMap(cm);
		if (old && old != CodeMirror.Init) {
			return
		}
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) return;
		if (val) {
			CodeMirror.on(cm, "focus", (cm) => {
				if (active != cm) {
					active = cm
					if (minimap) {
						minimap.remove(cm);
					}
					minimap.init(cm);
				}
			});
		}
	});
})