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
		//.mm_container
		mm_container,
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
			this.cm_scrollBar = cm.getScrollerElement();
			this.cm_wrap = cm.getWrapperElement();
			this.width = width;
		}
		_displayMiniMap(cm) {
			mm = document.createElement("div");
			mm.className = "mm transition";
			mm_container = document.createElement("div");
			mm_container.className = "mm_container";
			mm_scrollbar = document.createElement("div");
			mm_scrollbar.className = "mm_container_scrollbar";
			mm_bar = document.createElement("div");
			mm_bar.className = "mm_container_bar";
			var scrollBarParent = this.cm_scrollBar.parentNode;
			var scrollBarSibling = this.cm_scrollBar.nextSibling;
			scrollBarParent.insertBefore(mm, scrollBarSibling);
			mm.appendChild(mm_container);
			mm_container.appendChild(mm_scrollbar);
			mm_container.appendChild(mm_bar);
			mm_cm = CodeMirror(mm_container, {
				value: cm.getValue(),
				mode: cm.getOption('mode'),
				theme: cm.getOption('theme'),
				readOnly: true,
				scrollbarStyle: "simple"
			});
			if (mm_cm) setTimeout(this.render(cm), 1)
		}
		render(cm) {
			this.miniMapStyle(cm);
			this.miniMapBarStyle(cm);
			factor = (mm_cm.getScrollInfo().height - getStyle(mm, "maxHeight")) / (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight)
			if (factor < 0) factor = factor * (-1);
			this._scrollTo(mm, mm_bar, this.cm_scrollBar.scrollTop, cm);
			mm.classList.add("fadeout");
			mm_bar.classList.add("fadeout");
		}
		miniMapStyle(cm) {
			mm.style.maxHeight = cm.getScrollInfo().clientHeight;
			mm.style.width = cm.getOption("miniMapWidth");
		}
		miniMapBarStyle(cm) {
			setTimeout(() => {
				let factor_height = getStyle(mm, "maxHeight") / cm.getScrollInfo().height;
				let factor_fontSize = getStyle(this.cm_wrap, "fontSize") / (3 * getStyle(mm_cm.getWrapperElement(), "fontSize"));
				let factor = factor_height * factor_fontSize;
				mm_bar.style.height = mm_cm.getScrollInfo().height * factor;
			}, 1)
		}
		destroyMiniMap(cm) {
			if (mm != undefined) {
				mm.remove()
				mm_bar.remove()
			}
			cm.focus()
		}
		events(cm) {
			var _this = this;
			this.dragging(mm_bar, mm, _this.cm_scrollBar, cm);
			this.scrolling(mm, mm_bar, _this.cm_scrollBar, cm)
			cm.on("change", function (cm) {
				mm_cm.setValue(cm.getValue())
			})
			cm.on("refresh", function (cm) {
				_this.render(cm)
			})
		}
		_scrollTo(mm, mm_bar, cm_scrollTop, cm) {
			if (mm_cm.getScrollInfo().height > cm.getScrollInfo().clientHeight) {
				mm_bar.style.top = cm_scrollTop * cm.getScrollInfo().clientHeight / cm.getScrollInfo().height;
			} else {
				mm_bar.style.top = cm_scrollTop * parseInt(window.getComputedStyle(mm).height) / cm.getScrollInfo().height;
			}
			mm.scrollTop = cm_scrollTop * factor;
		};
		scrolling(mm, mm_bar, cm_scrollBar, cm) {
			var self = this;
			cm.on("scroll", function (cm) {
				self._scrollTo(mm, mm_bar, cm_scrollBar.scrollTop, cm)
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
					let factor = getStyle(miniMap, 'height') / cm.getScrollInfo().height;
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
	CodeMirror.defineOption("miniMapWidth", 80);
	CodeMirror.defineOption("miniMap", false, function (cm, val, old) {
		if (old && old != CodeMirror.Init) {
			return
		}
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) return;
		if (val) {
			CodeMirror.on(cm, "focus", (cm) => {
				var miniMapWidth = cm.getOption('miniMapWidth');
				var minimap = new MiniMap(cm, miniMapWidth);
				if (active != cm) {
					active = cm
					if (minimap) {
						minimap.destroyMiniMap(cm);
					}
					minimap._displayMiniMap(cm);
					minimap.events(cm);
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
			minimap.events(cm);
		}
	})
})