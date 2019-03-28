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
	let active = null,
		factor,
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
			this.scrollBar = cm.getScrollerElement();
			this.cm_wrap = cm.getWrapperElement();
			this.width = width;
		}
		_displayMiniMap(cm) {
			mm = document.createElement("div");
			mm.className = "mm transition";
			mm_scrollbar = document.createElement("div");
			mm_scrollbar.className = "mm_scrollbar";
			mm_bar = document.createElement("div");
			mm_bar.className = "mm_bar";
			this.scrollBar.parentNode.insertBefore(mm, this.scrollBar.nextSibling);
			mm.appendChild(mm_scrollbar);
			mm.appendChild(mm_bar);
			mm_cm = CodeMirror(mm_scrollbar, {
				mode: cm.getOption('mode'),
				theme: cm.getOption('theme'),
				readOnly: true,
				lineWrapping: false,
				scrollbarStyle: "simple"
			});
			mm_cm.refresh();
			if (mm_cm) {
				this.render(cm);
			}
		}
		render(cm) {
			mm_cm.setValue(cm.getValue());
			mm.style.width = cm.getOption("miniMapWidth");
			mm_scrollbar.style.maxHeight = mm.style.maxHeight = cm.getScrollInfo().clientHeight;
			/**TODO
			 * add fonts-size FACTOR
			 * let factor_fontSize = getStyle(this.cm_wrap, "fontSize") /(3 * getStyle(mm_cm.getWrapperElement(), "fontSize"));
			 */
			factor = mm_cm.getScrollInfo().height / (this.scrollBar.scrollHeight - 14);
			factor = Math.round(factor * 100) / 100;
			mm_bar.style.height = parseInt(getStyle(mm, "height") * (cm.getScrollInfo().clientHeight / cm.getScrollInfo().height));
			mm.classList.add("fadeout");
			mm_bar.classList.add("fadeout");
			mm_cm.refresh();
			this.events(cm, getStyle(mm, "height"), getStyle(mm_bar, "height"));
		}
		destroyMiniMap(cm) {
			if (mm != undefined) {
				mm.remove()
				mm_bar.remove()
			}
			cm.focus()
		}
		_scrollTo(mm, mm_bar, st, factor, cm) {
			var isNormal = mm_cm.getScrollInfo().height > cm.getScrollInfo().clientHeight;
			var max = getStyle(mm_bar, "height") + getStyle(mm_bar, "top");
			if (isNormal) {
				mm_bar.style.top = st * cm.getScrollInfo().clientHeight / cm.getScrollInfo().height;
			} else {
				mm_bar.style.top = parseInt(st * factor);
			}
			mm_scrollbar.scrollTop = parseInt(st * factor);
		};
		scrolling(mm, mm_bar, cm_scrollBar, factor, cm) {
			var self = this;
			cm.on("scroll", function (cm) {
				let st = cm_scrollBar.scrollTop
				self._scrollTo(mm, mm_bar, st, factor, mm_cm)
			});
			addWheelListener(mm, function (e) {
				var i = 5;
				cm_scrollBar.scrollTop += (e.deltaY * i++);
			});
		};
		dragging(miniMapBar, miniMap, scrollbar, cm) {
			miniMapBar.onmousedown = function (e) {
				let mmTop = e.pageY - miniMap.offsetParent.offsetTop,
					mm_barTop = miniMapBar.offsetTop,
					sbTop = scrollbar.scrollTop;
				var scroll = function (e) {
					factor = factor;
					if (mm_barTop >= 0) {
						scrollbar.scrollTop = sbTop * factor + ((e.pageY / factor - miniMap.offsetParent.offsetTop / factor - sbTop * factor) - (mmTop / factor - mm_barTop / factor));
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
			var _this = this;
			this.scrolling(mm, mm_bar, _this.scrollBar, factor, cm)
			this.dragging(mm_bar, mm, _this.scrollBar, cm);
			cm.on("change", function (cm) {
				mm_cm.setValue(cm.getValue())
			})
			CodeMirror.on(cm, "refresh", (cm) => {
				_this.render(cm)
			});
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
		if (old && old != CodeMirror.Init) {
			return
		}
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) return;
		if (val) {
			CodeMirror.on(cm, "focus", (cm) => {
				if (cm.hasFocus()) {
					var minimap = new MiniMap(cm);
					if (active != cm) {
						active = cm
						if (minimap) {
							minimap.destroyMiniMap(cm);
						}
						minimap._displayMiniMap(cm);
					}
				}
			});
		}
	});
	CodeMirror.defineExtension('miniMapWidth', function () {
		var cm = this;
		var minimap = new MiniMap(cm)
		if (active != cm) {
			active = cm
			if (minimap) {
				minimap.destroyMiniMap(cm);
			}
			minimap._displayMiniMap(cm);
		}
		CodeMirror.defineInitHook(function (cm) {
			function log() {}
			cm.on("refresh", render);
		});
	});
})