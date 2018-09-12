var parse = require('scriptparser');
var fs = require('fs');
var gl = require('./gl');
var dom = require('./dom');

EXOKIT.onDrawFrame = function(stage) {
    window.innerWidth = stage.width;
    window.innerHeight = stage.height;
    if (EXOKIT.prevStage) {
        if (stage.width != EXOKIT.prevStage.width || stage.height != EXOKIT.prevStage.height) {
            window.fireEvent('resize');
            window.onresize && window.onresize();
        }
    }
    EXOKIT.prevStage = stage;
    EXOKIT.animationFrame && EXOKIT.animationFrame(performance.now());
    window.__internalTimer();
};

EXOKIT.onload = function() {
    console.log(window.browser);
    window.fireEvent('load');
    window.onload && window.onload();
};

window.requestAnimationFrame = function(callback) {
    EXOKIT.animationFrame = callback;
};

var et = new EventTarget();
et.addEventListener("abcd", function(e) { console.log("recevied type: "+e.type) } );
function fn(e) { console.log("recevied type: "+e.type) }
et.addEventListener("abcd", fn );
et.addEventListener("xyz", function(e) { console.log("recevied type: "+e.type) } );

et.emit("abcd",{type:"abcd"});
et.emit("xyz",{type:"xyz"});
et.emit("none",{type:"aassdd"});
console.log('remove');
et.removeEventListener( "abcd", fn );
et.emit("abcd",{type:"abcd"});
et.emit("abcd",{type:"xyz"});

et= null;

garbageCollect()
