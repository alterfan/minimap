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
	            mm.refresh();
	            var node = mm.minimap.node,
	                view = mm.viewbox.node;
	            cm.on("change", (cm, change, e) => {
	                mm.BeforeChange(change);
	                mm.Change(e)
				});
				cm.on("inputRead", (cm, change, e) => {
	                mm.BeforeChange(change);
	                mm.Change(e)
	            });
	            CodeMirror.on(mm.cm.getScrollerElement(), "scroll", (e) => {
	                mm.Scroll(e);
	            });
	            CodeMirror.on(node, "dblclick", () => {
	                mm.Binding()
	            });
	            CodeMirror.on(view, "mousedown", (e) => {
	                mm.Drag(e)
	            });
	            CodeMirror.on(mm.canvas.node, "mousedown", (e) => {
	                mm.ScrollTo(e)
	            });
	            CodeMirror.on(view, "touchstart", (e) => {
	                mm.Drag(e)
	            });
	            window.onresize = (e) => {
	                mm.Resize(e)
	            };
	        }
	    });
	})