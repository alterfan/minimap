(function (mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror)
})((CodeMirror) => {
	'use strict';
	let Active, ActiveMap, ActiveMapContent, ActiveCodeMirrorSizes, ActiveMapView;
	/**
	 *
	 *
	 * @class MiniMap
	 */
	class MiniMap {
		constructor(cm) {
			this.cm = cm;
			this.screen = this.size = this.total = 0;
			this.pos = 0;
			this.node = create("div", "map");
			this.node__code = CodeMirror(this.node);
			this.node__view = this.node.appendChild(create("div", "map__view fade"));
			this.node__scrollbar = this.node.appendChild(create("div", "map__scrollbar"));
		}
		render(cm) {
			this._init(cm)
			this.wrapper.insertBefore(this.node, this.wrapper.firstChild);
			this.node.style.width = this.width;
			for (var i = 1; i < this.cm.getWrapperElement().childNodes.length; i++) {
				this.cm.getWrapperElement().childNodes[i].style.marginLeft = this.width;
			}
			this.scroller.style.width = "100%";
			this.scroller.style.top = 0;
			this.scroller.style.position = "absolute";
			this._update();
		}
		_init(cm) {
			var self = this;
			this.wrapper = this.cm.getWrapperElement();
			this.width = this.cm.getOption("miniMapWidth");
			this.scroller = this.cm.getScrollerElement();
			cm.refresh();
			this.events(cm, self);
		}
		events(cm, self) {
			CodeMirror.on(cm, "mousedown", () => {
				self.active = cm;
			});
			CodeMirror.on(self.cm, "focus", function () {
				self._hideView(cm);
				var sh = setInterval(function () {
					cm.refresh();
				}, 500);
				setTimeout(function () {
					clearInterval(sh);
				}, 2000)
				if (self.setSize(self.screen, self.cm) == true) {
					self._showView(self);
					self.updateSize(self, cm)
				}
			});
			CodeMirror.on(self.cm, "scroll", function () {
				self.scrollPos(self.scroller.scrollTop);
			});
			CodeMirror.on(self.cm, "change", function () {
				self._update(self.cm);
				setTimeout(self.updateSize(self, cm));
			});
			CodeMirror.on(self.cm, "refresh", function () {
				setTimeout(self.updateSize(self, cm));
			});
			CodeMirror.on(self.cm, "viewportChange", function () {
				setTimeout(self.updateSize(self, cm));
			});
			CodeMirror.on(self.cm, "update", function () {
				setTimeout(self.updateSize(self, cm));
			});
			CodeMirror.on(self.cm, "optionChange", function () {
				setTimeout(self.updateSize(self, cm));
			});
		}
		set active(cm) {
			Active = this.cm = cm;
			ActiveMap = Active.getWrapperElement().querySelector(".map");
			ActiveMapContent = Active.getWrapperElement().querySelector(".map.CodeMirror");
			ActiveMapView = Active.getWrapperElement().querySelector(".map__view");
		}
		_update() {
			this.node__code.setSize(this.cm.getScrollInfo().clientWidth);
			this.node__code.setValue(this.cm.getValue());
			this.node__code.setOption("scrollbarStyle", null);
			this.node__code.setOption("theme", this.cm.getOption("theme"))
			this.node__code.setOption("mode", this.cm.getOption("mode"));
		}
		_showView(self) {
			setTimeout(() => {
				self.node__view.classList.remove("transition");
				self.node__view.classList.remove("fade");
				self.node__view.classList.add("active");
			}, 200);
		}
		_hideView(cm) {
			let active = document.querySelector(".map__view.active");
			if (active) {
				document.querySelector(".map__view.active").classList.add("fade");
				document.querySelector(".map__view.active").classList.remove("active");
			}
		}
		updateSize(self, cm) {
			if (self.screen != self.cm.getScrollInfo().clientHeight) {
				self.screen = cm.getScrollInfo().clientHeight;
				self.setSize(self.screen, cm);
				this.scrollTo(this.scroller.scrollTop)
			}
			if (Active)
				Active.focus();
		}
		setSize(screen, cm) {
			var self = this;
			self.total = cm.getScrollInfo().height;
			self.screen = cm.getScrollInfo().clientHeight;
			self.map_total = this.node__code.getScrollInfo().height;
			self.factor = self.screen / self.total;
			this.size = this.map_total * this.factor;
			if (ActiveCodeMirrorSizes !== this.size) {
				ActiveCodeMirrorSizes = this.size;
				this.topfactor = (this.map_total > this.screen ? this.screen : this.map_total) / this.total;
				var scroll = this.total - this.screen,
					mapscroll = this.map_total - this.screen > 0 ? this.map_total - this.screen : 0;
				this.scrollFactor = mapscroll / scroll;
				this.node__code.getScrollerElement().style.maxHeight = this.screen;
				if (ActiveMapView !== undefined) {
					ActiveMapView.style.height = ActiveCodeMirrorSizes;
				}
				this.scrollPos(this.pos, ActiveCodeMirrorSizes !== this.size);
			}
			return true;
		}
		scrollTo(pos) {
			if (this.scrollPos(pos)) {
				this.scroller.scrollTop = pos;
			}
		}
		scrollPos(pos, force) {
			if (pos < 0) pos = 0;
			if (pos >= scroll) return false;
			if (!force && pos == this.pos) return false;
			this.pos = pos;
			if (this.node__view && this.node__code) {
				this.node__code.getScrollerElement().scrollTop = pos * this.scrollFactor;
				// this.node__code.getWrapperElement().style.bottom = pos * this.scrollFactor;
				pos = (pos * this.topfactor) > (this.screen - this.node__view.offsetHeight) ? this.screen - this.node__view.offsetHeight : pos * this.topfactor;
				this.node__view.style.top = pos;
			}
			return true;
		}
		onDrag(cm, self) {
			CodeMirror.on(ActiveMapView, "mousedown", function (e) {
				var start = e.pageY,
					startpos = self.pos;

				function done() {
					CodeMirror.off(document, "mousemove", move);
					CodeMirror.off(document, "mouseup", done);
				}

				function move(e) {
					var p = startpos + (e.pageY - start) / self.factor
					self.scrollTo((p > self.screen ? self.screen : (p < 0 ? 0 : p)));
				}
				CodeMirror.on(document, "mousemove", move);
				CodeMirror.on(document, "mouseup", done);
			});
		}
	}
	CodeMirror.defineOption("miniMap", false, function (cm, val, old) {
		if (old && old != CodeMirror.Init) {
			return;
		}
		if (old == CodeMirror.Init) old = false;
		if (!old == !val) {
			return;
		}
		if (val) {
			var minimap = new MiniMap(cm);
			minimap.render(cm);
		}
	});
	CodeMirror.defineOption("miniMapWidth", 48);

	function getstyle(elem, prop) {
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
	}

	function create(tag, className, id, styles) {
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
})