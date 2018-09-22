const fs = require('fs');
const timer = require('./timer');
const EventEmitter = require('events')
const f = require('./fetch');

let events = new EventEmitter();
self.addEventListener = events.addEventListener;
self.removeEventListener = events.removeEventListener;
self.fireEvent = self.dispatchEvent = events.fireEvent;

EXOKIT.tick = _ => {
    self.__internalTimer();
};

EXOKIT.init = path => {
    if (EXOKIT.rootPath.charAt(EXOKIT.rootPath.length-1) != '/') EXOKIT.rootPath += '/';
    EXOKIT.evaluate(fs.readFileSync(EXOKIT.rootPath + path), path);
};

const _getArrayType = function(array) {
    if (array instanceof Uint16Array) return 'Uint16Array';
    return 'Float32Array';
};

EXOKIT.onMessage = function(message) {
    self.fireEvent('message', {data: message});
};

self.postMessage = function(msg) {
    EXOKIT.postMessage(msg);
};

self.importScripts = function() {
    for (let i = 0; i < arguments.length; i++) {
        EXOKIT.evaluate(fs.readFileSync(EXOKIT.rootPath + arguments[i]), arguments[i]);
    }
};
