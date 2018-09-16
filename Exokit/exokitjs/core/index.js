const parse = require('scriptparser');
const fs = require('fs');
const gl = require('./gl');
const dom = require('./dom');
const worker = require('./worker');
const xr = require('./xr');

setTimeout(_ => xr.init(), 1000);

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
    if (EXOKIT.rootPath.charAt(EXOKIT.rootPath.length-1) != '/') EXOKIT.rootPath += '/';
    parse(fs.readFileSync(EXOKIT.rootPath));
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

console.log("XHR insrtance of EventTarget= "+(XMLHttpRequest instanceof EventTarget));
var xhr = XMLHttpRequest.create();
xhr.addEventListener("abcd", function(e) { console.log("recevied type: "+e.type) } );
xhr.dispatchEvent(Event.create("abcd"));

xhr.addEventListener("readystatechange", function(e) {
     console.log("xhr readystate= "+e.target.readyState+"  "+e.toString());
     if ( e.target.readyState===4 ) {
         var ab= e.target.response;
         console.log("array buffer length= " + ab.byteLength);
         
         var ta = new Int8Array(ab);
         console.log("ret[0]= " + ta[0]);
                     
     }
 });
xhr.open("GET", "http://192.168.32.101:8080/a.json");
xhr.responseType = "arraybuffer";
xhr.send();

garbageCollect()
