	(function(mod) {
	    if (typeof exports == "object" && typeof module == "object")
	        mod(require(["codemirror", "MiniMap.js"]));
	    else if (typeof define == "function" && define.amd)
	        define(["codemirror", "Drawer", "MiniMap"], mod);
	    else
	        mod(CodeMirror)
	})((CodeMirror) => {
	    CodeMirror.defineOption("miniMapWidth", 64);
	    CodeMirror.defineOption("miniMapSide", "left");
	    CodeMirror.defineOption("miniMap", false, function(cm, val, old) {
	        if (old && old != CodeMirror.Init) {
	            return;
	        }
	        if (old == CodeMirror.Init) old = false;
	        if (!old == !val) {
	            return;
	        }
	        if (val) {
	            var mm = new MiniMap(cm);
	            var node = mm.minimap.node,
	                view = mm.viewbox.node;
	            cm.on("change", () => {
	                mm.refresh()
	            });
	            cm.on("scroll", (e) => {
	                mm.onScroll();
	            });
	            window.onresize = (e) => {
	                mm.updateSize()
	            };
	            CodeMirror.on(node, "dblclick", () => {
	                mm.updateDirection()
	            });
	            CodeMirror.on(view, "mousedown", (e) => {
	                mm.onDrag(e)
	            });
	            CodeMirror.on(view, "touchstart", (e) => {
	                mm.onDrag(e)
	            });
	        }
	    });
	})