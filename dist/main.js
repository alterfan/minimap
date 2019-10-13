	(function(mod) {
	    if (typeof exports == "object" && typeof module == "object")
	        mod(require("codemirror"));
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
	            mm.init();
	            var node = mm.minimap.node,
	                view = mm.minimap.viewBoxElement;
	            cm.on("change", () => {
	                mm.refresh()
	            });
	            cm.on("scroll", (e) => {
	                mm.scrollTop();
	            });
	            window.onresize = (e) => {
	                mm.minimap.resize(mm.editorElement.offsetHeight, mm.width);
	            };
	            node.ondblclick = (e) => {
	                setTimeout(() => {
	                    mm.updateFloatSide()
	                }, 300)
	            }
	            node.ontouchstart = (e) => {
	                setTimeout(() => {
	                    mm.updateFloatSide()
	                }, 300)
	            }
	        }
	    });
	})
