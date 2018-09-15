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

//var f1 = File.create("www/index.html", 0);   // bundle
//console.log(f1.loadAsText());
//var f2 = File.create("https://mozilla.com", 2);   // remote
//console.log(f2.loadAsText());


var et = EventTarget.create();
et.addEventListener("abcd", function(e) { console.log("recevied type: "+e.type) } );
function fn(e) { console.log("recevied type: "+e.type) }
et.addEventListener("abcd", fn );
et.addEventListener("xyz", function(e) { console.log("recevied type: "+e.type) } );

et.dispatchEvent(Event.create('abcd'));
et.dispatchEvent({type:"xyz"});
et.dispatchEvent({type:"none"});
console.log('remove');
et.removeEventListener( "abcd", fn );
et.dispatchEvent({type:"abcd"});
et.dispatchEvent({type:"xyz"});
et.dispazztchEvent({type:"none"});

et= null;

console.log("XHR insrtance of EventTarget= "+(XMLHttpRequest instanceof EventTarget));
var xhr = XMLHttpRequest.create();
for(var i in xhr) {
    console.log(i);
}
xhr.addEventListener("abcd", function(e) { console.log("recevied type: "+e.type) } );
xhr.emit("abcd",{type:"none"});


garbageCollect()
