const parse = require('scriptparser');
const fs = require('fs');
const Url = require('url-parse');
const gl = require('./gl');
const dom = require('./dom');
const worker = require('./worker');
const xr = require('./xr');

require('./promise');
require('./fetch');
require('./image');

EXOKIT.onDrawFrame = function(stage) {
    window.innerWidth = stage.width;
    window.innerHeight = stage.height;
    if (EXOKIT.prevStage) {
        if (stage.width != EXOKIT.prevStage.width || stage.height != EXOKIT.prevStage.height) {
            window.fireEvent('resize');
        }
    }
    EXOKIT.prevStage = stage;
    EXOKIT.animationFrame && EXOKIT.animationFrame(performance.now());
    window.__internalTimer();
};

EXOKIT.onload = function() {
    if (EXOKIT.rootPath.charAt(EXOKIT.rootPath.length-1) != '/') EXOKIT.rootPath += '/';
    if (EXOKIT.rootPath.includes('http')) {
        let url = new Url(EXOKIT.rootPath);
        for (let key in url) window.location[key] = url[key];
    } else {
        window.location.pathname = EXOKIT.rootPath;
    }

    parse(fs.readFileSync(EXOKIT.rootPath));
    window.fireEvent('load');
};

window.requestAnimationFrame = function(callback) {
    EXOKIT.animationFrame = callback;
};

//let xhr = XMLHttpRequest.create();
//xhr.addEventListener('readystatechange', e => {
//     if (e.target.readyState === 4) {
//         var r = e.target.response;
//         var v = processImageFromArrayBuffer(r, true, true)
//         console.log("image processed: ("+v.width+ ","+v.height+")");
//     }
// });
//
//xhr.open('GET', "http://192.168.32.101:8080/a.png");
//xhr.responseType = 'arraybuffer';
//xhr.send();

var ww = new Worker('ibon.js');

ww.addEventListener('message', function(e) {
                        console.log('Worker said: ', JSON.stringify(e));
                        }, false);

ww.postMessage(['Hello World',1,{a:5}]); // Send data to our worker.
